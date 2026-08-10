/**
 * Login Screen Controller
 * Validates user credentials and routes to talent or admin dashboards.
 */
import { GlobalState } from "../utility/state.js";
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBanner = document.getElementById("error-banner");
    if (!loginForm)
        return;
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        // Basic validation check
        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }
        let role = "talent";
        let name = "Professional Talent";
        // Simple mock rule for role assignment to impress your mentor:
        // If email includes 'admin', assign admin privileges, otherwise treat as talent.
        if (email.includes("admin")) {
            role = "admin";
            name = "Portal Administrator";
        }
        else {
            const parts = email.split("@");
            if (parts[0]) {
                name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            }
        }
        const user = {
            email,
            role,
            name,
            skills: ["TypeScript", "Frontend Architecture", "UI/UX Design"]
        };
        // Save session in global state and storage
        GlobalState.setSession(user);
        // Redirect based on role
        if (role === "admin") {
            window.location.href = "../private-screens/job-management.html";
        }
        else {
            window.location.href = "../private-screens/job-board.html";
        }
    });
    function showError(message) {
        if (!errorBanner)
            return;
        errorBanner.textContent = message;
        errorBanner.style.display = "block";
        setTimeout(() => {
            errorBanner.style.display = "none";
        }, 4000);
    }
});
//# sourceMappingURL=login.js.map