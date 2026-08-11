export const StorageService = {
    // Save any data safely with type checking
    save<T>(key: string, data: T): void {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    },

    // Load data and parse it back to its original type
    load<T>(key: string): T | null {
        try {
            const serializedData = localStorage.getItem(key);
            if (!serializedData) return null;
            return JSON.parse(serializedData) as T;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    },

    // Remove a specific key
    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    },

    // Clear entire storage (useful for logging out)
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }
};
















