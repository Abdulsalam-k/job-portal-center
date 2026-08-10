/**
 * Notification Utility
 * Renders non-intrusive floating toast messages.
 */

export const NotificationService = {
    show(message: string, type: "success" | "error" | "info" = "info"): void {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        const bgColors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };
        toast.style.cssText = `background: ${bgColors[type]}; color: white; padding: 12px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s ease;`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};