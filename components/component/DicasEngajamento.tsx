import { Info } from "lucide-react"

const DicasEngajaento = () => {
    return (
        <div className="rounded-xl border bg-primary/10 p-4">
            <div className="mb-3 flex items-center gap-3 text-primary">
              <Info className="size-5 shrink-0" />
              <span className="font-semibold">Dicas de Engajamento</span>
            </div>

            <ul className="space-y-2 pl-1 text-sm text-muted-foreground">
              <li>• Mantenha o texto curto e direto ao ponto.</li>
              <li>
                • Escreva o máximo de informações possíveis no campo descrição.
              </li>
              <li>
                • Utilize a ferramenta "Associar Produtos" para criar grupos de
                clientes engajados.
              </li>
            </ul>
        </div>
    )

}

export default DicasEngajaento