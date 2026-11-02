import { useState } from "react";
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

type Props = { onConfirmar: (instrucao: string) => void };

export default function BotaoReprocessarImagem({ onConfirmar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [instrucao, setInstrucao] = useState("");

  function confirmar() {
    onConfirmar(instrucao.trim());
    setInstrucao("");
    setAberto(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        Reprocessar Imagem
      </Button>

      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprocessar imagem</AlertDialogTitle>
            <AlertDialogDescription>
              O que você gostaria de alterar na imagem?
              Essa orientação será enviada para a inteligência artificial.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={instrucao}
            onChange={(e) => setInstrucao(e.target.value)}
            placeholder="Ex: Deixar o fundo mais claro e destaque mais o produto."
            className="min-h-24"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button onClick={confirmar} disabled={instrucao.trim().length < 3}>
              Reprocessar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}