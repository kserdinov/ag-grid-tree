<script setup lang="ts">
    import type { ColDef, GetDataPath, GetRowIdParams, ValueGetterParams } from 'ag-grid-community';
    import { themeQuartz } from 'ag-grid-community';
    import { AgGridVue } from 'ag-grid-vue3';
    import type { TreeStore } from '../store/TreeStore';
    import type { TTreeItem, TTreeItemId } from '../types/tree';

    const props = defineProps<{
        items: TTreeItem[];
        treeStore: TreeStore;
    }>();

    const theme = themeQuartz;
    const treeData = true;
    const treeDataDisplayType = 'custom' as const;
    const groupDefaultExpanded = -1;

    const defaultColDef: ColDef = {
        sortable: false,
        filter: false,
        resizable: true,
    };

    const columnDefs: ColDef<TTreeItem>[] = [
        {
            headerName: '№ п/п',
            width: 96,
            maxWidth: 120,
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                const rowIndex = params.node?.rowIndex;

                return typeof rowIndex === 'number' ? rowIndex + 1 : '';
            },
        },
        {
            headerName: 'Категория',
            width: 140,
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                if (!params.data) {
                    return '';
                }

                return props.treeStore.getChildren(params.data.id).length > 0
                    ? 'Группа'
                    : 'Элемент';
            },
        },
        {
            headerName: 'Наименование',
            flex: 1,
            minWidth: 220,
            showRowGroup: true,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                suppressCount: true,
            },
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                const label = params.data?.label;

                return typeof label === 'string' ? label : '';
            },
        },
    ];

    function toPathKey(id: TTreeItemId): string {
        return typeof id === 'number' ? `n:${id}` : `s:${id}`;
    }

    const getDataPath: GetDataPath<TTreeItem> = (data) => {
        return props.treeStore
            .getAllParents(data.id)
            .slice()
            .reverse()
            .map((item) => toPathKey(item.id));
    };

    function getRowId(params: GetRowIdParams<TTreeItem>): string {
        return toPathKey(params.data.id);
    }
</script>

<template>
    <div :class="$style.TreeTable">
        <ag-grid-vue
            :class="$style.grid"
            :theme="theme"
            :row-data="items"
            :column-defs="columnDefs"
            :default-col-def="defaultColDef"
            :tree-data="treeData"
            :tree-data-display-type="treeDataDisplayType"
            :get-data-path="getDataPath"
            :get-row-id="getRowId"
            :group-default-expanded="groupDefaultExpanded"
        />
    </div>
</template>

<style module>
    .TreeTable {
        height: 100%;
        min-height: 0;
    }

    .grid {
        width: 100%;
        height: 100%;
    }
</style>
