import { Tree, TreeNode, type TreeNodeDTO } from '@marianmeres/tree';
import type { ContentBuilderNodeValue } from './types.js';
import { createDerivedStore, createStore } from '@marianmeres/store';
import { createClog } from '@marianmeres/clog';

const clog = createClog('content-builder');

export interface CreateContentBuilderStoreOptions {
	save: (dump: string) => Promise<any>;
}

export const createContentBuilderStore = (
	initialDump: string | null = null,
	options: Partial<CreateContentBuilderStoreOptions> = {}
) => {
	let tree = new Tree<ContentBuilderNodeValue>(new TreeNode({ type: 'root' }));
	if (initialDump) tree.restore(initialDump);

	let _counter = tree.size() - 1;
	const counter = () => ++_counter;

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
		// we want to keep it encapsulated under the hood
		([ts, error, isSaving]) => ({
			size: tree.size(),
			data: tree.toJSON(),
			error,
			isSaving
		})
	);

	const _touch = () => _ts.set(Date.now());

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

	const add = (parentKey: string | null, value: ContentBuilderNodeValue) => {
		try {
			_error.set(``);
			const p = tree.find(parentKey || tree.root!.key);
			if (p) {
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
				_touch();
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
				_touch();
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
			_touch();
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
		save: () => {
			_touch();
			_save();
		}
	};
};
