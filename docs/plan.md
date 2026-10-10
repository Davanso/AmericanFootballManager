# Plano do American Football Manager

Documento central de planejamento. Atualizar conforme decisões forem tomadas, preservando requisitos e registrando mudanças de escopo.

## 1. Visão do jogo

Jogo de futebol americano com gestão inspirada em Football Manager e participação direta nas decisões do quarterback durante as jogadas, inspirada em Madden.

O jogador atua como manager e técnico: prepara o elenco, escolhe formações e jogadas, acompanha a execução e controla as decisões do QB. Os demais atletas executam suas ações por meio de bots.

- Primeira versão offline, para um jogador.
- Visual 2D pixelizado, com campo em perspectiva inclinada.
- Primeiros personagens: atletas humanos com estética dos anos 80.
- Referência esportiva: NFL. Proposta inicial: liga, times e personagens fictícios com identidade própria.
- Prioridade: aprender a stack construindo etapas pequenas e jogáveis.
- Meta visual: campo rico em detalhes, atletas expressivos, estádio vivo e interface esportiva bonita, conforme a imagem de referência apresentada na conversa.

## 2. Épocas e identidade visual

Começar pelos anos 80 e preparar a estrutura para permitir escolha futura entre anos 80, 90, 2000 e outras épocas.

As épocas poderão mudar:

- Aparência dos jogadores: cabelos, bigodes, acessórios e silhuetas.
- Uniformes e equipamentos.
- Estádios, publicidade, torcida, placares e telões.
- Interface, sons e estilo de transmissão.
- Futuramente: playbooks, tendências táticas, atributos, regras e estrutura de gestão.

As diferenças fornecidas pelo usuário estão em [docs/eras.md](docs/eras.md). Esse documento será a referência para expansões. Seu conteúdo histórico precisa ser validado antes de virar regras da simulação.

Implementar primeiro uma época. Separar configurações de época das regras comuns para evitar duplicar o jogo a cada expansão. Não presumir que uma década inteira tenha regras e estilos uniformes; diferenças por ano podem ser necessárias futuramente.

## 3. Ciclo de jogo

Preparar o time → escolher formação e jogada → executar o snap → decidir com o QB → acompanhar o resultado → ajustar a estratégia.

Entre partidas, o ciclo futuro inclui treino, contratações, evolução dos atletas, preparação para adversários e calendário.

## 4. Fluxo obrigatório de uma jogada

### Preparação

- Escolher a jogada em cartas na interface.
- Posicionar ataque e defesa.
- Exibir as rotas desenhadas no campo antes do snap.
- Mostrar down, distância, posição da bola e informações relevantes.

### Snap e execução

- Ao iniciar a jogada, as linhas das rotas desaparecem imediatamente.
- O center entrega a bola ao QB por meio de animação visível.
- Os atletas começam suas ações: rotas, bloqueios, cobertura e pressão.
- A execução deve mostrar jogadores correndo e reagindo, sem representar a jogada apenas por um resultado textual.

### Decisão do QB

- O jogador pode escolher um recebedor para passar ou movimentar o QB para correr.
- Recebedores elegíveis têm teclas ou botões identificáveis.
- Mostrar um timer curto de decisão; proposta inicial de 3 a 5 segundos, a ajustar nos testes.
- A pressão defensiva continua ativa: um defensor pode alcançar o QB antes de o timer terminar.
- Diferenciar a janela de decisão após o snap do relógio para iniciar a jogada. O protótipo começa pela janela de decisão.
- Proposta inicial de assistência: passe automático ao esgotar o timer. Comportamento final ainda precisa ser definido.
- Após o passe, o recebedor permanece controlado pelo bot no primeiro protótipo.
- Ao optar por correr, o jogador mantém o controle do QB.
- Definir futuramente se é possível passar enquanto o QB se movimenta, respeitando a linha de scrimmage.

### Resultado

- Animar trajetória da bola, tentativa de recepção, avanço e tackle.
- Encerrar conforme o resultado: passe incompleto, tackle, saída de campo, sack, touchdown ou outros eventos adicionados depois.
- Atualizar posição da bola, down e distância.
- Permitir replay e iniciar a preparação da próxima jogada.

