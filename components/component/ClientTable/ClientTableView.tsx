"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ClientTableColumns, GroupTableColumns } from "./columns";
import { Download, Plus } from "lucide-react";
import ClientSheet from "./ClientSheet";
import GroupClientSheet from "./GroupClientSheet";

interface ClientTableViewProps {
  columnsClient: ColumnDef<ClientTableColumns>[];
  columnsGroup: ColumnDef<GroupTableColumns>[];
  clientesData: ClientTableColumns[];
  gruposData: GroupTableColumns[];
}

const ClientTableView = ({
  columnsClient,
  columnsGroup,
  clientesData,
  gruposData,
}: ClientTableViewProps) => {
  const [aba, setAba] = useState<"clientes" | "grupos">("clientes");
  //Controla as abas dos botões

  const [clienteSheet, setClienteSheet] = useState(false);
  const [grupoSheet, setGrupoSheet] = useState(false);
  // Chama os componentes de Sheet no onClick

  return (
    <div className="mt-8">
      {/*BOTÕES DE CIMA */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="link"
          className={aba === "clientes" ? "text-primary" : "text-gray-400"}
          onClick={() => setAba("clientes")}
        >
          Todos os clientes
        </Button>
        <Button
          variant="link"
          className={aba === "grupos" ? "text-primary" : "text-gray-400"}
          onClick={() => setAba("grupos")}
        >
          Grupos de clientes
        </Button>
      </div>

      <div className="flex flex-col gap-2 ml-2.5">
        {/* HEADER E BOTÕES */}
        <div className="flex justify-between items-center">
          {/* HEADER */}
          <div className="flex flex-col">
            {aba === "clientes" ? (
              <>
                <span className="text-md font-medium">Todos os clientes</span>
                <span className="text-sm text-gray-600">
                  Visualize e administre todos os clientes da sua loja em uma
                  única tela
                </span>
              </>
            ) : (
              <>
                <span className="text-md font-medium">Grupos de clientes</span>
                <span className="text-sm text-gray-600">
                  Crie e gerencie grupos para segmentar os clientes da sua loja
                </span>
              </>
            )}
          </div>

          {/* BOTÕES */}
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              
              <Button variant="outline" className="w-40 truncate">
                <Download />
                {aba === "clientes" ? "Exportar Clientes" : "Exportar Grupos"}
              </Button>
              
              <Button
                variant="default"
                className="w-32 truncate"
                onClick={() =>
                  aba === "clientes"
                    ? setClienteSheet(true)
                    : setGrupoSheet(true)
                }
              >
                <Plus />
                {aba === "clientes" ? "Novo cliente" : "Novo Grupo"}
              </Button>

              <ClientSheet 
                open={clienteSheet} 
                onOpenChange={setClienteSheet} 
              />
              <GroupClientSheet
                open={grupoSheet}
                onOpenChange={setGrupoSheet}
              />

            </div>
          </div>
        </div>

        {/*  TABELA  */}
        {aba === "clientes" ? (
          <DataTable
            columns={columnsClient}
            data={clientesData}
            hasFilter
            filterColumn="cliente"
            filterPlaceholder="Filtrar clientes por nome..."
          />
        ) : (
          <DataTable
            columns={columnsGroup}
            data={gruposData}
            hasFilter
            filterColumn="nome"
            filterPlaceholder="Filtrar grupos por nome"
          />
        )}
      </div>
    </div>
  );
};

export default ClientTableView;
