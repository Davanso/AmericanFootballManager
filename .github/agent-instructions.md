# Instruções para agentes

Este documento reúne os padrões do repositório para Codex e outros agentes. Atualizar conforme novos padrões forem acordados com o usuário. Não apresentar sugestões ainda não aprovadas como regras estabelecidas.

## Contexto do projeto

American Football Manager é um jogo offline de futebol americano, com gestão, decisões do quarterback, bots e visual pixelizado. O setup inicial usa TypeScript, Vite e Three.js, com HTML/CSS para a interface. Consultar o README para o estágio atual de implementação.

Antes de trabalhar, consultar:

- `README.md`: apresentação e estado do projeto.
- `docs/plan.md`: plano central, requisitos e decisões pendentes.
- `docs/eras.md`: referências por época; informações históricas ainda precisam ser validadas antes de virar mecânicas.

## Commits — regra definida pelo usuário

Todos os novos commits devem seguir o formato:

```text
tipo: descrição
```

Usar um prefixo em minúsculas, seguido de dois-pontos, espaço e uma descrição clara da mudança.

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de erro |
| `docs` | Documentação |
| `refactor` | Reorganização de código sem nova funcionalidade ou correção |
| `test` | Testes |
| `style` | Formatação de código sem mudança de comportamento |
| `perf` | Melhoria de desempenho |
| `build` | Dependências e configuração de build |
| `ci` | Integração contínua |
| `chore` | Manutenção que não se enquadra nos demais tipos |

Exemplos:

```text
feat: adicionar controle do quarterback
fix: ocultar linhas das rotas após o snap
docs: documentar planejamento do jogo
```

Escolher o tipo pela mudança efetiva. A regra se aplica aos novos commits; não reescrever o histórico existente para adequá-lo.

## Formatação antes de commits — regra definida pelo usuário

Antes de cada commit, executar `npm run fmt`, revisar as alterações geradas e incluí-las no commit quando fizerem parte da mudança. Se houver edições depois da formatação, executar novamente antes de criar o commit. Não criar o commit se a formatação falhar.

O projeto usa Oxfmt (`oxfmt.config.mjs`) para formatação e Oxlint (`oxlint.config.mjs`) para lint. Executar `npm run fmt:check` e `npm run lint` para validar as alterações. O lint considera avisos como falhas e verifica erros de correção, variáveis não utilizadas, uso de `const`, imports, práticas TypeScript e promises. Usar `npm run lint:fix` para correções automáticas seguras e revisar o resultado.

## Status do README — regra definida pelo usuário

Sempre que o projeto for atualizado, revisar e atualizar o status no `README.md` para refletir o estado real do projeto. Manter coerentes o badge de status, a seção de estado atual, os marcos descritos e as instruções de execução quando existirem. Registrar funcionalidades concluídas e limitações relevantes sem apresentar itens planejados como implementados. Se a atualização não mudar a fase do projeto, preservar a fase e ajustar a descrição do estado atual conforme necessário.

## Registro de novos padrões

Quando o usuário definir um novo padrão, registrá-lo neste arquivo com contexto e exemplos quando necessário. Manter a documentação coerente com o estado real do projeto e atualizar `docs/plan.md` quando uma decisão alterar o plano.