## 5. Simulação e bots

Bots locais programados; não dependem de serviços online ou IA generativa.

| Papel | Comportamento inicial |
|---|---|
| Recebedor | Percorrer rota, reagir ao passe, tentar receber e avançar |
| Linha ofensiva | Identificar ameaças e tentar bloquear |
| Defensor de cobertura | Marcar um recebedor ou proteger uma zona |
| Pass rusher | Buscar caminho até o QB |
| Defensor contra corrida | Perseguir o portador da bola e tentar tackle |
| Técnico adversário | Escolher defesa conforme a situação |

Estados iniciais: posicionado → executando rota ou bloqueio → reagindo à bola → perseguindo ou avançando → jogada encerrada.

- Atributos propostos: velocidade, leitura, precisão e força; detalhar atributos por posição depois.
- Defensores reagem a informações percebidas, evitando conhecimento perfeito das intenções do ataque.
- Resultados devem decorrer das posições, ações e atributos da simulação.
- Animações representam os eventos da simulação e devem permitir compreender o resultado.
- Começar com regras simples de contato, bloqueio e tackle; física complexa não é requisito inicial.
- Separar regras, decisões dos bots e renderização.
- Proposta técnica: passos fixos de simulação e aleatoriedade com seed para reproduzir situações e facilitar depuração/replay.

## 6. Stack proposta

A stack do setup inicial está definida: TypeScript, Vite, Three.js e HTML/CSS. Three.js será o motor visual inicial para aprendizagem.

| Camada | Proposta |
|---|---|
| Linguagem | TypeScript |
| Projeto e desenvolvimento | Vite |
| Campo e apresentação | Three.js |
| Visual dos atletas | Sprites pixelizados em cenário simples com profundidade |
| Câmera | Ortográfica, com perspectiva inclinada |
| Menus e gestão | HTML/CSS |
| Regras e bots | TypeScript independente do motor visual |
| Salvamento offline | Armazenamento local; mecanismo a definir |

O resultado visual deve parecer 2D, mesmo se o cenário usar elementos 3D. Phaser permanece uma alternativa caso a prioridade passe a ser um fluxo estritamente 2D com infraestrutura pronta para jogos.

### Organização proposta

- `src/simulation/`: estados, regras, movimento, bola, contato e eventos.
- `src/ai/`: decisões dos atletas e técnico adversário.
- `src/rendering/`: campo, câmera, sprites e efeitos.
- `src/ui/`: seleção de jogadas, indicadores e menus.
- `src/data/`: atletas, times, playbooks e configurações de épocas.
- `src/assets/`: sprites, texturas e áudio.
- `docs/`: referências, decisões e documentação.

Essa estrutura é proposta; adaptar à implementação sem misturar o estado da simulação com objetos do Three.js.

## 7. Direção artística

- Campo em perspectiva inclinada, com marcações legíveis.
- Pixel art consistente em escala, paleta e densidade de detalhes.
- Atletas pequenos, reconhecíveis por uniforme, posição e animação.
- Animações de posicionamento, corrida, snap, passe, recepção, bloqueio e tackle.
- Torcida, iluminação e detalhes do estádio desenvolvidos progressivamente.
- Interface inspirada em transmissão esportiva: placar superior, cartas de jogadas inferiores e informação contextual de atletas.
- Destaques dos recebedores precisam continuar legíveis depois que as rotas desaparecem.
- Evitar poluição visual durante a janela de decisão.
- Começar com sprites provisórios para validar escala, perspectiva e controles antes de produzir todos os assets finais.

## 8. Primeiro protótipo: uma jogada viva

Meta: dar o snap, ver todos os atletas agir e sentir a tensão de escolher entre passar e correr.

- [ ] Campo com perspectiva e direção visual dos anos 80.
- [x] Dois times com 11 atletas, inicialmente com sprites simples.
- [x] Uma jogada de passe com três opções de recebedor.
- [x] Posicionamento inicial de ataque e defesa.
- [x] Rotas visíveis antes do snap.
- [x] Rotas escondidas imediatamente após iniciar a jogada.
- [x] Animação do snap e posse de bola pelo QB.
- [x] QB controlável com opções de passe e corrida.
- [x] Timer visível de decisão.
- [ ] Bots executando rotas, bloqueios, cobertura e pressão.
- [x] Passe completo, passe incompleto e sack.
- [x] Avanço do portador da bola e término básico da jogada.
- [x] Resultado compreensível e opção de reiniciar a situação.

