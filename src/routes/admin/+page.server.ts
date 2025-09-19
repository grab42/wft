import {fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'lab_admin') {
		redirect(303, '/');
	}

	const usersQuery = await locals.dbConnection.query('SELECT id, email, role FROM users ORDER BY id ASC');
	const expQuery = await locals.dbConnection.query('SELECT id, title, user_id FROM experiments');

	const users = usersQuery.rows;
	const experiments = expQuery.rows;

	const expwithUsers = users.map(user => ({...user, experiments: experiments.filter(exp => exp.user_id === user.id)}));

	return {users: expwithUsers };
};

export const actions: Actions = {

	addUser: async ({ request, locals }) => {
		if (locals.user?.role !== 'lab_admin')
			return fail(403, { addUserError: "You are not authorized to add users." });

		const userData = await request.formData();
		const email = userData.get("email")?.toString();
		const role = userData.get("role")?.toString();
		const password = userData.get("password")?.toString();

		if (!email || !role || !password || email === "" || role === "" || password === "")
			return fail(400, { addUserError: "Please provide a valid email, role, and password!" });

		try {
			const query = 'INSERT INTO users (email, password_hash, role) VALUES ($1, crypt($2, gen_salt(\'bf\')), $3)';
			await locals.dbConnection.query(query, [email, password, role]);
			return { addUserSuccess: 'User profile created successfully.' };
		} catch (error) {
			return fail(500, { addUserError: "User profile could not be created." });
		}
	},

	resetPwd: async ({ request, locals }) => {
		if (locals.user?.role !== 'lab_admin')
			return fail(403, { resetPwdError: "You are not authorized to reset passwords." });

		const userData = await request.formData();
		const userId = userData.get("userId")?.toString();
		const newPassword = userData.get("newPassword")?.toString();

		if (!userId || !newPassword || userId === "" || newPassword === "")
			return fail(400, { resetPwdError: "Please provide a valid user ID and new password!" });

		try {
			const query = 'UPDATE users SET password_hash = crypt($1, gen_salt(\'bf\')) WHERE id = $2';
			await locals.dbConnection.query(query, [newPassword, userId]);
			return { resetPwdSuccess: 'Password for ${userId} reset successfully.' };
		} catch (error) {
			return fail(500, { resetPwdError: "Password for ${userId} could not be reset." });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (locals.user?.role !== 'lab_admin')
			return fail(403, { deleteUserError: "You are not authorized to delete users." });

		const userData = await request.formData();
		const userId = userData.get("userId")?.toString();

		if (!userId || userId === "")
			return fail(400, { deleteUserError: "Please provide a valid user ID!" });

		try {
			const query = 'DELETE FROM users WHERE id = $1';
			await locals.dbConnection.query(query, [userId]);
			return { deleteUserSuccess: "Profile of ${userId} deleted successfully." };
		} catch (error) {
			return fail(500, { deleteUserError: "Profile of ${userId} could not be deleted." });
		}
	}
};