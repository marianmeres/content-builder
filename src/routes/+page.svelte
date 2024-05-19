<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		AlertConfirmPrompt,
		Button,
		Notifications,
		createAlertConfirmPromptStore,
		createNotificationsStore
	} from '@marianmeres/stuic';
	import { Tree } from '@marianmeres/tree';
	import ContentBuilderNodeRenderer, {
		type ContentBuilderRendererComponentDef
	} from '../lib/content-builder/ContentBuilderNodeRenderer.svelte';
	import {
		ContentBuilder,
		ContentNodeEditor,
		createContentBuilderStore,
		type ContentBuilderNodeValue
	} from '../lib/index.js';
	import Foo from './_components/Foo.svelte';

	const clog = createClog('+page');

	const storage = (): any => {
		return typeof sessionStorage === 'undefined' ? null : sessionStorage;
	};

	const notifications = createNotificationsStore();

	const store = createContentBuilderStore(storage()?.getItem('dump'), {
		save: async (dump: string) => {
			// simulate async server request...
			return new Promise((resolve) => {
				setTimeout(() => {
					storage()?.setItem('dump', dump);
					resolve(true);
				}, 300);
			});
		}
		// logger: clog
	});

	const acp = createAlertConfirmPromptStore();

	$: tree = Tree.factory<ContentBuilderNodeValue>($store.data || '', true);

	let disabled = false;

	const typeToComponentMap: Record<string, ContentBuilderRendererComponentDef> = {
		foo: {
			component: Foo,
			props: {
				foo: 'must be overwritten 2'
			}
		}
	};

	let builder: ContentBuilder;
	let editor: ContentNodeEditor;

	let globalNotifsCmp: Notifications;
</script>

<div class="flex">
	<div class="flex-1">
		<div class="p-6">
			{#if $store?.error}
				<code class="text-red-500 text-sm block">{$store.error}</code>
			{/if}
			<ContentBuilder
				bind:this={builder}
				{store}
				{disabled}
				{acp}
				{notifications}
				debug={false}
				onNodeEditRequest={async (k, v) => {
					// key = k;
					editor?.setKey(k);
					// await builder?.defaultOnNodeEdit(k, v);
					// editor?.setKey('');
					return true;
				}}
			/>
			<!-- highlightedNodeKey="n-n6izkflr" -->
		</div>
		{#if $store.size > 1}
			<div class="text-xs opacity-50 px-6 mb-4">
				Edit label and use hover control buttons for more. Drag to move.
			</div>
		{/if}

		<div class="p-4 border-t space-x-4">
			<Button on:click={() => store.add(null)} size="sm" {disabled}>Append block</Button>
			<label class="inline-flex items-center space-x-2">
				<input type="checkbox" bind:checked={disabled} />
				<span>disabled</span>
			</label>
			<span>Blocks: {$store.size - 1}</span>
			{#if $store?.isSaving}
				<span class="opacity-25">Saving...</span>
			{/if}
		</div>

		{#if tree.size() > 1}
			<div class="p-4 bg-gray-50">
				<ContentBuilderNodeRenderer node={tree.root} {typeToComponentMap} />
			</div>
		{/if}
	</div>

	<div class="w-full max-w-[33%] bg-gray-100">
		<ContentNodeEditor
			bind:this={editor}
			{notifications}
			{acp}
			{store}
			{builder}
			class="bg-gray-200 p-4"
			t={(...args) => builder?.t.apply(null, args)}
			fieldsetBoxClass="border-gray-400"
			size="sm"
			debug
			typesConfig={[
				{
					label: 'Box with video background',
					value: 'bg_video',
					description: '',
					props: [
						{
							name: 'src',
							inputType: 'text',
							value: '',
							inputProps: {
								label: 'Video url',
								required: true,
								placeholder: 'https://example.com/video.mp4'
							}
						},
						{
							name: 'videoStyle',
							inputType: 'textarea',
							value: '',
							inputProps: {
								label: 'Video element CSS',
								placeholder: 'filter: sepia(100%);',
								rows: 1
							}
						},
						{
							name: 'overlayColor',
							inputType: 'text',
							value: '',
							inputProps: {
								label: 'Overlay color',
								placeholder: 'rgb(0 0 0 / .5)'
							}
						}
					],
					allowInnerBlocks: {
						value: true,
						hidden: true
					}
				},
				{
					label: 'With options',
					value: 'with_opts',
					description: 'Hey ho',
					optgroup: 'Foo',
					props: [
						{
							name: 'hey',
							inputType: 'select',
							value: 'baz',
							inputProps: {
								label: 'Foo',
								options: [
									{ value: 'foo', label: 'Foo', description: 'Some', optgroup: 'Bar' },
									{ value: 'bar', label: 'Bar' },
									{ value: 'baz', label: 'Baz' }
								],
								description: 'Lets go'
							}
						},
						{
							name: 'some',
							inputType: 'text',
							value: 'default value',
							inputProps: {
								label: 'Foo',
								description: 'Lets go'
							}
						}
					]
				},
				{
					label: 'With checkbox (no inner)',
					value: 'with_check',
					description: 'Lets go',
					optgroup: 'Foo',
					props: [
						{
							name: 'checkcheck',
							inputType: 'checkbox',
							value: true,
							inputProps: {
								label: 'Foo',
								description: 'Lets go'
							}
						}
					],
					allowInnerBlocks: {
						value: false,
						hidden: true
					}
				}
			]}
		/>
	</div>
</div>

<AlertConfirmPrompt
	{acp}
	{notifications}
	notificationsPositionConfig={globalNotifsCmp?.getPositionConfig() || {}}
/>

<Notifications {notifications} bind:this={globalNotifsCmp} />

<style lang="scss">
	:global([data-content-builder-node-type-invalid]) {
		outline: 2px red dashed;
	}
	// :global([data-content-builder-node-highlighted]) {
	// background-color: #ffc !important;
	// }
</style>
