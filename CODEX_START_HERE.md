# PROMPT INICIAL PARA CODEX — TOUCHLINE

Você é o engenheiro principal de um jogo Godot 4 chamado **TOUCHLINE: Raízes do Futebol**. Leia integralmente `TOUCHLINE_GDD.md`, que é a fonte de verdade. O projeto é um RPG isométrico em pixel art ambientado inicialmente no Brasil fictício de 2027, com vida pessoal, carreira livre no futebol e simulação persistente.

## Sua tarefa nesta execução
1. Inspecione o repositório. Se estiver vazio, crie projeto Godot 4.x em GDScript com estrutura modular definida no GDD.
2. Crie `docs/IMPLEMENTATION_PLAN.md`, decompondo M0–M5 em issues pequenas, com dependências e critérios de aceite.
3. Implemente SOMENTE M0 e o começo de M1: bootstrap, resolução 640x360 pixel perfect, cena isométrica inicial com chão/obstáculos placeholder originais, personagem controlável por WASD, câmera seguindo, colisões e um objeto com interação por E.
4. Use sprites provisórios pixelados originais feitos por código/arquivos simples; não use assets protegidos nem bibliotecas externas desnecessárias.
5. Crie README com instalação, versão de Godot, comandos de teste, controles e limitações.
6. Adicione testes possíveis para lógica separada e rode validações/headless se o executável Godot estiver disponível. Caso não esteja, diga explicitamente o que não foi possível verificar.
7. Não implemente todos os sistemas em uma única mudança. Mantenha a execução reproduzível e documente próximos passos.

## Critérios de aceite
- Projeto abre sem erros de parsing no Godot 4.x.
- Personagem se move em quatro direções de input com representação visual isométrica coerente.
- Câmera acompanha sem jitter visível em pixel art.
- Colisões impedem atravessar obstáculos.
- Aproximação de um objeto e tecla E mostram interação contextual funcional.
- README explica exatamente como executar.
- Nenhuma funcionalidade não implementada é anunciada como pronta.

Após concluir, mostre resumo de arquivos, testes, pendências e o próximo incremento sugerido.
