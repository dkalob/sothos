"use client"
//IMPORTS DOS COMPONENTES DO SHADCN
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"


const Home = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-red-50">
     <Card className="w-full max-w-sm justify-center">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Sothos</CardTitle>
        <CardDescription>
          Bem-vindo de volta!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6 mt-3">
            <div className="grid gap-2">
              <Label className="text-md" htmlFor="email">Email</Label>
              <Input
                className="p-4" 
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label className="text-md" htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm text-chart-4 underline-offset-4 hover:underline"
                >
                  Esqueceu sua senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  className="p-4" 
                  id="password" 
                  type="password" 
                  required 
                  />
              </div>
            </div>
          </div>
          <div className="flex items-center mt-4 gap-3">
            <Checkbox className="cursor-pointer" id="toggle-checkbox" name="toggle-checkbox"/>
            <span>Permanecer conectado</span>
          </div>
          
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full text-lg p-6 cursor-pointer">
          Entrar
        </Button>
        <div className="flex items-center gap-4 py-3 text-center">
          <span>Não tem uma conta? </span>
          <a href="#" className="text-sm text-chart-4 underline-offset-4 hover:underline">
            Cadastre-se
          </a>
        </div>
      </CardFooter>
    </Card>
    </main>
  )
}

export default Home