/**
 * Auth layout for Login and Register pages.
 * Adds background shapes matching the original pages.
 */
export default function AuthLayout({ children }) {
  return (
    <>
      <div className="bg-shape s1"></div>
      <div className="bg-shape s2"></div>
      {children}
    </>
  );
}
