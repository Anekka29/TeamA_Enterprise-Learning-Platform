/**
 * Dashboard icon sidebar — premium version
 * Accepts links array: [{ icon, label, href, active }]
 */
export default function Sidebar({ links = [], navigationItems, isOpen = false, user, role, activeRoute }) {
  const items = navigationItems || links || [];
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
      <ul className="sidebar-menu" style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
        {items.map((link, i) => {
          const isActive = Boolean(
            link.active ||
              (activeRoute &&
                (link.href === activeRoute ||
                  (activeRoute.includes('/profile') && link.label === 'Profile')))
          );
          return (
            <li key={i} className="sidebar-item">
              <a
                className={`sidebar-link${isActive ? ' active' : ''}`}
                href={link.href || '#'}
              >
                <i className={`bi ${link.icon}`}></i>
                <span>{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
