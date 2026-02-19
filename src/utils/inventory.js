export const USER_ROLES = {
  ADMIN: 'admin',
  ALMACEN: 'almacen',
  VENDEDOR: 'vendedor'
}

export const MOVEMENT_TYPES = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  AJUSTE: 'ajuste'
}

export const STOCK_FILTERS = {
  ALL: 'all',
  OK: 'ok',
  LOW: 'low',
  OUT: 'out'
}

export const IGV_AFFECTATIONS = {
  GRAVADO: 'gravado',
  EXONERADO: 'exonerado',
  INAFECTO: 'inafecto'
}

export const BUSINESS_REGIMES = [
  'RUS',
  'RER',
  'MYPE Tributario',
  'Regimen General'
]

export const COMPROBANTE_TYPES = [
  'boleta',
  'factura',
  'nota_credito',
  'nota_debito'
]

export const COMMON_UNITS = ['UND', 'KG', 'LT', 'M', 'CAJA', 'PAQ', 'SERV']

export function getInitialBusinessProfile() {
  return {
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    regimen: 'MYPE Tributario',
    igvRate: 0.18,
    comprobantePreferido: 'boleta'
  }
}

export function getInitialProducts() {
  return [
    {
      id: 1,
      sku: 'BEB-001',
      nombre: 'Coca-Cola 500ml',
      categoria: 'Bebidas',
      descripcion: 'Bebida gaseosa sabor cola',
      unidadMedida: 'UND',
      igvAfectacion: IGV_AFFECTATIONS.GRAVADO,
      precio: 150,
      stock: 10,
      minStock: 5,
      maxStock: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function calculateProductPricing(product, igvRate = 0.18) {
  const base = Number(product.precio) || 0
  if (product.igvAfectacion !== IGV_AFFECTATIONS.GRAVADO) {
    return {
      basePrice: base,
      igvAmount: 0,
      finalPrice: base
    }
  }

  const igvAmount = Number((base * igvRate).toFixed(2))
  return {
    basePrice: base,
    igvAmount,
    finalPrice: Number((base + igvAmount).toFixed(2))
  }
}

export function isValidPeruvianRuc(value) {
  const ruc = String(value || '').trim()
  if (!/^\d{11}$/.test(ruc)) return false

  const coefficients = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = coefficients.reduce((acc, coef, index) => acc + Number(ruc[index]) * coef, 0)
  const remainder = 11 - (sum % 11)
  const checkDigit = remainder === 10 ? 0 : remainder === 11 ? 1 : remainder

  return checkDigit === Number(ruc[10])
}

export function isValidPeruvianDni(value) {
  return /^\d{8}$/.test(String(value || '').trim())
}

export function validateBusinessProfile(profile) {
  const errors = {}
  const ruc = String(profile.ruc || '').trim()
  const razonSocial = String(profile.razonSocial || '').trim()
  const igvRate = Number(profile.igvRate)
  const comprobantePreferido = String(profile.comprobantePreferido || '').trim()

  if (!isValidPeruvianRuc(ruc)) {
    errors.ruc = 'RUC invalido (11 digitos con formato SUNAT).'
  }
  if (!razonSocial) {
    errors.razonSocial = 'Razon social es obligatoria.'
  }
  if (Number.isNaN(igvRate) || igvRate < 0 || igvRate > 0.5) {
    errors.igvRate = 'IGV debe estar entre 0 y 0.5 (ejemplo: 0.18).'
  }
  if (!COMPROBANTE_TYPES.includes(comprobantePreferido)) {
    errors.comprobantePreferido = 'Comprobante preferido invalido.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      ...profile,
      ruc,
      razonSocial,
      igvRate: Number.isNaN(igvRate) ? 0.18 : igvRate
    }
  }
}

export function getStockStatus(product) {
  if (product.stock <= 0) return STOCK_FILTERS.OUT
  if (product.stock <= product.minStock) return STOCK_FILTERS.LOW
  return STOCK_FILTERS.OK
}

export function getStockStatusLabel(status) {
  if (status === STOCK_FILTERS.OUT) return 'Agotado'
  if (status === STOCK_FILTERS.LOW) return 'Bajo stock'
  return 'Disponible'
}

export function getPermissions(role) {
  return {
    canCreateOrEditProduct: role === USER_ROLES.ADMIN || role === USER_ROLES.ALMACEN,
    canDeleteProduct: role === USER_ROLES.ADMIN,
    canRegisterEntradaOrAjuste: role === USER_ROLES.ADMIN || role === USER_ROLES.ALMACEN,
    canRegisterSalida: role === USER_ROLES.ADMIN || role === USER_ROLES.ALMACEN || role === USER_ROLES.VENDEDOR
  }
}

function normalizeText(value) {
  return String(value || '').trim()
}

function parsePositiveNumber(value) {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}

export function validateProduct(product, products, editingProductId = null) {
  const errors = {}

  const sku = normalizeText(product.sku)
  const nombre = normalizeText(product.nombre)
  const categoria = normalizeText(product.categoria)
  const descripcion = normalizeText(product.descripcion)
  const unidadMedida = normalizeText(product.unidadMedida || 'UND')
  const igvAfectacion = normalizeText(product.igvAfectacion || IGV_AFFECTATIONS.GRAVADO).toLowerCase()
  const precio = parsePositiveNumber(product.precio)
  const stock = parsePositiveNumber(product.stock)
  const minStock = parsePositiveNumber(product.minStock)
  const maxStock = parsePositiveNumber(product.maxStock)

  if (!sku) errors.sku = 'SKU es obligatorio.'
  if (!nombre || nombre.length < 2) errors.nombre = 'Nombre debe tener al menos 2 caracteres.'
  if (!categoria) errors.categoria = 'Categoria es obligatoria.'
  if (!descripcion || descripcion.length < 5) errors.descripcion = 'Descripcion debe tener al menos 5 caracteres.'
  if (!unidadMedida) errors.unidadMedida = 'Unidad de medida es obligatoria.'
  if (!Object.values(IGV_AFFECTATIONS).includes(igvAfectacion)) {
    errors.igvAfectacion = 'Afectacion IGV invalida.'
  }
  if (precio === null) errors.precio = 'Precio debe ser un numero positivo.'
  if (stock === null) errors.stock = 'Stock debe ser un numero positivo.'
  if (minStock === null) errors.minStock = 'Stock minimo debe ser un numero positivo.'
  if (maxStock === null) errors.maxStock = 'Stock maximo debe ser un numero positivo.'

  if (minStock !== null && maxStock !== null && minStock > maxStock) {
    errors.maxStock = 'Stock maximo debe ser mayor o igual al minimo.'
  }

  if (stock !== null && maxStock !== null && stock > maxStock) {
    errors.stock = 'Stock no puede superar el stock maximo.'
  }

  const repeatedSku = products.find(
    (item) => item.sku.toLowerCase() === sku.toLowerCase() && item.id !== editingProductId
  )

  if (repeatedSku) errors.sku = 'SKU ya existe.'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      sku,
      nombre,
      categoria,
      descripcion,
      unidadMedida,
      igvAfectacion,
      precio: precio ?? 0,
      stock: stock ?? 0,
      minStock: minStock ?? 0,
      maxStock: maxStock ?? 0
    }
  }
}

