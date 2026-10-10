export function navigation(active: string) {
  return `<nav class="club-nav" aria-label="Navegação principal">${[
    ['game', '/', 'Partida'],
    ['roster', '/elenco', 'Elenco'],
    ['config', '/config', 'Configurações'],
  ]
    .map(
      ([id, href, label]) =>
        `<a href="${href}" ${id === active ? 'aria-current="page"' : ''}>${label}</a>`,
    )
    .join('')}</nav>`;
}
