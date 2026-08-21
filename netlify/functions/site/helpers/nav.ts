const icone = (paths: string, classe = "h-5 w-5") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="${classe}">${paths}</svg>`;

const icones = {
  dashboard: icone('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  estoque: icone('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
  saidas: icone('<circle cx="12" cy="12" r="9"/><path d="M12 17V9"/><path d="m8.5 12.5 3.5-3.5 3.5 3.5"/>'),
  relatorios: icone('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'),
  clientes: icone('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  fornecedores: icone('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'),
  mais: icone('<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>'),
  marca: icone('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>', "h-[18px] w-[18px]"),
};

interface FilhoNav {
  nome: string;
  href: string;
}

interface ItemNav extends FilhoNav {
  key: string;
  icone: string;
  filhos?: FilhoNav[];
}

export interface SecaoNav {
  label: string;
  itens: ItemNav[];
}

export const secoesNav: SecaoNav[] = [
  {
    label: "Principal",
    itens: [
      { key: "dashboard", nome: "Dashboard", href: "/", icone: icones.dashboard },
    ],
  },
  {
    label: "Movimentações",
    itens: [
      {
        key: "estoque",
        nome: "Estoque",
        href: "/estoque",
        icone: icones.estoque,
        filhos: [
          { nome: "Visão geral", href: "/estoque" },
          { nome: "Novo produto", href: "/estoque/novo" },
        ],
      },
      {
        key: "saidas",
        nome: "Saídas",
        href: "/saidas",
        icone: icones.saidas,
        filhos: [
          { nome: "Histórico", href: "/saidas" },
          { nome: "Nova saída", href: "/saidas/novo" },
        ],
      },
    ],
  },
  {
    label: "Cadastros",
    itens: [
      {
        key: "clientes",
        nome: "Clientes",
        href: "/clientes",
        icone: icones.clientes,
        filhos: [
          { nome: "Lista", href: "/clientes" },
          { nome: "Novo cliente", href: "/clientes/novo" },
        ],
      },
      {
        key: "fornecedores",
        nome: "Fornecedores",
        href: "/fornecedores",
        icone: icones.fornecedores,
        filhos: [
          { nome: "Lista", href: "/fornecedores" },
          { nome: "Novo fornecedor", href: "/fornecedores/novo" },
        ],
      },
    ],
  },
  {
    label: "Análises",
    itens: [
      { key: "relatorios", nome: "Relatórios", href: "/relatorios", icone: icones.relatorios },
    ],
  },
];

export function helpersNav(caminho: string) {
  const rotaAtiva = (href: string, exato = false) =>
    href === "/"
      ? caminho === "/"
      : exato
        ? caminho === href
        : caminho === href || caminho.startsWith(href + "/");
  return { icones, secoes: secoesNav, rotaAtiva };
}
