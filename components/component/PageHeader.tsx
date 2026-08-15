import { Download, Plus } from "lucide-react";
import { Button } from "../ui/button";

// Componente do cabeçalho de (quase) todas as páginas

type PageHeaderProps = { // Props que controlam o cabeçalho das páginas
  title: string;
  subtitle: string;
  importButton?: { // Props que controlam os botões, são opcionais
    value: string;
  };
  addButton?: {
    value: string;
  };
};

const PageHeader = ({ title, subtitle, importButton, addButton }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold">{title}</h1>
        <span className="text-gray-600">{subtitle}</span>
      </div>

      {importButton && (
        <div className="flex gap-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-42 justify-center items-center truncate"
            >
              <Download className="rotate-180" />
              Importar {importButton.value}
            </Button>
          </div>
        </div>
      )}

      {addButton && (
        <div className="flex gap-6">
          <div className="flex gap-2">
            <Button
              variant="default"
              className="w-48 justify-center items-center truncate"
            >
              <Plus />
              Adicionar {addButton.value}
            </Button>
          </div>
        </div>
      )}

      {importButton && addButton && (
        <div className="flex gap-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-48 justify-center items-center truncate"
            >
              <Download className="rotate-180" />
              Importar {importButton.value}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="w-48 justify-center items-center truncate"
            >
              <Plus />
              Adicionar {addButton.value}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
