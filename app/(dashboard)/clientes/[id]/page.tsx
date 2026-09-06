interface ClientePageProps {
  params: Promise<{ id: string }>
}

const ClientePage = async ({ params }: ClientePageProps) => {
  const { id } = await params


  return (
    <div>
    </div>
  )
}

export default ClientePage