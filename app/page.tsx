import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
      <Card className="w-full max-w-sm justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sothos</CardTitle>
          <CardDescription>
            Segmentação de clientes e campanhas para a sua loja
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Button
            className="w-full text-lg p-6 cursor-pointer"
            render={<Link href="/login">Entrar</Link>}
          />

          <Button
            variant="outline"
            className="w-full text-lg p-6 cursor-pointer"
            render={<Link href="/cadastro">Criar conta</Link>}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default Home;