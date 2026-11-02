import PageCards from "@/components/component/PageCards"
import PageHeader from "@/components/component/PageHeader"
import { Boxes, Megaphone, PackageSearch, ShoppingCart } from "lucide-react"

const Campanhas = () => {

    return (
        <main>
            <PageHeader
                title="Gerenciamento de Campanhas"
                subtitle="Gerencie suas campanhas e acompanhe como elas estão performando"
            />

            {/* CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 justify-items-start mt-8 gap-4">
                
                <PageCards
                icon={PackageSearch}
                title="Campanhas cadastradas"
                value="20.435"
                trend={{ direction: "up", value: "+12%" }}
                footer={[
                    { label: "Novos", value: 2542 },
                    { label: "Recorrentes", value: 847 },
                ]}
                />
            
                <PageCards
                icon={ShoppingCart}
                title="Valor Gerado"
                value="88%"
                trend={{ direction: "up", value: "+12%" }}
                footer={[
                    { label: "Faturamento em campanhas", value: 10 },
                ]}
                />

                <PageCards
                icon={Boxes}
                title="Cliente Atingidos"
                value="8"
                trend={{ direction: "up", value: "+12%" }}
                footer={[
                    { label: "Quantos clientes foram impactados pelas campanhas", value: 60 },
                ]}
                />

                <PageCards
                icon={Megaphone}
                title="Campanhas vinculadas a produtos"
                value="20"
                trend={{ direction: "up", value: "+12%" }}
                footer={[
                    { label: "Valor arrecadado em campanhas", value: 4530 },
                ]}
                />
            
            </div>
        </main>
    )


}

export default Campanhas