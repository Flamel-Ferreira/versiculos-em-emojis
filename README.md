# Versículos em Emojis

Aplicação web infantil para memorizar versículos bíblicos com emojis. O adulto cadastra um
versículo, divide o texto em trechos e associa um emoji, uma cor e um rótulo opcional a cada
trecho. A criança aprende escondendo/revelando trechos e revisa em dois jogos: **Organização**
e **Quiz**.

Interface 100% em português do Brasil, sem backend e sem login. Todos os dados ficam no
`localStorage` do navegador.

## Requisitos

- Node.js 18 ou superior
- npm

## Como executar

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (por padrão `http://localhost:5173`).

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm test` | Executa os testes unitários (Vitest) |

## Funcionalidades

- **Início** — card de boas-vindas com o mascote e atalhos para cadastrar ou escolher um jogo.
- **Cadastrar** — referência em cascata (livro → capítulo → versículo) via API pública
  [bolls.life](https://bolls.life) (tradução ARA), seleção contígua de palavras, emoji (catálogo
  completo), cor e rótulo opcional por trecho. Exige pelo menos 3 trechos e bloqueia referências
  duplicadas.
- **Versículos** — galeria com modos Aprendizado/Revisão, filtros por status, contadores,
  exclusão com confirmação e faixa de até 3 emojis por card.
- **Aprendizagem** — esconde/revela trechos com explosão de emojis e som; marca o versículo como
  aprendido ao esconder todos os trechos pela primeira vez.
- **Organização** — ordenação por clique ou arrastar-e-soltar (mouse, toque e teclado), com
  feedback de acerto/erro e modal de conclusão.
- **Quiz** — identifica o versículo pela sequência de emojis. Opções sempre embaralhadas
  (3 ou 4 alternativas, conforme o total cadastrado). Erros não marcam como revisado.
- **Configurações** — exportar/importar JSON, apagar todos os dados e ligar/desligar sons.

## Persistência e backup

- Chave única no `localStorage`: `vee:data:v1`.
- O arquivo exportado contém `settings` e `verses`; a importação atua **somente** sobre os
  versículos. As preferências locais (ex.: som) nunca são alteradas.
- Sem versículos locais, a importação é aplicada direto. Com versículos locais, o app pergunta se
  deve **Substituir tudo** ou **Mesclar** (referências duplicadas são substituídas pelas do
  arquivo).
- Arquivo vazio ou sem nenhum versículo válido é recusado com um modal e nada é alterado.

## Stack

- React 18.3.1 + Vite 6
- React Router 7
- Tailwind CSS 4 (tokens em `@theme`)
- emoji-mart (seleção) + imagens Apple via CDN (renderização, com fallback nativo)
- dnd-kit (arrastar-e-soltar)
- canvas-confetti (explosão de emojis)
- Vitest (testes unitários)

> O React foi fixado em 18.3.1 por compatibilidade de peer dependency com o emoji-mart. O
> restante da stack segue o `SPEC.md`.

## Estrutura

```
src/
├─ components/   # layout, ui, emoji, cadastro, learn, review, gallery, settings
├─ config/       # tema, API e constantes
├─ context/      # AppDataContext (estado global) e ToastContext
├─ data/         # lista estática dos 66 livros
├─ hooks/        # som, confete, click outside etc.
├─ lib/          # tokenização, trechos, quiz, embaralhamento, schema
├─ pages/        # uma página por rota
├─ services/     # storage, API bíblica, backup e som
└─ routes.jsx    # mapa de rotas
```

## Acessibilidade e responsividade

- Header presente em todas as rotas, com item ativo apenas em Início/Cadastrar/Versículos.
- Modais com `role="dialog"`, foco preso, fechamento por Esc e retorno de foco.
- Botões com rótulos acessíveis, toasts com `aria-live` e suporte a teclado no drag-and-drop.
- Layout adaptado para celular (1 coluna), tablet (2 colunas) e desktop (3 colunas).
- Animações e confete respeitam `prefers-reduced-motion`.

## API bíblica

Os textos vêm da API pública `bolls.life`, tradução **ARA** (fixa). As requisições têm timeout,
uma tentativa extra e cache em memória por capítulo. Nenhum HTML da API é renderizado como HTML.

## Documentação

A especificação completa (regras de negócio, decisões e critérios de aceitação) está em
[`SPEC.md`](./SPEC.md).
# versiculos-em-emojis
