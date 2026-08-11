import ThemeToggle from '../components/Common/ThemeToggle';

/**
 * Auth layout for Login and Register pages.
 * Adds background shapes and floating theme toggle.
 */
export default function AuthLayout({ children }) {
  return (
    <>
      <div className="bg-shape s1"></div>
      <div className="bg-shape s2"></div>
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}

