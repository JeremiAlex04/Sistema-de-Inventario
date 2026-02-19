import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { query, withTransaction } from './db.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 4000)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

function parsePositiveNumber(value) {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}

function validateProductPayload(payload) {
  const errors = []
  const sku = String(payload.sku || '').trim()
  const nombre = String(payload.nombre || '').trim()
  const categoria = String(payload.categoria || '').trim()
  const descripcion = String(payload.descripcion || '').trim()
  const unidadMedida = String(payload.unidadMedida || 'UND').trim().toUpperCase()
  const igvAfectacion = String(payload.igvAfectacion || 'gravado').trim().toLowerCase()
  const precio = parsePositiveNumber(payload.precio)
  const stock = parsePositiveNumber(payload.stock)
  const minStock = parsePositiveNumber(payload.minStock)
  const maxStock = parsePositiveNumber(payload.maxStock)

  if (!sku) errors.push('SKU es obligatorio.')
  if (!nombre) errors.push('Nombre es obligatorio.')
  if (!categoria) errors.push('Categoria es obligatoria.')
  if (!descripcion) errors.push('Descripcion es obligatoria.')
  if (!unidadMedida) errors.push('Unidad de medida es obligatoria.')
  if (!['gravado', 'exonerado', 'inafecto'].includes(igvAfectacion)) {
    errors.push('Afectacion IGV invalida.')
  }
  if (precio === null) errors.push('Precio invalido.')
  if (stock === null) errors.push('Stock invalido.')
  if (minStock === null) errors.push('Stock minimo invalido.')
  if (maxStock === null) errors.push('Stock maximo invalido.')
  if (minStock !== null && maxStock !== null && minStock > maxStock) {
    errors.push('Stock minimo no puede ser mayor que stock maximo.')
  }
  if (stock !== null && maxStock !== null && stock > maxStock) {
    errors.push('Stock no puede superar stock maximo.')
  }

  return {
    errors,
    values: {
      sku,
      nombre,
      categoria,
      descripcion,
      unidadMedida,
      igvAfectacion,
      precio,
      stock,
      minStock,
      maxStock
    }
  }
}

function validateMovementPayload(payload) {
  const errors = []
  const productId = Number(payload.productId)
  const quantity = Number(payload.quantity)
  const type = String(payload.type || '')
  const adjustmentSign = payload.adjustmentSign === 'decrease' ? 'decrease' : 'increase'
  const motive = String(payload.motive || '').trim()
  const username = String(payload.user || '').trim()

  if (!Number.isInteger(productId) || productId <= 0) errors.push('Producto invalido.')
  if (!Number.isInteger(quantity) || quantity <= 0) errors.push('Cantidad invalida.')
  if (!['entrada', 'salida', 'ajuste'].includes(type)) errors.push('Tipo de movimiento invalido.')
  if (!motive) errors.push('Motivo es obligatorio.')
  if (!username) errors.push('Usuario es obligatorio.')

  return {
    errors,
    values: { productId, quantity, type, adjustmentSign, motive, username }
  }
}

async function ensureSchema() {
  const sqlPath = path.join(__dirname, 'sql', 'init.sql')
  const sql = await fs.readFile(sqlPath, 'utf8')
  await query(sql)
  await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS unidad_medida TEXT NOT NULL DEFAULT 'UND'")
  await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS igv_afectacion TEXT NOT NULL DEFAULT 'gravado'")

  const existing = await query('SELECT COUNT(*)::int AS total FROM products')
  if (existing.rows[0].total === 0) {
    await query(
      `INSERT INTO products (sku, nombre, categoria, descripcion, unidad_medida, igv_afectacion, precio, stock, min_stock, max_stock)
       VALUES ('BEB-001', 'Coca-Cola 500ml', 'Bebidas', 'Bebida gaseosa sabor cola', 'UND', 'gravado', 150, 10, 5, 120)`
    )
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/bootstrap', async (_req, res) => {
  const [productsResult, movementsResult] = await Promise.all([
    query('SELECT * FROM products ORDER BY id'),
    query(
      `SELECT m.*, p.nombre AS product_name
       FROM movements m
       JOIN products p ON p.id = m.product_id
       ORDER BY m.created_at DESC`
    )
  ])

  res.json({ products: productsResult.rows, movements: movementsResult.rows })
})

