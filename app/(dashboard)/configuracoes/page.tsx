import CategoriaTable from "@/components/component/ConfiguracoesPage/Categoria/CategoriaTable";
import PageHeader from "@/components/component/PageHeader";

const Configuracoes = () => {
  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Configure menus e opções da plataforma"
      />

      <div className="flex flex-col gap-6 p-6">
        <CategoriaTable />
      </div>
    </div>
  );
};

export default Configuracoes;
