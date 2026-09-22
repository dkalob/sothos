import ClienteDetalhe from "@/components/component/ClientPage/ClientDetailsPage/ClientDetailsView";


interface ClientePageProps {
  params: Promise<{ id: string }>;
}

const ClientePage = async ({ params }: ClientePageProps) => {
  const { id } = await params;

  return <ClienteDetalhe id={id} />;
};

export default ClientePage;