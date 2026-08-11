import { GlobalState } from "./state.js";

export const AuthUtility = {
    requireAuth(requiredRole?: "talent" | "admin"): boolean {
        const session = GlobalState.getSession();
        if (!session) {
            window.location.href = "../public-screens/login.html";
            return false;
        }

        if (requiredRole && session.role !== requiredRole) {
            window.location.href = "../public-screens/login.html";
            return false;
        }

        return true;
    }
};