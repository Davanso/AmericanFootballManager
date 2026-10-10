<div align="center">

# 🏈 American Football Manager

**Monte o time. Chame a jogada. Decida sob pressão.**

Um jogo de futebol americano com gestão de elenco, decisões de quarterback e uma identidade visual em pixel art inspirada nas décadas de 80, 90 e 2000.

![Status: setup inicial](https://img.shields.io/badge/status-setup_inicial-e9b44c)
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

O projeto está na fase de **setup inicial**, com a primeira aplicação executável: tela de pré-temporada, campo estático em Three.js, arquibancadas simplificadas e câmera ortográfica responsiva. Há um botão para restaurar o enquadramento da câmera.

Ainda não há atletas, animações, jogadas, bots ou gestão implementados. Os elementos do campo são provisórios; a pixel art final será desenvolvida nas próximas etapas. A aplicação não depende de assets ou serviços externos durante a execução local.

O primeiro run foi verificado no navegador, e a checagem de TypeScript e o build de produção passaram. O build emite um aviso de bundle acima de 500 kB devido à inclusão do motor gráfico; a divisão do bundle pode ser avaliada conforme a aplicação crescer.

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
npm run build      # Verificar tipos e gerar dist/
npm run preview    # Servir o build localmente
```

## Estrutura inicial

```text
src/
  main.ts              # Interface e inicialização
  style.css            # Apresentação da pré-temporada
  rendering/field.ts   # Campo, câmera e recursos do Three.js
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
