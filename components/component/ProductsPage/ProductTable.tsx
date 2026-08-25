// Essa página será responsável por trazer os dados do BD e 
// envia-los como props para ClientTableView

import {
  ProductTableColumns,
  columnsProduct,
} from "./columns";
import ProductTableView from "./ProductTableView";

const getProdutoData = async (): Promise<ProductTableColumns[]> => {
  return [
  ];
};


const ProductTable = async () => {
  const ProductData = await getProdutoData();


  return (
    <ProductTableView
      columnsProduct={columnsProduct}
      productsData={ProductData}
    />
  );
};

export default ProductTable;
