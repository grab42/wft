<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData, ActionData } from './$types';

    export let data: PageData;
    export let form: ActionData;
</script>

<div class="admin-container">
    <h1>Admin Panel</h1>

    <section class='card'>
        <h2>Add new user</h2>
        <form method="POST" action="?/addUser" use:enhance>
            <label>
                Email:
                <input type="email" name="email" required />
            </label>
            <label>
                Password:
                <input type="password" name="password" required />
            </label>
            <label>
                Role:
                <select name="role" required>
                    <option value="lab_user">Lab User</option>
                    <option value="lab_supervisor">Lab Supervisor</option>
                    <option value="lab_admin">Lab Admin</option>
                </select>
            </label>
            <button type="submit">Add User</button>
            {#if form?.addUserError}
                <p class="error">{form.addUserError}</p>
            {/if}
            {#if form?.addUserSuccess}
                <p class="success">{form.addUserSuccess}</p>
            {/if}
        </form>
    </section>

    <section class="card">
        <h2>Existing Users</h2>
        {#if data.users && data.users.length > 0}
            {#each data.users as user (user.id)}
                <div class="user-entry">
                    <div class="user-info">
                        <strong>{user.email}</strong> ({user.role})
                        <p>User ID: {user.id}</p>
                        
                        <h4>Experiments:</h4>
                        {#if user.experiments.length > 0}
                            <ul>
                                {#each user.experiments as exp}
                                    <li>{exp.title} (ID: {exp.id})</li>
                                {/each}
                            </ul>
                        {:else}
                            <p>No experiments found.</p>
                        {/if}
                    </div>

                    <div class="user-actions">
                        <!-- Reset Password Form -->
                        <form method="POST" action="?/resetPassword" use:enhance>
                            <input type="hidden" name="userId" value={user.id} />
                            <label>
                                New Password:
                                <input type="password" name="newPassword" required />
                            </label>
                            <button type="submit">Set new Password</button>
                        </form>

                        <!-- Delete User Form -->
                        <form method="POST" action="?/deleteUser" use:enhance class="delete-form">
                            <input type="hidden" name="userId" value={user.id} />
                            <button type="submit" class="delete-button">Delete User</button>
                        </form>
                    </div>
                </div>
            {/each}
            {#if form?.resetPasswordError}
                <p class="error">{form.resetPasswordError}</p>
            {/if}
            {#if form?.resetPasswordSuccess}
                <p class="success">{form.resetPasswordSuccess}</p>
            {/if}
            {#if form?.deleteUserError}
                <p class="error">{form.deleteUserError}</p>
            {/if}
            {#if form?.deleteUserSuccess}
                <p class="success">{form.deleteUserSuccess}</p>
            {/if}
        {:else}
            <p>No users found.</p>
        {/if}
    </section>
</div>

<style>
    .admin-container {
        max-width: 900px;
        margin: 2rem auto;
        font-family: sans-serif;
    }
    .card {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    h1, h2 {
        color: #333;
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .user-entry {
        border-top: 1px solid #eee;
        padding: 1rem 0;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
    }
    .user-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 200px;
    }
    .delete-form {
        margin-top: auto;
    }
    .delete-button {
        background-color: #e53e3e;
        color: white;
    }
    .error {
        color: red;
    }
    .success {
        color: green;
    }
</style>