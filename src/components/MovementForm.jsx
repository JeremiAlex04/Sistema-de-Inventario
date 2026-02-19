import { MOVEMENT_TYPES } from '../utils/inventory'

export function MovementForm({
  form,
  errors,
  products,
  onChange,
  onSubmit
}) {
  return (
    <section className="inventory-section">
      <div className="section-head">
        <h2>Registrar movimiento</h2>
      </div>
      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="productId" className="form-label">Producto</label>
          <select
            id="productId"
            name="productId"
            className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
            value={form.productId}
            onChange={onChange}
          >
            <option value="">Seleccionar producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.sku} - {product.nombre}
              </option>
            ))}
          </select>
          {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="type" className="form-label">Tipo</label>
          <select
            id="type"
            name="type"
            className={`form-select ${errors.type ? 'is-invalid' : ''}`}
            value={form.type}
            onChange={onChange}
          >
            <option value={MOVEMENT_TYPES.ENTRADA}>Entrada</option>
            <option value={MOVEMENT_TYPES.SALIDA}>Salida</option>
            <option value={MOVEMENT_TYPES.AJUSTE}>Ajuste</option>
          </select>
          {errors.type && <div className="invalid-feedback">{errors.type}</div>}
        </div>

        {form.type === MOVEMENT_TYPES.AJUSTE && (
          <div className="col-md-6">
            <label htmlFor="adjustmentSign" className="form-label">Direccion de ajuste</label>
            <select
              id="adjustmentSign"
              name="adjustmentSign"
              className="form-select"
              value={form.adjustmentSign}
              onChange={onChange}
            >
              <option value="increase">Incrementar</option>
              <option value="decrease">Disminuir</option>
            </select>
          </div>
        )}

        <div className="col-md-6">
          <label htmlFor="quantity" className="form-label">Cantidad</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
            value={form.quantity}
            onChange={onChange}
          />
          {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="motive" className="form-label">Motivo</label>
          <input
            id="motive"
            name="motive"
            type="text"
            className={`form-control ${errors.motive ? 'is-invalid' : ''}`}
            value={form.motive}
            onChange={onChange}
            placeholder="Compra, venta, ajuste por conteo, merma..."
          />
          {errors.motive && <div className="invalid-feedback">{errors.motive}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="user" className="form-label">Usuario</label>
          <input
            id="user"
            name="user"
            type="text"
            className={`form-control ${errors.user ? 'is-invalid' : ''}`}
            value={form.user}
            onChange={onChange}
          />
          {errors.user && <div className="invalid-feedback">{errors.user}</div>}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Registrar movimiento</button>
        </div>
      </form>
    </section>
  )
}
