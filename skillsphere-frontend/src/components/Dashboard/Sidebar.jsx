/**
 * Dashboard icon sidebar — premium version
 * Accepts links array: [{ icon, label, href, active }]
 */
export default function Sidebar({ links = [], isOpen = false }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
      <ul className="sidebar-menu" style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
        {links.map((link, i) => (
          <li key={i} className="sidebar-item">
            <a
              className={`sidebar-link${link.active ? ' active' : ''}`}
              href={link.href || '#'}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
