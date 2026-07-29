import { ChevronDown, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const DownloadReportButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className={buttonVariants({ variant: "default" })}>
            Baixar Relatório <ChevronDown />
          </button>
        }
      />
      <DropdownMenuContent className="w-36">
        <DropdownMenuGroup>
          <DropdownMenuItem className="data-highlighted:bg-secondary data-highlighted:text-primary">
            <FileSpreadsheet />
            Em CSV
          </DropdownMenuItem>
          <DropdownMenuItem className="data-highlighted:bg-secondary data-highlighted:text-primary">
            <FileSpreadsheet />
            Em XLS
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadReportButton;