export function createProduct(values, products) {
  const maxId = products.length ? Math.max(...products.map((item) => item.id)) : 0
  const now = new Date().toISOString()
  return {
    id: maxId + 1,
    ...values,
    createdAt: now,
    updatedAt: now
  }
}

export function updateProductValues(existingProduct, values) {
  return {
    ...existingProduct,
    ...values,
    updatedAt: new Date().toISOString()
  }
}

export function validateMovement(movement, products, permissions) {
  const errors = {}

  const productId = Number(movement.productId)
  const product = products.find((item) => item.id === productId)
  const quantity = Number(movement.quantity)
  const type = movement.type
  const motive = normalizeText(movement.motive)
  const user = normalizeText(movement.user)

  if (!product) errors.productId = 'Selecciona un producto valido.'
  if (!Object.values(MOVEMENT_TYPES).includes(type)) errors.type = 'Tipo de movimiento invalido.'
  if (Number.isNaN(quantity) || quantity <= 0) errors.quantity = 'Cantidad debe ser mayor a 0.'
  if (!motive) errors.motive = 'Motivo es obligatorio.'
  if (!user) errors.user = 'Usuario es obligatorio.'

  if (type === MOVEMENT_TYPES.ENTRADA || type === MOVEMENT_TYPES.AJUSTE) {
    if (!permissions.canRegisterEntradaOrAjuste) {
      errors.type = 'Tu rol no permite registrar entradas o ajustes.'
    }
  }

  if (type === MOVEMENT_TYPES.SALIDA && !permissions.canRegisterSalida) {
    errors.type = 'Tu rol no permite registrar salidas.'
  }

  if (product && type === MOVEMENT_TYPES.SALIDA && quantity > product.stock) {
    errors.quantity = 'Stock insuficiente para salida.'
  }

  if (
    product &&
    type === MOVEMENT_TYPES.AJUSTE &&
    movement.adjustmentSign === 'decrease' &&
    quantity > product.stock
  ) {
    errors.quantity = 'Ajuste no puede dejar stock negativo.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      productId,
      type,
      quantity,
      motive,
      user,
      adjustmentSign: movement.adjustmentSign || 'increase'
    },
    product
  }
}

