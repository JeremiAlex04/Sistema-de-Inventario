import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SidebarNav } from './components/layout/SidebarNav'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { CatalogPage } from './pages/CatalogPage'
import { DashboardPage } from './pages/DashboardPage'
import { FormsPage } from './pages/FormsPage'
import { KardexPage } from './pages/KardexPage'
import { ReportsPage } from './pages/ReportsPage'
import { SessionPage } from './pages/SessionPage'
import {
  calculateProductPricing,
  exportRowsToCsv,
  filterAndSortProducts,
  filterMovementsByDate,
  formatDate,
  getInitialBusinessProfile,
  getDashboardMetrics,
  getPermissions,
  getProductsWithoutMovement,
  getStockStatus,
  getTopOutputProducts,
  paginate,
  STOCK_FILTERS,
  USER_ROLES,
  validateBusinessProfile,
  validateMovement,
  validateProduct
} from './utils/inventory'
import {
  createProductApi,
  deleteProductApi,
  getBootstrapData,
  registerMovementApi,
  updateProductApi
} from './services/inventoryApi'

const INITIAL_PRODUCT_FORM = {
  sku: '',
  nombre: '',
  categoria: '',
  descripcion: '',
  unidadMedida: 'UND',
  igvAfectacion: 'gravado',
  precio: '',
  stock: '',
  minStock: '',
  maxStock: ''
}

const INITIAL_FILTERS = {
  term: '',
  category: '',
  stockStatus: STOCK_FILTERS.ALL,
  sortBy: 'nombre:asc'
}

const PAGE_SIZE = 8

function getInitialSession() {
  return {
    username: 'Operador',
    role: USER_ROLES.ADMIN
  }
}

function getInitialMovementForm(username) {
  return {
    productId: '',
    type: 'entrada',
    quantity: '',
    motive: '',
    user: username,
    adjustmentSign: 'increase'
  }
}

