<div align="center">

# 🏈 American Football Manager

**Monte o time. Chame a jogada. Decida sob pressão.**

Um jogo de futebol americano com gestão de elenco, decisões de quarterback e uma identidade visual em pixel art inspirada nas décadas de 80, 90 e 2000.

![Status: demo inicial](https://img.shields.io/badge/status-demo_inicial-e9b44c)
![Modo: offline](https://img.shields.io/badge/modo-offline-238636)
![Visual: pixel art](https://img.shields.io/badge/visual-pixel_art-8957e5)

</div>

---

## O projeto

American Football Manager combina a preparação e a estratégia de um manager esportivo com a tensão de tomar decisões dentro de uma jogada.

Você assume o papel de manager e técnico: monta o elenco, prepara o time e escolhe as jogadas. Quando a bola entra em jogo, assume as decisões do quarterback: encontrar um recebedor, passar ou correr enquanto a defesa se aproxima.

A inspiração vem da gestão de **Football Manager**, das decisões em campo de **Madden** e do universo do futebol americano da **NFL**. A proposta inicial usa uma liga fictícia, com times e personagens próprios.

## Do playbook ao campo

1. **Escolha a jogada.** Veja a formação e as rotas desenhadas no gramado.
2. **Dê o snap.** As linhas desaparecem e o campo ganha vida.
3. **Leia a defesa.** Recebedores correm, a linha bloqueia e os defensores pressionam.
4. **Decida rápido.** Escolha o passe ou avance com o QB dentro de uma janela curta de decisão.
5. **Acompanhe o resultado.** Recepção, avanço, tackle ou sack acontecem na simulação e aparecem nas animações.
6. **Ajuste a estratégia.** Use o resultado para preparar a próxima jogada.

Os demais atletas são controlados por bots locais. A primeira versão será **offline e para um jogador**.

## Futebol americano através das décadas

O ponto de partida são atletas humanos com estética dos **anos 80**. As próximas épocas poderão transformar jogadores, uniformes, equipamentos, estádios, placares e apresentação.

| Época | Direção visual planejada |
|---|---|
| **Anos 80** | Mullets, bigodes, uniformes retrô e transmissão vintage |
| **Anos 90** | Novos acessórios, publicidade e gráficos esportivos da época |
| **Anos 2000** | Telões, equipamentos e apresentação mais moderna |

Diferenças táticas e de regras também poderão influenciar o jogo. As referências estão em [Épocas do jogo](docs/eras.md), com validação histórica pendente antes da implementação.

## Direção visual

Pixel art detalhada, campo em perspectiva inclinada e atletas expressivos. A interface deve manter a ação legível, com placar, cartas de jogadas e indicadores de recebedores.

O acabamento será construído aos poucos: primeiro escala, movimento e leitura do campo; depois sprites finais, torcida, estádio, áudio e efeitos.

## Stack inicial

| Camada | Proposta |
|---|---|
| Linguagem | TypeScript |
| Desenvolvimento | Vite |
| Campo, câmera e sprites | Three.js com câmera ortográfica |
| Menus e gestão | HTML/CSS |
| Simulação e bots | TypeScript independente da renderização |

O setup inicial usa TypeScript, Vite e Three.js, com câmera ortográfica e interface em HTML/CSS. A apresentação deve ter aparência 2D, mesmo que o cenário use profundidade.

## Primeiro objetivo jogável

Um campo, dois times e uma jogada de passe com três opções de recebedor. O protótipo deve permitir dar o snap, movimentar o QB, escolher entre passe e corrida e enfrentar bots executando rotas, bloqueios, cobertura e pressão.

O primeiro marco é simples: **sentir a tensão da decisão e compreender o resultado olhando para o campo**.

Depois, o projeto evolui para um drive completo, partida offline, gestão de elenco e novas épocas.

## Estado atual

O projeto está na fase de **demo inicial**: treino de uma jogada de passe com 11 atletas por time, sprites humanos retrô provisórios e câmera ortográfica próxima e adaptativa. Uma carta mostra o desenho da jogada, com rotas coloridas e setas. As rotas desaparecem no snap, o QB recebe a bola e pode se movimentar ou passar para três recebedores. Bots correm rotas, acompanham recebedores e pressionam o QB. Toda a defesa começa a agir desde o snap.

Há timer de cinco segundos, passe assistido para WR 1 ao esgotar a janela (se o QB estiver atrás da linha), recepção, passe incompleto, sack, tackle, saída de campo, touchdown e reinício. A pressão pode encerrar a jogada antes do timer. O treino tem limite de 15 segundos.

**Limitações:** uma única jogada fixa, bloqueios aproximados por proximidade e resistência temporária; passe guiado até o recebedor em movimento; sem interceptações, atributos, animações completas de corrida/tackle, replay, downs, pontuação acumulada ou gestão. O placar é ilustrativo. Os elementos visuais são provisórios. A aplicação não depende de assets ou serviços externos durante a execução local.

**Melhorias da demo:** quando o QB corre, o ataque troca rotas por apoio e distribui bloqueios. A defesa combina perseguição, antecipação e contenção de laterais, com separação entre companheiros para reduzir aglomeração. São heurísticas iniciais, ainda sem leitura tática e atributos individuais completos.

Os atletas têm quatro poses de corrida, com movimento de braços e pernas apenas quando se deslocam. Tackle/sack mostram o portador caindo; passes incompletos mostram a bola caindo, quicando e parando. Essas animações continuam após o resultado sem reabrir a simulação.

O campo ganhou números de jardas, marcações a cada dez jardas, linha de scrimmage azul e primeira descida amarela a dez jardas. A câmera usa uma inclinação lateral discreta, com campo quase horizontal, suavização de bordas e renderização em até 2× a resolução CSS. O gramado tem textura procedural de 2048×1024 e o estádio possui árvores, prédio de tijolos, torcida, publicidade e refletores em arte procedural local. **Aurora Wolves** e **Crimson Hawks** são os times fictícios, com nomes nas end zones.

Variações de velocidade, aceleração e habilidade de passe curto/médio/longo por jogador estão previstas no plano; ainda não foram implementadas.

**Controles:** espaço ou botão para snap; WASD/setas para mover o QB; J (Carter), K (Hayes) e L (Brooks), ou botões, para passar; a mesma tecla e cor aparecem sobre cada recebedor; Reiniciar para repetir. O ataque avança para a direita; não é permitido passar após cruzar a linha de scrimmage. Após a recepção, o bot controla o avanço.

A demo foi verificada no navegador. Os quatorze testes de simulação, apoio à corrida, apresentação das animações e alinhamento da câmera, lint, formatação, TypeScript e build de produção passaram. O build emite um aviso de bundle acima de 500 kB devido à inclusão do motor gráfico; a divisão do bundle pode ser avaliada conforme a aplicação crescer.

Oxlint e Oxfmt estão configurados para lint e formatação. A formatação deve ser executada antes de cada commit, conforme as instruções para agentes.

Os testes ficam em `src/tests/`, espelhando os módulos de produção e usando `.spec.ts`. O Vitest descobre apenas testes nesse padrão.

Este repositório também é um espaço de aprendizagem: cada etapa deve produzir algo pequeno, compreensível e jogável.

## Como executar

Requisito: Node.js 20.19+ na linha 20 ou Node.js 22.12+ (incluindo versões posteriores compatíveis), com npm.

```sh
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://127.0.0.1:5173`. O navegador precisa oferecer WebGL e aceleração gráfica. A instalação inicial das dependências requer internet; depois o servidor local funciona offline.

```sh
npm run typecheck  # Verificar TypeScript
npm test           # Testar a simulação com Vitest
npm run lint       # Validar regras de código (avisos também falham)
npm run lint:fix   # Aplicar correções automáticas de lint
npm run fmt        # Formatar antes de cada commit
npm run fmt:check  # Verificar formatação sem alterar arquivos
npm run build      # Verificar tipos e gerar dist/
npm run preview    # Servir o build localmente
```

## Estrutura inicial

```text
src/
  main.ts              # Interface e inicialização
  style.css            # Apresentação da pré-temporada
  rendering/field.ts   # Campo, câmera e recursos do Three.js
  rendering/athletes.ts # Sprites, bola e rotas
  simulation/          # Estados e regras da jogada, com testes
  ai/                  # Movimento dos bots
  ui/                  # Controles e status da jogada
docs/
  plan.md              # Plano central
  eras.md              # Referências das épocas
```

## Documentação

- [Plano completo](docs/plan.md): requisitos, etapas, decisões e pontos pendentes.
- [Épocas do jogo](docs/eras.md): referências para diferenças entre décadas.
- [Instruções para agentes](.github/agent-instructions.md): padrões de trabalho e commits.

## Convenção de commits

Usamos mensagens no formato `tipo: descrição`, como `feat: adicionar seleção de jogadas` ou `fix: ocultar rotas após o snap`.

Consulte as [instruções do repositório](.github/agent-instructions.md) antes de contribuir.

A nova arte pixel art do estádio de 1985 está disponível em public/assets/stadium1985.png, com prompt e origem registrados em [Assets visuais](docs/assets.md). A integração ao campo será feita na próxima atualização da demo.
