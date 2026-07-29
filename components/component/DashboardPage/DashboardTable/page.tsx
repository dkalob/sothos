import { DashboardTableColumns, columns } from "./columns";
import { DataTable } from "./dataTable";

const getData = async (): Promise<DashboardTableColumns[]> => {
  return [
    {
      cliente: "João",
      email: "joao@email.com",
      campanha: "Produto novo 23",
      status: "Finalizada",
      valor: 345,
      data: new Date("2026-04-20"),
    },
    {
      cliente: "Maria",
      email: "maria@email.com",
      campanha: "Produto A",
      status: "Em andamento",
      valor: 0,
      data: new Date("2026-04-19"),
    },
  ];
};

const DashboardTable = async () => {
  const data = await getData();

  return (
    <div className="flex flex-col bg-gray-100 mt-8 rounded-lg w-full overflow-hidden border p-3">
      <div className="flex flex-col gap-1 rounded-lg p-2">
        <h1 className="text-lg font-normal">Campanhas recentes</h1>
        <span className="text-sm text-muted-foreground">
          Logs detalhados das últimas interações com clientes
        </span>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default DashboardTable;
