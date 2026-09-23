import { describe, expect, it } from 'vitest';
import { TreeStore } from '../../src/store/TreeStore';
import type { TTreeItem } from '../../src/types/tree';

function createItems(): TTreeItem[] {
    return [
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: '91064cef', parent: 1, label: 'Айтем 2' },
        { id: 3, parent: 1, label: 'Айтем 3' },
        { id: 4, parent: '91064cef', label: 'Айтем 4' },
        { id: 5, parent: '91064cef', label: 'Айтем 5' },
        { id: 6, parent: '91064cef', label: 'Айтем 6' },
        { id: 7, parent: 4, label: 'Айтем 7' },
        { id: 8, parent: 4, label: 'Айтем 8' },
    ];
}

function getIds(items: TTreeItem[]) {
    return items.map((item) => item.id);
}

describe('TreeStore', () => {
    it('returns all items in their loading order', () => {
        const items = createItems();
        const store = new TreeStore(items);

        expect(store.getAll()).toEqual(items);
    });

    it('returns an item by id and keeps string and numeric ids distinct', () => {
        const store = new TreeStore([
            { id: 1, parent: null, label: 'Число' },
            { id: '1', parent: null, label: 'Строка' },
        ]);

        expect(store.getItem(1)?.label).toBe('Число');
        expect(store.getItem('1')?.label).toBe('Строка');
    });

    it('returns direct children or an empty array', () => {
        const store = new TreeStore(createItems());

        expect(getIds(store.getChildren(1))).toEqual(['91064cef', 3]);
        expect(store.getChildren(7)).toEqual([]);
        expect(store.getChildren('missing')).toEqual([]);
    });

    it('returns every descendant without the requested item', () => {
        const store = new TreeStore(createItems());

        expect(getIds(store.getAllChildren(1))).toEqual(['91064cef', 4, 7, 8, 5, 6, 3]);
        expect(getIds(store.getAllChildren(4))).toEqual([7, 8]);
        expect(store.getAllChildren(7)).toEqual([]);
    });

    it('returns the path from the requested item to the root', () => {
        const store = new TreeStore(createItems());

        expect(getIds(store.getAllParents(7))).toEqual([7, 4, '91064cef', 1]);
        expect(getIds(store.getAllParents(1))).toEqual([1]);
    });

    it('fully replaces stored items', () => {
        const store = new TreeStore(createItems());
        const replacement = [
            { id: 'root', parent: null, label: 'Новый корень' },
            { id: 'child', parent: 'root', label: 'Новый элемент' },
        ];

        store.setItems(replacement);

        expect(store.getAll()).toEqual(replacement);
        expect(store.getItem(1)).toBeUndefined();
        expect(getIds(store.getChildren('root'))).toEqual(['child']);
    });

    it('adds an item and updates the indexes', () => {
        const store = new TreeStore(createItems());
        const item = { id: 9, parent: 3, label: 'Айтем 9' };

        store.addItem(item);

        expect(store.getItem(9)).toEqual(item);
        expect(getIds(store.getChildren(3))).toEqual([9]);
        expect(store.getAll().at(-1)).toEqual(item);
    });

    it('removes an item with all its descendants', () => {
        const store = new TreeStore(createItems());

        store.removeItem(4);

        expect(store.getItem(4)).toBeUndefined();
        expect(store.getItem(7)).toBeUndefined();
        expect(store.getItem(8)).toBeUndefined();
        expect(getIds(store.getChildren('91064cef'))).toEqual([5, 6]);
        expect(getIds(store.getAll())).toEqual([1, '91064cef', 3, 5, 6]);
    });

    it('updates fields and moves an item to another parent', () => {
        const store = new TreeStore(createItems());
        const updatedItem = { id: 7, parent: 3, label: 'Обновлённый айтем 7' };

        store.updateItem(updatedItem);

        expect(store.getItem(7)).toEqual(updatedItem);
        expect(getIds(store.getChildren(4))).toEqual([8]);
        expect(getIds(store.getChildren(3))).toEqual([7]);
        expect(getIds(store.getAllParents(7))).toEqual([7, 3, 1]);
    });
});
