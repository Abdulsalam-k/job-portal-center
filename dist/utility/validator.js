export const Validators = {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    isMinLength(value, min) {
        return value.trim().length >= min;
    },
    sanitizeText(input) {
        return input.replace(/[<>]/g, "");
    }
};
//# sourceMappingURL=validator.js.map