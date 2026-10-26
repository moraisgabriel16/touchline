# TOUCHLINE — como jogar

Abra o webapp e use os botões do menu. Todas as ações funcionam por clique.
O guia também está disponível em **Como jogar**, dentro do jogo.

## Minha carreira e relacionamentos

**Minha carreira** reúne metas, recompensas, confiança da diretoria, compromissos,
forma recente, súmulas e arquivo de temporadas. Resgate recompensas concluídas:
são únicas, dão XP e algumas acrescentam dinheiro ao caixa do clube. As metas
esportivas renovam por temporada; conhecer o vestiário e cumprir palavra são marcos
únicos da carreira. A confiança da diretoria ainda não causa demissão.

No CT, clique no atleta ou selecione seu nome e **Conversar com o atleta**.
No Elenco, use a busca e abra a ficha. Ouça suas prioridades; há três conversas
relevantes por rodada e uma por atleta. Cumprimentos não custam nem dão pontos.

Após ouvir alguém, em outra rodada você pode combinar uma devolutiva. O prazo é
antes da próxima partida: use **Treinar a equipe** e volte à ficha para **Entregar
devolutiva combinada**, sem gastar outra conversa. Quebrar o combinado reduz
confiança e gera uma memória. Reconhecer a falha inicia reparação, mas não devolve
os pontos. Novo acompanhamento do mesmo atleta exige intervalo de quatro rodadas.
O jogo avisa sobre promessas pendentes antes de iniciar a partida.

Jogos, titularidades e gols individuais são registrados desde esta atualização;
placares antigos permanecem, sem estatísticas individuais inventadas. Os vínculos,
XP e registros sobrevivem à mudança de temporada. As relações ainda não dão bônus
esportivo. O CT abre a conversa numa pausa da cena, sem deslocamento animado até
um ponto de encontro.

Em **Opções da partida (···)**, ative contraste maior e redução de movimento.
As opções são locais ao navegador. **Escalar disponíveis** escolhe jogadores por
força e grupos de posição, deixando suspensos de fora quando há elenco disponível.

## Começar

1. Abra **Central do clube → Escolher clube** e selecione uma das 12 equipes.
2. Confirme a nova carreira. Isso substitui a partida atual; você pode exportá-la
   antes de confirmar. O início padrão continua sendo o Aurora Atlético.
3. Cada clube tem 18 jogadores, R$ 18.000, condição 94 e apoio 45/100.
   Os elencos têm nomes e IDs próprios; os rivais usam força agregada na simulação.
4. Escolha o uniforme Casa ou Visitante na Central. Ele aparece na escalação.

## Um ciclo de rodada

Entre em **Mundo do futebol** e clique em um destino. Os elementos dos cenários
isométricos podem ser examinados; as decisões ficam ao lado ou abaixo no celular.

Você tem **três ações por rodada**. Cada ação só pode acontecer uma vez:

| Local | Ação | Custo | Consequência |
| --- | --- | --- | --- |
| Sede e CT | Treinar | Uma ação e 6 de condição | +3 + nível do CT de força nesta rodada; exige condição ≥55 |
| Sede e CT | Recuperar | Uma ação | +12 de condição, limitada a 100 |
| Praça da torcida | Encontrar a torcida | Uma ação e R$ 1.000 | +10 de apoio, limitado a 100 |
| Campo de várzea | Observar e contratar | Uma ação e R$ 1.500 | Um novo reserva; limite de seis contratações por carreira |

Em **Elenco**, examine os atletas. Em **Escalação**, clique no titular e depois
em um reserva para substituir. Não há restrição de posição nesta versão.
A contratação da várzea aparece imediatamente entre os reservas.

Escolha a mentalidade: Ofensiva aumenta as chances de marcar e sofrer gols;
Defensiva reduz ambas. Equilibrada usa as chances de base. A formação só organiza
a disposição visual. Força, condição, treino, mando e apoio afetam o resultado.

Clique em **Jogar próxima rodada** para abrir a transmissão isométrica.
Cada tempo dura **30 segundos em 1×**. Use Pausar/Retomar, velocidade 1×/2×/4×/8×
e Pular para o intervalo/Pular para o apito final. Pular preserva os lances.
No intervalo, selecione quem sai e quem entra e confirme até **cinco trocas**.
Quem sai não volta e um expulso não pode ser substituído. Troca de goleiro exige
outro goleiro; é possível colocar um goleiro no lugar de um atleta de linha.
O adversário também pode fazer trocas no intervalo.

