import { Download, Plus } from "lucide-react";
import { Button } from "../ui/button";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  button?: {
    value: string;
  };
};

const PageHeader = ({ title, subtitle, button }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold">{title}</h1>
        <span className="text-gray-600">{subtitle}</span>
      </div>
      {button && (
        <div className="flex gap-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-48 justify-center items-center truncate"
            >
              <Download className="rotate-180" />
              Importar {button.value}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="w-48 justify-center items-center truncate"
            >
              <Plus />
              Adicionar {button.value}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
