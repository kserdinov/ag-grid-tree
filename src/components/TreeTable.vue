<script setup lang="ts">
    import type {
        ColDef,
        GetDataPath,
        GetRowIdParams,
        ModelUpdatedEvent,
        ValueGetterParams,
    } from 'ag-grid-community';
    import type { TreeStore } from '../store/TreeStore';
    import type { TTreeItem, TTreeItemId } from '../types/tree';
    import { themeQuartz } from 'ag-grid-community';
    import { AgGridVue } from 'ag-grid-vue3';
    import { useCssModule } from 'vue';

    const props = defineProps<{
        items: TTreeItem[];
        treeStore: TreeStore;
    }>();

    const ROW_NUMBER_COLUMN_ID = 'rowNumber';

    const $style = useCssModule();

    const theme = themeQuartz;
    const treeData = true;
    const treeDataDisplayType = 'custom';
    const groupDefaultExpanded = -1;

    const defaultColDef: ColDef = {
        sortable: false,
        suppressMovable: true,
    };

    function isGroup(item: TTreeItem | undefined): boolean {
        return item !== undefined && props.treeStore.getChildren(item.id).length > 0;
    }

    const columnDefs: ColDef<TTreeItem>[] = [
        {
            colId: ROW_NUMBER_COLUMN_ID,
            headerName: '№ п/п',
            width: 90,
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                const rowIndex = params.node?.rowIndex;

                return typeof rowIndex === 'number' ? rowIndex + 1 : '';
            },
        },
        {
            headerName: 'Категория',
            width: 260,
            showRowGroup: true,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                suppressCount: true,
            },
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                if (!params.data) {
                    return '';
                }

                return isGroup(params.data) ? 'Группа' : 'Элемент';
            },
        },
        {
            headerName: 'Наименование',
            flex: 1,
            minWidth: 220,
            cellClassRules: {
                [$style.groupLabel]: (params) => isGroup(params.data),
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
            .reverse()
            .map((item) => toPathKey(item.id));
    };

    function getRowId(params: GetRowIdParams<TTreeItem>): string {
        return toPathKey(params.data.id);
    }

    function onModelUpdated(event: ModelUpdatedEvent<TTreeItem>) {
        event.api.refreshCells({ columns: [ROW_NUMBER_COLUMN_ID] });
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
            @model-updated="onModelUpdated"
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

    .groupLabel {
        font-weight: 600;
    }
</style>
