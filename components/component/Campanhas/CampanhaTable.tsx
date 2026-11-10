import { columnsCampanha, columnsMensagens } from "./columns";
import CampanhaTableView from "./CampanhaTableView";

const CampanhaTable = () => {
  return (
    <CampanhaTableView
      columnsCampanha={columnsCampanha}
      columnsMensagens={columnsMensagens}
    />
  );
};

export default CampanhaTable;