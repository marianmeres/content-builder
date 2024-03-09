<script lang="ts">
	export let key: string = '';
	export let type: string = '';

	export let html: string = '';
	export let style: string = '';

	let _class: string = '';
	export { _class as class };
</script>

<div {style} class={_class} id={key} data-content-builder-type={type}>
	{@html html}
	<slot />
</div>
