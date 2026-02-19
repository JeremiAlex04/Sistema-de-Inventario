import { MovementsTable } from '../components/MovementsTable'
import { calculateProductPricing, formatCurrency, formatDate } from '../utils/inventory'

export function KardexPage({ selectedProduct, movements, igvRate }) {
  const pricing = selectedProduct ? calculateProductPricing(selectedProduct, igvRate) : null

  return (
    <section className="row g-4">
      <div className="col-xl-4">
        <section className="inventory-section h-100">
          <div className="section-head">
            <h2>Detalle del producto</h2>
          </div>
          {!selectedProduct && <p className="text-secondary m-0">Selecciona un producto para ver detalle.</p>}
          {selectedProduct && (
            <dl className="detail-list">
              <div><dt>SKU</dt><dd>{selectedProduct.sku}</dd></div>
              <div><dt>Nombre</dt><dd>{selectedProduct.nombre}</dd></div>
              <div><dt>Categoria</dt><dd>{selectedProduct.categoria}</dd></div>
              <div><dt>Unidad</dt><dd>{selectedProduct.unidadMedida || 'UND'}</dd></div>
              <div><dt>Afectacion IGV</dt><dd>{selectedProduct.igvAfectacion}</dd></div>
              <div><dt>Precio base</dt><dd>{formatCurrency(pricing.basePrice)}</dd></div>
              <div><dt>Precio final</dt><dd>{formatCurrency(pricing.finalPrice)}</dd></div>
              <div><dt>Stock actual</dt><dd>{selectedProduct.stock}</dd></div>
              <div><dt>Rango stock</dt><dd>{selectedProduct.minStock} - {selectedProduct.maxStock}</dd></div>
              <div><dt>Actualizado</dt><dd>{formatDate(selectedProduct.updatedAt)}</dd></div>
            </dl>
          )}
        </section>
      </div>
      <div className="col-xl-8">
        <section className="inventory-section h-100">
          <div className="section-head">
            <h2>Kardex / movimientos</h2>
          </div>
          <MovementsTable movements={movements} />
        </section>
      </div>
    </section>
  )
}
