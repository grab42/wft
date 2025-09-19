import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, locals }) => {
    const sessionToken = cookies.get('session_token');
    if (sessionToken) {
        await locals.dbConnection.query('DELETE FROM user_sessions WHERE session_token = $1', [sessionToken]);
        cookies.delete('session_token', { path: '/' });
    }

    return new Response(null, {
        status: 303,
        headers: {
            'Location': '/'
        }
    });
};