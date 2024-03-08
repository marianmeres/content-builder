<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { Thc } from '@marianmeres/stuic';
	import type { ContentBuilderNodeValueTypesConfig } from '../ContentBuilder.svelte';
	import type { createContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';

	const clog = createClog('ContentNodeValue');

	export let value: ContentBuilderNodeValue;
	export let key: string;
	export let store: ReturnType<typeof createContentBuilderStore>;
	export let disabled = false;
	// for debug
	export let showNodeId = false;
	export let onNodeEditRequest: (
		key: string,
		value: ContentBuilderNodeValue
	) => Promise<void>;

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

<div class="flex items-center">
	<div class="flex-1 pr-2">
		<input
			type="text"
			class="
				w-full
				focus:outline-none focus:bg-gray-100 hover:bg-gray-50 focus:border-none focus:ring-0
				border-none p-0 text-base
				ring-0
			"
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
	<button
		class="
				text-xs font-mono rounded-full p-1 px-2 bg-gray-100
			"
		on:click={async () => onNodeEditRequest(key, value)}
		type="button"
	>
		<span class="opacity-75">{value.type}</span>
	</button>
</div>
