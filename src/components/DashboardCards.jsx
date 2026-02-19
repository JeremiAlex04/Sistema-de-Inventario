import { formatCurrency } from '../utils/inventory'

export function DashboardCards({ metrics }) {
  const cards = [
    { label: 'Productos', value: metrics.totalProducts },
    { label: 'Valor inventario', value: formatCurrency(metrics.inventoryValue) },
    { label: 'Bajo stock', value: metrics.lowStockCount },
    { label: 'Agotados', value: metrics.outOfStockCount },
    { label: 'Movimientos', value: metrics.totalMovements },
    { label: 'Salidas', value: metrics.outputs }
  ]

  return (
    <section className="dashboard-grid">
      {cards.map((card) => (
        <article className="metric-card" key={card.label}>
          <p className="metric-label">{card.label}</p>
          <p className="metric-value">{card.value}</p>
        </article>
      ))}
    </section>
  )
}
