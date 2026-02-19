import { COMMON_UNITS, IGV_AFFECTATIONS } from '../utils/inventory'

const INPUT_FIELDS = [
  { name: 'sku', label: 'SKU', type: 'text', placeholder: 'Ej. BEB-010' },
  { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre de producto' },
  { name: 'categoria', label: 'Categoria', type: 'text', placeholder: 'Categoria' },
  { name: 'descripcion', label: 'Descripcion', type: 'text', placeholder: 'Descripcion corta' },
  { name: 'precio', label: 'Precio base (sin IGV)', type: 'number', min: 0, step: '0.01' },
  { name: 'stock', label: 'Stock inicial', type: 'number', min: 0, step: '1' },
  { name: 'minStock', label: 'Stock minimo', type: 'number', min: 0, step: '1' },
  { name: 'maxStock', label: 'Stock maximo', type: 'number', min: 0, step: '1' }
]

export function ProductForm({
  form,
  errors,
  onChange,
  onSubmit,
  onCancelEdit,
  isEditing,
  canManage
}) {
  return (
    <section className="inventory-section">
      <div className="section-head">
        <h2>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
      </div>
      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="unidadMedida" className="form-label">Unidad de medida</label>
          <select
            id="unidadMedida"
            name="unidadMedida"
            className={`form-select ${errors.unidadMedida ? 'is-invalid' : ''}`}
            value={form.unidadMedida}
            onChange={onChange}
            disabled={!canManage}
          >
            {COMMON_UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          {errors.unidadMedida && <div className="invalid-feedback">{errors.unidadMedida}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="igvAfectacion" className="form-label">Afectacion IGV</label>
          <select
            id="igvAfectacion"
            name="igvAfectacion"
            className={`form-select ${errors.igvAfectacion ? 'is-invalid' : ''}`}
            value={form.igvAfectacion}
            onChange={onChange}
            disabled={!canManage}
          >
            <option value={IGV_AFFECTATIONS.GRAVADO}>Gravado</option>
            <option value={IGV_AFFECTATIONS.EXONERADO}>Exonerado</option>
            <option value={IGV_AFFECTATIONS.INAFECTO}>Inafecto</option>
          </select>
          {errors.igvAfectacion && <div className="invalid-feedback">{errors.igvAfectacion}</div>}
        </div>
        {INPUT_FIELDS.map((field) => (
          <div className="col-md-6" key={field.name}>
            <label htmlFor={field.name} className="form-label">{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              min={field.min}
              step={field.step}
              placeholder={field.placeholder}
              className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
              value={form[field.name]}
              onChange={onChange}
              disabled={!canManage}
            />
            {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
          </div>
        ))}
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={!canManage}>
            {isEditing ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-outline-secondary" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {!canManage && (
        <p className="permission-note">
          Tu rol no puede crear ni editar productos.
        </p>
      )}
    </section>
  )
}
