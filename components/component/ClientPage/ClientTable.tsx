import { columnsClient, columnsGroup } from "./columns"
import ClientTableView from "./ClientTableView"

const ClientTable = () => {
  return (
    <ClientTableView
      columnsClient={columnsClient}
      columnsGroup={columnsGroup}
    />
  )
}

export default ClientTable