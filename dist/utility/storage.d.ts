/**
 * Professional LocalStorage Utility Service
 * Provides type-safe methods to read and write data to the browser storage.
 */
export declare const StorageService: {
    save<T>(key: string, data: T): void;
    load<T>(key: string): T | null;
    remove(key: string): void;
    clear(): void;
};
//# sourceMappingURL=storage.d.ts.map