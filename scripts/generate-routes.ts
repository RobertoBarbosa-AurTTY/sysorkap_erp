import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const VERBS = ["get", "post", "put", "patch", "delete"] as const;
type Verb = (typeof VERBS)[number];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..", "netlify", "functions", "site");
const controllersDir = path.join(siteDir, "controllers");
const outFile = path.join(siteDir, "routes.generated.ts");

interface RouteEntry {
  urlPath: string;
  importPath: string;
  method: Verb;
  segments: string[];
  identifier: string;
}

interface FoundFile {
  file: string;
  segments: string[];
  verb: Verb;
}

function collectVerbFiles(dir: string, segments: string[], out: FoundFile[]): void {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;
    const next = [...segments, entry.name];
    if (entry.isDirectory()) {
      collectVerbFiles(path.join(dir, entry.name), next, out);
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      const base = entry.name.replace(/\.ts$/, "").toLowerCase();
      if ((VERBS as readonly string[]).includes(base)) {
        out.push({ file: path.join(dir, entry.name), segments, verb: base as Verb });
      }
    }
  }
}

function toUrlPath(segments: string[]): string {
  const parts = segments.map((segment) => {
    const dynamic = segment.match(/^\[(.+)\]$/);
    return dynamic ? `:${dynamic[1]}` : segment;
  });
  return `/${parts.join("/")}`;
}

function toPascalCase(segment: string): string {
  const name = segment.replace(/^\[(.+)\]$/, "$1");
  return name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function buildIdentifier(segments: string[], verb: Verb, taken: Set<string>): string {
  const parts = segments.map(toPascalCase).filter(Boolean);
  const stem = parts.length > 0 ? parts.join("") : "Root";
  const camel = stem[0].toLowerCase() + stem.slice(1);
  const base = `${camel}${verb[0].toUpperCase()}${verb.slice(1)}`;
  let identifier = /^[0-9]/.test(base) ? `_${base}` : base;
  let n = 2;
  while (taken.has(identifier)) {
    identifier = `${base}${n}`;
    n++;
  }
  taken.add(identifier);
  return identifier;
}

if (!fs.existsSync(controllersDir)) {
  console.error(`Pasta de controllers nao encontrada: ${controllersDir}`);
  process.exit(1);
}

const found: FoundFile[] = [];
collectVerbFiles(controllersDir, [], found);

const entries: RouteEntry[] = found.map(({ segments, verb }) => ({
  urlPath: toUrlPath(segments),
  importPath: `./controllers/${[...segments, verb].join("/")}`,
  method: verb,
  segments,
  identifier: "",
}));

// Rotas estaticas devem ser registradas antes das dinamicas na mesma posicao,
// senao "/estoque/:id" sombreia "/estoque/novo".
function chaveOrdenacao(urlPath: string): Array<[number, string]> {
  return urlPath
    .split("/")
    .filter(Boolean)
    .map((part) => (part.startsWith(":") ? ([1, part] as [number, string]) : ([0, part] as [number, string])));
}

function compararChaves(a: Array<[number, string]>, b: Array<[number, string]>): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i][0] !== b[i][0]) return a[i][0] - b[i][0];
    if (a[i][1] !== b[i][1]) return a[i][1].localeCompare(b[i][1]);
  }
  return a.length - b.length;
}

entries.sort(
  (a, b) => compararChaves(chaveOrdenacao(a.urlPath), chaveOrdenacao(b.urlPath)) || a.method.localeCompare(b.method),
);

const taken = new Set<string>();
for (const entry of entries) {
  entry.identifier = buildIdentifier(entry.segments, entry.method, taken);
}

const seen = new Map<string, string>();
for (const entry of entries) {
  const key = `${entry.method.toUpperCase()} ${entry.urlPath}`;
  if (seen.has(key)) {
    console.error(`Rota duplicada: ${key} (${seen.get(key)} e ${entry.importPath})`);
    process.exit(1);
  }
  seen.set(key, entry.importPath);
}

const lines: string[] = [
  "// AUTO-GERADO por scripts/generate-routes.ts - NAO EDITAR MANUALMENTE.",
  "// Convencoes: pasta = caminho da URL ([param] vira :param);",
  "// arquivo = verbo HTTP (get.ts, post.ts, put.ts, patch.ts, delete.ts), export default;",
  "// arquivos/pastas com prefixo _ sao ignorados.",
  "// Para regenerar: npm run routes:generate",
  'import type { Express } from "express";',
];

for (const entry of entries) {
  lines.push(`import ${entry.identifier} from "${entry.importPath}";`);
}

lines.push("", "export function registerRoutes(app: Express): void {");
if (entries.length === 0) {
  lines.push("  // nenhum endpoint encontrado em controllers/");
}
for (const entry of entries) {
  lines.push(`  app.${entry.method}("${entry.urlPath}", ${entry.identifier});`);
}
lines.push("}", "");

fs.writeFileSync(outFile, lines.join("\n"), "utf8");
console.log(
  `routes.generated.ts gerado com ${entries.length} endpoint(s):`,
  entries.map((e) => `${e.method.toUpperCase()} ${e.urlPath}`).join(", ") || "(vazio)",
);
