"use client"

import { Trash2Icon } from "lucide-react";
import RFMBadge, { type RFMSegmento } from "../../RFMBadge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiDelete } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NameCardProps = {
  id: string;
  cliente: string;
  segmento: RFMSegmento;
};

const NameCard = ({ id, cliente, segmento }: NameCardProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const deletarCliente = async () => {
    try {
      await apiDelete(`/clientes/${id}`);
      toast.add({
        title: "Cliente excluído com sucesso!",
        type: "success",
      });
      router.push("/clientes");
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      toast.add({
        title: "Não foi possível excluir o cliente",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold ml-1">{cliente}</h1>
          <RFMBadge segmento={segmento} />
        </div>
        <HoverCard>
          <HoverCardTrigger
            delay={10}
            closeDelay={100}
            render={
              <Button variant="ghost" onClick={() => setOpen(true)}>
                <Trash2Icon />
              </Button>
            }
          />
          <HoverCardContent className="w-fit px-2 py-1 text-xs">
            Excluir
          </HoverCardContent>
        </HoverCard>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                <Trash2Icon />
              </AlertDialogMedia>

              <AlertDialogTitle>Excluir Cliente?</AlertDialogTitle>

              <AlertDialogDescription>
                Essa ação irá excluir permanentemente o cliente{" "}
                <strong>{cliente}</strong>. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>

              <AlertDialogAction variant="destructive" onClick={deletarCliente}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default NameCard;
