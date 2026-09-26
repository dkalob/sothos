import {
  columnsProduct,
} from "./columns";
import ProductTableView from "./ProductTableView";

const ProductTable = () => {
  return (
    <ProductTableView
      columnsProduct={columnsProduct}
    />
  );
};

export default ProductTable;
