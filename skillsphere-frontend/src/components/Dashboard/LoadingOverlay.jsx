/**
 * Full-screen loading overlay — exact port from dashboard HTML files.
 */
export default function LoadingOverlay({ visible = true }) {
  if (!visible) return null;
  return (
    <div className="loading-overlay" id="loadingOverlay">
      <div className="loading-spinner"></div>
    </div>
  );
}
