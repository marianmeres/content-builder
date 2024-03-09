<script lang="ts">
	export let key: string = '';
	export let type: string = '';

	export let html: string = '';
	export let style: string = '';
</script>

<div {style} id={key} data-content-builder-type={type}>
	{@html html}
	<slot />
</div>
