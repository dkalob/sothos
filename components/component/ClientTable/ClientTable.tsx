import {
  ClientTableColumns,
  GroupTableColumns,
  columnsClient,
  columnsGroup,
} from "./columns";
import ClientTableView from "./ClientTableView";

const getClienteData = async (): Promise<ClientTableColumns[]> => {
  return [
    {
      cliente: "João",
      email: "joao@email.com",
      segmento: "Leais",
      pedidos: 10,
      valor: 345,
      data: new Date("2026-04-20"),
    },
    {
      cliente: "Maria",
      email: "maria@email.com",
      segmento: "Precisam de Atenção",
      pedidos: 0,
      valor: 0,
      data: new Date("2026-04-19"),
    },
  ];
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
