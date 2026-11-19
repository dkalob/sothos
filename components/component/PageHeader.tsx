"use client";

import { Download, Plus } from "lucide-react";
import { Button } from "../ui/button";

// Componente do cabeçalho de (quase) todas as páginas

type PageHeaderProps = {
  // Props que controlam o cabeçalho das páginas
  title: string;
  subtitle: string;
  importButton?: {
    // Props que controlam os botões, são opcionais
    value: string;
  };
  addButton?: {
    value: string;
  };
};

const PageHeader = ({
  title,
  subtitle,
  importButton,
  addButton,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">{title}</h1>

        <span className="text-sm text-gray-600 sm:text-base">{subtitle}</span>
      </div>

      <div className="flex w-full gap-2 sm:w-auto">
        {importButton && (
          <Button
            variant="outline"
            className="min-w-0 flex-1 sm:w-48 sm:flex-none justify-center items-center truncate"
          >
            <Download className="rotate-180" />
            Importar {importButton.value}
          </Button>
        )}

        {addButton && (
          <Button
            variant="default"
            className="min-w-0 flex-1 sm:w-48 sm:flex-none justify-center items-center truncate"
          >
            <Plus />
            Adicionar {addButton.value}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
