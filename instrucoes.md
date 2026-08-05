## NEXT.JS

npx create-app-next@latest
rodar com npm run dev
"use client" no começo de cada página indica que um componente deve ser executado no navegador (cliente) em vez de ser um Server Component (executado no servidor).
✅ Usa useState, useEffect? → "use client"
✅ Tem onClick, onSubmit, onChange? → "use client"
❌ Só renderiza JSX e recebe props? → não precisa
no Next.js (App Router), existe um arquivo chamado layout.tsx que funciona como uma "moldura" ao redor de várias páginas. Tudo que você colocar nesse arquivo aparece em todas as páginas que estão dentro dessa pasta
no Next.js não é possível usar funções async (consulta no BD) e useState no mesmo arquivo .tsx

## SHADCN

https://ui.shadcn.com/docs/components
Shadcn : pacote com componentes prontos
Para instalar: npx shadcn@latest init
Para usar componentes: npx shadcn@latest add (nome)
Todos os componentes são criadaos na pasta components > ui
Eles usam a biblioteca de ícones do Lucide
Não usa mais asChild e sim render={}

## TAILWIND

Baixar a extensão que traduz Tailwind para CSS

## INSTRUÇÕES DO PROJETO
A pasta app > (auth) contém o login e cadastro de usuário.
A pasta app > (dashboard) está todo o restante da aplicação estruturada com sidebar+navbar+espaço da página
A pasta components > nav contém a navbar e a sidebar que estão presentes em quase todas as páginas. Todas as páginas que forem utiliza-las precisam ser criadas dentro de app > (dashboard).
Na pasta components > ui estão todos os components criados pelo shadcn
Na pasta components > component estão a estilização de alguns components padrão e que podem ser compartilhados entre outras páginas. Dentro desta pasta também tem pastas de páginas específicas que possuem componenentes referentes somente a ela.


