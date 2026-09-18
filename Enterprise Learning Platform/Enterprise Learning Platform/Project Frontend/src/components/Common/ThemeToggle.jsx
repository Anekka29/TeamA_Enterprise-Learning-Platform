import { useTheme } from '../../hooks/useTheme';

/**
 * Premium 1-click Theme Toggle component.
 * Instantly toggles between Light Mode and Dark Mode on single click.
 */
export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`btn theme-toggle-btn shadow-sm ${className}`}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        padding: 0
      }}
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme Mode"
    >
      <i className={`bi ${isDark ? 'bi-moon-stars-fill text-success' : 'bi-sun-fill text-warning'} fs-5`}></i>
      {showLabel && (
        <span className="ms-2 font-weight-medium small">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
