export declare class Database {
    private db;
    private initialized;
    private initPromise;
    constructor();
    private initialize;
    private createTables;
    private ensureInitialized;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<void>;
    close(): Promise<void>;
}
