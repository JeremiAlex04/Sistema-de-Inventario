const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || 'Error de comunicacion con el servidor.')
  }

  return payload
}

function mapProduct(product) {
  return {
    id: product.id,
    sku: product.sku,
    nombre: product.nombre,
    categoria: product.categoria,
    descripcion: product.descripcion,
    unidadMedida: product.unidad_medida,
    igvAfectacion: product.igv_afectacion,
    precio: Number(product.precio),
    stock: Number(product.stock),
    minStock: Number(product.min_stock),
    maxStock: Number(product.max_stock),
    createdAt: product.created_at,
    updatedAt: product.updated_at
  }
}

function mapMovement(movement) {
  return {
    id: movement.id,
    productId: movement.product_id,
    productName: movement.product_name,
    type: movement.type,
    quantity: Number(movement.quantity),
    adjustmentSign: movement.adjustment_sign,
    motive: movement.motive,
    user: movement.username,
    stockAfter: Number(movement.stock_after),
    createdAt: movement.created_at
  }
}

export async function getBootstrapData() {
  const data = await request('/bootstrap')
  return {
    products: data.products.map(mapProduct),
    movements: data.movements.map(mapMovement)
  }
}

export async function createProductApi(values) {
  const data = await request('/products', {
    method: 'POST',
    body: JSON.stringify(values)
  })
  return mapProduct(data.product)
}

export async function updateProductApi(id, values) {
  const data = await request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(values)
  })
  return mapProduct(data.product)
}

export async function deleteProductApi(id) {
  await request(`/products/${id}`, { method: 'DELETE' })
}

export async function registerMovementApi(payload) {
  const data = await request('/movements', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return {
    product: mapProduct(data.product),
    movement: mapMovement(data.movement)
  }
}
