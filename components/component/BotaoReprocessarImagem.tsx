import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onConfirmar: (instrucao: string) => Promise<void>;
  processando?: boolean;
};

export default function BotaoReprocessarImagem({
  onConfirmar,
  processando = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [instrucao, setInstrucao] = useState("");

  async function confirmar() {
    const texto = instrucao.trim();

    if (texto.length < 3 || processando) return;

    await onConfirmar(texto);

    setInstrucao("");
    setAberto(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        Reprocessar Imagem
      </Button>

      <AlertDialog
        open={aberto}
        onOpenChange={(open) => {
          if (!processando) setAberto(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprocessar imagem</AlertDialogTitle>
            <AlertDialogDescription>
              O que você gostaria de alterar na imagem? Essa orientação será
              enviada para a inteligência artificial.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={instrucao}
            onChange={(e) => setInstrucao(e.target.value)}
            placeholder="Ex: Deixar o fundo mais claro e destaque mais o produto."
            className="min-h-24"
            disabled={processando}
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={processando}>
              Cancelar
            </AlertDialogCancel>

            <Button
              onClick={confirmar}
              disabled={instrucao.trim().length < 3 || processando}
            >
              {processando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reprocessando...
                </>
              ) : (
                "Reprocessar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
