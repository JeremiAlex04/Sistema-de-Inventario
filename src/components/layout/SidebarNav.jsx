import { NavLink } from 'react-router-dom'

const SECTIONS = [
  { to: '/session', label: 'Sesion' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/forms', label: 'Formularios' },
  { to: '/catalog', label: 'Catalogo' },
  { to: '/kardex', label: 'Kardex' },
  { to: '/reports', label: 'Reportes' }
]

export function SidebarNav() {
  return (
    <aside className="inventory-sidebar">
      <p className="sidebar-title">Menu rapido</p>
      <nav>
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.to}>
              <NavLink to={section.to} className={({ isActive }) => (isActive ? 'active-link' : undefined)}>
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
