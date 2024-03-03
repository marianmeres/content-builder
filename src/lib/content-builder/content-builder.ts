import { createClog } from '@marianmeres/clog';
import { createDerivedStore, createStore } from '@marianmeres/store';
import { Tree, TreeNode, type TreeNodeDTO } from '@marianmeres/tree';
import type { ContentBuilderNodeValue } from './types.js';
import { get as storeGet } from 'svelte/store';

const clog = createClog('content-builder');

const defaultNodeValue: ContentBuilderNodeValue = {
	type: 'default',
	label: '',
	props: {
		class: ''
	},
	// a.k.a. allow childred (but keepping the naming less technical)
	allowInnerBlocks: true
};

export interface CreateContentBuilderStoreOptions {
	save: (dump: string) => Promise<any>;
	defaultNodeValue: ContentBuilderNodeValue;
}

export const createContentBuilderStore = (
	initialDump: string | null = null,
	options: Partial<CreateContentBuilderStoreOptions> = {}
) => {
	let tree = new Tree<ContentBuilderNodeValue>(new TreeNode({ type: 'root' }));
	clog('initialDump', initialDump);
	if (initialDump) tree.restore(initialDump);

	// let _counter = tree.size() - 1;
	// const counter = () => tree.size() - 1;

	const _ts = createStore<number>(0);
	const _error = createStore<string>('');
	const _isSaving = createStore<boolean>(false);

	interface StoreVal {
		size: number;
		data: TreeNodeDTO<ContentBuilderNodeValue> | undefined;
		error: string;
		isSaving: boolean;
	}
	const _derived = createDerivedStore<StoreVal>(
		[_ts, _error, _isSaving],
		// intentionally exposing only the dump (data), not the tree instance,
		// want to keep it encapsulated to have outer reactivity under control
		([ts, error, isSaving]) => ({
			size: tree.size(),
			data: tree.toJSON(),
			error,
			isSaving
		})
	);

	const _touch = () => _ts.set(Date.now());
	const counter = () => storeGet(_derived).size;

	const _save = async () => {
		try {
			_isSaving.set(true);
			_error.set(``);
			if (typeof options.save === 'function') {
				await options.save(tree.dump());
			}
		} catch (e) {
			_error.set(`${e}`);
		} finally {
			_isSaving.set(false);
		}
	};

	// exposed API

	const add = (parentKey: string | null, value?: ContentBuilderNodeValue) => {
		try {
			_error.set(``);
			const p = tree.find(parentKey || tree.root!.key);
			if (p) {
				// if (!value) {
				value ??= { ...(options.defaultNodeValue || defaultNodeValue) };
				// }
				// if (!value.label) {
				// clog(4444, value.label);
				// value.label = [value.type, ' #', counter()].join('');
				// }
				value.label ||= `${value.type} #${counter()}`;
				p.appendChild(value);
				_touch();
				_save();
			} else {
				throw new Error(`Parent node (key "${parentKey}") not found`);
			}
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	const remove = (key: string) => {
		try {
			_error.set(``);
			if (tree.remove(key)) {
				_save();
			}
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	const duplicate = (key: string) => {
		try {
			_error.set(``);
			const source = tree.find(key);
			if (!source) throw new Error(`Source node (key "${key}") not found`);
			// clog(source?.deepClone());
			// if (tree.insert(source?.parent?.key!, source?.deepClone().value)) {
			if (tree.copy(source.key, source?.parent?.key!)) {
				_save();
			}
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	const move = (srcKey: string, targetKey: string, targetIndex: number = 0) => {
		try {
			clog('move', srcKey, targetKey, targetIndex);
			_error.set(``);
			if (srcKey === targetKey) {
				clog('same', targetIndex);
				tree.find(srcKey)?.moveSiblingIndex(targetIndex);
			} else {
				clog('not same', targetIndex);
				tree.move(srcKey, targetKey)?.moveSiblingIndex(targetIndex);
			}
			_save();
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	const edit = (srcKey: string, valueData: string | ContentBuilderNodeValue) => {
		try {
			clog('edit', srcKey, valueData);
			_error.set(``);
			if (typeof valueData === 'string') {
				try {
					valueData = JSON.parse(valueData);
				} catch (e) {
					throw new TypeError('Invalid JSON data. Cannot edit.');
				}
			}
			if (!valueData) return;

			const node = tree.find(srcKey);
			if (!node) throw new Error(`Node "${srcKey}" not found!`);
			node.value = valueData as any;

			_save();
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	return {
		subscribe: _derived.subscribe,
		add,
		duplicate,
		move,
		remove,
		counter,
		edit,
		resetError: () => _error.set(''),
		save: () => {
			_touch();
			_save();
		}
	};
};
