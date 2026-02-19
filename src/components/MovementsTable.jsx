import { formatDate, MOVEMENT_TYPES } from '../utils/inventory'

function getTypeLabel(item) {
  if (item.type === MOVEMENT_TYPES.ENTRADA) return 'Entrada'
  if (item.type === MOVEMENT_TYPES.SALIDA) return 'Salida'
  const label = item.adjustmentSign === 'decrease' ? 'Ajuste (-)' : 'Ajuste (+)'
  return label
}

export function MovementsTable({ movements }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Stock resultante</th>
            <th>Motivo</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((item) => (
            <tr key={item.id}>
              <td>{formatDate(item.createdAt)}</td>
              <td>{item.productName}</td>
              <td>{getTypeLabel(item)}</td>
              <td>{item.quantity}</td>
              <td>{item.stockAfter}</td>
              <td>{item.motive}</td>
              <td>{item.user}</td>
            </tr>
          ))}
          {movements.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-secondary py-4">
                Todavia no hay movimientos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
