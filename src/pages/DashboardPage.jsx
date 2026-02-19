import { DashboardCards } from '../components/DashboardCards'

export function DashboardPage({ metrics, lowStockAlerts }) {
  return (
    <div className="d-grid gap-4">
      <DashboardCards metrics={metrics} />
      <section className="inventory-section">
        <div className="section-head">
          <h2>Alertas de reposicion</h2>
        </div>
        {lowStockAlerts.length === 0 ? (
          <p className="text-secondary mb-0">No hay alertas de stock actualmente.</p>
        ) : (
          <ul className="list-group">
            {lowStockAlerts.map((item) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                <span>{item.sku} - {item.nombre}</span>
                <span className="fw-semibold">Stock: {item.stock} / Min: {item.minStock}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