Critério de conclusão: a jogada funciona de ponta a ponta; o usuário consegue tomar uma decisão e entender o resultado observando o campo.

## 9. Etapas de desenvolvimento e aprendizagem

### Etapa 1 — Campo e câmera

Aprender coordenadas, texturas, renderização e câmera. Validar enquadramento, escala e leitura do campo.

### Etapa 2 — Atleta animado

Aprender sprites, animação, movimento, tempo e entrada do jogador. Movimentar um QB em um campo simples.

### Etapa 3 — Jogada completa

Implementar posicionamento, rotas, snap, posse, passe e estados da jogada. Ocultar as rotas durante a execução.

### Etapa 4 — Bots e pressão

Adicionar bloqueios, marcação, pressão ao QB, recepção e tackle. Integrar timer e escolhas do jogador. Concluir o primeiro protótipo.

### Etapa 5 — Drive jogável

- [x] Downs e distância para primeira descida, incluindo goal-to-go.
- [x] Atualização da posição da bola e formação da próxima jogada no ponto final.
- [x] Touchdown, seis pontos acumulados e animação de celebração.
- [x] Corrida pelo meio, passe curto e passe longo.
- [x] Pelo menos duas respostas defensivas.
- [x] Seleção de jogadas entre snaps.
- [ ] Replay; velocidade de reprodução a avaliar.

### Etapa 6 — Partida offline

Expandir para posse dos dois times, controle do relógio, pontuação e fim de partida. Definir controle quando o time do usuário está na defesa e comportamento do QB adversário. Introduzir regras adicionais e special teams conforme necessário para uma partida completa.

### Etapa 7 — Gestão

Adicionar elenco, atributos, treino, evolução, contratação, calendário e preparação para adversários. Definir progressivamente temporada, draft, contratos e finanças.

### Etapa 8 — Expansão de épocas e acabamento

Adicionar anos 90 e 2000 usando `docs/eras.md`, validar diferenças históricas e produzir assets por época. Refinar estádio, torcida, áudio, efeitos e acessibilidade.

## 10. Fora do primeiro protótipo

- Multiplayer e servidores.
- Temporada completa, draft e mercado de atletas.
- Controle direto de todos os atletas ou troca de jogador após o passe.
- Todas as regras e situações especiais do futebol americano.
- Todos os playbooks e formações.
- Todas as décadas e assets finais.

Esses itens não estão cancelados; entram depois de validar a experiência principal.

## 11. Validação

- Verificar visualmente que as rotas desaparecem no snap e que as animações representam a posse e as ações corretas.
- Avaliar se recebedores, bola e pressão defensiva são legíveis durante a decisão.
- Ajustar timer, controles e dificuldade com partidas de teste.
- Verificar invariantes importantes da simulação: posse única, término único da jogada e atualização correta de down/distância.
- Testar comportamentos críticos dos bots e regras à medida que forem implementados.
- Definir metas de desempenho e dispositivos suportados antes de otimizações amplas.
- Validar funcionamento offline, inclusive disponibilidade local dos assets.

## 12. Decisões pendentes

- [x] Confirmar Three.js como motor visual inicial.
- [x] Definir plataforma inicial: navegador desktop.
- [ ] Definir controles finais e suporte a controle/gamepad.
- [ ] Definir câmera, orientação do campo e resolução base da pixel art.
- [ ] Definir duração e comportamento ao esgotar o timer.
- [ ] Definir o equilíbrio entre realismo, acessibilidade e humor.
- [ ] Definir a profundidade da gestão no primeiro lançamento.
- [ ] Definir controle do usuário na defesa e em jogadas de corrida planejadas.
- [ ] Definir seleção de época: estética inicialmente ou mecânicas já na primeira expansão.
- [ ] Definir formato de replay e salvamento.
- [ ] Definir produção dos assets e pipeline de animação.

