import type { TTreeItem, TTreeItemId } from '../types/tree';

export class TreeStore {
    private readonly itemsById = new Map<TTreeItemId, TTreeItem>();
    private readonly childrenIdsByParent = new Map<TTreeItemId | null, TTreeItemId[]>();

    constructor(items: readonly TTreeItem[]) {
        this.replaceItems(items);
    }

    private replaceItems(items: readonly TTreeItem[]) {
        this.itemsById.clear();
        this.childrenIdsByParent.clear();

        for (const item of items) {
            this.itemsById.set(item.id, item);

            const siblingIds = this.childrenIdsByParent.get(item.parent);

            if (siblingIds) {
                siblingIds.push(item.id);
            } else {
                this.childrenIdsByParent.set(item.parent, [item.id]);
            }
        }
    }
}
