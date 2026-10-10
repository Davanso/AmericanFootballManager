<div align="center">

# 🏈 American Football Manager

**Monte o time. Chame a jogada. Decida sob pressão.**

Um jogo de futebol americano com gestão de elenco, decisões de quarterback e uma identidade visual em pixel art inspirada nas décadas de 80, 90 e 2000.

![Status: planejamento](https://img.shields.io/badge/status-planejamento-e9b44c)
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

## Stack em avaliação

| Camada | Proposta |
|---|---|
| Linguagem | TypeScript |
| Desenvolvimento | Vite |
| Campo, câmera e sprites | Three.js com câmera ortográfica |
| Menus e gestão | HTML/CSS |
| Simulação e bots | TypeScript independente da renderização |

Three.js é a preferência inicial para aprender a stack. A escolha definitiva ainda está em planejamento. A apresentação deve ter aparência 2D, mesmo que o cenário use profundidade.

## Primeiro objetivo jogável

Um campo, dois times e uma jogada de passe com três opções de recebedor. O protótipo deve permitir dar o snap, movimentar o QB, escolher entre passe e corrida e enfrentar bots executando rotas, bloqueios, cobertura e pressão.

O primeiro marco é simples: **sentir a tensão da decisão e compreender o resultado olhando para o campo**.

Depois, o projeto evolui para um drive completo, partida offline, gestão de elenco e novas épocas.

## Estado atual

O projeto está na fase de **planejamento**. Ainda não há implementação jogável, scripts de execução ou dependências configuradas.

O plano inicial e as referências de épocas estão documentados. As instruções para agentes incluem a convenção de commits e a atualização obrigatória do status deste README a cada atualização do projeto.

Este repositório também é um espaço de aprendizagem: cada etapa deve produzir algo pequeno, compreensível e jogável.

## Documentação

- [Plano completo](docs/plan.md): requisitos, etapas, decisões e pontos pendentes.
- [Épocas do jogo](docs/eras.md): referências para diferenças entre décadas.
- [Instruções para agentes](.github/agent-instructions.md): padrões de trabalho e commits.

## Convenção de commits

Usamos mensagens no formato `tipo: descrição`, como `feat: adicionar seleção de jogadas` ou `fix: ocultar rotas após o snap`.

Consulte as [instruções do repositório](.github/agent-instructions.md) antes de contribuir.
