import { Badge } from "@/components/ui/badge"

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

const rfmColorMap: Record<RFMSegmento, string> = {
  "Campeões": "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Leais": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "Potenciais Leais": "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Recém-Chegados": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Promissores": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "Precisam de Atenção": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  "À Beira de Dormir": "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Em Risco": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  "Não Podem Perder": "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "Hibernando": "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
  "Perdidos": "bg-black text-white dark:bg-black dark:text-white",
}

interface RFMBadgeProps {
  segmento: RFMSegmento
}

const RFMBadge = ({ segmento }: RFMBadgeProps) => {
  return (
    <Badge className={rfmColorMap[segmento]}>
      {segmento}
    </Badge>
  )
}

export default RFMBadge