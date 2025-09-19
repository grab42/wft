<script lang="ts">
	import { fade } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';

	// 1. Define props with runes. This replaces createEventDispatcher.
	let { close }: { close: () => void } = $props();

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	let modalElement: HTMLDivElement;

	// 3. The closeModal function now calls the prop directly.
	export function closeModal() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	async function handleSubmit() {
		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('email', email);
			formData.append('password', password);

			const response = await fetch('/login', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				// On successful login, close the modal and invalidate data
				// to re-run the layout load function and update the UI
				closeModal();
				await invalidateAll();
			} else {
				errorMessage = result.message || 'Login failed';
			}
		} catch (error) {
			errorMessage = 'An error occurred during login.';
			console.error(error);
		} finally {
			isSubmitting = false;
		}
	}

	/* onMount(() => {
		// Focus the first input when the modal mounts
		const firstInput = modalElement.querySelector('input');
		if (firstInput) {
			firstInput.focus();
		}
	}); */
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" role="presentation" onclick={closeModal} transition:fade={{ duration: 150 }}>
	<div
		class="modal-content"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		bind:this={modalElement}
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="modal-header">
			<h2 id="modal-title">Login</h2>
			<button class="close-btn" onclick={closeModal} aria-label="Close">&times;</button>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={email}
					placeholder="Email"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					placeholder="Password"
					required
					disabled={isSubmitting}
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">{errorMessage}</div>
			{/if}

			<div class="form-actions">
				<button type="button" class="cancel-btn" onclick={closeModal} disabled={isSubmitting}>
					Cancel
				</button>
				<button type="submit" class="submit-btn" disabled={isSubmitting}>
					{#if isSubmitting}
						Signing In...
					{:else}
						Sign In
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		padding: 0;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e5e5;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.close-btn:hover {
		background-color: #f5f5f5;
	}

	form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
	}

	input:disabled {
		background-color: #f9f9f9;
		cursor: not-allowed;
	}

	.error-message {
		background-color: #fef2f2;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.cancel-btn,
	.submit-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		border: none;
	}

	.cancel-btn {
		background-color: #f3f4f6;
		color: #374151;
	}

	.cancel-btn:hover:not(:disabled) {
		background-color: #e5e7eb;
	}

	.submit-btn {
		background-color: #007acc;
		color: white;
	}

	.submit-btn:hover:not(:disabled) {
		background-color: #0056b3;
	}

	.cancel-btn:disabled,
	.submit-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
