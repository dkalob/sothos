// Essa página será responsável por trazer os dados do BD e 
// envia-los como props para ClientTableView

import {
  OrderTableColumns,
  columnsOrder,
} from "./columns";
import OrderTableView from "./OrderTableView";

const getOrderData = async (): Promise<OrderTableColumns[]> => {
  return [
  ];
};


const OrderTable = async () => {
  const OrderData = await getOrderData();


  return (
    <OrderTableView
      columnsOrder={columnsOrder}
      orderData={OrderData}
    />
  );
};

export default OrderTable;
