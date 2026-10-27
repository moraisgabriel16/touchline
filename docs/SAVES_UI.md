# Tela inicial, perfil e saves — v0.6

Implementado em 26/10/2026.

## Fluxo

Tela inicial → Nova carreira → nome e clube → slot vazio → jogo. Nome entre
2 e 32 caracteres, com espaços normalizados. São 12 clubes e três carreiras
independentes. A escolha do clube não altera os saves já existentes.

Continuar usa a última carreira selecionada que ainda tenha save válido. Minhas
carreiras mostra nome, clube, ano, rodadas concluídas, jogo em andamento e data
da gravação. A primeira carreira antiga conserva o conteúdo original e recebe
um nome ao continuar. O campo `managerName` é opcional no schema 4 e validado
na importação; saves anteriores sem nome permanecem legíveis.

## Persistência

- Slot 1: `touchline.web.save.v1` (a mesma chave da versão anterior).
- Slots 2 e 3: `touchline.web.save.v1.slot-2` e `.slot-3`.
- Cada slot armazena o Game em JSON, incluindo partida em andamento. Datas ficam
  em chaves auxiliares `.date`; falha em gravar a data não invalida o save.
- `touchline.active-slot.v1` aponta para a última carreira selecionada.
- `touchline.playing.v1` no sessionStorage identifica a sessão que deve retomar
  após reload. Menu inicial limpa esse marcador e grava antes de mudar de tela.
- Autosave: 200 ms após alterações de estado. Salvar agora grava imediatamente.
- Abrir a tela inicial não cria um save vazio nem sobrescreve uma carreira.

Use uma aba de jogo por vez. Os saves pertencem à origem e ao navegador:
localhost, Vercel e outro navegador têm armazenamentos separados. Exportar e
importar JSON faz a transferência; não há sincronização em nuvem.

## Operações protegidas

Criar e importar pelo menu só aceitam slots vazios. Importação valida o arquivo
(até 1 MB) e pede confirmação. Liberar slot pede confirmação e escreve o JSON
original em `.backup` antes de removê-lo; se o backup falhar, o save fica intacto.
Restaurar última cópia só funciona em slot vazio e valida o conteúdo.

A cópia é única por slot, não um histórico de versões. Reinício e importação
pelo menu interno antigo também fazem checkpoint antes da substituição. Para
preservar uma versão permanentemente, exporte o JSON. Limpar os dados do
navegador remove slots, metadados e cópias locais.

Saves corrompidos aparecem como ocupados, sem serem substituídos por uma nova
carreira. O arquivo original pode ser exportado. Erros de acesso ou espaço são
informados. Voltar ao menu após falha de gravação mantém a sessão aberta para
permitir exportação do progresso.

## Layout

Abertura com tipografia editorial, cores do jogo e CT isométrico renderizado com
os atlas existentes. Cadastro com cartões de clubes e resumo antes de começar.
Carreiras em três cartões no desktop e lista no celular. Barra lateral interna
mais compacta, rolagem discreta, perfil com nome e acesso a salvar/menu.

## Validação

Testes de lógica: isolamento dos slots, compatibilidade com save antigo, nomes,
restauração, proteção de slot ocupado, erro de quota antes da remoção,
corrupção isolada e save de partida ativa. Testes de navegador: primeira entrada,
duas carreiras, reload, troca, migração com nome, liberar/cancelar/restaurar,
importação inválida/válida e retomada de partida.