app.post('/api/products', async (req, res) => {
  const { errors, values } = validateProductPayload(req.body)
  if (errors.length) return res.status(400).json({ message: errors.join(' ') })

  try {
    const result = await query(
      `INSERT INTO products (sku, nombre, categoria, descripcion, unidad_medida, igv_afectacion, precio, stock, min_stock, max_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        values.sku,
        values.nombre,
        values.categoria,
        values.descripcion,
        values.unidadMedida,
        values.igvAfectacion,
        values.precio,
        values.stock,
        values.minStock,
        values.maxStock
      ]
    )

    return res.status(201).json({ product: result.rows[0] })
  } catch (error) {
    if (String(error.message).includes('duplicate key')) {
      return res.status(409).json({ message: 'El SKU ya existe.' })
    }
    throw error
  }
})

app.put('/api/products/:id', async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto invalido.' })
  }

  const { errors, values } = validateProductPayload(req.body)
  if (errors.length) return res.status(400).json({ message: errors.join(' ') })

  try {
    const result = await query(
      `UPDATE products
       SET sku = $1, nombre = $2, categoria = $3, descripcion = $4,
           unidad_medida = $5, igv_afectacion = $6, precio = $7, stock = $8,
           min_stock = $9, max_stock = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        values.sku,
        values.nombre,
        values.categoria,
        values.descripcion,
        values.unidadMedida,
        values.igvAfectacion,
        values.precio,
        values.stock,
        values.minStock,
        values.maxStock,
        productId
      ]
    )

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    return res.json({ product: result.rows[0] })
  } catch (error) {
    if (String(error.message).includes('duplicate key')) {
      return res.status(409).json({ message: 'El SKU ya existe.' })
    }
    throw error
  }
})

app.delete('/api/products/:id', async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto invalido.' })
  }

  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [productId])
  if (!result.rows[0]) {
    return res.status(404).json({ message: 'Producto no encontrado.' })
  }

  res.status(204).send()
})

app.post('/api/movements', async (req, res) => {
  const { errors, values } = validateMovementPayload(req.body)
  if (errors.length) return res.status(400).json({ message: errors.join(' ') })

  const response = await withTransaction(async (client) => {
    const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [values.productId])
    const product = productResult.rows[0]
    if (!product) throw new Error('NOT_FOUND_PRODUCT')

    const delta =
      values.type === 'entrada'
        ? values.quantity
        : values.type === 'salida'
          ? -values.quantity
          : values.adjustmentSign === 'decrease'
            ? -values.quantity
            : values.quantity

    const nextStock = Number(product.stock) + delta
    if (nextStock < 0) throw new Error('NEGATIVE_STOCK')

    const updatedProduct = await client.query(
      'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [nextStock, values.productId]
    )

    const movementInsert = await client.query(
      `INSERT INTO movements (product_id, type, quantity, adjustment_sign, motive, username, stock_after)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        values.productId,
        values.type,
        values.quantity,
        values.adjustmentSign,
        values.motive,
        values.username,
        nextStock
      ]
    )

    return { product: updatedProduct.rows[0], movement: movementInsert.rows[0], productName: product.nombre }
  }).catch((error) => {
    if (error.message === 'NOT_FOUND_PRODUCT') {
      return { error: { code: 404, message: 'Producto no encontrado.' } }
    }
    if (error.message === 'NEGATIVE_STOCK') {
      return { error: { code: 400, message: 'Stock insuficiente para aplicar el movimiento.' } }
    }
    throw error
  })

  if (response.error) {
    return res.status(response.error.code).json({ message: response.error.message })
  }

  res.status(201).json({
    product: response.product,
    movement: { ...response.movement, product_name: response.productName }
  })
})

app.use((error, _req, res, next) => {
  void next
  console.error(error)
  res.status(500).json({ message: 'Error interno del servidor.' })
})

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Inventory API running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('No se pudo iniciar el servidor:', error)
    process.exit(1)
  })
