# Relatório de desenvolvimento: FinTrack

**Disciplina:** Programação para Dispositivos Móveis (IESB)
**Projeto:** FinTrack, app de finanças pessoais com React Native, Expo, Supabase e Open Finance
**Base:** guia "FinTrack — Guia de construção passo a passo" (Prof. Me. Bruno Assunção Dias, 17 etapas)
**Desenvolvimento assistido por IA:** Claude (modelo Claude Opus 5.5), usado pela extensão Claude Code no VS Code
**Período:** 25 a 26 de novembro de 2026

Este relatório registra como o projeto foi construído com apoio de uma IA. Para cada problema encontrado ele mostra o pedido feito (prompt), a resposta e o diagnóstico da IA, e a solução aplicada para o projeto seguir.

---

## 1. Resumo

| Item | Resultado |
|---|---|
| Etapas do guia implementadas | 1 a 17 (app base, Open Finance e publicação) |
| Testes automatizados | 4 suítes, **46 testes passando** (24 do app base e 22 do Open Finance) |
| Verificação de tipos (`tsc --noEmit`) | Sem erros |
| Formatação (Prettier) | Todos os arquivos no padrão |
| Empacotamento Android (`expo export`) | Sem erros |
| Backend | Supabase com 2 scripts SQL, RLS e 3 Edge Functions publicadas |
| Open Finance | Conexão e importação funcionando com o banco de teste (Pluggy Bank) |
| Problemas resolvidos durante o projeto | 11 (detalhados na seção 4) |

O guia foi escrito para o Expo SDK 57. O projeto foi criado com o **SDK 58** (React Native 0.88), a versão que o `create-expo-app` instalou na data. Algumas correções vieram dessa diferença. Outras vieram de mudanças em serviços externos (Pluggy) depois que o guia foi escrito.

---

## 2. Como a IA foi usada

A IA trabalhou como agente dentro do VS Code. Ela lia arquivos, rodava comandos no terminal, escrevia código e conferia os resultados. O fluxo seguiu este padrão:

1. **Pedido do aluno** (prompt) em linguagem natural.
2. **Investigação da IA:** leitura do PDF, comandos de diagnóstico, consulta à documentação oficial quando era preciso.
3. **Implementação** do código ou da configuração.
4. **Verificação:** typecheck, testes, empacotamento ou teste direto no serviço.
5. **Instruções ao aluno** para o que dependia dele: contas, chaves, celular e painel do Supabase.

A IA não tinha acesso ao celular, ao painel do Supabase nem às credenciais do Pluggy. Por isso, os testes no aparelho e as ações nos painéis foram feitos pelo aluno, seguindo as instruções. Quando a IA precisou publicar uma função no Supabase, a própria CLI exigiu a confirmação explícita do aluno antes da alteração.

---

## 3. Linha do tempo dos prompts

| # | Prompt do aluno (texto original) | O que a IA fez |
|---|---|---|
| 1 | "Preciso realizar o passo a passo para a criação de um projeto para dispositivos móveis seguindo o PDF enviado. Antes de começarmos, faça uma checklist do que eu preciso fazer/configurar no meu vs code ou afins para iniciar o projeto." | Localizou o PDF, contornou o fato de o PDF não ter texto extraível (problema 1) e montou a checklist da Etapa 1. Detectou que Node e Git não estavam instalados e que o PowerShell bloquearia o `npx` (problema 2). |
| 2 | "confira as versões intaladas antes de começarmos para ver se está tudo certo" | Conferiu Node 26 (LTS), npm 11, Git 2.56, a política de execução, as extensões e o Format On Save. Tudo aprovado. |
| 3 | "Com tudo de acordo, faça o projeto seguindo todo o passo a passo do fintrack, na pasta Documents\VScode\FinTrack. Para testes e afins que precisar de mim, explique de forma clara como executar sem erros." | Leu as 123 páginas e implementou as 17 etapas: projeto Expo, bibliotecas, SQL, tipos, tema, regras, testes, serviços, hooks, telas, Edge Functions e README. Corrigiu os problemas 3, 4 e 5. Validou com typecheck, 46 testes e empacotamento, e escreveu as instruções para o aluno. |
| 4 | "verifique o erro no terminal apos inicial o expo go" | Diagnosticou a URL do Supabase errada no `.env` (problema 6). |
| 5 | "Continua dando erro no expo go web" | Reproduziu o erro num navegador headless, rastreou até o `punycode` e corrigiu com o `metro.config.js` (problema 7). |
| 6 | "Erro no app após ir em perfil - contas bancárias: Could not find the table 'public.bank_connections' in the schema cache" | Consultou a API do Supabase e confirmou que o script `open-finance.sql` não tinha sido executado (problema 8). |
| 7 | "Quais são as páginas do app em que devo tirar as capturas de tela para o readme?" | Indicou as 3 telas (Início, Lançamentos e Contas bancárias) e os nomes dos arquivos esperados pelo README. |
| 8 | "não consigo autorizar acesso da minha conta para conectar o pluggy bank" | Identificou o retorno do navegador ao app falhando no Expo Go e mudou a autorização para dentro do app (problema 9). |
| 9 | "aparece nenhuma conta disponivel para compartilhar. assim não consigo apertar o botao para autorizar" | Consultou a documentação do Pluggy e informou os CPFs e o login de teste do sandbox de Open Finance (problema 10). |
| 10 | "consegui conectar, mas nao consigo sincronizar pelo app" (resposta: "Falha inesperada") e, em seguida, os logs da Edge Function | Analisou o log, que mostrava o Pluggy respondendo 410 (endpoint desativado), migrou para `/v2/transactions` e publicou a função (problema 11). |
| 11 | "Agora com tudo certo e enviar para o meu repositório do github, crie um relatório sobre todo o projeto que fizemos…" | Este relatório. Corrigiu também as imagens do README (`.png` → `.jpg`). |

