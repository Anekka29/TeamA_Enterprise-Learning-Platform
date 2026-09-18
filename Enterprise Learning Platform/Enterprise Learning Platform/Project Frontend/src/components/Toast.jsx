/**
 * Toast notification component.
 * Replicates exactly the original showToast() DOM manipulation.
 * Receives toasts array + removeToast handler from useToast hook.
 */
export default function Toast({ toasts, removeToast }) {
  const iconMap = {
    error: 'bi-exclamation-circle',
    success: 'bi-check-circle',
    warning: 'bi-exclamation-triangle',
  };

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`custom-toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}
        >
          <i className={`bi ${iconMap[toast.type] || iconMap.error} toast-icon ${toast.type}`}></i>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
