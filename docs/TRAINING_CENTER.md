# Centro de treinamento — cenário v3

O CT usa o elenco real: 18 atletas iniciais e até seis contratações, incluindo
reservas. Todos participam simultaneamente; o banco coberto fica livre durante
a sessão. A lista sob o Canvas mostra nomes, números, posições e exercícios.
Clique num nome para localizá-lo no campo.

Na v0.4, clicar diretamente no atleta abre sua ficha de relacionamento. A lista
também oferece **Conversar com o atleta** após selecioná-lo. O cenário pausa
durante a conversa; ouvir, prometer e entregar acompanhamento seguem as regras
de CAREER_RELEASE_V04.md. O treino da gestão continua sendo a ação que cumpre
o requisito de preparação. A opção de reduzir animações fica em Opções.

Área lógica 14×10 e câmera de conjunto em 640×360. Duas balizas, estações de
passes, condução, agilidade e finalização. Os dois goleiros iniciais usam os gols;
um terceiro contratado tem estação própria de recepção/deslocamento. O jogador
sem par pratica condução individual, sem depender de um parceiro inexistente.
Materiais, água, bolas extras, circulação e banco ficam fora dos exercícios.
Helena acompanha na lateral e o visitante continua andando por clique.

Os atores usam os quatro atlas ativos de SPRITE_STANDARD.md. Não se misturam
as poses avulsas antigas. Identidade e aparência permanecem estáveis nos ciclos.
Davi não é duplicado quando já está no elenco do Aurora; Observar Davi é um
ponto de observação lateral enquanto ele treina. Em outros clubes, ele é um
convidado do prólogo, fora da contagem do elenco selecionado.

O relógio visual pausa nos modais e respeita movimento reduzido. Os exercícios
são ambientes: sem física de contatos, IA tática ou bônus automáticos. Os bônus
continuam na ação de treino da gestão. Jogadores compartilham modelo e uniforme
de treino; fisionomias individuais e kits por clube ainda não existem no CT.

Cliques usam a transformação inversa da câmera. Banco, gols, materiais e saída
têm bloqueios estáticos, sem colisão individual dinâmica dos atletas. Saves
antigos mantêm a carreira; se a posição passou a conter uma instalação, o
visitante reaparece na entrada. O layout atual usa sceneVersion 3.

Reproduzir: npm run assets:characters. Validar: npm test e npm run test:e2e.
Os testes cobrem os 12 elencos, 24 atletas incluindo três goleiros, identidade,
afastamento por 60 segundos amostrados, pivôs, câmera, migração e seleção de nomes.
O navegador verifica carregamento, animação, movimento reduzido, mobile,
contratações, Davi e saída. Capturas em artifacts/web: training-all-24.png,
training-roster-24.png, training-scene-v2.png (nome histórico, cena atual) e
training-upgraded-mobile.png.
