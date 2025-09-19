<script lang="ts">
	import LoginModal from '$lib/LoginModal.svelte';
	let { data, children }: { data: any, children: any } = $props();

	let showLoginModal = $state(false);
	let menuOpen = $state(false);

	function openLoginModal() {
		showLoginModal = true;
		menuOpen = false;
	}

	function closeLoginModal() {
		showLoginModal = false;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<header>
	<nav>
		<a href="/">Home</a>
		<div class="menu-container">
			<button onclick={toggleMenu} class="hamburger-button" aria-label="Open menu">
				<div></div>
				<div></div>
				<div></div>
			</button>
			{#if menuOpen}
				<ul class="dropdown-menu">
					{#if data.user}
						<li>
							<span class="user-email">Logged in as {data.user.email}</span>
						</li>
						<li><a href="/logout" class="menu-button logout-button">Logout</a></li>
					{:else}
						<li><button onclick={openLoginModal} class="menu-button">Login</button></li>
					{/if}
					<li class="separator"><hr /></li>
					<li><a href="/export?type=pdf" target="_blank">Export to PDF</a></li>
					<li><a href="/export?type=json" target="_blank">Export to JSON</a></li>
					<li><a href="/export?type=png" target="_blank">Export to PNG</a></li>
				</ul>
			{/if}
		</div>
	</nav>
</header>

<main>
	{@render children()}
</main>

{#if showLoginModal}
	<LoginModal close={closeLoginModal} />
{/if}

<style>
	header {
		background: #f9f9f9;
		padding: 1rem;
		border-bottom: 1px solid #ddd;
	}
	nav {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
	}
	/* .link-button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font-family: inherit;
		font-size: inherit;
		color: #007acc;
		text-decoration: underline;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}
	.link-button:hover {
		color: #0056b3;
	} */

	.menu-button {
		background-color: #007acc;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		width: calc(100% - 2rem);
		text-align: center;
		display: block;
		box-sizing: border-box;
	}

	.menu-button:hover {
		background-color: #0056b3;
	}

	.logout-button {
		background-color: #d15252 !important;
		text-decoration: none;
	}

	.logout-button:hover {
		background-color: #b91c1c !important;
	}

	.menu-container {
		position: relative;
		display: inline-block;
	}

	.hamburger-button {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		height: 24px;
		width: 30px;
		padding: 0;
	}

	.hamburger-button div {
		width: 30px;
		height: 3px;
		background-color: #333;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background-color: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		list-style: none;
		padding: 0.5rem 0;
		margin: 0.5rem 0 0;
		min-width: 200px;
		z-index: 1000;
	}

	.dropdown-menu li {
		padding: 0.5rem 1rem;
		text-align: center;
	}

	.dropdown-menu li a,
	/* .dropdown-menu .link-button {
		color: #333;
		text-decoration: none;
		display: block;
		text-align: center;
	} */

	.dropdown-menu li a:hover,
	/* .dropdown-menu .link-button:hover {
		background-color: #f5f5f5;
	} */

	.user-email {
		color: #555;
		font-style: italic;
		text-align: center;
		display: block;
	}

	.separator {
		padding: 0.25rem 0;
	}

	.separator hr {
		border: 0;
		border-top: 1px solid #eee;
		margin: 0;
	}
</style>