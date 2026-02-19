import {
  calculateProductPricing,
  formatCurrency,
  getStockStatus,
  getStockStatusLabel,
  IGV_AFFECTATIONS,
  STOCK_FILTERS
} from '../utils/inventory'

function StockBadge({ product }) {
  const status = getStockStatus(product)
  const className =
    status === STOCK_FILTERS.OUT
      ? 'badge text-bg-danger'
      : status === STOCK_FILTERS.LOW
        ? 'badge text-bg-warning'
        : 'badge text-bg-success'

  return <span className={className}>{getStockStatusLabel(status)}</span>
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onSelect,
  canEdit,
  canDelete,
  igvRate
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>IGV</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const pricing = calculateProductPricing(product, igvRate)
            const igvLabel =
              (product.igvAfectacion || IGV_AFFECTATIONS.GRAVADO) === IGV_AFFECTATIONS.GRAVADO
                ? `${Math.round(igvRate * 100)}%`
                : product.igvAfectacion || IGV_AFFECTATIONS.GRAVADO

            return (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>{product.unidadMedida || 'UND'}</td>
                <td>
                  <div>{formatCurrency(pricing.basePrice)}</div>
                  <small className="text-secondary">Final: {formatCurrency(pricing.finalPrice)}</small>
                </td>
                <td>{igvLabel}</td>
                <td>{product.stock}</td>
                <td><StockBadge product={product} /></td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onSelect(product.id)}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onEdit(product.id)}
                      disabled={!canEdit}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(product.id)}
                      disabled={!canDelete}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center text-secondary py-4">
                No hay productos para mostrar con los filtros actuales.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
