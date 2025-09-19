<script module lang="ts">
    import { getContext } from 'svelte'

    export interface DnDContext {
        current: string | null;
    }

    export const useDnD = (): DnDContext => {
        return getContext<DnDContext>('dnd');
    };
</script>

<script lang="ts">
    import { onDestroy, setContext, type Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
    let dndType = $state<string | null>(null);

    const contextValue: DnDContext = {
        set current(value: string | null) {
            dndType = value;
        }, 
        get current() {
            return dndType;
        },
    };

    setContext<DnDContext>('dnd', contextValue);

    onDestroy(() => {
        // Reset drag state when component is destroyed
        dndType = null;
    });
</script>

{@render children()}