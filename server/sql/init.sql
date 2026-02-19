CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  unidad_medida TEXT NOT NULL DEFAULT 'UND',
  igv_afectacion TEXT NOT NULL DEFAULT 'gravado',
  precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  max_stock INTEGER NOT NULL DEFAULT 0 CHECK (max_stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'salida', 'ajuste')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  adjustment_sign TEXT NOT NULL DEFAULT 'increase' CHECK (adjustment_sign IN ('increase', 'decrease')),
  motive TEXT NOT NULL,
  username TEXT NOT NULL,
  stock_after INTEGER NOT NULL CHECK (stock_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
