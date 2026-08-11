import { GlobalState, type User } from "../utility/state.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form") as HTMLFormElement;
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const errorBanner = document.getElementById("error-banner") as HTMLElement;
    const togglePasswordBtn = document.getElementById("toggle-password");

    if (!registerForm) return;
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
        const role: "talent" | "admin" = email.includes("admin") ? "admin" : "talent";

        const user: User = {
            email,
            role,
            name,
            skills: ["TypeScript", "Frontend Development"]
        };

        // Save session and redirect
        GlobalState.setSession(user);

        if (role === "admin") {
            window.location.href = "../private-screens/job-management.html";
        } else {
            window.location.href = "../private-screens/job-board.html";
        }
    });

    function showError(message: string) {
        if (!errorBanner) return;
        errorBanner.textContent = message;
        errorBanner.style.display = "block";
        setTimeout(() => {
            errorBanner.style.display = "none";
        }, 4000);
    }
});