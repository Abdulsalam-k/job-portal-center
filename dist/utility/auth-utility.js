/**
 * Auth Utility
 * Manages user access level validations and route guards.
 */
import { GlobalState } from "./state.js";
export const AuthUtility = {
    requireAuth(requiredRole) {
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
//# sourceMappingURL=auth-utility.js.map