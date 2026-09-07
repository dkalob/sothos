import RFMBadge, { type RFMSegmento } from "../../RFMBadge";

type NameCardProps = {
    cliente: string
    segmento: RFMSegmento
}

const NameCard = ({cliente , segmento}: NameCardProps) => {
  return (
    <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
      <h1 className="text-xl font-semibold ml-1">{cliente}</h1>
      <RFMBadge segmento={segmento} />
    </div>
  );
};

export default NameCard;
