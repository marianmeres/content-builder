<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { droppable } from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import { writable } from 'svelte/store';
	import type { ContentBuilderStore } from '../content-builder.js';
	import type { ContentBuilderNodeValue } from '../types.js';

	const clog = createClog('Dropzone');

	export let index: number = 0;
	export let id: string = '';
	export let store: ContentBuilderStore;
	export let disabled = false;

	const isDraggedOver = writable<string | null>(null);

	const tree = new Tree<ContentBuilderNodeValue>();
</script>

{#if id}
	<div
		use:droppable={{
			enabled: !disabled,
			id,
			dropEffect: 'move',
			onDrop: (data, e) => {
				const sourceKey = data.payload?.source;
				const targetKey = id;
				let targetIndex = index;
				// clog('onDrop', { sourceKey, targetKey, targetIndex });

				// @ts-ignore
				tree.restore($store.data);

				const src = tree.find(sourceKey);
				const target = tree.find(targetKey);

				// dragging under same parent needs some adjusting
				if (src?.parent === target) {
					// dropped to top (special case -1 mark)
					if (targetIndex === -1) {
						targetIndex = 0;
					}
					// dragging upwards
					else if (src?.siblingIndex > targetIndex) {
						targetIndex++;
					}
				}
				// not under same parent
				else {
					targetIndex++;
				}

				// console.log('final', src?.siblingIndex, targetIndex);
				store.move(sourceKey, targetKey, targetIndex);
			},
			isDraggedOver
			// logger: createClog('droppable')
		}}
		class="transition-all"
		class:bg-black={$isDraggedOver === id}
		class:h-2={$isDraggedOver !== id && index === -1}
		class:h-3={$isDraggedOver !== id && index !== -1}
		class:h-6={$isDraggedOver === id}
	/>
{/if}
