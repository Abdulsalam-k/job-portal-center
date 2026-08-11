import { GlobalState } from "../utility/state.js";
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBanner = document.getElementById("error-banner");
    const togglePasswordBtn = document.getElementById("toggle-password");
    if (!registerForm)
        return;
    togglePasswordBtn?.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        togglePasswordBtn.textContent = type === "password" ? "👁️" : "🙈";
    });
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!name || !email || !password) {
            showError("Please fill in all fields.");
            return;
        }
        // Determine role (admin if email includes admin, otherwise talent)
        const role = email.includes("admin") ? "admin" : "talent";
        const user = {
            email,
            role,
            name,
            skills: ["TypeScript", "Frontend Development"]
        };
        // Save session and redirect
        GlobalState.setSession(user);
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
//# sourceMappingURL=register.js.map