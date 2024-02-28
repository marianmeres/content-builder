<script lang="ts">
	import type { Tree, TreeNode } from '@marianmeres/tree';
	import type { ContentBuilderNodeValue } from '../types.js';
	import { Button } from '@marianmeres/stuic';
	import ContentNode from './ContentNode.svelte';
	import type { createContentBuilderStore } from '../content-builder.js';

	export let tree: Tree<ContentBuilderNodeValue>;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let t: CallableFunction;
</script>

<div class="p-4">
	<ContentNode node={tree.root} {store} {t} />
</div>
