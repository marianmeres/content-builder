<script context="module" lang="ts">
	export interface ContentBuilderRendererComponentDef {
		component: any;
		props?: Record<string, any>;
	}
</script>

<script lang="ts">
	import type { TreeNode } from '@marianmeres/tree';
	import GenericRenderer from './components/renderer/GenericRenderer.svelte';
	import type { ContentBuilderNodeValue } from './types.js';

	type ComponentDefFn = () => ContentBuilderRendererComponentDef;

	export let typeToComponentMap: Record<
		string,
		ComponentDefFn | ContentBuilderRendererComponentDef
	> = {};
	export let node: TreeNode<ContentBuilderNodeValue> | null;

	// $: clog(123, node?.isRoot);
	const getCmp = (key: string, value: ContentBuilderNodeValue) => {
		let def = typeToComponentMap?.[value.type];
		if (typeof def === 'function') def = def();
		return {
			component: def?.component || GenericRenderer,
			props: {
				key,
				type: value.type,
				...(def?.props || {}),
				...(value?.props || {})
			}
		};
	};
</script>

{#if node?.isRoot}
	<div data-content-builder-type={node.value.type}>
		{#each node?.children || [] as child}
			<svelte:self node={child} {typeToComponentMap} />
		{/each}
	</div>
{:else if node}
	{@const cmp = getCmp(node.key, node.value)}
	<svelte:component this={cmp.component} {...cmp?.props || {}}>
		{#if node.value.allowInnerBlocks}
			{#each node?.children || [] as child}
				<svelte:self node={child} {typeToComponentMap} />
			{/each}
		{/if}
	</svelte:component>
{/if}
