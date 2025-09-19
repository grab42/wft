import DB_CONFIG, { dbPool } from "$lib/database";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const dbClient = await dbPool.connect();
	const dbConnection = DB_CONFIG(dbClient);
	event.locals.dbConnection = dbConnection;

	try {
		await dbConnection.begin();
		
		const sessionToken = event.cookies.get("session_token");
		if (!sessionToken){
			event.locals.user = null;
			return resolve(event);
		}
		else {
			const sessionQuery = ` 
				SELECT u.id, u.email, u.role 
				FROM users u 
				JOIN user_sessions s ON u.id = s.user_id 
				WHERE s.session_token = $1 AND s.expires_at > NOW()
			`;
			const userResult = await dbConnection.query(sessionQuery, [sessionToken]);
			const user = userResult.rows[0];

			if (!user) {
				event.locals.user = null;
				event.cookies.delete("session_token", { path: '/' });
				return resolve(event);
			}
			event.locals.user = {
				id: user.id,
				email: user.email,
				role: user.role
			};
		}	
		const response = await resolve(event);
		await dbConnection.commit();
		return response;
	} catch (error) {
		await dbConnection.rollback();
		console.error('Transaction rolled back due to DB error:', error);
	} finally {
		dbClient.release();
	}
};