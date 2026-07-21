## NEXT.JS

npx create-app-next@latest
rodar com npm run dev
"use client" no começo de cada página indica que um componente deve ser executado no navegador (cliente) em vez de ser um Server Component (executado no servidor).
✅ Usa useState, useEffect? → "use client"
✅ Tem onClick, onSubmit, onChange? → "use client"
❌ Só renderiza JSX e recebe props? → não precisa
no Next.js (App Router), existe um arquivo chamado layout.tsx que funciona como uma "moldura" ao redor de várias páginas. Tudo que você colocar nesse arquivo aparece em todas as páginas que estão dentro dessa pasta

## SHADCN

https://ui.shadcn.com/docs/components
Shadcn : pacote com componentes prontos
Para instalar: npx shadcn@latest init
Para usar componentes: npx shadcn@latest add (nome)
Todos os componentes são criadaos na pasta components > ui
Eles usam a biblioteca de ícones do Lucide

## TAILWIND

Baixar a extensão que traduz Tailwind para CSS
