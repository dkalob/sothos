"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "../DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { ClientTableColumns, GroupTableColumns } from "./columns"

interface ClientTableViewProps {
  columnsClient: ColumnDef<ClientTableColumns>[]
  columnsGroup: ColumnDef<GroupTableColumns>[]
  clientesData: ClientTableColumns[]
  gruposData: GroupTableColumns[]
}

const ClientTableView = ({ columnsClient, columnsGroup, clientesData, gruposData }: ClientTableViewProps) => {
  
  const [aba, setAba] = useState<"clientes" | "grupos">("clientes")

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="link"
          className={aba === "clientes" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("clientes")}
        >
          Todos os clientes
        </Button>
        <Button
          variant="link"
          className={aba === "grupos" ? "text-black" : "text-gray-400"}
          onClick={() => setAba("grupos")}
        >
          Grupos de clientes
        </Button>
      </div>

      {aba === "clientes" ? (
        <DataTable columns={columnsClient} data={clientesData} />
      ) : (
        <DataTable columns={columnsGroup} data={gruposData} />
      )}
    </div>
  )
}

export default ClientTableView