---

## 4. Problemas encontrados e soluções

### Problema 1: o PDF do guia não tinha texto legível por máquina

- **Sintoma:** a leitura do PDF falhou. Tentativas de extrair o texto devolveram zero caracteres.
- **Diagnóstico da IA:** o arquivo tem 43 MB e 123 páginas, sem fontes embutidas. O texto foi convertido em desenhos vetoriais, então não há texto para extrair. O computador também não tinha Python nem ferramentas de PDF.
- **Solução:** a IA usou a API nativa do Windows (`Windows.Data.Pdf`) pelo PowerShell para transformar cada página em imagem e leu as imagens. Nas páginas com código pequeno (expressões regulares, testes, Edge Functions), renderizou recortes em resolução maior para transcrever cada caractere sem erro.
- **Lição:** com material didático em formato fechado, transformar as páginas em imagem é uma alternativa confiável.

### Problema 2: ambiente sem Node.js e Git, e PowerShell bloqueando o `npx`

- **Sintoma:** os comandos `node`, `npm` e `git` não existiam.
- **Diagnóstico da IA:** além de faltarem as ferramentas, a política de execução do PowerShell estava no padrão do Windows. Esse padrão bloqueia os scripts `npx.ps1` e `npm.ps1`, erro que o guia não menciona.
- **Solução:** a checklist incluiu instalar o Node LTS e o Git e rodar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. Depois a IA conferiu que o `npx` rodava num PowerShell novo.

### Problema 3: versão do Expo diferente da do guia (SDK 58 em vez de 57)

- **Sintoma:** o `create-expo-app@latest` criou o projeto com Expo SDK 58 e React Native 0.88.
- **Decisão:** manter o SDK 58. O guia orienta que, se o `create-expo-app` instalar outra versão, os comandos continuam os mesmos. Além disso, o Expo Go da loja acompanha a versão mais recente.
- **Consequência:** surgiram os problemas 4 e 7, que são diferenças dessa versão.

### Problema 4: três erros de tipagem do TypeScript

- **Sintoma:** o `npm run typecheck` acusou 3 erros em código transcrito fielmente do guia.
- **Diagnóstico da IA:** no React Native 0.88, mudaram duas tipagens:
  1. O tipo `ColorValue` passou a aceitar `null`, e o componente `Ionicons` não aceita `null` (em `app/(app)/(tabs)/_layout.tsx`).
  2. O `onRefresh` do `RefreshControl` passou a exigir uma função que não retorne valor, mas o `refetch` do TanStack Query retorna uma Promise com dados (em `index.tsx` e `transactions.tsx`).
- **Solução:**
  - `color={color as string}` no ícone das abas.
  - `onRefresh={() => void refetch()}` nas duas telas.

  O comportamento é o mesmo; só a tipagem ficou compatível.

### Problema 5: caracteres invisíveis nas expressões regulares

- **Sintoma:** depois da formatação, a expressão `/[̀-ͯ]/g`, que remove acentos, apareceu com caracteres estranhos.
- **Diagnóstico da IA:** a ferramenta de escrita de arquivos da própria IA convertia a sequência `̀` no caractere Unicode literal, que é invisível. O código funcionava (os testes passavam), mas ficava ilegível e frágil. O mesmo aconteceu com o ` ` do teste de dinheiro.
- **Solução:** a IA regravou os trechos com um script Node que escreve a barra invertida de fato. Depois varreu todos os arquivos `.ts` e `.tsx` procurando caracteres invisíveis e não encontrou nenhum.
- **Lição:** mesmo com testes passando, vale revisar o arquivo final. A IA percebeu o problema porque verificou o resultado em vez de confiar na escrita.

