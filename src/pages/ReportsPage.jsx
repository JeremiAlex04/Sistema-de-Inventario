import { ReportsPanel } from '../components/ReportsPanel'

export function ReportsPage({
  productsWithoutMovement,
  topOutputProducts,
  reportRange,
  onRangeChange,
  onExportProducts,
  onExportMovements
}) {
  return (
    <ReportsPanel
      productsWithoutMovement={productsWithoutMovement}
      topOutputProducts={topOutputProducts}
      reportRange={reportRange}
      onRangeChange={onRangeChange}
      onExportProducts={onExportProducts}
      onExportMovements={onExportMovements}
    />
  )
}
