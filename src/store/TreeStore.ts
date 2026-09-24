import type { TTreeItem, TTreeItemId } from '@/types/tree';

export class TreeStore {
    private readonly itemsById = new Map<TTreeItemId, TTreeItem>();
    private readonly childrenIdsByParent = new Map<TTreeItemId | null, Set<TTreeItemId>>();

    constructor(items: readonly TTreeItem[]) {
        this.replaceItems(items);
    }

    getAll(): TTreeItem[] {
        return Array.from(this.itemsById.values());
    }

    getItem(id: TTreeItemId): TTreeItem | undefined {
        return this.itemsById.get(id);
    }

    getChildren(id: TTreeItemId): TTreeItem[] {
        const childIds = this.childrenIdsByParent.get(id);

        if (!childIds) {
            return [];
        }

        const children: TTreeItem[] = [];

        for (const childId of childIds) {
            const child = this.itemsById.get(childId);

            if (child) {
                children.push(child);
            }
        }

        return children;
    }

    getAllChildren(id: TTreeItemId): TTreeItem[] {
        const descendants: TTreeItem[] = [];

        this.visitDescendantIds(id, (descendantId) => {
            const child = this.itemsById.get(descendantId);

            if (child) {
                descendants.push(child);
            }
        });

        return descendants;
    }

    getAllParents(id: TTreeItemId): TTreeItem[] {
        const parents: TTreeItem[] = [];
        let current = this.itemsById.get(id);

        while (current) {
            parents.push(current);

            if (current.parent === null) {
                break;
            }

            current = this.itemsById.get(current.parent);
        }

        return parents;
    }

    setItems(items: readonly TTreeItem[]): void {
        this.replaceItems(items);
    }

    addItem(item: TTreeItem): void {
        const previous = this.itemsById.get(item.id);

        if (previous) {
            this.detachFromParent(item.id, previous.parent);
        }

        this.itemsById.set(item.id, item);
        this.attachToParent(item.id, item.parent);
    }

    removeItem(id: TTreeItemId): void {
        const item = this.itemsById.get(id);

        if (!item) {
            return;
        }

        this.detachFromParent(id, item.parent);

        this.visitDescendantIds(id, (descendantId) => {
            this.itemsById.delete(descendantId);
            this.childrenIdsByParent.delete(descendantId);
        });

        this.itemsById.delete(id);
        this.childrenIdsByParent.delete(id);
    }

    updateItem(item: TTreeItem): void {
        const previous = this.itemsById.get(item.id);

        if (!previous) {
            this.attachToParent(item.id, item.parent);
        } else if (previous.parent !== item.parent) {
            this.detachFromParent(item.id, previous.parent);
            this.attachToParent(item.id, item.parent);
        }

        this.itemsById.set(item.id, item);
    }

    private replaceItems(items: readonly TTreeItem[]): void {
        this.itemsById.clear();
        this.childrenIdsByParent.clear();

        for (const item of items) {
            this.itemsById.set(item.id, item);
            this.attachToParent(item.id, item.parent);
        }
    }

    private visitDescendantIds(id: TTreeItemId, visit: (descendantId: TTreeItemId) => void): void {
        const childIds = this.childrenIdsByParent.get(id);

        if (!childIds) {
            return;
        }

        const stack = [childIds.values()];

        while (stack.length) {
            const iterator = stack[stack.length - 1];
            const result = iterator.next();

            if (result.done) {
                stack.pop();
                continue;
            }

            const descendantId = result.value;
            const descendantChildIds = this.childrenIdsByParent.get(descendantId);

            if (descendantChildIds) {
                stack.push(descendantChildIds.values());
            }

            visit(descendantId);
        }
    }

    private attachToParent(id: TTreeItemId, parent: TTreeItemId | null): void {
        const siblingIds = this.childrenIdsByParent.get(parent);

        if (siblingIds) {
            siblingIds.add(id);
        } else {
            this.childrenIdsByParent.set(parent, new Set([id]));
        }
    }

    private detachFromParent(id: TTreeItemId, parent: TTreeItemId | null): void {
        const siblingIds = this.childrenIdsByParent.get(parent);

        if (!siblingIds) {
            return;
        }

        if (!siblingIds.delete(id)) {
            return;
        }

        if (siblingIds.size === 0) {
            this.childrenIdsByParent.delete(parent);
        }
    }
}
