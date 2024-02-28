<script lang="ts">
	import { Button } from '@marianmeres/stuic';
	import { ContentBuilder, createContentBuilderStore } from '../lib/index.js';

	const store = createContentBuilderStore();
	//
</script>

<div class="flex p-4 space-x-4">
	<div class="flex-1">
		<ContentBuilder {store} />
	</div>
	<div class="w-[200px]">
		<Button
			on:click={() => {
				store.add(null, { type: 'foo', label: Math.random().toString() });
			}}
		>
			click
		</Button>
	</div>
</div>
