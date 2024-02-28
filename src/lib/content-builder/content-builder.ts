import { Tree, TreeNode, type TreeNodeDTO } from '@marianmeres/tree';
import type { ContentBuilderNodeValue } from './types.js';
import { createDerivedStore, createStore } from '@marianmeres/store';

export const createContentBuilderStore = () => {
	const tree = new Tree<ContentBuilderNodeValue>(new TreeNode({ type: 'root' }));

	const _touch = createStore<number>(0);
	const _error = createStore<string>('');

	interface StoreVal {
		data: TreeNodeDTO<ContentBuilderNodeValue> | undefined;
		error: string;
	}
	const _derived = createDerivedStore<StoreVal>(
		[_touch, _error],
		// intentionally exposing only the dump (data), not the tree instance,
		// we want to keep it encapsulated under the hood
		([ts, error]) => ({
			data: tree.toJSON(),
			error
		})
	);

	const touch = () => _touch.set(Date.now());

	// exposed API

	const add = (parentKey: string | null, value: ContentBuilderNodeValue) => {
		try {
			const p = tree.find(parentKey || tree.root!.key);
			if (p) {
				p.appendChild(value);
				touch();
			} else {
				throw new Error(`Parent node "${parentKey}" not found`);
			}
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	const remove = (key: string) => {
		try {
			tree.remove(key) && touch();
		} catch (e) {
			_error.set(`${e}`);
		}
	};

	return {
		subscribe: _derived.subscribe,
		add,
		remove
	};
};