## 13. Registro das decisões já tomadas

- Personagens inicialmente humanos com estética dos anos 80.
- Planejar opções futuras dos anos 90, 2000 e outras épocas, incluindo mudanças nos estádios.
- Rotas aparecem na preparação e desaparecem quando a jogada começa.
- Jogadas têm animações de atletas correndo e executando suas funções.
- QB recebe a bola, tem opções de passe e pode correr.
- Existe uma janela curta com timer para a decisão do jogador.
- Outros atletas precisam de bots.
- Primeiro jogo offline.
- `docs/eras.md` guarda as diferenças entre épocas fornecidas pelo usuário.
- Setup inicial implementado com TypeScript, Vite, Three.js e HTML/CSS; primeiro run com campo estático no navegador desktop.

## 14. Progresso do setup inicial

- [x] Dependências instaladas e lockfile gerado.
- [x] Scripts de desenvolvimento, checagem de tipos, build e preview.
- [x] Tela de pré-temporada dos anos 80.
- [x] Prévia de campo com marcações, end zones e arquibancadas simplificadas.
- [x] Câmera ortográfica, redimensionamento e restauração do enquadramento.
- [x] Primeiro run verificado no navegador.
- [x] TypeScript e build de produção verificados.

O campo é uma base provisória. A etapa 1 continua com refinamento visual; a primeira implementação de simulação e bots está registrada abaixo.

## 15. Primeira demo simples

Implementada uma jogada de treino com simulação em passos de 1/60 segundo, módulos separados para estado/regras, bots, renderização e interface. Os atletas usam sprites locais provisórios e duas poses de movimento e sombras; animações completas ainda estão pendentes.

O timer começa após o snap. O QB pode passar enquanto estiver atrás da linha, ou correr. Passe assistido após cinco segundos; defesa pode provocar sack antes disso. Recebedor avança por bot após receber. Resultados encerram e congelam a jogada; Reiniciar restaura a formação e as rotas.

Limitações: bloqueios aproximados por proximidade e resistência temporária, cobertura aproximada, passe guiado e duas jogadas de passe, além do field goal simplificado. O item de bots com bloqueios completos permanece pendente. Há drive de treino com downs e distância; ainda não há partida completa, replay, temporada ou gestão.

Próxima etapa: refinar bloqueios e percepção defensiva, animações e legibilidade dos recebedores; depois adicionar seleção entre corrida, passe curto e passe longo, além de posse adversária e regras de partida completa.

## 16. Leitura visual, câmera e tradução — requisitos do usuário

### Cartas com desenhos das jogadas

É obrigatório que cada opção de jogada tenha uma imagem/diagrama mostrando formação e rotas, como as cartas da referência inicial. O desenho deve corresponder à jogada executada, com setas, cores e identificação dos alvos. Não apresentar apenas nomes textuais.

- [x] Primeira carta do passe curto, derivada dos dados reais da formação e das rotas.
- [ ] Todas as opções futuras com diagrama, destaque de seleção e descrição curta.

### Identificação dos alvos e teclado

Exibir a mesma tecla/símbolo no botão e sobre o recebedor correspondente, inspirado em Madden. Não depender de “WR superior” ou da ordem numérica para decisões rápidas. Cores ajudam, mas a tecla precisa identificar o alvo por si só.

- [x] J / Carter, K / Hayes e L / Brooks nos botões e sobre os atletas.
- [x] Suporte às teclas de passe e WASD/setas para movimento. J/K/L evitam conflito com WASD; são escolhas provisórias da demo.
- [ ] Remapeamento e gamepad com símbolos correspondentes ao dispositivo ativo.

### Defesa desde o snap

Toda a defesa deve agir desde o primeiro passo do snap, sem aguardar a decisão do QB. Bloqueios podem reduzir e desviar o avanço, mas não congelar artificialmente os atletas.

- [x] Pressão dos rushers, marcação dos recebedores e recuo dos defensores de zona durante o snap.
- [x] Aproximação de bloqueios: bloqueadores buscam rushers; contato reduz a velocidade por um período limitado.
- [ ] Melhorar disputas de bloqueio, percepção, atributos e reação à bola.

