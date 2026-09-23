export type TTreeItemId = string | number;

export type TTreeItem = {
    id: TTreeItemId;
    parent: TTreeItemId | null;
    [key: string]: unknown;
};
