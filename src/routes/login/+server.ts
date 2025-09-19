import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const authData = await request.formData();
	const email = authData.get('email')?.toString();
	const pwd = authData.get('password')?.toString();

	if (!email || !pwd || email === '' || pwd === '') {
		return json({ message: 'Please provide a valid email and password.' }, { status: 400 });
	}

	const loginQuery = `
        SELECT id FROM users 
        WHERE lower(email) = lower($1) 
        AND password_hash = crypt($2, password_hash)`;

	try {
		const authResult = await locals.dbConnection.query(loginQuery, [email, pwd]);
		const user = authResult.rows[0];

		if (!user) {
			return json(
				{ message: 'Sorry, the email or password you entered is incorrect.' },
				{ status: 401 }
			);
		}

		const sessionQuery = `
            INSERT INTO user_sessions (user_id) 
            VALUES ($1)
            RETURNING session_token`;

		const sessionResult = await locals.dbConnection.query(sessionQuery, [user.id]);
		const sessionToken = sessionResult.rows[0]?.session_token;

		if (!sessionToken) {
			return json(
				{ message: 'Session could not be initiated. Your changes cannot be saved' },
				{ status: 500 }
			);
		}

		cookies.set('session_token', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 8 // 8 hours
		});

		return json({ success: true, message: 'Logged in successfully' });
	} catch (error) {
		console.error('Login error:', error);
		return json({ message: 'An internal server error occurred.' }, { status: 500 });
	}
};

