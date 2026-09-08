import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export type RFMSegmento =
  | "Campeões"
  | "Leais"
  | "Potenciais Leais"
  | "Recém-Chegados"
  | "Promissores"
  | "Precisam de Atenção"
  | "À Beira de Dormir"
  | "Em Risco"
  | "Não Podem Perder"
  | "Hibernando"
  | "Perdidos"
  | "Leads";

const rfmColorMap: Record<RFMSegmento, string> = {
  "Campeões": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Leais": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "Potenciais Leais": "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Recém-Chegados": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Promissores": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "Precisam de Atenção": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  "À Beira de Dormir": "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Em Risco": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  "Não Podem Perder": "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "Hibernando": "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "Perdidos": "bg-stone-100 text-amber-800 dark:bg-stone-800 dark:text-amber-200",
  "Leads": "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const rfmDescriptionMap: Record<RFMSegmento, string> = {
  "À Beira de Dormir": "Clientes que compraram há muito tempo e com baixa frequência. Estão prestes a se tornarem perdidos.",
  "Campeões": "Clientes que compram com frequência, gastam bastante e compraram recentemente. São os melhores clientes.",
  "Em Risco": "Clientes que costumavam comprar bastante, mas não compram há algum tempo. Podem estar migrando para concorrentes.",
  "Hibernando": "Clientes que não compram há muito tempo e têm baixo histórico de compras. Estão praticamente perdidos.",
  "Leais": "Clientes que compram com frequência e têm bom histórico, mesmo que não sejam os maiores gastadores.",
  "Não Podem Perder": "Clientes de alto valor que não compram há muito tempo. É essencial reengajá-los.",
  "Perdidos": "Clientes que não compram há muito tempo e tinham baixo valor. Pouca chance de retorno.",
  "Potenciais Leais": "Clientes que compraram recentemente e com frequência razoável. Podem se tornar leais.",
  "Precisam de Atenção": "Clientes que compraram recentemente, mas com baixa frequência ou valor. Precisam de estímulo para engajamento.",
  "Promissores": "Clientes novos que compraram recentemente, mas ainda não demonstraram frequência ou valor alto.",
  "Recém-Chegados": "Clientes que fizeram a primeira compra há pouco tempo. Estão começando o relacionamento.",
  "Leads": "Clientes que nunca realizaram uma compra. É ideal engajá-los."
};

interface RFMBadgeProps {
  segmento: RFMSegmento;
}

const RFMBadge = ({ segmento }: RFMBadgeProps) => {
  const badge = <Badge className={rfmColorMap[segmento]}>{segmento}</Badge>;


  return (
    <HoverCard>
      <HoverCardTrigger delay={10} closeDelay={100} render={badge} />
      <HoverCardContent side="right" className="flex w-64 flex-col gap-0.5">
        <div className="font-semibold">{segmento}</div>
        <div className="text-sm text-muted-foreground">
          {rfmDescriptionMap[segmento]}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default RFMBadge;