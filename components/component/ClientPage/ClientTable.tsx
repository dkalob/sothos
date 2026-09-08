// Essa página será responsável por trazer os dados do BD e 
// envia-los como props para ClientTableView

import {
  ClientTableColumns,
  GroupTableColumns,
  columnsClient,
  columnsGroup,
} from "./columns";
import ClientTableView from "./ClientTableView";
import { apiGet } from "@/lib/api";


type ClienteApi = Omit<ClientTableColumns, "data"> & {
  data: string;
};

const getClienteData = async (): Promise<ClientTableColumns[]> => {
  const clientes = await apiGet<ClienteApi[]>("/clientes");

  return clientes.map((cliente) => ({
    ...cliente,
    data: new Date(cliente.data),
  }));
};

const getGrupoData = async (): Promise<GroupTableColumns[]> => {
  return [
    {
      data: new Date("2026-04-20"),
      nome: "Clientes Ativos",
      campanhas: 5,
      clientes: 45,
      valor: 4593,
    },
    {
      data: new Date("2026-04-24"),
      nome: "Clientes Recorrentes",
      campanhas: 2,
      clientes: 12,
      valor: 5000,
    },
  ];
};

const ClientTable = async () => {
  const ClienteData = await getClienteData();
  const GrupoData = await getGrupoData();

  return (
    <ClientTableView
      columnsClient={columnsClient}
      columnsGroup={columnsGroup}
      clientesData={ClienteData}
      gruposData={GrupoData}
    />
  );
};

export default ClientTable;
