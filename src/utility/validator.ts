/**
 * Validators Utility
 * Validates emails, passwords, and form entries.
 */

export const Validators = {
    isValidEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isMinLength(value: string, min: number): boolean {
        return value.trim().length >= min;
    },

    sanitizeText(input: string): string {
        return input.replace(/[<>]/g, "");
    }
};