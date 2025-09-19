<script lang="ts">
	import Flow from "./Flow.svelte";
	import DnDService from "./DnDService.svelte";
	import ExportService from "./ExportService.svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { notes, metadata, instruments, materials } from '../lib/store';

	let activeTab = 0;
	const tabs = [
		{ label: "Experiment Flow" },
		{ label: "Notes" },
		{ label: "Metadata" },
		{ label: "Instruments"},
		{ label: "Materials" }
	];
</script>

<div class="tab-layout">
<div class="tabs">
	{#each tabs as tab, i}
		<button
			class:active={activeTab === i}
			on:click={() => (activeTab = i)}
		>
			{tab.label}
		</button>
	{/each}
	<ExportService />
</div>

<div class="tab-content">
	{#if activeTab === 0}
		
			<SvelteFlowProvider>
				<DnDService>
					<Flow />
				</DnDService>
			</SvelteFlowProvider>
		
	{:else if activeTab === 1}
		<label>
			Notes:
			<textarea bind:value={$notes} rows="8" cols="40" placeholder="Enter your notes here..."></textarea>
		</label>
	{:else if activeTab === 2}
		<label>
			Metadata:
			<input type="text" bind:value={$metadata} placeholder="Enter metadata..." />
		</label>
	{:else if activeTab === 3}
		<label for="instruments">
			Instruments:
		</label>
		<table class="instruments-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Serial Number</th>
					<th>Notes</th>
				</tr>
			</thead>
			<tbody>
				{#each $instruments as instrument, i}
					<tr>
						<td><input bind:value={instrument.name} type="text" placeholder="e.g. Microscope" /></td>
						<td><input bind:value={instrument.type} type="text" placeholder="e.g. Optical" /></td>
						<td><input bind:value={instrument.serialNumber} type="text" placeholder="e.g. 12345" /></td>
						<td><input bind:value={instrument.notes} type="text" placeholder="Additional notes..." /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else if activeTab === 4}
		<label>
			Materials:
			<input type="text" bind:value={$materials} placeholder="Enter metadata..." />
		</label>
	{/if}
</div>
</div>

<style>
.tab-layout {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.tabs {
	display: flex;
	flex-direction: row;
	gap: 1rem;
	padding: 1rem;
	border-bottom: 1px solid #ccc;
}

.tabs button {
	padding: 0.5rem 1rem;
	border: none;
	background: #eee;
	cursor: pointer;
	border-bottom: 4px solid transparent;
	font-weight: bold;
	text-align: left;
}

.tabs button.active {
	background: #fff;
	border-left: 4px solid #007acc;
}

.tab-content {
	flex: 1;
	padding: 1rem;
	overflow: auto;
}
.instruments-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 1rem;
}
.instruments-table th, .instruments-table td {
	border: 1px solid #ccc;
	padding: 0.5rem;
	text-align: left;
}
.instruments-table th {
	background: #f5f5f5;
}

/* h1 {
	font-size: 2.2rem;
	font-weight: 700;
	color: #3c7575fb;
	text-align: center;
	margin-bottom: 0.25em;
	letter-spacing: 0.02em;
	font-family: 'Merriweather', 'Georgia', serif;
	background: #e6e3d6;
	padding: 0.5em 0;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(60, 117, 117, 0.06);
} */

/* p {
	font-size: 1.15rem;
	color: #354b4bfa;
	margin-bottom: 2rem;
	font-family: 'Lato', 'Arial', sans-serif;
	line-height: 1.5;
} */
</style>
