import readline from "readline";
import { hashSenha } from "../netlify/functions/site/utils/password.ts";

const senha = process.argv[2];

if (senha) {
  console.log(`\nSENHA_HASH=${hashSenha(senha)}\n`);
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Senha para gerar o hash: ", (informada) => {
  rl.close();
  if (!informada) {
    console.error("Senha vazia.");
    process.exit(1);
  }
  console.log(`\nSENHA_HASH=${hashSenha(informada)}\n`);
});