### Problema 6: o app não conectava ao Supabase

- **Prompt:** "verifique o erro no terminal apos inicial o expo go"
- **Diagnóstico da IA:** a IA não tinha acesso ao terminal do aluno, então analisou o `.env` sem exibir as chaves. A URL tinha 28 caracteres, exatamente o tamanho de `https://fintrack.supabase.co`. O Supabase não usa o nome do projeto na URL: usa um identificador de cerca de 20 letras. Um teste de DNS confirmou que o endereço não existia.
- **Solução:** o aluno copiou a **Project URL** correta do painel (Project Settings → Data API), corrigiu o `.env` e reiniciou com `npx expo start -c`. O `-c` limpa o cache, para o Expo não continuar usando a URL antiga. A IA confirmou que a nova URL respondia.

### Problema 7: tela em branco na versão web (`reading 'decode'`)

- **Prompt:** "Continua dando erro no expo go web"
- **Investigação da IA:**
  1. O servidor compilava o app para Android e para Web sem erro, então o problema acontecia em tempo de execução.
  2. A IA abriu o app num navegador Edge sem janela (headless) e capturou o console: `TypeError: Cannot read properties of undefined (reading 'decode')`.
  3. Rastreou o erro até o pacote `whatwg-url-without-unicode`, usado pelo `react-native-url-polyfill`, na linha `punycode.ucs2.decode(...)`.
  4. Descobriu que, na web, o Metro (empacotador do Expo) carregava `punycode.es6.js`, versão em que `ucs2` não existe como exportação nomeada. No celular o Metro usa `punycode.js` (CommonJS), que funciona.
  5. A primeira tentativa, carregar o polyfill só no celular, não resolveu, porque o widget do Pluggy (`react-native-pluggy-connect`) importa a própria cópia do polyfill.
- **Solução final:** criação do [`metro.config.js`](../metro.config.js), que obriga o Metro a usar `punycode/punycode.js` em todas as plataformas. A IA desfez a primeira tentativa, para não deixar código desnecessário.
- **Verificação:** a IA subiu um servidor de teste na porta 8082 e abriu o app no navegador headless. A tela de login apareceu sem erros no console.

### Problema 8: "Could not find the table 'public.bank_connections'"

- **Prompt:** "Erro no app após ir em perfil - contas bancárias: Could not find the table 'public.bank_connections' in the schema cache"
- **Diagnóstico da IA:** consultas à API do Supabase com a chave pública mostraram que:
  - `categories` existia (o `schema.sql` tinha sido executado);
  - `transactions` não tinha as colunas novas;
  - `bank_connections` não existia.

  O segundo script, `open-finance.sql` (Etapa 14.1), não tinha sido executado.
- **Solução:** o aluno executou `supabase/open-finance.sql` no SQL Editor do Supabase. A IA não executou o script porque isso exigiria a senha do banco ou a chave `service_role`, que não devem sair do painel.

### Problema 9: a autorização do banco não voltava para o app

- **Prompt:** "não consigo autorizar acesso da minha conta para conectar o pluggy bank"
- **Diagnóstico da IA:** primeiro, a IA confirmou que as Edge Functions estavam publicadas. Depois perguntou em que ponto a falha acontecia (resposta: na tela de autorização). No código do pacote instalado, encontrou que o widget usa `forceOauthInBrowser = true` por padrão. Com isso, a autorização abre no navegador externo e precisa voltar ao app por um link `exp://`, o que falha com frequência no Expo Go. O próprio guia prevê esse caso (Etapa 16.1 e Apêndice B).
- **Solução:** `forceOauthInBrowser={false}` no `<PluggyConnect>` em [`app/(app)/banks/connect.tsx`](../app/(app)/banks/connect.tsx). A autorização passou a acontecer dentro do app.

### Problema 10: "nenhuma conta disponível para compartilhar"

- **Prompt:** "aparece nenhuma conta disponivel para compartilhar. assim não consigo apertar o botao para autorizar"
- **Diagnóstico da IA:** era o fluxo de **Open Finance** do ambiente de testes do Pluggy, que só retorna contas com CPFs de teste específicos. A IA consultou a documentação oficial do Pluggy em vez de responder de memória.
- **Solução:** duas opções foram passadas ao aluno.
  - **Opção A:** usar o "Pluggy Bank" de login direto (`user-ok` / `password-ok` / `123456`), como no guia.
  - **Opção B:** no fluxo de Open Finance, usar o CPF de teste `761.092.776-73` e, no banco simulado, o login `ralph.bragg@gmail.com` / `P@ssword01`.

  A conexão foi concluída.

