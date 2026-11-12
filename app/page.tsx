import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  FileSpreadsheet,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

// Conteúdo da página separado do layout: para mudar um texto,
// edite só estas listas.
const problemas = [
  {
    titulo: "Você não sabe quem são seus melhores clientes",
    texto:
      "Os dados estão no sistema da loja, mas ninguém tem tempo de cruzar pedidos, datas e valores.",
  },
  {
    titulo: "A mesma mensagem para todo mundo",
    texto:
      "Quem compra toda semana recebe a mesma campanha de quem não aparece há meses.",
  },
  {
    titulo: "Clientes somem sem ninguém perceber",
    texto:
      "Quando a loja nota que um cliente parou de comprar, muitas vezes já é tarde.",
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Traga seus dados",
    texto: "Importe clientes, produtos e pedidos da sua loja por planilha.",
  },
  {
    numero: "02",
    titulo: "Entenda sua base",
    texto:
      "O Sothos classifica cada cliente pela matriz RFM: quando comprou, com que frequência e quanto gastou.",
  },
  {
    numero: "03",
    titulo: "Escolha quem atingir",
    texto:
      "Veja quem são os Campeões, quem está Em Risco e quem precisa de atenção.",
  },
  {
    numero: "04",
    titulo: "Crie a campanha",
    texto:
      "Gere mensagens de e-mail e WhatsApp com inteligência artificial e revise antes de usar.",
  },
];

const recursos = [
  {
    icone: Target,
    titulo: "Segmentação RFM",
    texto: "Clientes organizados em 11 segmentos, de Campeões a Perdidos.",
  },
  {
    icone: Sparkles,
    titulo: "Mensagens com IA",
    texto: "Textos de e-mail e WhatsApp gerados para o perfil de cada grupo.",
  },
  {
    icone: Users,
    titulo: "Grupos de clientes",
    texto: "Monte grupos com filtros e use-os nas suas campanhas.",
  },
  {
    icone: MessageSquareText,
    titulo: "Recomendação de produtos",
    texto: "Sugestões do que oferecer a cada cliente com base no histórico de compras da loja.",
  },
  {
    icone: BarChart3,
    titulo: "Dashboard",
    texto: "Acompanhe vendas e clientes em gráficos e baixe relatórios.",
  },
  {
    icone: FileSpreadsheet,
    titulo: "Importação por planilha",
    texto: "Envie seus dados em CSV.",
  },
];

const perguntas = [
  {
    pergunta: "Preciso saber de análise de dados para usar?",
    resposta:
      "Não. O Sothos faz os cálculos e mostra os resultados em segmentos com nomes simples.",
  },
  {
    pergunta: "Como coloco os dados da minha loja?",
    resposta:
      "Exportando uma planilha do seu sistema e enviando no Sothos. Você indica qual coluna é o e-mail, o pedido, a data e assim por diante.",
  },
  {
    pergunta: "A IA envia mensagens sozinha?",
    resposta:
      "Não. A IA sugere o texto, e a decisão de usar é sempre sua.",
  },
];

const Logo = () => (
  <div className="flex items-center">
    <Image src="/logo.svg" alt="Sothos" width={32} height={32} />
    <span className="text-2xl font-bold text-primary">othos</span>
  </div>
);

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="Página inicial">
            <Logo />
          </Link>

          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#como-funciona" className="hover:text-primary">
              Como funciona
            </a>
            <a href="#recursos" className="hover:text-primary">
              Recursos
            </a>
            <a href="#duvidas" className="hover:text-primary">
              Dúvidas
            </a>
          </nav>

          <div className="flex gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Entrar
            </Link>
            <Link href="/cadastro" className={buttonVariants({ size: "sm" })}>
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="bg-red-50">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full bg-background px-3 py-1 text-xs font-medium text-primary">
                Segmentação de clientes para e-commerce
              </span>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Conheça seus clientes e fale com cada um do jeito certo.
              </h1>
              <p className="text-lg text-muted-foreground">
                O Sothos organiza a base da sua loja virtual em segmentos e
                ajuda você a criar campanhas para quem realmente importa.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className={buttonVariants({ size: "lg" })}
                >
                  Criar conta grátis
                </Link>
                <a
                  href="#como-funciona"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Ver como funciona
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Image
                src="/Marketing-amico.svg"
                alt="Ilustração de marketing digital"
                width={850}
                height={800}
                priority
                className="h-auto w-full max-w-md"
              />
              {/* Atribuição exigida pela licença gratuita do Storyset */}
              <a
                href="https://storyset.com/communication"
                className="text-xs text-muted-foreground"
              >
                Communication illustrations by Storyset
              </a>
            </div>
          </div>
        </section>

        {/* PROBLEMAS */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Vender mais começa por conhecer quem já compra
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {problemas.map((p) => (
              <Card key={p.titulo}>
                <CardHeader>
                  <CardTitle className="text-lg">{p.titulo}</CardTitle>
                  <CardDescription>{p.texto}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-16 bg-red-50">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <h2 className="mb-10 text-center text-3xl font-bold">
              Como funciona
            </h2>
            <ol className="grid gap-8 md:grid-cols-4">
              {passos.map((p) => (
                <li key={p.numero} className="flex flex-col gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {p.numero}
                  </span>
                  <h3 className="text-lg font-semibold">{p.titulo}</h3>
                  <p className="text-muted-foreground">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* RECURSOS */}
        <section
          id="recursos"
          className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 md:py-24"
        >
          <h2 className="mb-10 text-center text-3xl font-bold">
            Tudo em um só lugar
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map(({ icone: Icone, titulo, texto }) => (
              <Card key={titulo}>
                <CardHeader>
                  <Icone className="mb-2 h-8 w-8 text-primary" aria-hidden />
                  <CardTitle className="text-lg">{titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {texto}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* DÚVIDAS */}
        <section id="duvidas" className="scroll-mt-16 bg-red-50">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
            <h2 className="mb-10 text-center text-3xl font-bold">
              Dúvidas frequentes
            </h2>
            <div className="flex flex-col gap-3">
              {perguntas.map((p) => (
                <details
                  key={p.pergunta}
                  className="group rounded-lg border bg-background p-4"
                >
                  <summary className="cursor-pointer list-none font-medium">
                    {p.pergunta}
                  </summary>
                  <p className="mt-3 text-muted-foreground">{p.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <h2 className="text-3xl font-bold">
            Pronto para conhecer seus clientes?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Crie sua conta e importe a base da sua loja.
          </p>
          <Link
            href="/cadastro"
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Criar conta grátis
          </Link>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>Projeto de Trabalho de Graduação · Fatec Ipiranga</p>
          <p>© {new Date().getFullYear()} Sothos</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
