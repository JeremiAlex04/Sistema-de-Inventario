import { ProductTable } from '../components/ProductTable'
import { STOCK_FILTERS } from '../utils/inventory'

export function CatalogPage({
  categories,
  filters,
  onFilterChange,
  pagination,
  filteredCount,
  onPageChange,
  onEditProduct,
  onDeleteProduct,
  onSelectProduct,
  canEdit,
  canDelete,
  igvRate
}) {
  return (
    <section className="inventory-section">
      <div className="section-head">
        <h2>Catalogo de productos</h2>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="term" className="form-label">Buscar</label>
          <input
            id="term"
            name="term"
            className="form-control"
            placeholder="SKU, nombre o categoria"
            value={filters.term}
            onChange={onFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="category" className="form-label">Categoria</label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={filters.category}
            onChange={onFilterChange}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="stockStatus" className="form-label">Estado stock</label>
          <select
            id="stockStatus"
            name="stockStatus"
            className="form-select"
            value={filters.stockStatus}
            onChange={onFilterChange}
          >
            <option value={STOCK_FILTERS.ALL}>Todos</option>
            <option value={STOCK_FILTERS.OK}>Disponible</option>
            <option value={STOCK_FILTERS.LOW}>Bajo stock</option>
            <option value={STOCK_FILTERS.OUT}>Agotado</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="sortBy" className="form-label">Ordenar</label>
          <select
            id="sortBy"
            name="sortBy"
            className="form-select"
            value={filters.sortBy}
            onChange={onFilterChange}
          >
            <option value="nombre:asc">Nombre A-Z</option>
            <option value="nombre:desc">Nombre Z-A</option>
            <option value="precio:asc">Precio menor</option>
            <option value="precio:desc">Precio mayor</option>
            <option value="stock:asc">Stock menor</option>
            <option value="stock:desc">Stock mayor</option>
          </select>
        </div>
      </div>

      <ProductTable
        products={pagination.items}
        onEdit={onEditProduct}
        onDelete={onDeleteProduct}
        onSelect={onSelectProduct}
        canEdit={canEdit}
        canDelete={canDelete}
        igvRate={igvRate}
      />

      <div className="d-flex justify-content-between align-items-center mt-2">
        <p className="m-0 text-secondary">
          Mostrando {pagination.items.length} de {filteredCount} productos
        </p>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Anterior
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
            Pagina {pagination.page} / {pagination.totalPages}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