### Arte, rotas e câmera adaptativa

Buscar a riqueza visual da referência com atletas humanos expressivos, capacetes, ombreiras, uniformes, sombras e detalhes retrô. A câmera começa próxima à ação, sem precisar mostrar o campo inteiro, e acompanha QB, recebedores e bola. Quando as rotas se espalham ou o passe avança, abre o enquadramento suavemente para preservar a leitura. Recebedores executam rotas longas; RBs participam conforme o playbook.

- [x] Sprites provisórios com maior detalhamento, proporções robustas, sombras e duas poses.
- [x] Rotas mais grossas, contrastantes, coloridas e com setas; desaparecem no snap.
- [x] Câmera próxima com enquadramento adaptativo conforme a distância entre QB, alvos e bola cresce.
- [ ] Validar câmera em passes longos reais, mudanças de posse e telas pequenas. A jogada atual é um passe curto.
- [ ] Animações direcionais completas de corrida, passe, bloqueio, recepção e tackle; acabamento artístico ainda em evolução.

### Tradução para português

Português é requisito do jogo: menus, cartas, controles, resultados, erros, ajuda e futuras telas de gestão. A interface da demo já está em português. Termos como QB, snap e touchdown terão explicação na ajuda futura.

- [ ] Centralizar textos em catálogo pt-BR, evitando strings de interface espalhadas.
- [ ] Revisar terminologia esportiva, números, unidades, acentos e textos expandidos.
- [ ] Validar acessibilidade e mensagens de todas as fases.
- [ ] Preparar a estrutura para outros idiomas, sem exigir uma segunda língua no primeiro lançamento.

## 17. Dinâmica de corrida, animações e identidade do estádio

- [x] Quando o QB inicia uma corrida, jogadores ofensivos mudam de rotas para apoio e bloqueios distribuídos contra ameaças distintas.
- [x] Defesa combina os perseguidores mais próximos com antecipação e contenção de corredores de fuga. Separação local reduz companheiros sobrepostos.
- [ ] Refinar tempo de reação, estabilidade das atribuições, caminho dos bloqueadores, disputas físicas e retorno às rotas. As heurísticas atuais reconhecem imediatamente a intenção de correr; percepção realista é futura.
- [x] Quatro poses de corrida com braços, pernas e oscilação, acionadas por deslocamento.
- [x] Tackle e sack com queda do portador e manutenção da pose no gramado.
- [x] Passe incompleto com queda, quique e repouso da bola. A animação é de apresentação; não muda o resultado encerrado.
- [ ] Animação coordenada de contato entre defensor e portador, orientações e sprite sheets finais.
- [x] Números de jardas e apenas marcações a cada dez jardas, linha de scrimmage e linha de primeira descida a dez jardas.
- [x] Câmera com leve inclinação lateral, gramado de alta resolução, antialiasing e estádio procedural com prédio de tijolos, árvores, torcida, publicidade e refletores, inspirado na composição da referência.
- [x] Times fictícios Aurora Wolves e Crimson Hawks identificados no placar e nas end zones.
- [ ] Novos assets e refinamento de profundidade, estádio e câmera por época.

### Futuro: atributos e estilos individuais de jogadores

As diferenças entre atletas são essenciais e devem afetar a simulação, os bots, a seleção do elenco e as decisões do usuário. Não usar um único perfil universal de QB.

- [ ] Velocidade máxima, aceleração, agilidade e resistência individuais; QBs móveis e QBs lentos.
- [ ] Precisão de passe curto, médio, longo/de profundidade, força do braço e tempo de lançamento.
- [ ] Precisão sob pressão e em movimento, leitura defensiva e tomada de decisão.
- [ ] Velocidade, separação e recepção de WRs/RBs; força e técnica de bloqueio; perseguição, cobertura e tackle de defensores.
- [ ] Perfis de exemplo: QB especialista em passe curto, passador de profundidade e dual-threat; apresentar forças e limitações no elenco.
- [ ] Configuração por atleta independente da época; tendências históricas podem influenciar distribuições, sem tornar todos os jogadores iguais.
- [ ] Testes comparando atletas rápidos/lentos e especialistas de passe, com cenários equivalentes e aleatoriedade reproduzível.

