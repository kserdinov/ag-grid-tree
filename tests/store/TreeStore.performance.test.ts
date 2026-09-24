import type { TTreeItem } from '@/types/tree';
import { TreeStore } from '@/store/TreeStore';
import { describe, expect, it } from 'vitest';

const ITEMS_COUNT = 100_000;
const BRANCHING = 10;
const OPERATIONS_COUNT = 10_000;
const MAX_DURATION_MS = 200;

function createBalancedTree(): TTreeItem[] {
    return Array.from({ length: ITEMS_COUNT }, (_, id) => ({
        id,
        parent: id === 0 ? null : Math.floor((id - 1) / BRANCHING),
        label: `Айтем ${id}`,
    }));
}

function measure(operation: () => void): number {
    const startedAt = performance.now();

    operation();

    return performance.now() - startedAt;
}

describe('TreeStore performance', () => {
    it('runs every method quickly on 100 000 items', () => {
        const items = createBalancedTree();
        let store = new TreeStore([]);
        const lastId = ITEMS_COUNT - 1;

        expect(measure(() => (store = new TreeStore(items)))).toBeLessThan(MAX_DURATION_MS);
        expect(measure(() => store.setItems(items))).toBeLessThan(MAX_DURATION_MS);
        expect(measure(() => store.getAll())).toBeLessThan(MAX_DURATION_MS);
        expect(measure(() => store.getAllChildren(0))).toBeLessThan(MAX_DURATION_MS);

        const readDuration = measure(() => {
            for (let id = 0; id < OPERATIONS_COUNT; id += 1) {
                store.getItem(id);
                store.getChildren(id);
                store.getAllParents(lastId - id);
            }
        });

        const writeDuration = measure(() => {
            for (let index = 0; index < OPERATIONS_COUNT; index += 1) {
                const id = ITEMS_COUNT + index;

                store.addItem({ id, parent: index, label: `Новый ${id}` });
                store.updateItem({ id, parent: index + 1, label: `Обновлённый ${id}` });
            }
        });

        expect(readDuration).toBeLessThan(MAX_DURATION_MS);
        expect(writeDuration).toBeLessThan(MAX_DURATION_MS);
        expect(measure(() => store.removeItem(1))).toBeLessThan(MAX_DURATION_MS);
        expect(store.getItem(1)).toBeUndefined();
    });

    it('moves children of a wide parent without scanning all siblings', () => {
        const items: TTreeItem[] = [
            { id: 'root', parent: null },
            ...Array.from({ length: ITEMS_COUNT }, (_, id) => ({ id, parent: 'root' })),
        ];
        const store = new TreeStore(items);

        const duration = measure(() => {
            for (let id = ITEMS_COUNT - OPERATIONS_COUNT; id < ITEMS_COUNT; id += 1) {
                store.updateItem({ id, parent: null });
            }
        });

        expect(store.getChildren('root')).toHaveLength(ITEMS_COUNT - OPERATIONS_COUNT);
        expect(duration).toBeLessThan(MAX_DURATION_MS);
    });

    it('handles a deep tree without stack overflow', () => {
        const depth = 25_000;
        const items: TTreeItem[] = Array.from({ length: depth }, (_, id) => ({
            id,
            parent: id === 0 ? null : id - 1,
        }));
        const store = new TreeStore(items);

        expect(store.getAllChildren(0)).toHaveLength(depth - 1);
        expect(store.getAllParents(depth - 1)).toHaveLength(depth);
    });
});
