<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { createContentBuilderStore } from './content-builder.js';
	import { Tree } from '@marianmeres/tree';
	import { createClog } from '@marianmeres/clog';
	import type { ContentBuilderNodeValue } from './types.js';
	import ContentNode from './components/ContentNode.svelte';
	import ContentTree from './components/ContentTree.svelte';

	const clog = createClog('ContentBuilder');

	let _class = '';
	export { _class as class };

	export let store: ReturnType<typeof createContentBuilderStore>;
	export let i18n: Record<string, string> = {
		node_remove: 'Remove content',
		node_add: 'Add new content'
	};

	const t = (i18nKey: string, params: any = {}) => {
		return i18n?.[i18nKey] || i18nKey;
	};

	$: clog($store);

	// this is a readonly tree!
	$: tree = new Tree<ContentBuilderNodeValue>(null, true).restore($store.data || '');

	// *preOrderTraversal(node?: TreeNode<T> | null) {
	// 	node ??= this._root;
	// 	yield node;
	// 	if (node?.children.length) {
	// 		for (let child of node.children) {
	// 			yield* this.preOrderTraversal(child);
	// 		}
	// 	}
	// }
</script>

<div class={twMerge(`${_class}`)}>
	{#if $store?.error}
		<code class="text-red-500 mb-4 block">{$store.error}</code>
	{/if}
	<ContentTree {tree} {store} {t} />
	<pre class="text-xs">{JSON.stringify($store?.data, null, 2)}</pre>
</div>