function computeDelta(type, quantity, adjustmentSign) {
  if (type === MOVEMENT_TYPES.ENTRADA) return quantity
  if (type === MOVEMENT_TYPES.SALIDA) return -quantity
  return adjustmentSign === 'decrease' ? -quantity : quantity
}

export function applyMovement(products, movementValues) {
  const delta = computeDelta(movementValues.type, movementValues.quantity, movementValues.adjustmentSign)
  const updatedProducts = products.map((item) => {
    if (item.id !== movementValues.productId) return item

    const nextStock = item.stock + delta
    return {
      ...item,
      stock: nextStock,
      updatedAt: new Date().toISOString()
    }
  })

  return { updatedProducts, delta }
}

export function createMovement(movementValues, currentMovements, productName, stockAfter) {
  const nextId = currentMovements.length ? Math.max(...currentMovements.map((item) => item.id)) + 1 : 1
  return {
    id: nextId,
    productId: movementValues.productId,
    productName,
    type: movementValues.type,
    quantity: movementValues.quantity,
    adjustmentSign: movementValues.adjustmentSign,
    motive: movementValues.motive,
    user: movementValues.user,
    stockAfter,
    createdAt: new Date().toISOString()
  }
}

export function filterAndSortProducts(products, filters) {
  const term = normalizeText(filters.term).toLowerCase()

  const filtered = products.filter((item) => {
    const status = getStockStatus(item)
    const matchesTerm =
      !term ||
      item.nombre.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.categoria.toLowerCase().includes(term)

    const matchesCategory = !filters.category || item.categoria === filters.category
    const matchesStatus = filters.stockStatus === STOCK_FILTERS.ALL || status === filters.stockStatus

    return matchesTerm && matchesCategory && matchesStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    const [field, direction] = filters.sortBy.split(':')
    const multiplier = direction === 'desc' ? -1 : 1

    if (field === 'nombre' || field === 'sku' || field === 'categoria') {
      return a[field].localeCompare(b[field]) * multiplier
    }

    if (field === 'precio' || field === 'stock') {
      return (a[field] - b[field]) * multiplier
    }

    return 0
  })

  return sorted
}

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    page: safePage,
    totalPages,
    items: items.slice(start, start + pageSize)
  }
}

export function getDashboardMetrics(products, movements) {
  const inventoryValue = products.reduce((acc, item) => acc + item.stock * item.precio, 0)
  const lowStockCount = products.filter((item) => getStockStatus(item) === STOCK_FILTERS.LOW).length
  const outOfStockCount = products.filter((item) => getStockStatus(item) === STOCK_FILTERS.OUT).length

  const entries = movements.filter((item) => item.type === MOVEMENT_TYPES.ENTRADA).length
  const outputs = movements.filter((item) => item.type === MOVEMENT_TYPES.SALIDA).length

  return {
    totalProducts: products.length,
    inventoryValue,
    lowStockCount,
    outOfStockCount,
    totalMovements: movements.length,
    entries,
    outputs
  }
}

export function getProductsWithoutMovement(products, movements) {
  const movedIds = new Set(movements.map((item) => item.productId))
  return products.filter((item) => !movedIds.has(item.id))
}

export function getTopOutputProducts(movements) {
  const totals = {}

  movements.forEach((item) => {
    if (item.type !== MOVEMENT_TYPES.SALIDA) return
    totals[item.productName] = (totals[item.productName] || 0) + item.quantity
  })

  return Object.entries(totals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

export function filterMovementsByDate(movements, fromDate, toDate) {
  if (!fromDate && !toDate) return movements

  const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : Number.MIN_SAFE_INTEGER
  const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER

  return movements.filter((item) => {
    const timestamp = new Date(item.createdAt).getTime()
    return timestamp >= from && timestamp <= to
  })
}

function toCsvValue(value) {
  const normalized = String(value ?? '')
  return `"${normalized.replace(/"/g, '""')}"`
}

export function exportRowsToCsv(filename, rows) {
  if (!rows.length) return false

  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(toCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(','))
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}
