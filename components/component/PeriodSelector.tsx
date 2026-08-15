"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

// COMPONENTE DE FILTRO DE PERÍODO COM 3 BOTÕES

const opcoes = ["Diário", "Semanal", "Mensal"];


const PeriodSelector = () => {
  const [periodo, setPeriodo] = useState("Diário");

  return (
    <ButtonGroup>
      {opcoes.map((opcao) => (
        <Button
          key={opcao}
          variant="outline"
          onClick={() => setPeriodo(opcao)}
          className={
            periodo === opcao
              ? "bg-primary text-white hover:bg-primary hover:text-white"
              : "hover:bg-primary-foreground hover:text-chart-3"
          }
        >
          {opcao}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default PeriodSelector;
