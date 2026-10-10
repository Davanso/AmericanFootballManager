<div align="center">

# 🏈 American Football Manager

**Monte o time. Chame a jogada. Decida sob pressão.**

Um jogo de futebol americano com gestão de elenco, decisões de quarterback e uma identidade visual em pixel art inspirada nas décadas de 80, 90 e 2000.

![Status: demo de drive](https://img.shields.io/badge/status-partida_curta-e9b44c)
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

A demo já permite encadear descidas em um drive de treino. Os próximos marcos incluem múltiplas jogadas, partida offline, gestão de elenco e novas épocas.

## Estado atual

O projeto está na fase de **partida curta e treino livre**: treino de corrida pelo meio, passe curto, passe longo e field goal com 11 atletas por time, sprites humanos retrô provisórios e câmera ortográfica próxima e adaptativa. Uma carta mostra o desenho da jogada, com rotas coloridas e setas. As rotas desaparecem no snap, o QB recebe a bola e pode se movimentar ou passar para três recebedores. Bots correm rotas, acompanham recebedores e pressionam o QB. Toda a defesa começa a agir desde o snap.

Há timer de cinco segundos, passe assistido para WR 1 ao esgotar a janela (se o QB estiver atrás da linha), recepção, passe incompleto, sack, tackle, saída de campo, touchdown e reinício. A pressão pode encerrar a jogada antes do timer. O treino tem limite de 15 segundos.

**Limitações:** uma corrida pelo meio, duas jogadas de passe e field goal simplificado, bloqueios aproximados por proximidade e resistência temporária; chute sem vento, atributos ou tentativa de bloqueio; passe guiado até o recebedor em movimento; sem retorno de interceptação, animações completas de corrida/tackle ou gestão. A partida curta tem posse dos dois times e quatro períodos de 60 segundos. Kickoff com retorno e safety ainda não estão implementados. No treino livre, o botão Novo drive continua iniciando outra série de treino. Os elementos visuais são provisórios. Todos os assets são locais; a execução não depende de serviços externos.

**Melhorias da demo:** quando o QB corre, o ataque troca rotas por apoio e distribui bloqueios. A defesa combina perseguição, antecipação e contenção de laterais, com separação entre companheiros para reduzir aglomeração. São heurísticas iniciais, ainda sem leitura tática e atributos individuais completos.

Os atletas têm quatro poses de corrida, com movimento de braços e pernas apenas quando se deslocam. Tackle/sack mostram o portador caindo; passes incompletos mostram a bola caindo, quicando e parando. Essas animações continuam após o resultado sem reabrir a simulação.

O campo mostra números a cada dez jardas. A única linha tática permanente é a dourada de primeira descida/goal; a linha azul de scrimmage continua oculta, mas as linhas brancas do gramado foram restauradas a cada dez jardas. As rotas e suas setas usam a cor de cada recebedor (J dourado, K azul, L rosa) apenas antes do snap. A câmera tem alinhamento lateral reto, com campo horizontal, suavização de bordas e renderização em até 2× a resolução CSS. O gramado tem textura procedural de 2048×1024 e o estádio usa uma nova ilustração pixel art detalhada com árvores, academia de tijolos, arquibancadas, refletores e jogadores humanos nas laterais, inspirada na referência. A arte gerada e seu prompt estão documentados em [Assets visuais](docs/assets.md). **Aurora Wolves** e **Crimson Hawks** são os times fictícios, com nomes nas end zones.

O painel abaixo do campo mostra **1st to 10**, **1st to GOAL** e as demais descidas, além da posição da bola. **Próxima jogada** reposiciona formação, rotas e snap no ponto final da anterior. Passe incompleto mantém o ponto do snap; perdas aumentam a distância; uma conversão renova as quatro descidas. Touchdowns somam seis pontos, com salto do portador, confetes e faixa de celebração. Reiniciar zera o treino e o placar.

O seletor **Início do treino** permite começar na jarda 31 do Wolves, no meio do campo, na jarda 20 ou na jarda 5 do Hawks. Assim é possível experimentar goal-to-go sem precisar completar um drive inteiro.

Perfis de QB equilibrado, móvel e de profundidade já alteram velocidade e precisão; recebedores e corredores também têm atributos básicos. Aceleração, resistência e técnica detalhada ainda estão planejadas.

**Controles:** espaço ou botão para snap; WASD/setas para mover o QB ou o RB na corrida planejada; J (Carter), K (Hayes) e L (Brooks), ou botões, para passar; a mesma tecla e cor aparecem sobre cada recebedor; Reiniciar para repetir. O ataque avança para a direita; não é permitido passar após cruzar a linha de scrimmage. Após a recepção, o bot controla o avanço.

A demo foi verificada no navegador. Os 79 testes de simulação e regressão visual, apoio à corrida, apresentação das animações, alinhamento da câmera, progressão do drive, limites dos atletas e chutes, lint, formatação, TypeScript e build de produção passaram. O build emite um aviso de bundle acima de 500 kB devido à inclusão do motor gráfico; a divisão do bundle pode ser avaliada conforme a aplicação crescer.

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

### Chutes, novas poses e limites do campo

O fundo do estádio integra a cena e acompanha a lateral distante do gramado durante o movimento e o zoom da câmera, com a proporção original de 3:1. Os jogadores usam sprites de 32×40 com pixels definidos, números individuais, tons de pele e chuteiras variados. Ombreiras largas, meias altas, capacetes listrados, bigodes e mullets remetem aos anos 80. As traves são sprites verticais em pixel art. Há poses de snap, posse, lançamento e chute, além da corrida. O snap mostra a bola saindo do center para o QB/holder; o chute inclui aproximação do kicker e voo em arco.

Os atletas são limitados à área do campo, com margem para o tamanho dos sprites. A corrida do portador termina ao alcançar a lateral. Passe longo é a segunda opção de jogada, com carta e rotas próprias.

Para testar o chute: escolha a jarda 20 ou 5 do Hawks, selecione **Field goal · 3 pontos**, dê o snap e use **Espaço** ou o botão duas vezes: primeiro fixa a direção da seta oscilante, depois a força. A bola precisa chegar além da linha da trave, acima da barra e entre os postes para somar três pontos. Chutes curtos ou desviados encerram o drive sem pontuar.

O seletor **Situação do treino → Fim de jogo · 20s** habilita um cenário de contagem regressiva. Somente nesse cenário, nos últimos 30 segundos e a partir do meio de campo, aparece a linha branca de alcance de um chute de 50 jardas. O botão de field goal fica disponível ao entrar nesse alcance. É um cenário de treino; ainda não há relógio, quartos e ataque adversário de uma partida completa. Um chute lançado antes de esgotar o tempo pode terminar sua trajetória.

### Próximos passos planejados

O placar fixo no rodapé e o controle da defesa estão implementados. Faltas/flags com pequena chance reproduzível (false start e facemask como primeiros exemplos). False start e facemask estão implementados na partida curta. Cada ajuste passa a exigir testes de regressão, conforme as instruções para agentes.

### Conversões e cobertura defensiva

Após touchdown, escolha **Extra point · +1** (chute com direção/força) ou **Conversão de dois pontos · +2** (uma única jogada da linha de duas jardas). O novo drive só é liberado depois da tentativa. A posição do extra point segue a direção dos anos 80; uma tentativa convertida soma somente um ou dois pontos, sem repetir os seis do touchdown.

Pequenos ajustes do QB no pocket preservam as rotas. Os recebedores passam a bloquear quando o QB cruza a linha ou sai lateralmente do pocket. Marcadores acompanham direção e mudanças de rota; defensores de zona reagem a ameaças próximas. A defesa aperta a marcação de recebedores procurados repetidamente durante o treino. A marcação usa heurísticas locais, complementadas por planos defensivos, atributos e interceptações descritos abaixo. Um coordenador defensivo completo permanece no plano futuro. Reiniciar limpa a memória defensiva.

### Corrida pelo meio

A carta **Corrida pelo meio** mostra a entrega e a rota verde do RB #34. Após o snap, o QB recebe a bola e a entrega ao corredor em uma animação curta. Depois, **WASD ou setas controlam o RB**; sem pressionar uma direção, ele para. Os botões de passe ficam desabilitados nessa jogada e não há passe automático ao fim do timer.

O ataque distribui bloqueios desde a entrega, enquanto a defesa persegue e contém o corredor. Tackle, lateral, first down e touchdown seguem a progressão do drive. A corrida também pode ser selecionada numa tentativa de dois pontos. Os bloqueios ainda são aproximações; novas formações e respostas defensivas serão o próximo marco.

### Respostas defensivas

O seletor **Plano defensivo** permite testar marcação individual, zona e blitz. A zona preserva setores e a blitz envia seis defensores à pressão, abrindo espaço em cobertura. A escolha fica travada durante a jogada e permanece entre descidas e conversões.

### Treino de defesa

Escolha **Lado controlado → Controlar defesa**. WASD/setas movem o defensor destacado, **E** troca para outro defensor perto da bola e **Espaço** tenta o tackle quando o portador está ao alcance. O QB adversário procura um recebedor livre e pode sair do pocket sob pressão. Os demais defensores continuam suas atribuições.

### Partida curta offline

Escolha **Modo de jogo → Partida curta · 4 × 60s**. Você ataca com os Wolves e controla a defesa quando os Hawks têm a bola. Downs, touchdown/conversão, field goal, punt e quarta descida determinam a posse. O relógio corre durante a execução e pausa entre jogadas; uma conversão necessária após o último touchdown permanece disponível. O resultado final aceita empate nesta demo.

Punt tem voo em arco, avanço fixo e touchback, ainda sem retorno. Após pontuação, o novo ataque começa na própria jarda 25, sem animação de kickoff. Para manter os controles consistentes nesta primeira versão, ambos os ataques são apresentados avançando para a direita. Reiniciar começa outra partida.

### Placar de transmissão

Painel fixo no rodapé com bordas quadradas, paleta retrô, pontos dos dois times, posse, período, relógio, descida/distância, posição e estado da jogada. A versão compacta reorganiza as informações em telas estreitas. Timeouts ainda não existem na simulação e não são apresentados como disponíveis.

### Atributos e interceptações

A partida usa atributos individuais; no treino, escolha um perfil no seletor **Perfil do quarterback** para ativá-los. O QB móvel corre mais, o especialista de profundidade tem maior precisão longa. Velocidade e recepção variam no elenco. Pressão e movimento reduzem a chance de completar passes. Cobertura próxima pode gerar interceptação e troca de posse imediata, ainda sem retorno. Resultados usam aleatoriedade reproduzível por seed.

### Flags iniciais

Na partida curta há pequena chance de false start antes do snap e facemask num tackle. A jogada pausa para aceitar ou recusar a penalidade. False start recua a bola e repete a descida; facemask avança a bola e concede primeira descida. Perto da end zone há redução para metade da distância. Essa demo permite ao usuário revisar a decisão das flags dos dois lados; faltas em conversões ainda estão desativadas.

### Replay da última jogada

Após o resultado, **Replay da última jogada** reproduz posições e bola em 0.5×, 1× ou 2×. **Parar replay** retorna à cena atual. O relógio, o placar e a simulação ficam preservados durante a reprodução. A gravação é temporária e substituída pela próxima jogada; exportação e arquivo de replays ainda não existem.