### Correção visual do campo

- [x] Manter linhas quase horizontais com inclinação discreta no eixo Y; evitar campo girado na diagonal.
- [x] Suavizar linhas e textos sem perder os sprites pixelizados; textura do gramado 2048×1024 e estádio ilustrado de 2172×724.
- [x] Remover arquibancadas planas soltas e reduzir a faixa ao redor do gramado.
- [ ] Arte final do estádio e iluminação por época; a arte atual continua procedural e provisória.


## 18. Drive de treino e campo baseado na referência

- [x] Fundo de estádio detalhado em pixel art, com humanos, arquibancadas, árvores, academia de tijolos e refletores; asset local e prompt registrados em `docs/assets.md`.
- [x] Gramado mais próximo da paleta da referência, faixas de corte, borda estreita e enquadramento mais próximo da ação, sem a moldura larga anterior.
- [x] Linha tática de primeira descida/goal, números e linhas brancas a cada dez jardas; retirar scrimmage azul e hash marks. Rotas da jogada selecionada apenas antes do snap.
- [x] Painel inferior com `1st to 10`, `1st to GOAL`, demais descidas, posição da bola e botão Próxima jogada.
- [x] Iniciar a próxima jogada no ponto final: traduzir atletas, rotas, bola, snap, cobertura de zona e limite do passe para a nova linha de scrimmage.
- [x] Ganhos curtos/perdas mantêm a linha a conquistar; passe incompleto volta ao ponto do snap; conversão reinicia as descidas com dez jardas ou goal-to-go.
- [x] Quarta descida sem conversão encerra o drive. O botão Novo drive começa outro ataque de treino, preservando pontos acumulados.
- [x] Touchdown soma seis pontos uma única vez e exibe celebração com faixa, salto do portador e confetes; respeitar preferência por movimento reduzido.
- [x] Seletor de posição inicial para testar meio de campo, red zone e goal-to-go. Alterações somente entre jogadas; Reiniciar zera posição e placar.
- [x] Testes de regressão para perdas, incompletos, conversão, goal-to-go após perda, quarta descida, reposicionamento, snap, limite do passe e touchdown real por recepção.
- [ ] Refinar arte dos atletas para combinar com o novo estádio e validar enquadramento em todas as dimensões.
- [ ] Posse adversária, safety, kickoff, punt, field goal completo, relógio de partida e penalidades. O drive atual é um treino ofensivo, sem troca real de ataque/defesa.

## 19. Correções visuais, limites e field goal

- [x] Remover rotação lateral da câmera: limites horizontais e números alinhados.
- [x] Integrar o estádio à cena, ancorado na lateral distante do campo e preservando a proporção original de 3:1 durante zoom e movimento.
- [x] Preservar as marcações brancas a cada dez jardas e a linha dourada necessária para primeira descida/goal. Rotas e setas na cor do recebedor correspondente, somente antes do snap, e cartas com diagramas próprios.
- [x] Conter todos os atletas nos limites do campo, incluindo bots, formações perto das end zones e separação entre jogadores. Margem visual considera o tamanho do sprite.
- [x] Revisar silhuetas humanas, capacetes de perfil, poses de snap, posse, lançamento e chute.
- [x] Snap do center ao QB/holder com movimento da bola; kicker aproxima-se e chuta com voo em arco.
- [x] Traves ilustradas para leitura frontal na apresentação 2D; resultado do chute usa distância, altura e abertura entre postes.
- [x] Field goal disponível dentro do alcance simplificado de 50 jardas. Fixar direção da seta oscilante, depois força oscilante, por botão ou Espaço; marcar três pontos somente uma vez.
- [x] Cenário explícito de fim de jogo com 20 segundos; linha branca de alcance apenas nos últimos 30 segundos, a partir do meio de campo. Treino normal não mostra esse indicador.
- [x] Passe longo selecionável, com carta, rotas e execução diferentes do passe curto.
- [ ] Vento, atributos do kicker, bloqueio de chute, snap impreciso e regras completas de relógio/posse.
- [ ] Sprite sheets finais direcionais e animações completas de center, holder, QB e kicker; as poses atuais são procedurais e provisórias.

