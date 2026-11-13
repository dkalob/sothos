"use client";

import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

type Periodo = "DIARIO" | "SEMANAL" | "MENSAL";

type PeriodSelectorProps = {
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
};

const opcoes: { label: string; value: Periodo }[] = [
  { label: "Diário", value: "DIARIO" },
  { label: "Semanal", value: "SEMANAL" },
  { label: "Mensal", value: "MENSAL" },
];

const PeriodSelector = ({ periodo, onChange }: PeriodSelectorProps) => {
  return (
    <ButtonGroup>
      {opcoes.map((opcao) => (
        <Button
          key={opcao.value}
          variant="outline"
          onClick={() => onChange(opcao.value)}
          className={
            periodo === opcao.value
              ? "bg-primary text-white hover:bg-primary hover:text-white"
              : "hover:bg-primary-foreground hover:text-chart-3"
          }
        >
          {opcao.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default PeriodSelector;
