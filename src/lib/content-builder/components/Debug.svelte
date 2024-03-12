<script lang="ts">
	import type { TreeNode } from '@marianmeres/tree';
	import type { ContentBuilderNodeValue } from '../types.js';

	export let debug = false;
	export let node: TreeNode<ContentBuilderNodeValue>;
	export let dropzoneEnabled: boolean | undefined = undefined;
</script>

{#if debug}
	<div class="text-xs font-mono bg-pink-100 text-pink-800/70 p-1">
		{JSON.stringify({ dropzoneEnabled })}
	</div>
{/if}
