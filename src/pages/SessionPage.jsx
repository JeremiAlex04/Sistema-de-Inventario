import { BUSINESS_REGIMES, COMPROBANTE_TYPES, USER_ROLES } from '../utils/inventory'

export function SessionPage({
  session,
  onSessionChange,
  businessProfile,
  businessErrors,
  onBusinessChange,
  onBusinessSubmit
}) {
  return (
    <div className="d-grid gap-4">
      <section className="inventory-section">
        <div className="section-head">
          <h2>Sesion y roles</h2>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              id="username"
              name="username"
              className="form-control"
              value={session.username}
              onChange={onSessionChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="role" className="form-label">Rol</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={session.role}
              onChange={onSessionChange}
            >
              <option value={USER_ROLES.ADMIN}>admin</option>
              <option value={USER_ROLES.ALMACEN}>almacen</option>
              <option value={USER_ROLES.VENDEDOR}>vendedor</option>
            </select>
          </div>
        </div>
      </section>

      <section className="inventory-section">
        <div className="section-head">
          <h2>Perfil del negocio (Peru)</h2>
        </div>
        <form className="row g-3" onSubmit={onBusinessSubmit}>
          <div className="col-md-4">
            <label htmlFor="ruc" className="form-label">RUC</label>
            <input
              id="ruc"
              name="ruc"
              className={`form-control ${businessErrors.ruc ? 'is-invalid' : ''}`}
              value={businessProfile.ruc}
              onChange={onBusinessChange}
              maxLength={11}
            />
            {businessErrors.ruc && <div className="invalid-feedback">{businessErrors.ruc}</div>}
          </div>
          <div className="col-md-8">
            <label htmlFor="razonSocial" className="form-label">Razon social</label>
            <input
              id="razonSocial"
              name="razonSocial"
              className={`form-control ${businessErrors.razonSocial ? 'is-invalid' : ''}`}
              value={businessProfile.razonSocial}
              onChange={onBusinessChange}
            />
            {businessErrors.razonSocial && <div className="invalid-feedback">{businessErrors.razonSocial}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="nombreComercial" className="form-label">Nombre comercial</label>
            <input
              id="nombreComercial"
              name="nombreComercial"
              className="form-control"
              value={businessProfile.nombreComercial}
              onChange={onBusinessChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="regimen" className="form-label">Regimen</label>
            <select id="regimen" name="regimen" className="form-select" value={businessProfile.regimen} onChange={onBusinessChange}>
              {BUSINESS_REGIMES.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="igvRate" className="form-label">IGV (decimal)</label>
            <input
              id="igvRate"
              name="igvRate"
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${businessErrors.igvRate ? 'is-invalid' : ''}`}
              value={businessProfile.igvRate}
              onChange={onBusinessChange}
            />
            {businessErrors.igvRate && <div className="invalid-feedback">{businessErrors.igvRate}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="comprobantePreferido" className="form-label">Comprobante por defecto</label>
            <select
              id="comprobantePreferido"
              name="comprobantePreferido"
              className={`form-select ${businessErrors.comprobantePreferido ? 'is-invalid' : ''}`}
              value={businessProfile.comprobantePreferido}
              onChange={onBusinessChange}
            >
              {COMPROBANTE_TYPES.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
            {businessErrors.comprobantePreferido && <div className="invalid-feedback">{businessErrors.comprobantePreferido}</div>}
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">Guardar perfil</button>
          </div>
        </form>
      </section>
    </div>
  )
}
