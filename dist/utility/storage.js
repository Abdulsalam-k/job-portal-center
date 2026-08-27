export const StorageService = {
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        }
        catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    },
    load(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (!serializedData)
                return null;
            return JSON.parse(serializedData);
        }
        catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    },
    // Remove a specific key
    remove(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    },
    // Clear entire storage (useful for logging out)
    clear() {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }
};
//# sourceMappingURL=storage.js.map