<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { Thc } from '@marianmeres/stuic';
	import type { ContentBuilderNodeValueTypesConfig } from '../ContentBuilder.svelte';
	import type { createContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';

	const clog = createClog('ContentNodeValue');

	export let nodeValueByTypeConfig: ContentBuilderNodeValueTypesConfig;
	export let value: ContentBuilderNodeValue;
	export let key: string;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let disabled = false;
	// for debug
	export let showNodeId = false;

	let input: HTMLInputElement;

	//
	let _previousLabel = value.label;
	const submitLabel = (e: Event) => {
		if (_previousLabel !== value.label) {
			store.save();
			_previousLabel = value.label;
		}
	};
</script>

{#if nodeValueByTypeConfig?.[value.type]?.component}
	<Thc
		thc={{
			component: nodeValueByTypeConfig?.[value.type]?.component,
			props: {
				...(nodeValueByTypeConfig?.[value.type]?.props || {}),
				...(value.props || {}),
				key,
				value,
				disabled
			}
		}}
	/>
{:else}
	<div class="flex items-center">
		<div class="flex-1 pr-2">
			<input
				type="text"
				class="w-full focus:outline-none focus:bg-gray-100 hover:bg-gray-100"
				class:cursor-not-allowed={disabled}
				bind:this={input}
				bind:value={value.label}
				on:blur={submitLabel}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						input.blur();
						submitLabel(e);
					}
				}}
				{disabled}
			/>
		</div>
		{#if showNodeId}
			<span class="text-xs font-mono opacity-50 mr-2">{key}</span>
		{/if}
		<span
			class="
				text-xs font-mono rounded-full p-1 px-2 bg-gray-200
			"
		>
			<span class="opacity-75">{value.type}</span>
		</span>
	</div>
{/if}
