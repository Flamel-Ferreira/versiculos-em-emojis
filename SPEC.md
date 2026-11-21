# SPEC — Versículos em Emojis (v2)

> **Documento de Especificação (Spec-Driven Development)**
> Status: **Especificação fechada (v1.2)** — aguardando comando explícito para iniciar a Fase 2.
> Versão: 1.2 · Data: 20/11/2026 · Idioma do produto: pt-BR

---

## Sumário

1. [Visão geral e escopo](#1-visão-geral-e-escopo)
2. [Stack e dependências](#2-stack-e-dependências)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Design system](#4-design-system)
5. [Modelo de dados](#5-modelo-de-dados)
6. [Persistência, exportação e importação](#6-persistência-exportação-e-importação)
7. [Rotas e navegação](#7-rotas-e-navegação)
8. [Arquitetura de componentes](#8-arquitetura-de-componentes)
9. [Estado global, hooks e utilitários](#9-estado-global-hooks-e-utilitários)
10. [Especificação por tela](#10-especificação-por-tela)
11. [Regras de negócio transversais](#11-regras-de-negócio-transversais)
12. [Integração com a API bolls.life](#12-integração-com-a-api-bollslife)
13. [Feedback visual e sonoro](#13-feedback-visual-e-sonoro)
14. [Responsividade e acessibilidade](#14-responsividade-e-acessibilidade)
15. [Erros, estados vazios e casos de borda](#15-erros-estados-vazios-e-casos-de-borda)
16. [Critérios de aceitação](#16-critérios-de-aceitação)
17. [Decisões aprovadas](#17-decisões-aprovadas)
18. [Plano de implementação (Fase 2)](#18-plano-de-implementação-fase-2)

---

## 1. Visão geral e escopo

Aplicação web infantil para **memorização de versículos bíblicos com emojis**. O adulto (professor/pai) cadastra um versículo, divide seu texto em trechos, associa um emoji, uma cor e um rótulo opcional a cada trecho. A criança aprende escondendo/revelando trechos e revisa em dois modos: **Organização** (ordenar emojis) e **Quiz** (identificar a referência a partir da sequência de emojis).

### 1.1 Objetivos

- Reproduzir fielmente o visual dos protótipos (exceto pontos explicitamente descartados).
- Funcionar 100% no navegador, sem backend próprio, com persistência em `localStorage`.
- Consumir a Bíblia via API pública `bolls.life` (sem chave).
- Estrutura modular, componentes reutilizáveis, código em JavaScript.

### 1.2 Fora de escopo (descartes explícitos do documento)

| Item do design | Decisão |
|---|---|
| Header com "Início / Atividades / Professores" | **Substituído** por "Início / Cadastrar / Versículos". |
| Sugestões rápidas de versículos no cadastro | **Não implementar**. |
| Texto "Texto principal" à direita do cabeçalho do trecho | **Não implementar**. |
| Botão de tela cheia no modo aprendizagem | **Não implementar**. |
| Barra de progresso no Quiz | **Não implementar**. |
| Botão "Próximo Nível" na tela de Organização | **Substituído** pelo modal de conclusão (voltar à galeria / tentar novamente). |
| Texto longo "Qual é a ordem correta dos emojis para: X?" | **Substituído** pela referência em destaque + subtítulo curto. |

### 1.3 Premissas de produto

- Uso prioritário em desktop/tablet (professor cadastra) e tablet/celular (criança joga).
- Sem autenticação, sem multiusuário, sem sincronização em nuvem.
- Toda a interface em português do Brasil.

---

## 2. Stack e dependências

| Camada | Escolha | Justificativa |
|---|---|---|
| Build | **Vite 6** + **React 19** (JavaScript, sem TS) | Stack obrigatória. |
| Rotas | **react-router-dom 7** (`BrowserRouter`, `Routes`, `Route`) | Rotas declarativas simples. |
| Estilo | **Tailwind CSS 4** (`@tailwindcss/vite`) + tokens em `@theme` | Utilitários + design tokens. |
| Ícones | **lucide-react** | Ícones de linha equivalentes aos do design. |
| Emojis (picker) | **@emoji-mart/data + @emoji-mart/react + emoji-mart** | Catálogo Unicode completo (estilo WhatsApp), busca e i18n pt. |
| Emojis (render) | **emoji-datasource-apple** via CDN (imagens) com fallback nativo | Fidelidade visual ao protótipo (emojis estilo Apple). |
| Explosão de emojis | **canvas-confetti** (`shapeFromText`) | Partículas performáticas em tela cheia. |
| Drag & drop | **@dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities** | Acessível, suporta arrastar entre listas e reordenar. |
| Classes condicionais | **clsx + tailwind-merge** | Helper `cn()`. |
| Datas/IDs | **crypto.randomUUID()** nativo | Sem dependência extra. |
| Testes (QA) | **vitest** (unitários de `lib/`) | Validação das regras críticas. |

**Sem** dependências de UI pesadas (Material, Chakra) — visual próprio.

### 2.1 Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

### 2.2 Configuração da API

`src/config/bible.js`

```js
export const BIBLE_API_BASE = 'https://bolls.life';
export const BIBLE_TRANSLATION = 'ARA'; // Almeida Revista e Atualizada — texto do protótipo
export const REQUEST_TIMEOUT_MS = 12000;
```

> A tradução é uma constante central (`ARA`, conforme decisão **P11**). Não haverá seletor de tradução na UI; trocar de versão é uma alteração de uma linha.
> A ARA envolve algumas falas em aspas simples (`'...'`). O serviço remove aspas externas antes de tokenizar (ver 12.2).

---

## 3. Estrutura de pastas

```
versiculos_em_emojis_v2/
├─ public/
│  └─ assets/
│     ├─ logo.png                 ← mover o arquivo da raiz para cá (usado só no card de boas-vindas)
│     └─ favicon.png              ← derivado do logo
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx                     ← providers + rotas
│  ├─ index.css                   ← Tailwind + @theme + keyframes
│  ├─ config/
│  │  ├─ bible.js                 ← base URL, tradução, timeouts
│  │  └─ theme.js                 ← paleta de trechos, labels, textos fixos
│  ├─ data/
│  │  └─ bibleBooks.js            ← 66 livros {id, name, chapters}
│  ├─ services/
│  │  ├─ bibleApi.js              ← fetch de capítulo/versículo + cache + sanitização
│  │  ├─ storage.js               ← load/save/reset do localStorage + schema
│  │  ├─ backup.js                ← exportar/importar JSON
│  │  └─ sound.js                 ← sons sintetizados (WebAudio)
│  ├─ context/
│  │  ├─ AppDataContext.jsx       ← versículos, settings, progresso
│  │  └─ ToastContext.jsx         ← toasts globais
│  ├─ hooks/
│  │  ├─ useBibleChapter.js
│  │  ├─ useBibleVerse.js
│  │  ├─ useEmojiBurst.js
│  │  ├─ useSound.js
│  │  ├─ useClickOutside.js
│  │  ├─ useLockBodyScroll.js
│  │  └─ useReducedMotion.js
│  ├─ lib/
│  │  ├─ cn.js
│  │  ├─ uid.js
│  │  ├─ tokenize.js              ← tokenização + offsets
│  │  ├─ sanitize.js              ← remoção de HTML/entidades da API
│  │  ├─ segments.js              ← ranges permitidos, validações, ownership
│  │  ├─ shuffle.js               ← embaralhar garantindo ordem ≠ correta
│  │  ├─ format.js                ← referência, truncamentos, datas
│  │  └─ quiz.js                  ← geração de opções e distratores
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppShell.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ AvatarMenu.jsx
│  │  │  ├─ Footer.jsx
│  │  │  ├─ PageContainer.jsx
│  │  │  ├─ PageTopBar.jsx
│  │  │  ├─ BackButton.jsx
│  │  │  └─ PageDecorations.jsx
│  │  ├─ ui/
│  │  │  ├─ Button.jsx
│  │  │  ├─ Card.jsx
│  │  │  ├─ Modal.jsx
│  │  │  ├─ ConfirmDialog.jsx
│  │  │  ├─ Badge.jsx
│  │  │  ├─ SegmentedToggle.jsx
│  │  │  ├─ Select.jsx
│  │  │  ├─ TextInput.jsx
│  │  │  ├─ Popover.jsx
│  │  │  ├─ Spinner.jsx
│  │  │  ├─ EmptyState.jsx
│  │  │  └─ ToastViewport.jsx
│  │  ├─ emoji/
│  │  │  ├─ Emoji.jsx
│  │  │  ├─ EmojiPickerButton.jsx
│  │  │  └─ EmojiBurstLayer.jsx
│  │  ├─ verses/
│  │  │  ├─ VerseCard.jsx
│  │  │  ├─ VerseStatusTag.jsx
│  │  │  ├─ VerseEmojiStrip.jsx
│  │  │  ├─ VerseRenderer.jsx
│  │  │  └─ ReviewModeModal.jsx
│  │  ├─ cadastro/
│  │  │  ├─ ReferencePicker.jsx
│  │  │  ├─ SegmentList.jsx
│  │  │  ├─ SegmentEditor.jsx
│  │  │  ├─ TokenSelectionPopover.jsx
│  │  │  ├─ ColorPalette.jsx
│  │  │  ├─ LabelEditor.jsx
│  │  │  ├─ DuplicateVerseModal.jsx
│  │  │  └─ RegisterSuccessModal.jsx
│  │  ├─ learn/
│  │  │  ├─ MemorizePanel.jsx
│  │  │  ├─ KeywordCounter.jsx
│  │  │  └─ SegmentToggleCard.jsx
│  │  ├─ review/
│  │  │  ├─ OrganizeBoard.jsx
│  │  │  ├─ SequenceSlots.jsx
│  │  │  ├─ ShuffledPool.jsx
│  │  │  ├─ SequenceCard.jsx
│  │  │  ├─ ReviewSuccessModal.jsx
│  │  │  ├─ QuizOptionCard.jsx
│  │  │  └─ QuizFeedbackModal.jsx
│  │  └─ settings/
│  │     ├─ ImportModeModal.jsx
│  │     └─ EmptyFileModal.jsx
│  ├─ pages/
│  │  ├─ HomePage.jsx
│  │  ├─ RegisterVersePage.jsx
│  │  ├─ GalleryPage.jsx
│  │  ├─ SettingsPage.jsx
│  │  ├─ LearnPage.jsx
│  │  ├─ OrganizePage.jsx
│  │  ├─ QuizPage.jsx
│  │  └─ NotFoundPage.jsx
│  └─ routes.jsx
├─ SPEC.md
├─ README.md
├─ index.html
├─ vite.config.js
├─ package.json
└─ .gitignore
```

**Movimentação do asset:** na Fase 2, `Mascote Principal com Moldura Brincalhona_margin.png` (raiz) → `public/assets/logo.png`.

**Uso do logo (P9):** o logo é usado **exclusivamente** no card de boas-vindas da Home, abaixo da pílula “Diversão Bíblica Infantil” e acima do título “Versículos em Emojis”. **Não** é usado no Header nem no Footer. Nesses dois locais, a marca é representada por um ícone de livro (`BookOpenText` do lucide, em círculo bege) + o nome “Versículos em Emojis”. O favicon é gerado a partir do logo.

---

## 4. Design system

### 4.1 Tokens de cor (Tailwind `@theme`)

| Token | Hex | Uso |
|---|---|---|
| `--color-page` | `#F2F5FD` | Fundo geral lilás-azulado |
| `--color-surface` | `#FFFFFF` | Cards e painéis |
| `--color-surface-muted` | `#E9EDFA` | Blocos internos, chips, campos |
| `--color-surface-strong` | `#DDE4F7` | Slots vazios, hover de chips |
| `--color-border` | `#E2E8F8` | Bordas suaves |
| `--color-ink` | `#20263D` | Texto principal |
| `--color-ink-soft` | `#4B5563` | Texto secundário |
| `--color-muted` | `#7C849B` | Texto auxiliar/placeholder |
| `--color-primary` | `#F7B51E` | Amarelo de ação (CTAs de cadastro, toggle ativo) |
| `--color-primary-hover` | `#EDA80D` | Hover do amarelo |
| `--color-primary-soft` | `#FDF1D2` | Fundos amarelos claros |
| `--color-accent` | `#1B4FA8` | Azul de ação (botões primários de jogo) |
| `--color-accent-hover` | `#16418C` | Hover do azul |
| `--color-accent-soft` | `#E4EBFA` | Fundos azuis claros |
| `--color-success` | `#16A34A` | Acerto |
| `--color-success-soft` | `#DCFCE7` | Fundo de acerto |
| `--color-danger` | `#EF4444` | Erro/exclusão |
| `--color-danger-soft` | `#FEE2E2` | Fundo de erro |

### 4.2 Paleta de trechos (cores de destaque)

Definida em `src/config/theme.js` e aplicada **inline** (evita classes dinâmicas do Tailwind).

| `id` | Nome | `bg` (destaque) | `bgSoft` (chip) | `ring` |
|---|---|---|---|---|
| `coral` | Coral | `#F87171` | `#FDE4E4` | `#F87171` |
| `sky` | Azul | `#7FB0F2` | `#E5EEFD` | `#7FB0F2` |
| `amber` | Amarelo | `#FCD34D` | `#FEF3D1` | `#FCD34D` |
| `lime` | Verde | `#B4E36A` | `#EEFAD9` | `#B4E36A` |
| `lilac` | Lilás | `#C4B5FD` | `#EDE9FE` | `#C4B5FD` |

Regras de contraste:
- Texto sobre `bgSoft` usa `--color-ink`.
- Emoji sempre dentro de um “chip” com `bg` da cor e leve `box-shadow` interno (como no design).
- O fundo do destaque no versículo usa `bgSoft`; o chip do emoji usa `bg` com 85% de opacidade.

### 4.3 Tipografia

- Família: **Nunito** (Google Fonts, pesos 400/600/700/800/900), fallback `system-ui, sans-serif`.
- Títulos de tela: 40–56px, peso 800, `tracking-tight`.
- Títulos de card: 22–26px, peso 800.
- Corpo: 16–18px, peso 600, `leading-relaxed`.
- Botões: 16–20px, peso 800.
- Texto do versículo (aprendizagem): 30–38px, peso 700, `leading-snug`.
- Rótulos de seção: 14–16px, peso 800, com ícone.

### 4.4 Formas, sombras e espaçamento

- Raio: cards `32px`, painéis internos `24px`, inputs `16px`, botões `999px`.
- Sombra padrão: `0 18px 40px -24px rgba(31, 45, 90, 0.28)`.
- Sombra de botão amarelo: `0 8px 0 -2px rgba(201, 141, 8, 0.55)` (efeito “3D” do design).
- Container: `max-width: 1200px`, padding lateral `24px` (desktop) / `16px` (mobile).
- Espaçamento vertical entre blocos: `24px` mobile / `32px` desktop.

### 4.5 Decorações de fundo

Componente `PageDecorations` renderiza SVGs decorativos posicionados de forma absoluta (atrás do conteúdo, `pointer-events-none`, `aria-hidden`):
- estrela/laço amarelo (topo esquerdo), nuvem (topo direito), flor rosa (direita), arco-íris (esquerda), confete (rodapé esquerdo).
- Ocultos em telas `< 768px` para não poluir.

### 4.6 Componentes base (aparência)

| Componente | Especificação |
|---|---|
| `Button` `primary` | Fundo amarelo, texto marrom-escuro `#3A2B00`, pill, ícone circular branco translúcido à esquerda e seta à direita (como CTAs da Home). |
| `Button` `accent` | Fundo azul, texto branco, pill, ícone circular translúcido. |
| `Button` `secondary` | Fundo `surface-muted`, texto `ink`, pill. |
| `Button` `ghost` | Transparente, texto `ink-soft`, hover `surface-muted`. |
| `Button` `danger` | Fundo `danger-soft`, texto `danger`, pill. |
| `Card` | Branco, raio 32px, sombra padrão, borda `border`. |
| `Modal` | Overlay `rgba(20,26,46,.45)` + blur leve; card branco central, raio 28px, `max-w-[520px]`, fecha com X, Esc e clique fora (quando `dismissible`). |
| `SegmentedToggle` | Trilho `surface-muted` pill; item ativo amarelo com sombra; ícones + rótulo. |
| `Select` | Fundo branco, raio 16px, ícone à esquerda, chevron à direita, altura 56px. |
| `Badge` | Pill `surface-muted`, ícone + texto, 14px/800. |
| `Toast` | Canto inferior direito, fundo `ink`, texto branco, ícone de status; auto-dismiss 4s. |

---

## 5. Modelo de dados

### 5.1 Estrutura raiz (localStorage)

Chave: **`vee:data:v1`**

```json
{
  "app": "versiculos-em-emojis",
  "version": 1,
  "settings": {
    "translation": "ARA",
    "soundEnabled": true
  },
  "verses": [ /* Verse[] */ ]
}
```

> **Preferências são locais do dispositivo.** `settings` é exportado junto com o backup, mas **nunca** é aplicado por importação (nem em “Substituir tudo”, nem em “Mesclar”). A importação atua apenas sobre `verses` (M1).

### 5.2 `Verse`

```json
{
  "id": "c1a2…",
  "reference": {
    "bookId": 43,
    "bookName": "João",
    "chapter": 3,
    "verse": 16
  },
  "referenceLabel": "João 3:16",
  "translation": "ARA",
  "fullText": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
  "tokens": ["Porque", "Deus", "amou", "o", "mundo", "de", "tal", "maneira", "que", "deu", "o", "seu", "Filho", "unigênito,", "para", "que", "todo", "aquele", "que", "nele", "crê", "não", "pereça,", "mas", "tenha", "a", "vida", "eterna."],
  "segments": [
    {
      "id": "s1…",
      "startToken": 0,
      "endToken": 4,
      "text": "Porque Deus amou o mundo",
      "emoji": "❤️",
      "colorId": "coral",
      "label": "Amor"
    }
  ],
  "progress": {
    "learned": false,
    "learnedAt": null,
    "reviewModes": [],
    "reviewedAt": null
  },
  "createdAt": "2026-11-19T12:00:00.000Z",
  "updatedAt": "2026-11-19T12:00:00.000Z"
}
```

Regras:
- `tokens` é derivado de `fullText` no momento do cadastro e persistido para estabilidade.
- `segments` é ordenado por `startToken` (ordem canônica = ordem dos trechos).
- `text` é sempre `tokens.slice(startToken, endToken + 1).join(' ')`; validado ao carregar (ver 11.2).
- `progress.reviewModes` aceita `"organization"` e/ou `"quiz"` (sem duplicatas).
- `label` é `string | null`. Rótulos são “tudo ou nada” por versículo.
- `colorId` ∈ `['coral','sky','amber','lime','lilac']`.

### 5.3 Invariantes

1. `segments.length >= 3` para qualquer versículo salvo.
2. Trechos não se sobrepõem e estão em ordem crescente de `startToken`.
3. Todo `startToken`/`endToken` está em `[0, tokens.length - 1]`.
4. `startToken <= endToken`.
5. Emoji não vazio em todo trecho salvo.
6. Ou todos os trechos têm `label` preenchido, ou todos têm `label === null`.
7. `progress.learned === false` ⇒ `progress.reviewModes.length === 0`.

---

## 6. Persistência, exportação e importação

### 6.1 `storage.js`

```js
loadData()        // → { app, version, settings, verses } | estado inicial
saveData(data)    // grava com try/catch (quota/JSON inválido)
resetData()       // remove a chave
isStorageAvailable()
```

- Leitura protegida: se JSON inválido, schema desconhecido ou versão futura → retorna estado inicial e registra aviso em toast (“Não foi possível carregar os dados salvos”).
- Escrita em toda mutação do provider (síncrona).
- Sem sincronização entre abas.

### 6.2 Exportação

`services/backup.js → exportBackup(data)`

- Botão da UI: **“Exportar JSON”** (P7).
- Payload = exatamente a estrutura raiz (5.1) + `exportedAt` (ISO).
- Nome do arquivo: `versiculos-em-emojis-AAAA-MM-DD.json`.
- Download via `Blob` + `<a download>`.
- Inclui `settings` e `verses` (com progresso). `settings` vai no arquivo apenas como registro/backup; a importação **ignora** preferências (M1).

### 6.3 Importação

`importBackup(file) → { data, ignored } | { error: 'invalid' | 'empty' | 'no-valid' }`

- Botão da UI: **“Importar JSON”** (P7).
- Aceita `.json` até 5 MB.
- **Validações de estrutura:** JSON válido → `app === 'versiculos-em-emojis'` → `version <= 1` → `Array.isArray(verses)`.
- **Validação de conteúdo:** cada versículo passa no sanitizador de schema. Inválidos são descartados e contabilizados em `ignored`.
- **Deduplicação interna do arquivo:** se o próprio JSON trouxer duas entradas com a mesma referência, a última vence (mantém a invariante de referência única).
- **Arquivo vazio (M7):** se `verses.length === 0`, **ou** se todos os itens forem inválidos (`validVerses.length === 0`), a operação é **cancelada** e um modal de aviso é exibido:
  - sem entradas → “O arquivo está vazio. Nenhum dado foi importado.”
  - com entradas, mas nenhuma válida → “Nenhum versículo válido foi encontrado no arquivo. Nenhum dado foi importado.”
  - Nenhum modal de Substituir/Mesclar é aberto nesse caso.
- **Definição de “dados locais” (M3):** `verses.length > 0`.
  - O modal Substituir/Mesclar existe **somente** para decidir o destino dos **versículos** locais.
  - Preferências (`settings`: som, etc.) são sempre locais e nunca são substituídas ou mescladas (M1). Por isso, um usuário que apenas desligou o som, sem nenhum versículo, **não** vê o modal — não há versículos a perder.
- **Sem versículos locais:** importa automaticamente, sem popup, e navega para `/versiculos` (P8).
- **Com versículos locais:** abre `ImportModeModal` com duas opções (P8):
  1. **Substituir tudo** — aviso explícito: “Todos os versículos e progressos deste navegador serão apagados e substituídos pelos do arquivo.” Substitui apenas `verses`; `settings` permanecem intactos.
  2. **Mesclar** — texto explicativo: “Os versículos do arquivo serão adicionados aos atuais. Se houver a mesma referência bíblica, **a versão local será substituída** pela do arquivo.” Mescla por chave `bookId:chapter:verse`; `settings` permanecem intactos.
  - Fechar (X/Esc) ou “Cancelar” → nada é importado.
- **Não há confirmação adicional** depois da escolha — o próprio modal já é a confirmação (P14).
- Em qualquer importação concluída com sucesso → toast “X versículos importados” + navegação para `/versiculos` (M2).
- Arquivo inválido (JSON malformado, app/versão errados) → toast “Arquivo inválido” e permanência na tela de Configurações.

### 6.4 Exclusão total

- Botão “Deletar dados” → `ConfirmDialog` com texto de consequência → `resetData()` + estado inicial + toast.
- Não apaga o arquivo exportado anteriormente.

---

## 7. Rotas e navegação

| Rota | Página | Item ativo no header |
|---|---|---|
| `/` | Home | **Início** |
| `/cadastrar` | Cadastro de versículo | **Cadastrar** |
| `/versiculos` | Galeria | **Versículos** |
| `/versiculos/:verseId/aprender` | Aprendizagem | **nenhum** |
| `/versiculos/:verseId/revisar/organizacao` | Revisão — Organização | **nenhum** |
| `/versiculos/:verseId/revisar/quiz` | Revisão — Quiz | **nenhum** |
| `/configuracoes` | Configurações | **nenhum** |
| `*` | NotFound → redireciona para `/` | — |

Regras:
- Item ativo calculado por **match exato** de `pathname` (não usar `startsWith`, senão as rotas de jogo destacariam “Versículos”).
- `verseId` inexistente → redireciona para `/versiculos` com toast “Versículo não encontrado”.
- Botão voltar da galeria → `/`; das telas de jogo → `/versiculos`.
- O header é renderizado em **todas** as rotas (inclusive jogos), conforme requisito.
- Rota de revisão só é acessível para versículos aprendidos; caso contrário, redireciona para a galeria com toast “Aprenda o versículo antes de revisar”.
- Quiz exige **pelo menos 3 versículos cadastrados** (P3); senão, o botão fica desabilitado no modal e a rota redireciona para a galeria com toast explicativo.

### 7.1 Diagrama de navegação

```
Home ──► Cadastrar ──► (modal sucesso) ──► Galeria
  │                                          │
  ├──► Galeria ──► Aprender ────────────────┘
  │        │
  │        ├──► (modal modo) ──► Organização ──► (modal sucesso) ──► Galeria
  │        └──► (modal modo) ──► Quiz ────────► (modal feedback) ──► Galeria
  │
  └──► Avatar ──► Configurações
```

---

## 8. Arquitetura de componentes

### 8.1 Árvore geral

```
<App>
 └─ <AppDataProvider>
     └─ <ToastProvider>
         └─ <BrowserRouter>
             └─ <AppShell>            // Header + main + Footer + decorações + EmojiBurstLayer
                 └─ <Routes> … páginas
```

### 8.2 Layout

#### `AppShell`
| Prop | Tipo | Descrição |
|---|---|---|
| `children` | `ReactNode` | Conteúdo da rota |

Renderiza `Header`, `<main className="flex-1">`, `Footer`, `PageDecorations`, `ToastViewport`, `EmojiBurstLayer`. `min-h-screen` com fundo `page`.

#### `Header`
Sem props. Usa `useLocation`.
- Esquerda: **ícone de livro** (`BookOpenText`) em círculo bege (40px) + “Versículos em Emojis” em duas linhas (peso 800). O PNG do mascote **não** é usado aqui (P9).
- Centro: nav com 3 links pill (`Início`, `Cadastrar`, `Versículos`), ativo em amarelo.
- Direita: `AvatarMenu` (círculo marrom-oliva com ícone de usuário).
- Sticky no topo, fundo branco 85% + blur, borda inferior suave.
- Mobile: marca compacta + nav em linha rolável; avatar sempre visível.

#### `AvatarMenu`
Sem props. Estado interno `open`.
- Botão circular `aria-haspopup="menu"`, `aria-expanded`.
- Dropdown com item “Configuração” (ícone `Settings`) → navega para `/configuracoes`.
- Fecha com Esc, clique fora e ao navegar.

#### `Footer`
Sem props. Três colunas (empilhadas no mobile): ícone de livro + nome “Versículos em Emojis”; descrição “Aprender a Palavra com alegria e cor para crianças e educadores.”; **“© {anoAtual} Versículos em Emojis.”**, com `anoAtual = new Date().getFullYear()` (P25). O PNG do mascote **não** é usado aqui (P9).

#### `PageTopBar`
| Prop | Tipo | Default |
|---|---|---|
| `backTo` | `string` | — |
| `backLabel` | `string` | `'Voltar'` |
| `title` | `string` | — |
| `subtitle` | `string?` | — |

Usado nas telas de jogo (barra branca arredondada com voltar à esquerda e título centralizado).

### 8.3 UI

| Componente | Props principais |
|---|---|
| `Button` | `variant`, `size`, `iconLeft`, `iconRight`, `fullWidth`, `loading`, `disabled`, `to`, `onClick`, `children` |
| `Card` | `as`, `className`, `children` |
| `Modal` | `open`, `onClose`, `title`, `description`, `icon`, `children`, `footer`, `size`, `dismissible` |
| `ConfirmDialog` | `open`, `title`, `message`, `confirmLabel`, `cancelLabel`, `tone`, `onConfirm`, `onCancel` |
| `Badge` | `tone`, `icon`, `children` |
| `SegmentedToggle` | `options[{value,label,icon}]`, `value`, `onChange`, `ariaLabel` |
| `Select` | `label`, `icon`, `value`, `onChange`, `options[{value,label}]`, `placeholder`, `disabled`, `loading`, `error` |
| `TextInput` | `label`, `value`, `onChange`, `placeholder`, `maxLength`, `error`, `icon`, `disabled` |
| `Popover` | `open`, `onClose`, `anchorRef`, `align`, `width`, `children` |
| `EmptyState` | `icon`, `title`, `description`, `action` |
| `Spinner` | `size`, `label` |

### 8.4 Emojis

#### `Emoji`
| Prop | Tipo | Default |
|---|---|---|
| `char` | `string` | — |
| `size` | `number` (px) | `32` |
| `className` | `string?` | — |
| `decorative` | `boolean` | `true` |

- Renderiza `<img>` com a imagem Apple (`emoji-datasource-apple` via CDN), `alt` = char quando não decorativo.
- Fallback em cadeia: `unified` com FE0F → sem FE0F → `<span>` com o caractere nativo.
- `loading="lazy"` exceto em contextos animados.

#### `EmojiPickerButton`
| Prop | Tipo | Descrição |
|---|---|---|
| `value` | `string` | Emoji atual |
| `onChange` | `(emoji) => void` | Seleção |
| `colorId` | `string` | Cor de fundo do chip |
| `size` | `number` | Tamanho do emoji |

- Abre `Popover` com `<Picker>` do emoji-mart (`locale="pt"`, `perLine={8}`, `previewPosition="none"`, `theme="light"`).
- Fecha ao selecionar, Esc ou clique fora.
- Sem emoji selecionado → ícone `SmilePlus` + “Escolher emoji”.

#### `useEmojiBurst()`
```js
const { burst } = useEmojiBurst();
burst(['❤️', '🌍']); // dispara explosão
```
- `canvas-confetti` com `shapeFromText({ text: emoji, scalar: 3 })`.
- 3 rajadas (centro, esquerda, direita), `particleCount` 40 por emoji, `spread: 360`, `startVelocity: 45`, `ticks: 250`, `scalar: 3.5`, `gravity: 0.9`.
- Respeita `prefers-reduced-motion` (reduz para 1 rajada curta).
- `EmojiBurstLayer` monta um `<canvas>` fixo, `pointer-events-none`, `z-50`.

### 8.5 Versículos

#### `VerseCard`
| Prop | Tipo |
|---|---|
| `verse` | `Verse` |
| `mode` | `'learn' \| 'review'` |
| `onAction` | `(verse) => void` |
| `onDelete` | `(verse) => void` |

Estrutura: referência (topo esquerdo) + lixeira (topo direito) + `VerseStatusTag` + `VerseEmojiStrip` + trecho de texto (2 linhas) + botão de ação.

#### `VerseStatusTag`
| Prop | Tipo |
|---|---|
| `mode` | `'learn' \| 'review'` |
| `learned` | `boolean` |
| `reviewModes` | `string[]` |

- `learn`: `learned ? {ícone: Check, texto: 'Aprendido', tom: success} : {ícone: Circle, texto: 'Não aprendido', tom: muted}`
- `review`: `0 modos` → bolinha + “Não revisado”; `1 modo` → um “check” + “Revisado”; `2 modos` → dois “checks” sobrepostos (estilo “Entregue” do WhatsApp) + “Revisado”.

#### `VerseEmojiStrip`
| Prop | Tipo |
|---|---|
| `segments` | `Segment[]` |
| `max` | `number` (default `3`) |

- Fundo `surface-muted`, raio 24px, emojis 40–48px.
- Exibe **até 3 emojis**; se houver mais, chip `+N` com a quantidade restante (P12). Ex.: 5 trechos → 3 emojis + `+2`.

#### `VerseRenderer`
| Prop | Tipo |
|---|---|
| `verse` | `Verse` |
| `hiddenSegmentIds` | `Set<string>` |
| `showQuotes` | `boolean` (default `true`) |
| `size` | `'md' \| 'lg'` |

- Reconstrói o texto percorrendo `tokens` e agrupando por trecho.
- Trecho visível: chip com `bgSoft` + emoji + texto.
- Trecho oculto: chip com `bgSoft` + emoji + `•••••` (letter-spacing largo).
- Tokens fora de trechos: texto normal.
- Aspas curvas decorativas no início/fim quando `showQuotes`.

### 8.6 Cadastro

#### `ReferencePicker`
| Prop | Tipo |
|---|---|
| `value` | `{ bookId, chapter, verse }` |
| `onChange` | `(next) => void` |
| `verseOptions` | `number[]` |
| `loadingVerses` | `boolean` |
| `error` | `string?` |
| `disabled` | `boolean` |

- Livro: select com 66 livros (`bibleBooks.js`).
- Capítulo: select `1..book.chapters`.
- Versículo: select populado após fetch do capítulo.
- Ao trocar livro → limpa capítulo/versículo. Ao trocar capítulo → limpa versículo.
- A confirmação de reset de trechos é responsabilidade da página (ver 10.2).

#### `SegmentList`
| Prop | Tipo |
|---|---|
| `segments` | `Segment[]` |
| `tokens` | `string[]` |
| `onAdd` | `() => void` |
| `onRemove` | `(id) => void` |
| `onUpdate` | `(id, patch) => void` |
| `canAdd` | `boolean` |

#### `SegmentEditor`
| Prop | Tipo |
|---|---|
| `index` | `number` |
| `segment` | `Segment` |
| `tokens` | `string[]` |
| `allowedRange` | `{ min: number, max: number }` |
| `onUpdate` | `(patch) => void` |
| `onRemove` | `() => void` |

- Linha 1: input somente leitura, clicável, abre `TokenSelectionPopover`. Placeholder “Toque aqui para escolher as palavras”.
- Linha 2: `EmojiPickerButton` + `ColorPalette` + `LabelEditor` + botão lixeira. **`flex-nowrap`** (não quebra linha); em telas estreitas, `overflow-x-auto` com `scrollbar-hide`.
- Cabeçalho: “Trecho {index+1}” — índice derivado da posição no array.

#### `TokenSelectionPopover`
| Prop | Tipo |
|---|---|
| `open` | `boolean` |
| `onClose` | `() => void` |
| `tokens` | `string[]` |
| `allowedRange` | `{ min, max }` |
| `initialRange` | `{ start, end } \| null` |
| `onApply` | `(range) => void` |

- Título “✨ Toque nas palavras para adicionar a este trecho:” + instrução de seleção contígua.
- Tokens em `flex-wrap`; selecionados em azul com check; indisponíveis (fora do range) em cinza claro, `disabled`.
- Rodapé: “Selecionar todas” · “Limpar” · botão amarelo “Aplicar trecho” (desabilitado sem seleção).
- Regras de clique descritas em 11.3.

#### `ColorPalette`
| Prop | Tipo |
|---|---|
| `value` | `string` |
| `onChange` | `(colorId) => void` |
| `compact` | `boolean` |

Cinco círculos; selecionado recebe anel e check branco.

#### `LabelEditor`
| Prop | Tipo |
|---|---|
| `value` | `string \| null` |
| `onChange` | `(value) => void` |

- Sem rótulo: botão tracejado “+ Rótulo”.
- Com rótulo: input inline (máx. **24 caracteres** — P5) + botão de remover.
- Placeholder “Ex.: Amor de Deus”.

#### `DuplicateVerseModal`
| Prop | Tipo |
|---|---|
| `open` | `boolean` |
| `referenceLabel` | `string` |
| `onClose` | `() => void` |

- Ícone de aviso (âmbar), título “Versículo já cadastrado”.
- Texto: “Já existe um versículo com a referência **{referência}**. Não é permitido cadastrar duplicatas.”
- Complemento: “Se quiser cadastrá-lo novamente, exclua manualmente a versão existente na galeria de versículos antes de cadastrar esta referência.”
- Um único botão “Entendi” (fecha). Sem ação de exclusão automática (P4).

### 8.7 Aprendizagem

| Componente | Props |
|---|---|
| `MemorizePanel` | `verse`, `hiddenIds`, `onToggleSegment`, `onHideAll`, `onRevealAll` |
| `KeywordCounter` | `count` |
| `SegmentToggleCard` | `segment`, `hidden`, `onToggle` |

`SegmentToggleCard`: card branco 150×150 (desktop), emoji grande em chip colorido, pill de status `Oculto` (vermelho suave, ícone `EyeOff`) / `Visível` (azul suave, ícone `Eye`).

### 8.8 Revisão — Organização

| Componente | Props |
|---|---|
| `OrganizeBoard` | `verse`, `onSolved` |
| `SequenceSlots` | `slots`, `segments`, `feedback`, `locked`, `onRemove`, `dnd` |
| `ShuffledPool` | `items`, `segments`, `feedback`, `onPick`, `dnd` |
| `SequenceCard` | `segment`, `variant`, `state`, `position`, `onClick`, drag handle |
| `ReviewSuccessModal` | `open`, `onRetry`, `onBack` |

- `slots`: `(segmentId | null)[]` com tamanho = `segments.length`.
- `pool`: `segmentId[]` embaralhado.
- DnD com `DndContext` + `SortableContext`; cartões com handle de 6 pontos.
- Feedback por trecho: `'correct' | 'wrong' | null`.

### 8.9 Revisão — Quiz

| Componente | Props |
|---|---|
| `QuizOptionCard` | `letter`, `referenceLabel`, `text`, `selected`, `disabled`, `onSelect` |
| `QuizFeedbackModal` | `open`, `correct`, `correctReference`, `onRetry`, `onBack` |

- `letter`: A, B, C, D (com 3 versículos cadastrados existem apenas 3 opções: A–C).
- Texto da opção com `line-clamp-2`.
- Círculo de seleção à direita; selecionado = azul com check.
- A ordem das opções é **sempre embaralhada**; nenhuma posição é fixa ou derivada da ordem de cadastro (P24).

### 8.10 Configurações

#### `ImportModeModal`
| Prop | Tipo |
|---|---|
| `open` | `boolean` |
| `fileName` | `string` |
| `verseCount` | `number` |
| `onReplace` | `() => void` |
| `onMerge` | `() => void` |
| `onCancel` | `() => void` |

- Título “Como deseja importar?” + nome do arquivo e quantidade de versículos.
- Opção 1 — **Substituir tudo**: destaque de risco “Todos os versículos e progressos locais serão perdidos.”
- Opção 2 — **Mesclar**: “Adiciona os versículos do arquivo aos atuais. Em caso de referências duplicadas, os dados locais serão substituídos pelos do arquivo.”
- Rodapé informativo: “Suas preferências (como o som) não serão alteradas.”
- Botão “Cancelar” / X / Esc → cancela a importação.
- A escolha já é a confirmação final (P14): não abrir segundo diálogo.

#### `EmptyFileModal`
| Prop | Tipo |
|---|---|
| `open` | `boolean` |
| `reason` | `'empty' \| 'no-valid'` |
| `onClose` | `() => void` |

- Ícone de aviso, título “Arquivo vazio”.
- Texto conforme `reason`: “O arquivo está vazio. Nenhum dado foi importado.” ou “Nenhum versículo válido foi encontrado no arquivo. Nenhum dado foi importado.”
- Botão “Entendi”. A operação é cancelada e nada é alterado (M7).

---

## 9. Estado global, hooks e utilitários

### 9.1 `AppDataContext`

```js
{
  verses,               // Verse[]
  settings,             // { translation, soundEnabled }
  ready,                // boolean (hidratação inicial)
  getVerse(id),         // Verse | undefined
  addVerse(verse),      // → Verse salvo
  updateVerse(id, patch),
  deleteVerse(id),
  markLearned(id),      // idempotente
  markReviewed(id, mode),
  updateSettings(patch),
  replaceAll(data),     // importação
  resetAll()            // deletar dados
}
```

Implementação: `useReducer` + `useEffect` de persistência. Nenhum componente lê `localStorage` diretamente.

Ações do reducer: `HYDRATE`, `ADD_VERSE`, `UPDATE_VERSE`, `DELETE_VERSE`, `MARK_LEARNED`, `MARK_REVIEWED`, `UPDATE_SETTINGS`, `REPLACE_ALL`, `RESET`.

### 9.2 Hooks

| Hook | Retorno |
|---|---|
| `useAppData()` | Contexto acima (erro se fora do provider) |
| `useBibleChapter(bookId, chapter)` | `{ verses: [{verse, text}], loading, error, retry }` |
| `useBibleVerse(bookId, chapter, verse)` | `{ text, tokens, loading, error, retry }` |
| `useSound()` | `{ playSuccess, playReveal, playError, enabled }` |
| `useEmojiBurst()` | `{ burst }` |
| `useReducedMotion()` | `boolean` |
| `useClickOutside(ref, cb, active)` | — |
| `useLockBodyScroll(active)` | — |

### 9.3 Utilitários (`lib/`)

```js
tokenize(text) -> { tokens: string[], offsets: [{start,end}] }
stripHtml(html) -> string            // remove tags, <sup>…</sup>, decodifica entidades, normaliza espaços
getAllowedRange(segments, index, total) -> { min, max }
validateSegments(segments, tokens) -> { valid: boolean, errors: string[] }
buildTokenOwnership(segments, total) -> Map<tokenIndex, segmentId>
shuffle(arr) -> arr                  // Fisher-Yates
shuffleNotSolved(ids) -> ids         // garante ordem ≠ correta
buildQuizOptions(target, verses) -> Option[]
formatReference(bookName, chapter, verse) -> 'João 3:16'
truncate(text, max) -> string
```

**Regras de `getAllowedRange`** (ver 11.4):
```
prev = segments[index - 1]
next = segments[index + 1]
min = prev ? prev.endToken + 1 : 0
max = next ? next.startToken - 1 : total - 1
```

**`buildQuizOptions`**: exige **3+ versículos**; retorna o alvo + **exatamente `min(4, total) - 1` distratores** sorteados entre os demais versículos, totalizando `min(4, total)` opções, sempre embaralhadas e com letras atribuídas após o embaralhamento (P3, P24). Ex.: total 3 → 1 alvo + 2 distratores; total 4+ → 1 alvo + 3 distratores.

---

## 10. Especificação por tela

### 10.1 Home (`/`)

**Layout**
1. Header (Início ativo).
2. Card hero centralizado (`max-w-[760px]`), nesta ordem: badge “📌 Diversão Bíblica Infantil”; **logo do mascote** em círculo bege (~190px) — único uso do PNG na aplicação (P9); título “Versículos em Emojis” (48–56px); subtítulo “Aprenda a Palavra de Deus brincando! ✨ 📖”; divisor decorativo (linha – sol – linha).
3. Dois CTAs grandes empilhados:
   - “Cadastrar Versículo” / “Criar novos enigmas e lições” → `/cadastrar` (amarelo).
   - “Selecionar Versículo” / “Escolher um jogo para decifrar!” → `/versiculos` (azul).
4. Footer.

**Interações**
- CTAs navegam.
- Nenhum dado é necessário para renderizar.

**Estados**: nenhum (estático).

### 10.2 Cadastro (`/cadastrar`)

**Layout**
1. Header (Cadastrar ativo).
2. `BackButton` “Voltar ao Menu” → `/`.
3. Card branco:
   - Título “✏️ Cadastro de Versículo” + subtítulo “Divida o versículo em trechos fáceis e conecte cada parte ao seu emoji ilustrativo!”.
   - Painel “Referência Bíblica:” (`surface-muted`) com selects de Livro, Capítulo, Versículo.
   - Seção “❞ Trechos do Versículo”.
   - Lista de trechos (cards internos `surface-muted`).
   - Botão “+ Adicionar novo trecho”.
   - Botão azul “Cadastrar Versículo” + texto auxiliar “Tudo pronto? Clique acima para cadastrar o versículo e gerar os jogos infantis!”.
4. Footer.

**Estado local**
```js
{
  bookId, chapter, verse,
  chapterVerses,          // number[]
  loadingChapter, chapterError,
  verseText, tokens,
  segments: SegmentDraft[],   // {localId, startToken, endToken, text, emoji, colorId, label}
  popover: { segmentId, selection: {start,end} | null } | null,
  pendingReference,       // referência aguardando confirmação de reset
  submitting, successOpen
}
```

**Fluxo de referência**
1. Livro → habilita capítulo.
2. Capítulo → dispara `useBibleChapter`; popula versículo.
3. Versículo → dispara `useBibleVerse`; guarda `fullText` e `tokens`; habilita “Adicionar novo trecho”.
4. Se já existem trechos e o usuário altera qualquer um dos três campos → `ConfirmDialog`: “Trocar a referência apaga todos os trechos já criados. Deseja continuar?”.
   - Confirmar → limpa trechos e aplica a nova referência.
   - Cancelar → restaura a seleção anterior.
5. Falha de rede → mensagem inline “Não foi possível carregar o capítulo. Verifique sua conexão.” + “Tentar novamente”.

**Fluxo de trechos**
1. “Adicionar novo trecho” desabilitado se referência incompleta ou se o último trecho ainda não tem texto aplicado. Tooltip explica o motivo.
2. Ao adicionar: cria trecho com `colorId` = próxima cor da paleta (ciclo), `emoji = null`, `label = null`, sem seleção.
3. Clique na linha 1 → abre popover com tokens; range permitido calculado por 11.4.
4. “Aplicar trecho” grava `startToken/endToken/text` e fecha o popover.
5. Excluir trecho → remove e renumera automaticamente os demais (o índice exibido é a posição).
6. Rótulos: qualquer trecho pode ter; a validação “tudo ou nada” ocorre no submit (11.5).

**Submit**
- Botão habilitado quando: referência completa **e** `segments.length >= 3` **e** todos os trechos têm texto, emoji e cor.
- Ao clicar:
  1. Valida invariantes (11.5). Se falhar → erros inline + toast; não salva.
  2. **Duplicidade (P4):** se já existir versículo com a mesma referência (`bookId:chapter:verse`), abre `DuplicateVerseModal` e interrompe o salvamento. O modal informa que não é permitido duplicar e que o usuário deve excluir manualmente a versão existente na galeria antes de cadastrar novamente. Nenhuma exclusão automática é oferecida.
  3. `addVerse({...})` com `progress` zerado.
  4. Abre `RegisterSuccessModal`:
     - Ícone de sucesso, “Versículo cadastrado com sucesso! 🎉”, referência.
     - Ações: “Continuar cadastrando” (fecha e reseta o formulário para o estado inicial) e “Ir para a galeria” (`/versiculos`).
     - Fechar pelo X = permanecer no formulário **resetado**.

**Regras de reset**
- Após sucesso + “Continuar cadastrando”: limpa referência, texto, trechos, erros; mantém scroll no topo.

### 10.3 Galeria (`/versiculos`)

**Layout**
1. Header (Versículos ativo).
2. Card superior branco: `BackButton` “Voltar” à esquerda; eyebrow “GALERIA BÍBLICA” + título “Versículos”; `SegmentedToggle` à direita (Aprendizado / Revisão).
3. Painel CTA (`surface-muted`): ícone 📌 + “Vamos memorizar juntos!” + texto “Toque nos cartões para aprender e memorizar a Palavra de Deus.”; à direita badge com troféu: “Aprendidos X de Y” ou “Revisados X de Y”.
4. **Filtro** (novo, não está no design): linha de chips `Todos | Aprendidos | Não aprendidos` (ou `Revisados | Não revisados`), com contagem opcional.
5. Grid de cards (1 / 2 / 3 colunas).
6. Footer.

**Estado local**
```js
{
  mode: 'learn' | 'review',   // default 'learn'
  filter: 'all' | 'done' | 'pending',
  reviewModalVerseId: string | null,
  deleteTarget: Verse | null
}
```

**Derivações**
- `learn`: lista = todos os versículos; badge = `learnedCount / total`.
- `review`: lista = apenas `progress.learned === true`; badge = `reviewedCount / learnedCount`.
- Ao trocar de modo, `filter` volta para `'all'`.
- Contagens recalculadas a partir da lista atual (exclusão reflete imediatamente).

**Card**
- Referência em destaque.
- Tag de status (aprendido/não aprendido ou revisado/não revisado) — **novo elemento**, abaixo da referência.
- Lixeira no canto superior direito (`aria-label="Excluir versículo"`).
- Faixa de emojis (até **3** emojis + chip `+N`) — P12.
- Trecho do texto do versículo (`line-clamp-2`, com aspas).
- Botão de ação:
  - modo `learn` → “Aprender versículo” → `/versiculos/:id/aprender`.
  - modo `review` → “Revisar versículo” → abre `ReviewModeModal`.
- Card inteiro não é clicável (evita cliques acidentais); apenas o botão.

**`ReviewModeModal`**
- Título “Como você quer revisar?” + referência.
- Botão “Organização” (ícone `ListOrdered`) → `/versiculos/:id/revisar/organizacao`.
- Botão “Quiz” (ícone `Sparkles`) → `/versiculos/:id/revisar/quiz`.
  - Desabilitado se `verses.length < 3` (P3), com legenda “Cadastre pelo menos 3 versículos para desbloquear o Quiz.”
- Fechar com X/Esc.

**Exclusão**
- `ConfirmDialog`: “Excluir {referência}? Todo o progresso desse versículo será perdido.” → confirmar remove; toast “Versículo excluído”.

**Estados vazios**
- Sem versículos: `EmptyState` “Nenhum versículo cadastrado ainda” + CTA “Cadastrar primeiro versículo”.
- Modo revisão sem aprendidos: “Nenhum versículo aprendido ainda. Aprenda um versículo para liberar a revisão.”
- Filtro sem resultados: “Nenhum versículo neste filtro.”

### 10.4 Aprendizagem (`/versiculos/:id/aprender`)

**Layout**
1. Header (nenhum item ativo).
2. `PageTopBar`: voltar → `/versiculos`; título “Versículo”; subtítulo “Modo Memorização com Emojis”.
3. Card do versículo:
   - Chip “🔑 N palavras-chave ativas” (N = nº de trechos).
   - Texto do versículo com trechos destacados (10.4.1).
   - Chip escuro no canto inferior direito com ícone de livro + referência.
4. Instrução “✋ Toque nos emojis para esconder ou revelar palavras!”.
5. Fita de cards de emojis (4 colunas no desktop, 2 no mobile).
6. Botões “🙈 Esconder tudo” (secundário) e “✨ Revelar tudo” (amarelo).

**Estado local**
```js
{
  hiddenIds: Set<string>   // inicia vazio (todos visíveis)
}
```

**10.4.1 Renderização do trecho**
- Visível: `[emoji] texto` dentro de chip `bgSoft`, texto `ink`.
- Oculto: `[emoji] •••••` dentro do mesmo chip; o restante do versículo permanece legível.
- Trechos não selecionados aparecem como texto comum.

**Interações**
- Clique em card visível → adiciona ao `hiddenIds`, atualiza card para “Oculto”, dispara `burst([emoji])` + `playSuccess()`.
- Clique em card oculto → remove do `hiddenIds`, card volta a “Visível”, dispara **apenas** `playReveal()` (som neutro, sem explosão de emojis) — P20.
- “Esconder tudo” → todos ocultos; `burst(todos os emojis)` + `playSuccess()`; idempotente se já ocultos (P21).
- “Revelar tudo” → limpa `hiddenIds`, dispara `playReveal()` (som neutro) e **não** explode emojis.
- Ao esconder **todos** os trechos pela primeira vez (individualmente ou via “Esconder tudo”) → `markLearned(verse.id)` (P1).
- Ao sair e voltar, todos os trechos começam visíveis (não persistir `hiddenIds`).

**Acessibilidade**: cards são `<button>` com `aria-pressed`; texto oculto tem `aria-label` “Trecho oculto”.

### 10.5 Revisão — Organização (`/versiculos/:id/revisar/organizacao`)

**Layout**
1. Header (nenhum ativo).
2. `BackButton` “Voltar” → `/versiculos` (pill branco, alinhado à esquerda).
3. Card superior: badge amarelo “⭐ DESAFIO: ORGANIZE”; **referência em destaque** (“João 3:16”, azul, 40–48px); subtítulo “Toque nos emojis abaixo para colocá-los na sequência certa da história bíblica!”.
4. Card “📋 Sua Sequência:” + link “↺ Recomeçar”:
   - `N` slots vazios com “1º Emoji”, “2º Emoji”… (fundo `surface-strong`).
   - Slots preenchidos mostram emoji + rótulo (se houver) + “Toque para retirar”.
   - Divisor com dica dinâmica: `💡 Dica: Comece por "{primeiros ~32 caracteres do trecho 1}…"`.
5. Card “🔀 Emojis Embaralhados:” com os cards restantes (emoji + rótulo quando existir).
6. Botão “🚀 Conferir Ordem” (desabilitado até todos os slots preenchidos).
7. Modal de sucesso.

**Estado local**
```js
{
  slots: (segmentId | null)[],
  pool: segmentId[],
  feedback: Record<segmentId, 'correct' | 'wrong'>,
  lockedIds: Set<string>,
  checking: boolean,
  successOpen: boolean
}
```

**Inicialização**
- `slots` = array de `null` (tamanho = nº de trechos).
- `pool` = `shuffleNotSolved(segmentIds)` — nunca na ordem correta no início.
- `feedback` vazio.

**Interações**
- Clique em card do pool → vai para o primeiro slot vazio (da esquerda para a direita).
- Clique em card do slot → volta para o pool (se não estiver travado por acerto).
- Drag & drop:
  - pool → slot vazio: posiciona.
  - pool → slot ocupado: o card do slot volta ao pool e o arrastado ocupa o lugar.
  - slot → slot: troca os dois.
  - slot → pool: remove.
  - Cards com feedback `correct` ficam travados (não arrastáveis) (P22).
- “Recomeçar” → todos os cards voltam ao pool, embaralha novamente (≠ ordem correta), limpa feedback/travas.

**Conferir**
1. Habilita somente com todos os slots preenchidos.
2. Compara `slots[i]` com `segments[i].id`:
   - Correto → feedback `correct`, card travado, fundo verde.
   - Incorreto → card volta ao pool com feedback `wrong` (fundo vermelho por 2s) (P22).
3. Se tudo correto:
   - `markReviewed(id, 'organization')`.
   - `burst(todos os emojis)` + `playSuccess()`.
   - `ReviewSuccessModal`: “Parabéns! Você organizou perfeitamente: {referência}!” + botões “Tentar novamente” (reinicia tabuleiro embaralhado) e “Voltar para a galeria”.
4. Se houver erros: nenhum modal; usuário reposiciona os cards devolvidos.

### 10.6 Revisão — Quiz (`/versiculos/:id/revisar/quiz`)

**Layout**
1. Header (nenhum ativo).
2. Barra branca: `BackButton` “Voltar” → `/versiculos` + título “Quiz Bíblico” à direita. **Sem barra de progresso.**
3. Card do desafio: badge “🧩 Desafio de Decodificação”; pergunta “Que versículo é representado por esta sequência de emojis?”; faixa `surface-muted` com os emojis do versículo-alvo na ordem correta, separados por setas (sem rótulos).
4. Grid 2×2 de opções (1 coluna no mobile): letra (A–D), referência, texto do versículo em até 2 linhas, círculo de seleção.
5. Botão “Enviar Resposta →” (azul), desabilitado sem seleção.
6. `QuizFeedbackModal`.

**Estado local**
```js
{
  options: Option[],        // { verseId, referenceLabel, text }
  selectedId: string | null,
  submitted: boolean,
  feedback: { correct: boolean } | null,
  submitting: boolean
}
```

**Geração das opções**
- Correto = versículo da rota.
- Distratores = **exatamente `min(4, verses.length) - 1`** outros versículos sorteados aleatoriamente.
  - 3 versículos → 2 distratores (3 opções, A–C).
  - 4 versículos → 3 distratores (4 opções, A–D).
  - 5+ versículos → 3 distratores sorteados (4 opções, A–D).
- Se `verses.length < 3` → rota redireciona para a galeria com toast (P3).
- **Embaralhamento obrigatório:** posições das opções sorteadas; letras atribuídas após o embaralhamento. Nenhuma ordem predefinida (por cadastro, referência, etc.) — P24.
- Ao “Tentar novamente” → regenera distratores e embaralha novamente.
- A sequência de emojis do desafio permanece na ordem correta do versículo (é a pista do quiz).

**Envio**
- Sem seleção → botão desabilitado.
- Ao enviar: compara `selectedId === verse.id`.
- Correto → `markReviewed(id, 'quiz')` + `burst(emojis)` + `playSuccess()` + modal de acerto.
- Incorreto → modal de erro exibindo a referência correta; **sem** marcar revisado (P2).
- Modal sempre com “Tentar novamente” e “Voltar para a galeria”.

### 10.7 Configurações (`/configuracoes`)

Sem design de referência — mesmo estilo do restante.

**Layout**
1. Header (nenhum item ativo).
2. `BackButton` “Voltar ao Menu”.
3. Título “Configurações” + subtítulo “Gerencie os dados e preferências do aplicativo.”
4. Card “Dados do aplicativo”:
   - **Exportar JSON** — “Salvar um arquivo .json com versículos, progresso e preferências.” → botão “Exportar JSON”.
   - **Importar JSON** — “Restaurar o aplicativo a partir de um arquivo .json exportado.” → botão “Importar JSON” (P7).
   - **Deletar dados** — “Apagar permanentemente todos os versículos e progressos.” → botão vermelho “Deletar tudo”.
5. Card “Preferências”:
   - Toggle “Sons de feedback” (ligado por padrão) — P13.
   - **Sem** seletor de tradução (P11 — ARA fixa).
6. Card “Sobre”: nome, versão, crédito da API.
7. Footer.

**Comportamentos**
- **Importar JSON:** input file oculto (`.json`) → parse/validação.
  - **Arquivo vazio** (`verses` ausente/vazio ou sem nenhum versículo válido): abre `EmptyFileModal`, cancela a operação e não altera nada (M7).
  - Sem versículos locais: importa direto (sem popup) e navega para `/versiculos`.
  - Com versículos locais: abre `ImportModeModal` (Substituir tudo / Mesclar / Cancelar) e aplica a escolha, sem confirmação extra (P8, P14).
  - **Preferências nunca mudam** em nenhuma das opções — som e demais `settings` continuam locais (M1).
  - Sucesso → toast + navegação para `/versiculos`. Erro → toast e permanece na tela.
- **Deletar:** `ConfirmDialog` de confirmação explícita; após deletar, contadores e galeria refletem estado vazio.
- **Exportar JSON:** gera o download; não navega.

### 10.8 NotFound

- Redireciona para `/` (ou página 404 simples com link). Decisão: redirect + toast.

---

## 11. Regras de negócio transversais

### 11.1 Tokenização

- `tokenize(text)` usa `/\S+/g` sobre o texto sanitizado; preserva pontuação junto ao token (“unigênito,”).
- Normaliza espaços múltiplos e remove tags HTML.
- O texto renderizado é a junção dos tokens com espaço simples.
- Aspas tipográficas são adicionadas apenas na renderização (não fazem parte dos tokens).

### 11.2 Integridade dos trechos

Ao carregar dados:
- Ordenar `segments` por `startToken`.
- Recalcular `text` a partir dos tokens; se divergir, prevalecem os índices.
- Descartar (ou reparar) trechos com índices inválidos; se o versículo ficar com < 3 trechos válidos, mantê-lo na galeria mas bloquear os jogos com aviso.

### 11.3 Seleção de tokens no popover

- Intervalo permitido: `[min, max]` (11.4).
- Tokens fora do intervalo: desabilitados visualmente.
- Clique em token não selecionado **dentro** do intervalo:
  - Sem seleção → seleciona apenas ele.
  - Antes do início → novo início = token clicado (respeitando `min`).
  - Depois do fim → novo fim = token clicado (respeitando `max`).
  - Entre início e fim (buraco) → nada acontece (seleção é sempre contígua).
- Clique em token selecionado:
  - Na extremidade → remove aquela extremidade (se sobrar 1, limpa).
  - No meio → nada acontece + micro-feedback (“Selecione apenas pelas extremidades”).
- “Selecionar todas” → `[min, max]` (não o versículo inteiro, para respeitar os outros trechos) (P19).
- “Limpar” → seleção vazia.
- “Aplicar trecho” desabilitado se seleção vazia.

### 11.4 Ordem e exclusividade dos trechos

- Trecho 1 pode usar tokens a partir do índice 0.
- Trecho N só pode usar tokens **após** o `endToken` do trecho N−1.
- Trecho N também não pode invadir o `startToken` do trecho N+1 (ao editar um trecho já existente).
- Um token pertence a no máximo um trecho.
- Não é obrigatório cobrir o versículo inteiro; lacunas são permitidas.
- Trechos não podem se sobrepor nem ficar fora de ordem.
- “Adicionar novo trecho” só é liberado quando o trecho anterior já tem texto aplicado.
- Ao excluir um trecho, os seguintes são renumerados e mantêm seus intervalos.

### 11.5 Validação no cadastro

Ordem de verificação e mensagens:

| # | Regra | Mensagem |
|---|---|---|
| 1 | Referência completa | “Selecione livro, capítulo e versículo.” |
| 2 | Mínimo de 3 trechos | “Adicione pelo menos 3 trechos.” |
| 3 | Texto aplicado em todos | “O trecho {n} está sem texto.” |
| 4 | Emoji em todos | “Escolha um emoji para o trecho {n}.” |
| 5 | Cor definida em todos | “Escolha uma cor para o trecho {n}.” |
| 6 | Rótulos tudo ou nada | “Preencha o rótulo de todos os trechos ou remova todos.” |
| 7 | Sem sobreposição/ordem | “Os trechos estão em ordem inválida. Revise as seleções.” |
| 8 | Duplicidade de referência (P4) | Abre `DuplicateVerseModal`: “Já existe um versículo com esta referência. Exclua a versão existente na galeria antes de cadastrar novamente.” |

- Botão desabilitado cobre 1–5; 6–8 são verificados no clique com erros inline.

### 11.6 Progresso

| Evento | Efeito |
|---|---|
| Esconder **todos** os trechos pela 1ª vez (individualmente ou via “Esconder tudo”) | `learned = true`, `learnedAt = now` |
| Concluir Organização com **todos** os cards corretos | adiciona `'organization'` a `reviewModes` |
| **Acertar** o Quiz | adiciona `'quiz'` a `reviewModes` |
| Conclusão bem-sucedida de revisão | `reviewedAt = now` |

- `reviewed` (derivado) = `reviewModes.length > 0`.
- “Revisado nos dois modos” = `reviewModes.length === 2`.
- Tentativas erradas **não** marcam como revisado (P2).
- Revelar trechos depois de esconder não desfaz `learned` (P1).
- Excluir versículo remove todo o progresso.
- Refazer o aprendizado não remove modos de revisão já conquistados.

### 11.7 Regras de exibição por modo

| Contexto | Lista | Tag | Ação |
|---|---|---|---|
| Galeria / Aprendizado | todos | Aprendido / Não aprendido | “Aprender versículo” |
| Galeria / Revisão | apenas aprendidos | Revisado (1 ou 2 checks) / Não revisado | “Revisar versículo” |
| Revisão — Organização | versículo aprendido | — | — |
| Revisão — Quiz | versículo aprendido | — | — |

---

## 12. Integração com a API bolls.life

Base: `https://bolls.life` · CORS liberado (`Access-Control-Allow-Origin: *`) · sem chave.

### 12.1 Endpoints usados

| Uso | Endpoint |
|---|---|
| Lista de versículos do capítulo | `GET /get-text/{translation}/{bookId}/{chapter}/` |
| Texto de um versículo (opcional) | `GET /get-verse/{translation}/{bookId}/{chapter}/{verse}/` |

- Livros e capítulos vêm de `src/data/bibleBooks.js` (estático, 66 livros com nomes pt-BR curtos e contagem de capítulos).
- O capítulo é buscado apenas para: (a) saber quantos versículos existem; (b) obter o texto do versículo selecionado.
- Cache em memória `Map` por `translation/book/chapter` durante a sessão.
- `AbortController` com timeout de 12s; 1 retry automático; depois estado de erro com botão “Tentar novamente”.

### 12.2 Sanitização

O campo `text` vem em HTML (ex.: `<i>`, `<b>`, `<font>`, `<sup>?</sup>`):

```js
stripHtml(html) =>
  html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')   // remove marcadores de nota
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')                  // remove demais tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    // demais entidades via DOMParser
    .replace(/\s+/g, ' ')
    .trim();

stripWrappingQuotes(text) =>
  text.replace(/^['"“”‘’]+/, '').replace(/['"“”‘’]+$/, '').trim();
```

- **ARA:** algumas falas vêm envolvidas em aspas simples (`'...'`). O serviço remove aspas externas antes de tokenizar, para não duplicar com as aspas decorativas da renderização.
- Nunca usar `dangerouslySetInnerHTML`.
- A sanitização ocorre no service, antes de tokenizar.
- Também normalizar espaços não separáveis e remover caracteres de controle.

### 12.3 Tratamento de erros

| Situação | UI |
|---|---|
| Sem conexão / timeout | “Não foi possível carregar o capítulo. Verifique sua conexão.” + “Tentar novamente” |
| Capítulo inexistente | “Capítulo não encontrado.” |
| Resposta vazia | “Nenhum versículo encontrado para esta referência.” |
| Versículo fora do capítulo | Select limita às opções reais |

---

## 13. Feedback visual e sonoro

### 13.1 Som (`services/sound.js`)

Sintetizado via WebAudio (sem arquivos):

- `playSuccess()`: arpejo ascendente C5–E5–G5–C6 (triangle), envelope suave, ~0,55s, ganho 0,18. Usado ao ocultar trecho, “Esconder tudo”, concluir Organização e acertar o Quiz.
- `playReveal()`: **som neutro** de uma única nota curta (ex.: E5, sine, ~0,18s, ganho 0,10), sem caráter de comemoração. Usado ao revelar um trecho oculto **e** ao “Revelar tudo” (P20).
- `playError()` (opcional): duas notas descendentes suaves.
- Contexto criado sob demanda no primeiro gesto do usuário (política de autoplay).
- Respeita `settings.soundEnabled`; `prefers-reduced-motion` afeta apenas animações, não o som.

### 13.2 Explosão de emojis

- Disparada ao ocultar um trecho, ao “Esconder tudo”, ao concluir Organização e ao acertar o Quiz.
- **Não** dispara ao revelar trechos (P20).
- Emojis usados: o do trecho clicado ou todos os trechos.
- Efeito “exagerado”: 3 origens, partículas grandes (scalar 3.5), rotação, queda com gravidade, duração ~2,5s.
- Respeita `prefers-reduced-motion` (1 rajada curta, sem queda longa).

### 13.3 Outros feedbacks

- Botões: hover/active com translateY e sombra.
- Toasts para ações destrutivas/erros.
- Modal de sucesso com ícone animado (CSS `scale-in`).

---

## 14. Responsividade e acessibilidade

### 14.1 Breakpoints

| Faixa | Comportamento |
|---|---|
| `< 640px` | Header compacto; CTAs full-width; cards 1 coluna; fita de emojis 2 colunas; slots 2 colunas; quiz 1 coluna; linha 2 do trecho com scroll horizontal; popover quase full-screen. |
| `640–1024px` | Grid 2 colunas; fita de emojis 2–4 colunas; slots 4 colunas. |
| `≥ 1024px` | Layout do protótipo: grid 3 colunas; fita 4 colunas; slots 4 colunas; quiz 2×2. |

### 14.2 Acessibilidade

- Contraste mínimo AA em textos e botões.
- Navegação por teclado: todos os controles focáveis com `focus-visible:ring`.
- Modais: `role="dialog"`, `aria-modal`, foco inicial no primeiro controle, foco preso, retorno do foco ao gatilho, Esc fecha.
- DnD do dnd-kit com `KeyboardSensor` (espaço + setas).
- `aria-live="polite"` para toasts e contadores.
- Emojis decorativos com `aria-hidden`; emojis informativos com `alt`/`aria-label`.
- `prefers-reduced-motion` desativa/reduz confete e animações.
- Textos alternativos em botões de ícone (lixeira, avatar, fechar).

---

## 15. Erros, estados vazios e casos de borda

| Caso | Comportamento |
|---|---|
| localStorage indisponível | App funciona em memória; banner “Os dados não serão salvos neste navegador.” |
| JSON corrompido no storage | Estado inicial + toast de aviso; não sobrescreve até a primeira ação. |
| Importação com versículos inválidos | Importa os válidos; informa quantos foram ignorados. |
| Arquivo de importação vazio | `EmptyFileModal`; operação cancelada; nada é alterado (M7). |
| Arquivo sem nenhum versículo válido | `EmptyFileModal` com motivo “nenhum válido”; operação cancelada (M7). |
| Versículo com < 3 trechos (dados antigos) | Card aparece; jogos bloqueados com aviso. |
| Versículo removido enquanto em jogo (outra aba) | Não sincroniza; ao voltar à galeria reflete o estado atual. |
| API fora do ar no cadastro | Impossível selecionar versículo; mensagem + retry. |
| Quiz com menos de 3 versículos | Botão bloqueado com explicação; rota redireciona (P3). |
| Referência duplicada no cadastro | `DuplicateVerseModal`; salvamento bloqueado (P4). |
| Importação sem dados locais | Aplica direto, sem popup, e navega para a galeria (P8). |
| Importação com dados locais | Modal Substituir/Mesclar; cancelar não altera nada (P8). |
| JSON com referências repetidas | Deduplica pelo último registro do arquivo. |
| Organização com 3 trechos | 3 slots; layout se adapta. |
| Organização com > 6 trechos | Slots quebram em 2 linhas; cards menores. |
| Emoji não encontrado na CDN | Fallback nativo. |
| Rótulo muito longo | Limite de 24 caracteres no input. |
| Texto do versículo muito longo | Container cresce; tipografia reduz em telas pequenas. |
| Duplo clique em “Conferir” | `checking` bloqueia reentrada. |
| Excluir último versículo | Galeria vai para estado vazio; contadores 0 de 0. |
| Navegar direto para rota inválida | Redirect + toast. |

---

## 16. Critérios de aceitação

### 16.1 Global
- [ ] Build (`npm run build`) sem erros nem warnings críticos.
- [ ] Nenhum erro no console durante os fluxos principais.
- [ ] Header presente em todas as rotas, com item ativo correto e **nenhum** ativo em jogos/configurações.
- [ ] Avatar abre menu com “Configuração” e navega para `/configuracoes`.
- [ ] Footer em todas as páginas, com ano atual calculado dinamicamente.
- [ ] Interface 100% em pt-BR.
- [ ] Dados persistem após recarregar a página.
- [ ] Layout funcional em 360px, 768px e 1280px.

### 16.2 Home
- [ ] Logo exibido a partir de `public/assets/logo.png`, **apenas** no card de boas-vindas.
- [ ] Ordem do card: pílula → logo → título → subtítulo.
- [ ] Header/Footer usam ícone de livro, sem o PNG do mascote.
- [ ] Dois CTAs navegam corretamente.
- [ ] Visual fiel (badge, círculo do logo, divisor, botões com ícones).

### 16.3 Cadastro
- [ ] Livro/capítulo/versículo vêm da API/lista e populam em cascata.
- [ ] “Adicionar novo trecho” bloqueado sem referência completa.
- [ ] Trocar referência com trechos existentes pede confirmação e reseta ao confirmar.
- [ ] Popover lista tokens; seleção só contígua; tokens de outros trechos bloqueados.
- [ ] Trecho 2 não inicia antes do fim do trecho 1.
- [ ] “Selecionar todas”, “Limpar” e “Aplicar trecho” funcionam.
- [ ] Linha 2 não quebra; emoji, cor, rótulo e lixeira funcionam.
- [ ] Excluir trecho renumera os restantes.
- [ ] Cadastro bloqueado com < 3 trechos.
- [ ] Validações de texto/emoji/cor e rótulos tudo-ou-nada exibem mensagens.
- [ ] Rótulo limitado a 24 caracteres.
- [ ] Referência duplicada abre `DuplicateVerseModal` e não salva (P4).
- [ ] Sucesso abre modal com as duas opções; “Continuar” reseta o formulário.
- [ ] Versículo salvo aparece na galeria com emojis e texto corretos.

### 16.4 Galeria
- [ ] Toggle alterna modos e recalcula badge/filtros.
- [ ] Badge mostra contagem correta e atualiza após exclusão.
- [ ] Filtro funciona nos dois modos.
- [ ] Tag de status correta (bolinha / 1 check / 2 checks).
- [ ] Modo revisão lista apenas aprendidos.
- [ ] Lixeira no canto superior direito, com confirmação.
- [ ] Ação “Aprender” navega; “Revisar” abre modal com Organização e Quiz.
- [ ] Faixa de emojis mostra no máximo 3 + chip `+N`.
- [ ] Quiz bloqueado com menos de 3 versículos, com legenda explicativa.
- [ ] Estados vazios corretos.

### 16.5 Aprendizagem
- [ ] Todos os trechos visíveis ao entrar.
- [ ] Contador de palavras-chave correto.
- [ ] Clique em card oculta o trecho no versículo e muda o card para “Oculto”.
- [ ] Explosão de emojis + som feliz ao ocultar.
- [ ] “Esconder tudo” oculta todos, com explosão de todos os emojis + som.
- [ ] Clique em card oculto revela o trecho com som neutro e **sem** explosão.
- [ ] “Revelar tudo” mostra todos, com som neutro e **sem** explosão.
- [ ] Voltar retorna à galeria.
- [ ] Versículo marcado como aprendido ao esconder todos os trechos pela 1ª vez (P1).

### 16.6 Organização
- [ ] Referência em destaque substitui o texto longo.
- [ ] Cards começam embaralhados e nunca na ordem correta.
- [ ] Clique posiciona no primeiro slot vazio; clique no slot devolve.
- [ ] Arrastar entre pool/slots e trocar posições funciona.
- [ ] “Recomeçar” devolve todos e reembaralha.
- [ ] “Conferir” só habilita com tudo preenchido.
- [ ] Acertos ficam verdes/travados; erros voltam ao pool em vermelho.
- [ ] Conclusão: som + confete + modal com “Tentar novamente” e “Voltar”.
- [ ] Progresso de revisão registrado.

### 16.7 Quiz
- [ ] Sem barra de progresso.
- [ ] Sequência de emojis na ordem correta, sem rótulos.
- [ ] 3 ou 4 opções (`min(4, total)`), com referência + texto em 2 linhas.
- [ ] Opções e letras sempre embaralhadas, sem ordem predefinida (P24).
- [ ] Quantidade de distratores = `min(4, total) - 1`, sempre sorteados.
- [ ] “Enviar Resposta” desabilitado sem seleção.
- [ ] Acerto/erro exibem modal com “Tentar novamente” e “Voltar”.
- [ ] Acerto marca revisado; erro não.
- [ ] Tentar novamente reembaralha as opções.

### 16.8 Configurações
- [ ] Botões nomeados “Exportar JSON” e “Importar JSON”.
- [ ] Exportar gera JSON completo e reimportável.
- [ ] Importar sem dados locais aplica direto e navega para a galeria.
- [ ] Importar com dados locais abre modal Substituir/Mesclar, com os avisos corretos.
- [ ] Cancelar o modal não altera nada.
- [ ] Importação nunca altera as preferências (som etc.), em nenhuma das opções (M1).
- [ ] Arquivo vazio (ou sem versículos válidos) exibe `EmptyFileModal` e cancela a operação (M7).
- [ ] Mesclar substitui os locais em referências duplicadas; **toda** importação preserva as preferências locais.
- [ ] Deletar tudo limpa o localStorage e reseta a UI.
- [ ] Toasts de sucesso/erro.

---

## 17. Decisões aprovadas

> Todas as pendências P1–P25 foram respondidas e incorporadas ao documento. Esta seção registra a decisão final e os conflitos verificados.

### 17.1 Registro de decisões (P1–P25)

| # | Tema | Decisão final |
|---|---|---|
| **P1** | Gatilho de “Aprendido” | Ao esconder **todos** os trechos pela primeira vez, individualmente ou via “Esconder tudo”. Revelar depois não desfaz. |
| **P2** | Gatilho de “Revisado” | Somente ao **concluir com sucesso** Organização ou Quiz. Tentativas erradas não contam. |
| **P3** | Mínimo e opções do Quiz | Exige **3+ versículos**. Opções = `min(4, total)`; distratores = **`min(4, total) - 1`**, sempre sorteados. Com 3 → A–C; com 4+ → A–D. |
| **P4** | Duplicidade | Bloqueada com `DuplicateVerseModal`; o usuário deve excluir manualmente a versão existente. Sem exclusão automática. |
| **P5** | Rótulo | Máximo **24 caracteres**; opcional por trecho, mas “tudo ou nada” por versículo. |
| **P6** | Header | “Início / Cadastrar / Versículos”; “Atividades” e “Professores” removidos. |
| **P7** | Nomenclatura de dados | Botões **“Importar JSON”** e **“Exportar JSON”**. |
| **P8** | Importação | Sem dados locais: importa direto, sem popup, e vai para a galeria. Com dados locais: modal **Substituir tudo** / **Mesclar** (duplicatas por referência são substituídas pelas do arquivo). Cancelar não altera nada. Preferências nunca são alteradas (M1). |
| **P9** | Logo | Usado **somente** no card de boas-vindas (abaixo da pílula, acima do título). Header/Footer usam ícone de livro. |
| **P10** | Emojis | Imagens Apple via CDN, com fallback nativo. |
| **P11** | Tradução | **ARA** fixa, sem seletor. |
| **P12** | Emojis no card da galeria | Máximo **3** + chip `+N`. |
| **P13** | Som | WebAudio sintetizado + toggle “Sons de feedback”. |
| **P14** | Exclusão | Versículo excluído somente com `ConfirmDialog`. Importação não pede confirmação extra (o modal de importação já confirma). |
| **P15** | Cor padrão | Primeira cor da paleta, em ciclo. |
| **P16** | Fonte | Nunito via Google Fonts, fallback `system-ui`. |
| **P17** | Checks de revisão | 1 modo = check simples; 2 modos = check duplo. |
| **P18** | Ação do card | Definida pelo **toggle** (Aprendizado → “Aprender”; Revisão → “Revisar”), não pelo status. |
| **P19** | “Selecionar todas” | Seleciona todo o intervalo permitido do trecho. |
| **P20** | Revelar trechos | Revelar um trecho oculto e “Revelar tudo” tocam **som neutro** (`playReveal`), **sem** explosão. |
| **P21** | “Esconder tudo” repetido | Idempotente, mas dispara som/explosão novamente. |
| **P22** | Organização | Corretos ficam travados; erros voltam ao pool com vermelho por 2s. |
| **P23** | Badge de revisão | “Revisados X de Y” com **Y = aprendidos**. |
| **P24** | Quiz | Opções e posições **sempre embaralhadas**; nenhuma ordem predefinida. A sequência de emojis permanece na ordem correta (é a pista). |
| **P25** | Rodapé | Ano **dinâmico** (`new Date().getFullYear()`), exibindo 2026 atualmente. |

### 17.2 Conflitos verificados e resolvidos

1. **P3 × spec anterior:** o mínimo do Quiz passou de 2 para **3** versículos; as opções passaram a ser `min(4, total)` e os distratores exatamente `min(4, total) - 1`, sempre sorteados. Atualizado em 7, 8.9, 9.3, 10.3 e 10.6.
2. **P8 × spec anterior:** a importação deixou de ser “sempre substituir” e passou a ter dois caminhos (substituir/mesclar) + importação automática quando não há dados locais. Reescrito em 6.3 e 10.7.
3. **P8/P14 × confirmação dupla:** não há segundo diálogo após escolher Substituir/Mesclar; o `ImportModeModal` é a confirmação. Ajustado em 6.3, 10.7 e 14.
4. **P8 × P4 (duplicidade):** a mesclagem é a **única exceção** à regra de referência única — e, ao final, continua existindo apenas um versículo por referência (o do arquivo vence). Arquivos com referências repetidas internamente são deduplicados (última vence).
5. **P9 × design:** header e footer não usam mais o mascote; foi definido um ícone de livro como marca nesses locais. O logo permanece apenas no hero, na ordem pedida.
6. **P10 × offline:** a fidelidade visual passa a depender da CDN de emojis; o fallback nativo cobre falhas de rede.
7. **P11 × ARA:** o texto da ARA às vezes vem entre aspas simples (`'...'`). Foi adicionada remoção de aspas externas na sanitização (12.2) para não duplicar com as aspas decorativas.
8. **P12 × spec anterior:** o limite de emojis no card caiu de 4 para **3** + `+N`.
9. **P20 × spec anterior:** revelar um trecho **e** “Revelar tudo” passaram a tocar som neutro; nenhum dos dois dispara explosão de emojis.
10. **P1 × P21:** “Esconder tudo” repetido continua disparando efeitos, mas `markLearned` é idempotente (não altera `learnedAt`).
11. **P2 × navegação:** o modo de revisão só é acessível para versículos aprendidos; o sucesso é o único gatilho de revisão. Sem conflito.
12. **P24 × P3:** os distratores são sorteados entre **todos os versículos cadastrados** (não apenas aprendidos), pois o enunciado do Quiz mostra referência + texto, sem exigir progresso.
13. **M7 × fluxo de importação:** a checagem de arquivo vazio acontece **antes** do modal de modo; um arquivo sem versículos nunca chega a “Substituir tudo”. A operação é cancelada e nada é alterado.

### 17.3 Microdecisões aprovadas

| # | Tema | Decisão final |
|---|---|---|
| **M1** | Preferências × importação | `settings` são **sempre locais**. Nem “Substituir tudo” nem “Mesclar” alteram som ou qualquer preferência. A importação atua apenas sobre `verses`. |
| **M2** | Navegação após importar | Após **qualquer** importação bem-sucedida, navega para `/versiculos`. |
| **M3** | Definição de “dados locais” | **Explicação:** o modal Substituir/Mesclar só serve para decidir o que fazer com os **versículos** que já existem no navegador. “Dados locais”, portanto, significa `verses.length > 0`. Preferências (ex.: som desligado) não são dados que possam ser substituídos ou mesclados — elas nunca são tocadas pela importação. Assim, quem só mexeu nas preferências, sem cadastrar versículos, não vê o modal: não há nada a perder. |
| **M4** | Marca no Header/Footer | Ícone `BookOpenText` em círculo bege + nome “Versículos em Emojis”; PNG do mascote apenas na Home. |
| **M5** | Modal de duplicidade | Apenas o botão “Entendi”, sem atalho para a galeria ou exclusão. |
| **M6** | Quiz com exatamente 3 versículos | 3 opções (A–C): 1 correta + 2 distratores. |
| **M7** | Arquivo de importação vazio | Se não houver versículos (ou nenhum válido), exibe `EmptyFileModal` com a mensagem correspondente e **cancela** a operação; nada é alterado e o modal Substituir/Mesclar não aparece. |

### 17.4 Decisões de arquitetura

- Tailwind CSS v4 com tokens em `@theme`; cores de trecho via `style` inline.
- Estado global com Context + `useReducer`; nenhum acesso direto ao storage em componentes.
- Chave única de persistência (`vee:data:v1`) — simplifica exportar/importar/resetar.
- `tokens` persistidos no versículo (evita re-tokenização divergente).
- Índices de tokens como fonte de verdade dos trechos (texto derivado).
- Rotas explícitas por modo de revisão (`/organizacao`, `/quiz`).
- DnD com dnd-kit (mouse + toque + teclado).
- Confete com canvas-confetti (emojis como partículas).
- Nenhum HTML da API renderizado como HTML.
- Sem backend, sem login, sem telemetria.

---

## 18. Plano de implementação (Fase 2)

> Executado **somente após aprovação deste SPEC**.

### Etapa 0 — Fundação (sequencial, 1 agente)
1. Scaffold Vite + React JS.
2. Tailwind v4 + tokens + fonte + `index.css` (keyframes).
3. `AppShell`, `Header`, `Footer`, `PageDecorations`, componentes `ui/`.
4. Rotas + páginas vazias (placeholders) navegáveis.
5. `storage`, `AppDataContext`, `ToastContext`, `lib/` + testes unitários.
6. Mover o logo para `public/assets/logo.png`.

**Gate:** app sobe, navega entre todas as rotas, tokens visuais aplicados.

### Etapa 1 — Paralelização (3 agentes)

| Agente | Escopo | Depende de |
|---|---|---|
| **UI/Layout** | Home, Configurações, header/footer refinados, decorações, responsividade, estados vazios | Etapa 0 |
| **Lógica/Estado A** | Cadastro completo (referência, API, popover, trechos, validações, modal) | Etapa 0 + `lib/` |
| **Lógica/Estado B** | Galeria + Aprendizagem + Organização + Quiz + progresso | Etapa 0 + `lib/` |

Arquivos compartilhados (`ui/`, `config/`, `lib/`) são **somente leitura** para os agentes A/B; alterações passam pelo orquestrador.

### Etapa 2 — Integração (sequencial)
- Conectar dados reais entre telas.
- Ajustes de transições, foco, sons, confete.
- Seed opcional de demonstração? **Não** — estado inicial vazio.

### Etapa 3 — QA
- Checklist da seção 16.
- Testes unitários de `tokenize`, `getAllowedRange`, `validateSegments`, `shuffleNotSolved`, `buildQuizOptions`, import/export.
- Auditoria de fidelidade visual (comparação com protótipos).
- Relatório de divergências + correções.

### Definition of Done
- Todos os critérios da seção 16 marcados.
- `npm run build` limpo.
- Nenhum texto em inglês na UI.
- Sem `console.log` residual.
- README com instruções de execução.

---

## Apêndice A — Textos fixos (pt-BR)

| Contexto | Texto |
|---|---|
| Badge home | Diversão Bíblica Infantil |
| Home subtítulo | Aprenda a Palavra de Deus brincando! ✨ 📖 |
| CTA cadastrar | Cadastrar Versículo / Criar novos enigmas e lições |
| CTA selecionar | Selecionar Versículo / Escolher um jogo para decifrar! |
| Cadastro subtítulo | Divida o versículo em trechos fáceis e conecte cada parte ao seu emoji ilustrativo! |
| Popover título | Toque nas palavras para adicionar a este trecho: |
| Popover instrução | Seleção contínua: selecione as palavras em ordem contígua para formar o trecho. |
| Galeria eyebrow | GALERIA BÍBLICA |
| Galeria CTA | Vamos memorizar juntos! / Toque nos cartões para aprender e memorizar a Palavra de Deus. |
| Galeria modal | Como você quer revisar? |
| Aprendizagem subtítulo | Modo Memorização com Emojis |
| Aprendizagem instrução | Toque nos emojis para esconder ou revelar palavras! |
| Organização badge | DESAFIO: ORGANIZE |
| Organização subtítulo | Toque nos emojis abaixo para colocá-los na sequência certa da história bíblica! |
| Organização dica | Dica: Comece por "{início do trecho 1}…" |
| Quiz badge | Desafio de Decodificação |
| Quiz pergunta | Que versículo é representado por esta sequência de emojis? |
| Configurações subtítulo | Gerencie os dados e preferências do aplicativo. |
| Configurações — exportar | Exportar JSON |
| Configurações — importar | Importar JSON |
| Modal de importação | Como deseja importar? |
| Importação — opção 1 | Substituir tudo |
| Importação — opção 2 | Mesclar |
| Importação — preferências | Suas preferências (como o som) não serão alteradas. |
| Arquivo vazio — título | Arquivo vazio |
| Arquivo vazio — mensagem | O arquivo está vazio. Nenhum dado foi importado. |
| Arquivo sem versículos válidos | Nenhum versículo válido foi encontrado no arquivo. Nenhum dado foi importado. |
| Duplicidade — título | Versículo já cadastrado |
| Duplicidade — ação | Entendi |

## Apêndice B — Estrutura do arquivo exportado

```json
{
  "app": "versiculos-em-emojis",
  "version": 1,
  "exportedAt": "2026-11-19T15:00:00.000Z",
  "settings": { "translation": "ARA", "soundEnabled": true },
  "verses": [
    {
      "id": "…",
      "reference": { "bookId": 43, "bookName": "João", "chapter": 3, "verse": 16 },
      "referenceLabel": "João 3:16",
      "translation": "ARA",
      "fullText": "…",
      "tokens": ["…"],
      "segments": [
        { "id": "…", "startToken": 0, "endToken": 4, "text": "…", "emoji": "❤️", "colorId": "coral", "label": "Amor" }
      ],
      "progress": {
        "learned": true,
        "learnedAt": "2026-11-19T15:00:00.000Z",
        "reviewModes": ["organization", "quiz"],
        "reviewedAt": "2026-11-19T15:10:00.000Z"
      },
      "createdAt": "…",
      "updatedAt": "…"
    }
  ]
}
```

---

**Fim do SPEC (v1.2).** Pendências P1–P25 e microdecisões M1–M7 aprovadas e incorporadas. Aguardando seu comando explícito para iniciar a Fase 2.