Vermelho direto ou segundo amarelo expulsam e reduzem a força da equipe.
Três amarelos acumulados ou uma expulsão suspendem por uma partida. Na abertura,
suspensos são substituídos automaticamente por atletas disponíveis. A ficha do
elenco identifica suspensões e amarelos. A disciplina é zerada na nova temporada.
A disciplina persistente é do seu elenco; os rivais ainda não têm calendário disciplinar.

**Encerrar partida e atualizar rodada** confirma o resultado, simula os outros
cinco jogos, atualiza tabela e caixa, reduz condição em 5, encerra o treino e
renova as três ações. Até essa confirmação, a rodada continua em andamento.
Recarregar retoma o jogo salvo; em outra aba do navegador, o relógio fica parado.
As ações são opcionais: você pode disputar a rodada sem preparar a equipe.

## Estádio e dinheiro

No Estádio, escolha ingresso de R$ 10, R$ 20 ou R$ 30. O preço mais baixo traz
mais público; o mais alto reduz a procura. O apoio também aumenta a demanda.
O público respeita a capacidade e não é sorteado. O painel mostra a previsão.

Nos jogos em casa, a renda bruta é público × ingresso. Jogos fora não geram
bilheteria. Toda rodada acrescenta R$ 2.500 de cota e desconta até R$ 4.500 de
operação/salários. A cobrança é limitada ao saldo disponível; não há dívida.
O extrato mostra os últimos lançamentos e o save guarda até 80.

| Melhoria | Preço do próximo nível | Efeito |
| --- | --- | --- |
| Estádio | R$ 8.000 × (nível atual + 1) | +1.500 lugares por nível, partindo de 3.000 |
| CT | R$ 6.000 × (nível atual + 1) | +1 no bônus de treino e +2 na força de futuras contratações |

Cada melhoria tem três níveis e não consome ação. Só é possível melhorar durante
a temporada, com dinheiro suficiente. Os recrutados têm força
`62 + ((rodada concluída + índice do clube) % 9) + 2 × nível do CT`.

## Liga e continuidade

Há **12 clubes, 22 rodadas e 132 jogos**, em turno e returno. Vitória vale 3 pontos
e empate vale 1. Os desempates usam vitórias, saldo e gols marcados, depois a
ordem estável dos clubes. A sua partida usa eventos por minuto, com aleatoriedade
reproduzível, cartões, faltas, finalizações, gols, escanteios, impedimentos e pênaltis.
Os outros confrontos ainda usam o motor agregado de nove ataques por equipe.
Preparação e trocas melhoram chances, sem garantir vitória.

Ao terminar, abra a Central e clique em **Próxima temporada**. Clube, elenco,
recrutas, caixa, apoio, instalações e RPG são mantidos. Ano e semente avançam,
calendário e ações reiniciam e a condição volta a 94. Jogadores ainda não envelhecem.
Escolher outro clube inicia uma carreira nova; não é uma transferência de emprego.

## RPG

Em Ambientes, clique no chão para andar. Os pontos dourados e os botões laterais
levam o personagem até pessoas, objetos e portas. O prólogo acontece no Aurora,
independentemente do clube escolhido para gestão.

Estude a caixa de Antônio → converse com Helena na diretoria → aceite a tarefa
→ entre no CT → observe Davi → volte e entregue o relatório.
Completar esse trecho dá 100 XP, nível 2, Análise 3, Comunicação 2 e confiança
de Helena. Você pode adiar as escolhas e não recebe recompensas duplicadas.
O diário registra a história. Os atributos ainda não dão bônus em partidas.

## Salvar

O progresso é salvo automaticamente neste navegador. **Exportar partida** baixa
um JSON; **Importar partida** valida e pede confirmação antes de substituir.
No celular, use o botão **···**. Aguarde “Salvo neste navegador” antes de fechar.
Use uma aba por partida; não há conta nem sincronização em nuvem.

Saves antigos (schema 1) migram sem perder resultados ou RPG. A liga antiga de
quatro clubes e seis rodadas é preservada até terminar; a temporada seguinte
adota os 12 clubes. Saves schema 2 também são migrados. Saves schema 3 também migram. Novos saves usam schema 4 na mesma chave do navegador.

## Limites desta versão

As 112 artes de futebol estão em uso em identidade, uniformes, calendário e
quatro áreas de decisões isométricas. Arquiteturas e quatro paletas de torcida
são compartilhadas entre clubes. Os cenários novos são áreas de gestão por clique;
a caminhada com personagem permanece nos três ambientes originais.
A partida tem animação representativa de jogadores e bola, não física completa
ou IA tática individual. A formação escolhida aparece no posicionamento visual da transmissão;
o motor ainda não calcula instruções táticas individuais.
Ainda não há acréscimos, lesões, prorrogação, disputa de pênaltis, contratos
individuais, mercado entre clubes, envelhecimento, multiplayer ou contas online.