function App() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useLocalStorageState('inventory_session', getInitialSession)
  const [businessProfile, setBusinessProfile] = useLocalStorageState(
    'inventory_business_profile',
    getInitialBusinessProfile
  )
  const [businessErrors, setBusinessErrors] = useState({})

  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [productErrors, setProductErrors] = useState({})
  const [editingProductId, setEditingProductId] = useState(null)

  const [movementForm, setMovementForm] = useState(getInitialMovementForm(session.username))
  const [movementErrors, setMovementErrors] = useState({})

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [reportRange, setReportRange] = useState({ fromDate: '', toDate: '' })
  const [notice, setNotice] = useState(null)

  const permissions = useMemo(() => getPermissions(session.role), [session.role])
  const igvRate = Number(businessProfile.igvRate) || 0.18

  useEffect(() => {
    let mounted = true
    async function loadInventory() {
      setIsLoading(true)
      try {
        const data = await getBootstrapData()
        if (!mounted) return
        setProducts(data.products)
        setMovements(data.movements)
      } catch (error) {
        if (!mounted) return
        setNotice({ type: 'danger', message: error.message })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadInventory()
    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => {
    return [...new Set(products.map((item) => item.categoria))].sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => filterAndSortProducts(products, filters), [products, filters])
  const pagination = useMemo(() => paginate(filteredProducts, currentPage, PAGE_SIZE), [filteredProducts, currentPage])
  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedProductId) || null, [products, selectedProductId])
  const reportMovements = useMemo(() => {
    const values = filterMovementsByDate(movements, reportRange.fromDate, reportRange.toDate)
    return [...values].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [movements, reportRange.fromDate, reportRange.toDate])

  const metrics = useMemo(() => getDashboardMetrics(products, movements), [products, movements])
  const lowStockAlerts = useMemo(() => {
    return products.filter((item) => {
      const status = getStockStatus(item)
      return status === STOCK_FILTERS.LOW || status === STOCK_FILTERS.OUT
    })
  }, [products])
  const productsWithoutMovement = useMemo(() => getProductsWithoutMovement(products, reportMovements), [products, reportMovements])
  const topOutputProducts = useMemo(() => getTopOutputProducts(reportMovements), [reportMovements])

  function showNotice(type, message) {
    setNotice({ type, message })
  }

  function resetProductForm() {
    setProductForm(INITIAL_PRODUCT_FORM)
    setProductErrors({})
    setEditingProductId(null)
  }

  function handleSessionChange(event) {
    const { name, value } = event.target
    setSession((prev) => ({ ...prev, [name]: value }))
    if (name === 'username') {
      setMovementForm((prev) => ({ ...prev, user: value }))
    }
  }

  function handleProductInputChange(event) {
    const { name, value } = event.target
    setProductForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    if (!permissions.canCreateOrEditProduct) {
      showNotice('warning', 'Tu rol no permite crear ni editar productos.')
      return
    }

    const validation = validateProduct(productForm, products, editingProductId)
    if (!validation.isValid) {
      setProductErrors(validation.errors)
      return
    }

    try {
      if (editingProductId) {
        const updated = await updateProductApi(editingProductId, validation.values)
        setProducts((prev) => prev.map((item) => (item.id === editingProductId ? updated : item)))
        showNotice('success', 'Producto actualizado correctamente.')
      } else {
        const created = await createProductApi(validation.values)
        setProducts((prev) => [...prev, created])
        showNotice('success', 'Producto agregado correctamente.')
      }
      resetProductForm()
    } catch (error) {
      showNotice('danger', error.message)
    }
  }

  function handleEditProduct(productId) {
    if (!permissions.canCreateOrEditProduct) {
      showNotice('warning', 'Tu rol no permite editar productos.')
      return
    }
    const product = products.find((item) => item.id === productId)
    if (!product) return

    setEditingProductId(product.id)
    setProductErrors({})
    setProductForm({
      sku: product.sku,
      nombre: product.nombre,
      categoria: product.categoria,
      descripcion: product.descripcion,
      unidadMedida: product.unidadMedida || 'UND',
      igvAfectacion: product.igvAfectacion || 'gravado',
      precio: String(product.precio),
      stock: String(product.stock),
      minStock: String(product.minStock),
      maxStock: String(product.maxStock)
    })
  }

  async function handleDeleteProduct(productId) {
    if (!permissions.canDeleteProduct) {
      showNotice('warning', 'Solo el rol admin puede eliminar productos.')
      return
    }
    const product = products.find((item) => item.id === productId)
    if (!product) return
    const confirmed = window.confirm(`Eliminar ${product.nombre} (${product.sku})? Esta accion no se puede deshacer.`)
    if (!confirmed) return

    try {
      await deleteProductApi(productId)
      setProducts((prev) => prev.filter((item) => item.id !== productId))
      setMovements((prev) => prev.filter((item) => item.productId !== productId))
      if (editingProductId === productId) resetProductForm()
      if (selectedProductId === productId) setSelectedProductId(null)
      showNotice('success', 'Producto eliminado correctamente.')
    } catch (error) {
      showNotice('danger', error.message)
    }
  }

  function handleMovementInputChange(event) {
    const { name, value } = event.target
    setMovementForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleMovementSubmit(event) {
    event.preventDefault()
    const validation = validateMovement(movementForm, products, permissions)
    if (!validation.isValid) {
      setMovementErrors(validation.errors)
      return
    }

    try {
      const data = await registerMovementApi({ ...validation.values, user: validation.values.user })
      setProducts((prev) => prev.map((item) => (item.id === data.product.id ? data.product : item)))
      setMovements((prev) => [data.movement, ...prev])
      setMovementErrors({})
      setMovementForm(getInitialMovementForm(session.username))
      showNotice('success', 'Movimiento registrado.')
    } catch (error) {
      showNotice('danger', error.message)
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

  function handleRangeChange(event) {
    const { name, value } = event.target
    setReportRange((prev) => ({ ...prev, [name]: value }))
  }

  function handleBusinessChange(event) {
    const { name, value } = event.target
    setBusinessProfile((prev) => ({ ...prev, [name]: value }))
  }

  function handleBusinessSubmit(event) {
    event.preventDefault()
    const validation = validateBusinessProfile(businessProfile)
    if (!validation.isValid) {
      setBusinessErrors(validation.errors)
      showNotice('warning', 'Revisa el perfil del negocio.')
      return
    }
    setBusinessErrors({})
    setBusinessProfile(validation.values)
    showNotice('success', 'Perfil del negocio actualizado.')
  }

  function exportProducts() {
    const rows = products.map((item) => ({
      RUCEmisor: businessProfile.ruc,
      RazonSocial: businessProfile.razonSocial,
      SKU: item.sku,
      Nombre: item.nombre,
      Categoria: item.categoria,
      Unidad: item.unidadMedida,
      AfectacionIGV: item.igvAfectacion,
      PrecioBase: item.precio,
      PrecioFinal: calculateProductPricing(item, igvRate).finalPrice,
      Stock: item.stock,
      StockMinimo: item.minStock,
      StockMaximo: item.maxStock,
      Actualizado: formatDate(item.updatedAt)
    }))
    const ok = exportRowsToCsv('inventario_productos.csv', rows)
    if (!ok) showNotice('warning', 'No hay productos para exportar.')
  }

  function exportMovements() {
    const rows = reportMovements.map((item) => ({
      Fecha: formatDate(item.createdAt),
      Producto: item.productName,
      Tipo: item.type,
      Cantidad: item.quantity,
      StockResultante: item.stockAfter,
      Motivo: item.motive,
      Usuario: item.user
    }))
    const ok = exportRowsToCsv('inventario_movimientos.csv', rows)
    if (!ok) showNotice('warning', 'No hay movimientos en el rango actual para exportar.')
  }

  return (
    <div className="inventory-layout">
      <SidebarNav />
      <main className="inventory-main container py-4">
        <header className="mb-4">
          <h1>Sistema de Inventario</h1>
          <p className="text-secondary mb-0">
            {businessProfile.razonSocial || 'Configura tu negocio'} | IGV {Math.round(igvRate * 100)}%
          </p>
        </header>

        {notice && (
          <div className={`alert alert-${notice.type} alert-dismissible`} role="alert">
            {notice.message}
            <button type="button" className="btn-close" onClick={() => setNotice(null)} />
          </div>
        )}
        {isLoading && <div className="alert alert-info">Cargando datos desde Neon...</div>}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/session"
            element={
              <SessionPage
                session={session}
                onSessionChange={handleSessionChange}
                businessProfile={businessProfile}
                businessErrors={businessErrors}
                onBusinessChange={handleBusinessChange}
                onBusinessSubmit={handleBusinessSubmit}
              />
            }
          />
          <Route path="/dashboard" element={<DashboardPage metrics={metrics} lowStockAlerts={lowStockAlerts} />} />
          <Route
            path="/forms"
            element={
              <FormsPage
                productForm={productForm}
                productErrors={productErrors}
                onProductInputChange={handleProductInputChange}
                onProductSubmit={handleProductSubmit}
                onCancelEdit={resetProductForm}
                isEditing={Boolean(editingProductId)}
                canManageProducts={permissions.canCreateOrEditProduct}
                movementForm={movementForm}
                movementErrors={movementErrors}
                products={products}
                onMovementInputChange={handleMovementInputChange}
                onMovementSubmit={handleMovementSubmit}
              />
            }
          />
          <Route
            path="/catalog"
            element={
              <CatalogPage
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                pagination={pagination}
                filteredCount={filteredProducts.length}
                onPageChange={setCurrentPage}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onSelectProduct={setSelectedProductId}
                canEdit={permissions.canCreateOrEditProduct}
                canDelete={permissions.canDeleteProduct}
                igvRate={igvRate}
              />
            }
          />
          <Route
            path="/kardex"
            element={<KardexPage selectedProduct={selectedProduct} movements={reportMovements} igvRate={igvRate} />}
          />
          <Route
            path="/reports"
            element={
              <ReportsPage
                productsWithoutMovement={productsWithoutMovement}
                topOutputProducts={topOutputProducts}
                reportRange={reportRange}
                onRangeChange={handleRangeChange}
                onExportProducts={exportProducts}
                onExportMovements={exportMovements}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
