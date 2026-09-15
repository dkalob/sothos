import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const Home = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
      <Card className="overflow-hidden">
        <div className="grid min-h-100 grid-cols-2">
          <div className="col-span-1 flex flex-col items-center justify-start">
            <Image
              src="/Marketing-amico.svg"
              alt="Capa"
              width={850}
              height={800}
              className="h-115 w-auto object-contain"
            />
            <a
              href="https://storyset.com/communication"
              className="text-muted-foreground"
            >
              Communication illustrations by Storyset
            </a>
          </div>

          <div className="col-span-1 flex flex-col justify-center px-8">
            <CardHeader className="text-center">
              <div className="flex flex-row justify-center">
                <Image
                  src="/logo.svg"
                  alt="Capa"
                  width={100}
                  height={100}
                  className="h-10 w-auto object-contain"
                />
                <CardTitle className="text-3xl font-bold text-primary">othos</CardTitle>
              </div>

              <CardDescription>
                Segmentação de clientes e campanhas para a sua loja.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col justify-center items-center gap-2 mt-4">
              <a
                href="/login"
                className={buttonVariants({
                  className: "w-80 cursor-pointer",
                  size: "lg",
                })}
              >
                Entrar
              </a>

              <a
                href="/cadastro"
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-80 cursor-pointer",
                  size: "lg",
                })}
              >
                Criar Conta
              </a>
            </CardContent>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default Home;
