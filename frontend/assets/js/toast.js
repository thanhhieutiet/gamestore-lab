/**
 * Global Toast Notification function
 * Supports showToast(message, type) and showToast(message, subtitle, type)
 */
function showToast(message, subtitle = "", type = "success") {
  // If the second argument is a valid type, adjust the parameters
  if (subtitle === "success" || subtitle === "error" || subtitle === "warning") {
    type = subtitle;
    subtitle = "";
  }

  // Remove existing toast if present
  const existing = document.querySelector(".sl-toast");
  if (existing) existing.remove();

  const icons = {
    success: {
      bg: "#d1fae5",
      color: "#065f46",
      svg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`
    },
    error: {
      bg: "#fee2e2",
      color: "#991b1b",
      svg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>`
    },
    warning: {
      bg: "#fef3c7",
      color: "#92400e",
      svg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`
    }
  };

  const icon = icons[type] || icons.success;

  const toast = document.createElement("div");
  toast.className = "sl-toast animate-toast-in";
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: var(--surface-1, #ffffff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-md, 12px);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    min-width: 280px;
    max-width: 360px;
  `;

  toast.innerHTML = `
    <div style="width: 32px; height: 32px; border-radius: 8px; background: ${icon.bg}; color: ${icon.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      ${icon.svg}
    </div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; color: var(--text-1, #111827); line-height: 1.4;">${message}</div>
      ${subtitle ? `<div style="font-size: 13px; color: var(--text-3, #6b7280); margin-top: 2px; line-height: 1.3;">${subtitle}</div>` : ""}
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-remove toast after 3000ms
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// Make it available globally
window.showToast = showToast;
