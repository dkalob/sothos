import { columnsCategoria } from "./columns";
import CategoriaTableView from "./CategoriaTableView";

const CategoriaTable = () => {
  return (
    <CategoriaTableView
      columnsCategoria={columnsCategoria}
    />
  );
};

export default CategoriaTable;
