import { ReactNode } from "react";

interface HistoricoCardProps {
  title: string;
  children: ReactNode;
}

const HistoricoCard = ({ title, children }: HistoricoCardProps) => {
  return (
    <div className="bg-primary-foreground p-4 rounded-lg space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </div>
  );
};

export default HistoricoCard;
