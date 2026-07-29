import PageHeader from "@/components/component/PageHeader";

const Produtos = () => {
  return (
    <PageHeader
      title="Gerenciamento de Produtos"
      subtitle="Gerencie seu inventário de produtos e acompanhe seu desempenho em campanhas."
      button={{ value: "Produtos" }}
    />
  );
};

export default Produtos;
