import { ChevronDown, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { VariantProps } from "class-variance-authority";

// COMPONENTE DE BOTÃO DE "BAIXAR RELATÓRIO"

interface DownloadReportButtonProps {
  title: string,
  btnVariant?: VariantProps<typeof buttonVariants>["variant"]
}

const DownloadReportButton = ({title, btnVariant}: DownloadReportButtonProps ) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className={buttonVariants({ variant: btnVariant })}>
            {title} <ChevronDown />
          </button>
        }
      />
      <DropdownMenuContent className="w-36">
        <DropdownMenuGroup>
          <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
            <FileSpreadsheet />
            Em CSV
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
            <FileSpreadsheet />
            Em XLS
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadReportButton;
