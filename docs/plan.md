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

A escolha definitiva ainda está pendente. Three.js é a preferência inicial para aprendizagem.

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
- [ ] Dois times com 11 atletas, inicialmente com sprites simples.
- [ ] Uma jogada de passe com três opções de recebedor.
- [ ] Posicionamento inicial de ataque e defesa.
- [ ] Rotas visíveis antes do snap.
- [ ] Rotas escondidas imediatamente após iniciar a jogada.
- [ ] Animação do snap e posse de bola pelo QB.
- [ ] QB controlável com opções de passe e corrida.
- [ ] Timer visível de decisão.
- [ ] Bots executando rotas, bloqueios, cobertura e pressão.
- [ ] Passe completo, passe incompleto e sack.
- [ ] Avanço do portador da bola e término básico da jogada.
- [ ] Resultado compreensível e opção de reiniciar a situação.

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

- [ ] Downs e distância para primeira descida.
- [ ] Atualização da posição da bola.
- [ ] Touchdown e pontuação básica.
- [ ] Corrida pelo meio, passe curto e passe longo.
- [ ] Pelo menos duas respostas defensivas.
- [ ] Seleção de jogadas entre snaps.
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

- [ ] Confirmar Three.js como motor visual.
- [ ] Definir plataforma inicial: navegador desktop é a proposta.
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
- Este arquivo centraliza o plano; ainda não foi iniciada a implementação do jogo.