## 20. Retorno à pixel art e evolução futura

- [x] Restaurar linhas brancas a cada dez jardas, separadas dos indicadores táticos.
- [x] Sprites de pixels definidos com diversidade de pele, números de camisa e chuteiras; ombreiras largas, meias altas, bigodes e mullets para os anos 80.
- [x] Traves verticais 2D com textura pixelizada.
- [x] Rotas e pontas das setas seguem a cor do recebedor; somem no snap.
- [x] Estádio e campo unidos na mesma cena, sem faixa vazia; proporção do asset preservada.
- [x] Testes de regressão para todos esses ajustes e regra registrada nas instruções dos agentes.
- [ ] Placar fixo na parte inferior da tela, quadrado e bem pixelizado, inspirado em transmissão real. Mostrar times, pontos, quarto, relógio, posse, down/distância, posição e timeouts; desenhar versão compacta responsiva sem cobrir a ação.
- [ ] Projetar o jogo com a equipe de defesa: seleção de formação/cobertura/blitz, atleta controlado, troca de defensor, movimentação e tackle; bots mantêm as demais atribuições. Primeiro validar uma jogada defensiva antes de ligar à alternância de posse.
- [ ] Faltas e flags: eventos raros com aleatoriedade reproduzível por seed. Primeiros exemplos: false start antes do snap e facemask defensivo durante contato. Definir momento, equipe infratora, interrupção, jardas, repetição da descida ou first down, aceitação/recusa e aviso visual. Ajustar probabilidades em testes para evitar punições arbitrárias frequentes; validar regras por época antes de implementar.

## 21. Conversões e revisão dos bots

- [x] Escolha obrigatória após touchdown: chute de um ponto ou jogada de dois pontos.
- [x] Formação na linha de duas jardas para a época inicial; uma tentativa, sem quatro descidas e sem somar outro touchdown de seis pontos.
- [x] Chute com direção/força e animação; erro preserva os seis pontos. Conversão de dois permite passe curto/longo ou corrida do QB.
- [x] Ajustes no pocket preservam rotas; apoio à corrida ao cruzar a linha ou sair lateralmente do pocket. Separação não empurra recebedores para fora das rotas.
- [x] Cobertura individual antecipa movimento observado; zonas reagem a ameaças próximas; repetição de passes aumenta atenção defensiva no treino.
- [x] Testes de pontuação única, tentativas frustradas, interface durante conversão, preservação de rotas e defesa contra passe repetido.
- [ ] Interceptações, disputas com atributos, disfarce de cobertura, coordenador defensivo e calibração de dificuldade em sessões de jogo.
- [ ] Retorno defensivo em conversões e posição do extra point configurável por época.

## 22. Corrida pelo meio com RB controlável

- [x] Carta com formação, entrega e rota do RB #34, verde e visível somente antes do snap.
- [x] Formação traduzida para a posição atual do drive; QB recebe o snap e entrega a bola ao RB em uma fase própria.
- [x] Controle do RB por WASD/setas depois da entrega, com velocidade normalizada nas diagonais; sem entrada, o corredor para. QB e bots não controlam o portador nessa jogada.
- [x] Ataque distribui bloqueios durante a entrega; defesa persegue e contém o corredor.
- [x] Passe desabilitado, sem passe assistido ou timer de decisão de passe nessa jogada.
- [x] Tackle, lateral, progressão do drive, touchdown e corrida numa tentativa de dois pontos.
- [x] Testes de posse, entrega, controle, diagonal, lateral, reposicionamento, tackle, touchdown único, conversão e apresentação da carta/rota/interface.
- [ ] Próximo marco: respostas defensivas distintas (man, zone e blitz) e calibração dos bloqueios contra corrida.

## 23. Respostas defensivas

- [x] Seleção entre marcação individual, zona e blitz antes do snap.
- [x] Zona protege setores; blitz adiciona dois rushers à pressão e reduz cobertura.
- [x] Preservar seleção entre descidas/conversões e impedir mudança em execução.
- [x] Testes comparando pressão e movimentação nos três planos.
