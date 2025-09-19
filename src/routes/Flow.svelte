<script lang="ts">
	import {
	  SvelteFlow,
	  Controls,
	  Background,
	  BackgroundVariant,
	  MiniMap,
	  useSvelteFlow,
	  type Edge,
	  type NodeEventWithPointer,
	  type Node,
	} from '@xyflow/svelte';
   
	import { useDnD, type DnDContext } from './DnDService.svelte';
	import Sidebar from './Sidebar.svelte';
	import ContextMenuService from './ContextMenuService.svelte';
	import { onMount } from 'svelte';
	import { flowData } from '../lib/store';
   
	import '@xyflow/svelte/dist/style.css';
   
	let nodes = $state.raw([
	  {
		id: '1',
		type: 'input',
		data: { label: 'some Node' },
		position: { x: 150, y: 5 },
	  },
	  {
		id: '2',
		type: 'default',
		data: { label: 'Default Node' },
		position: { x: 0, y: 150 },
	  },
	  {
		id: '3',
		type: 'output',
		data: { label: 'Output Node' },
		position: { x: 300, y: 150 },
	  },
	]);
   
	let edges = $state.raw([
	  {
		id: '1-2',
		type: 'default',
		source: '1',
		target: '2',
	  },
	  {
		id: '1-3',
		type: 'smoothstep',
		source: '1',
		target: '3',
	  },
	]);
   
	let loadExperimentId = $state('');

	const { screenToFlowPosition } = $derived(useSvelteFlow());
   
	const type: DnDContext = useDnD();

	// Update the store when nodes or edges change
	$effect(() => {
		flowData.set({ nodes, edges });
	});
   
	const onDragOver = (event: DragEvent) => {
	  event.preventDefault();
   
	  if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	  }
	};
   
	const onDrop = (event: DragEvent) => {
	  event.preventDefault();
   
	  if (!type.current) {
		return;
	  }
   
	  const position = screenToFlowPosition({
		x: event.clientX,
		y: event.clientY,
	  });
   
	  const newNode = {
		id: `${Math.random()}`,
		type: type.current,
		position,
		data: { label: `${type.current} node` },
		origin: [0.5, 0.0],
	  } satisfies Node;
   
	  nodes = [...nodes, newNode];
	};

	async function saveFlowchart() {
		try {
			const formData = new FormData();
			formData.append('nodes', JSON.stringify(nodes));
			formData.append('edges', JSON.stringify(edges));

			const response = await fetch('./saveFlow', {
	  			method: 'POST',
	  			body: formData
			});

			if (!response.ok) {
	  			throw new Error(`HTTP error! status: ${response.status}`);
			}
		
			const result = await response.json();
			console.log('Load result:', result); // Debug log

			if (result.success) {
		  		alert(result.data.message);
			} else {
		  		alert(`Error: ${result.message}`);
			}
	  	} catch (error) {
			console.error('Failed to send flowchart data:', error);
			alert('An error occurred while trying to save.');
	  	}
	}

	async function loadFlowchart() {
		if (!loadExperimentId.trim()) {
			alert('Please enter an experiment ID');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('experimentId', loadExperimentId);

			const response = await fetch('./loadFlow', {
				method: 'POST',
				body: formData
			});
		
			if (!response.ok) {
		  		throw new Error(`HTTP error! status: ${response.status}`);
			}
		
			const result = await response.json();
			console.log('Load result:', result); // Debug log

			// Handle SvelteKit form action response structure
			// The data structure from SvelteKit actions
			//const { Node: loadedNodes, edges: loadedEdges } = result;
			
			console.log (result.nodes, result.edges);

			nodes = result.nodes;
			edges = result.edges;
			//alert(message);		
		} catch (error) {
			console.error('Failed to load flowchart data:', error);
			alert('An error occurred when loading flowchart data.');
		}
	}

	let menu: {
	id: string;
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
	} | null = $state(null);
	let clientWidth: number = $state();
	let clientHeight: number = $state();
 
	const handleContextMenu: NodeEventWithPointer = ({ event, node }) => {
		
		event.preventDefault(); // Prevent native context menu from showing
 
		// Calculate position of the context menu. Make sure it
		// doesn't get positioned off-screen.
  
		//const rect = event.currentTarget as HTMLElement;
		const flowRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const position = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
	  	});

		menu = {
	  		id: node.id,
	  		top: node.position.y,
	  		left: event.clientX < clientWidth - 200 ? event.clientX : undefined,
	  	right:
			event.clientX >= clientWidth - 200
		  	? clientWidth - event.clientX
		  	: undefined,
	  	bottom:
			event.clientY >= clientHeight - 200
		  	? clientHeight - event.clientY
		  	: undefined,
		};
		/* menu = {
	  		id: node.id,
	  		top: event.clientY < clientHeight - 200 ? event.clientY : undefined,
	  		left: event.clientX < clientWidth - 200 ? event.clientX : undefined,
	  	right:
			event.clientX >= clientWidth - 200
		  	? clientWidth - event.clientX
		  	: undefined,
	  	bottom:
			event.clientY >= clientHeight - 200
		  	? clientHeight - event.clientY
		  	: undefined,
		}; */
  	}
 
  // Close the context menu if it's open whenever the window is clicked.
  function handlePaneClick() {
	menu = null;
  }
</script>

<main>  
  <div style="height:90vh;" bind:clientWidth bind:clientHeight>
	<SvelteFlow
	  bind:nodes
	  bind:edges
	  fitView
	  ondragover={onDragOver}
	  ondrop={onDrop}
	  onnodecontextmenu={handleContextMenu}
	  onpaneclick={handlePaneClick}
	>
	  <Controls />
	  <Background variant={BackgroundVariant.Dots} />
	  {#if menu}
	  <ContextMenuService
		onclick={handlePaneClick}
		id={menu.id}
		top={menu.top}
		left={menu.left}
		right={menu.right}
		bottom={menu.bottom}
	  />
	{/if}
	  <MiniMap />
	</SvelteFlow>
  </div>
  <div class="controls-container">
	<div class="load-container">
	  <input 
		type="text" 
		bind:value={loadExperimentId} 
		placeholder="Enter Experiment ID"
		class="experiment-input"
	  />
	  <button onclick={loadFlowchart}>Load Flowchart</button>
	</div>
	<div class="save-container">
	  <button onclick={saveFlowchart}>Save Flowchart</button>
	</div>
  </div>
	<Sidebar />
</main>
   
  <style>
	main {
	  height: 90vh;
	  display: flex;
	  flex-direction: column-reverse;
	}
	.controls-container {
	  padding: 1rem;
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  background: #f9f9f9;
	  gap: 1rem;
	}
	.load-container {
	  display: flex;
	  gap: 0.5rem;
	  align-items: center;
	}
	.experiment-input {
	  padding: 0.5rem;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  min-width: 200px;
	}
	.save-container {
	  display: flex;
	}
	button {
	  padding: 0.5rem 1rem;
	  background: #007acc;
	  color: white;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	}
	button:hover {
	  background: #005999;
	}
	/* menu {
	  position: absolute;
	  z-index: 1000;
	} */
  </style>