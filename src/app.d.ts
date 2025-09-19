declare global {
    namespace App {
        interface Locals {
            dbConnection: {
                query: (sql: string, params?: any[]) => Promise<any>;
                //checkConnection: () => Promise<void>;
            };
            user: {
                id: number;
                email: string;
                role: string;
            } | null;
        }
    }
}

export {};