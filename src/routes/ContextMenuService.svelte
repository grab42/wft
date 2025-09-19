<script lang="ts">
    import { useEdges, useNodes, useSvelteFlow } from '@xyflow/svelte';
   
    let {
      id,
      top,
      left,
      right,
      bottom,
      onclick,
    }: {
      id: string;
      top: number | undefined;
      left: number | undefined;
      right: number | undefined;
      bottom: number | undefined;
      onclick: () => void;
    } = $props();
   
    const { deleteElements } = useSvelteFlow();
   
    const nodes = useNodes();
    const node = nodes.current.find((node) => node.id === id);
   
    function duplicateNode() {
      
      if (node) {
        nodes.current = [
          ...nodes.current,
          {
            ...node,
            // Change id before pushing to production!!!
            id: `${id}-copy${Math.random()}`,
            position: {
              x: node.position.x,
              y: node.position.y + 50,
            },
          },
        ];
      }
    }
   
    function deleteNode() {
      deleteElements({ nodes: [{ id }] });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        onclick();
      }
    }
    
  </script>

  <div style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
    class="context-menu" onclick={onclick} onkeydown={handleKeyDown}
    role="menu" tabindex="0" aria-label="Node context menu">
    <p style="margin: 0.5em;">
      <small>node: {id}</small>
    </p>
    <button onclick={duplicateNode}>duplicate</button>
    <button onclick={deleteNode}>delete</button>
  </div>
   
  <style>
    .context-menu {
      background: white;
      border-style: solid;
      box-shadow: 10px 19px 20px rgba(0, 0, 0, 10%);
      position: absolute;
      z-index: 10;
    }
   
    .context-menu button {
      border: none;
      display: block;
      padding: 0.5em;
      text-align: left;
      width: 100%;
    }
   
    .context-menu button:hover {
      background: white;
    }
  </style>