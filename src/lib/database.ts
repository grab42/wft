import type { PoolClient } from 'pg';
import pkg from 'pg';
const { Pool } = pkg;

import { PGUSER, PGHOST, PGPASSWORD, PGPORT, PGDATABASE } from '$env/static/private';

export const dbPool = new Pool({
				database: PGDATABASE,
				host: PGHOST,
				user: PGUSER,
				password: PGPASSWORD,
				port: Number(PGPORT),
				idleTimeoutMillis: 15000,
				connectionTimeoutMillis: 5000,
				max: 50
});

const DB_CONFIG = (dbClient: PoolClient) => {
	const api = {
		query: async (sql: string, params: any[] = []): Promise<any> => {
			try {
				const result = await dbClient.query(sql, params);
				return result;
			} 
			catch (error) {
				if (error instanceof Error) {
					console.log('Query:', sql);
					console.log('Parameters:', params);
					console.log('Database error: ' ,error.stack);
				}
				throw new Error('Could not read from the database');
			}
		},
		begin: async () => await dbClient.query('BEGIN'),
		commit: async () => await dbClient.query('COMMIT'),
		rollback: async () => await dbClient.query('ROLLBACK')
	};
	return api;
};

export default DB_CONFIG;