import { columnsOrder } from "./columns";
import OrderTableView from "./OrderTableView";

const OrderTable = () => {
  return <OrderTableView columnsOrder={columnsOrder} />;
};

export default OrderTable;
