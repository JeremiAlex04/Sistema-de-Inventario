export function ReportsPanel({
  productsWithoutMovement,
  topOutputProducts,
  reportRange,
  onRangeChange,
  onExportProducts,
  onExportMovements
}) {
  return (
    <section className="inventory-section">
      <div className="section-head d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>Reportes</h2>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onExportProducts}>
            Exportar productos CSV
          </button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onExportMovements}>
            Exportar movimientos CSV
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="fromDate" className="form-label">Desde</label>
          <input
            id="fromDate"
            name="fromDate"
            type="date"
            className="form-control"
            value={reportRange.fromDate}
            onChange={onRangeChange}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="toDate" className="form-label">Hasta</label>
          <input
            id="toDate"
            name="toDate"
            type="date"
            className="form-control"
            value={reportRange.toDate}
            onChange={onRangeChange}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="subpanel">
            <h3>Productos sin movimiento</h3>
            <ul className="list-group">
              {productsWithoutMovement.map((item) => (
                <li className="list-group-item" key={item.id}>
                  {item.sku} - {item.nombre}
                </li>
              ))}
              {productsWithoutMovement.length === 0 && (
                <li className="list-group-item text-secondary">Todos los productos tienen movimientos.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="subpanel">
            <h3>Top salidas</h3>
            <ul className="list-group">
              {topOutputProducts.map((item) => (
                <li className="list-group-item d-flex justify-content-between" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.total}</strong>
                </li>
              ))}
              {topOutputProducts.length === 0 && (
                <li className="list-group-item text-secondary">Aun no hay salidas registradas.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