### Problema 11: "Falha inesperada" ao sincronizar (endpoint do Pluggy desativado)

- **Prompts:** "consegui conectar, mas nao consigo sincronizar pelo app" e, em seguida, os logs da Edge Function `bank-sync`.
- **Diagnóstico da IA:** a mensagem genérica significava um erro tratado só no servidor, então a IA pediu o log. O log mostrou:

  ```
  Pluggy /transactions?accountId=...&from=...&to=...&pageSize=500&page=1 respondeu 410:
  "This endpoint is deprecated. Use GET /v2/transactions with cursor pagination instead."
  ```

  A documentação do Pluggy confirmou que aplicações criadas a partir de 02/06/2026 recebem `410 ENDPOINT_DEPRECATED` no endereço antigo. O guia foi escrito antes dessa mudança.
- **Solução:** em [`supabase/functions/_shared/pluggy.ts`](../supabase/functions/_shared/pluggy.ts), a função `listTransactions` foi migrada para `GET /v2/transactions`:

  | Antes (guia) | Depois |
  |---|---|
  | `from` / `to` | `dateFrom` / `dateTo` |
  | `page` / `pageSize` / `totalPages` | Cursor: a resposta traz `next` (query string da próxima página, ou `null` no fim) |

  O restante da função (regras puras, verificação de dono, importação sem duplicar) não mudou.
- **Publicação:** a CLI do Supabase bloqueou o deploy feito pela IA até o aluno confirmar explicitamente. Após a confirmação, a função foi publicada com `npx supabase functions deploy bank-sync --use-api --yes`. O `--use-api` foi necessário porque o computador não tem Docker.
- **Resultado:** sincronização funcionando, e os lançamentos do banco de teste importados.

---

## 5. Diferenças em relação ao guia

| Arquivo | Mudança | Motivo |
|---|---|---|
| `app/(app)/(tabs)/_layout.tsx` | `color as string` no ícone das abas | Tipagem do React Native 0.88 (problema 4) |
| `app/(app)/(tabs)/index.tsx`, `transactions.tsx` | `onRefresh={() => void refetch()}` | Tipagem do React Native 0.88 (problema 4) |
| `metro.config.js` (novo) | Força `punycode/punycode.js` | Erro na versão web (problema 7) |
| `app/(app)/banks/connect.tsx` | `forceOauthInBrowser={false}` | Retorno do navegador no Expo Go (problema 9) |
| `supabase/functions/_shared/pluggy.ts` | `/v2/transactions` com cursor | Endpoint antigo desativado pelo Pluggy (problema 11) |
| `app.json` | `bundleIdentifier`/`package` próprios (`br.edu.iesb.nick2406.fintrack`) | O guia pede para trocar pelo nome do aluno |
| Etapa 2.7 | A tela temporária "FinTrack funcionando!" não foi criada | O projeto foi direto para as telas finais |

Todos os outros arquivos seguem o código do guia.

---

## 6. Verificações finais

```
npm run typecheck   -> sem erros
npm test            -> Test Suites: 4 passed | Tests: 46 passed, 46 total
npm run format      -> todos os arquivos no padrão do Prettier
npx expo export     -> bundle Android gerado sem erros
```

Testado no aparelho pelo aluno: cadastro e login, lançamentos, painel e gráfico, conexão com o banco de teste e sincronização.

---

## 7. Lições aprendidas

1. **Guias envelhecem.** Em poucos meses mudaram a versão do Expo e um endpoint do Pluggy. Ler a mensagem de erro e a documentação oficial atual foi mais útil do que seguir o guia ao pé da letra.
2. **O log é o caminho mais curto.** Uma mensagem genérica como "Falha inesperada" escondia uma causa simples (HTTP 410), que só apareceu no log da Edge Function.
3. **Verificar o que foi feito, não só o que foi pedido.** Os caracteres invisíveis (problema 5) e as imagens quebradas do README só foram encontrados porque a IA conferiu o resultado final.
4. **Segurança por padrão funciona.** As credenciais do Pluggy ficaram só como segredos do Supabase. A IA nunca exibiu as chaves do `.env`, e a CLI exigiu confirmação humana antes de alterar o servidor.
5. **Diferenças entre plataformas.** O mesmo código pode funcionar no celular e quebrar na web por detalhes do empacotador (problema 7).

---

## 8. Pendências e próximos passos

- Opcional (Etapa 17.3): gerar um APK de teste com EAS Build.
- Opcional (Etapa 16.1): conectar um banco real pelo Meu Pluggy e comparar com o extrato.
- Opcional: gravar um GIF de 20 a 30 segundos para o topo do README.
