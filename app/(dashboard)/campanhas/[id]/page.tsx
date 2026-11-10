import CampanhaDetailsView from "@/components/component/Campanhas/CampanhaDetailsPage/CampanhaDetailsView";


interface CampanhaPageProps {
  params: Promise<{ id: string }>;
}

const CampanhaPage = async ({ params }: CampanhaPageProps) => {
  const { id } = await params;

  return <CampanhaDetailsView id={id} />;
};

export default CampanhaPage;