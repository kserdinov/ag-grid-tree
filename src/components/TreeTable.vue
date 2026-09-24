<script setup lang="ts">
    import type {
        ColDef,
        GetDataPath,
        GetRowIdParams,
        ModelUpdatedEvent,
        ValueGetterParams,
    } from 'ag-grid-community';
    import type { TreeStore } from '@/store/TreeStore';
    import type { TTreeItem, TTreeItemId } from '@/types/tree';
    import { themeQuartz } from 'ag-grid-community';
    import { useCssModule } from 'vue';
    import { AgGridVue } from 'ag-grid-vue3';

    const props = defineProps<{
        items: TTreeItem[];
        treeStore: TreeStore;
    }>();

    const ROW_NUMBER_COLUMN_ID = 'rowNumber';
    const TREE_DATA_DISPLAY_TYPE = 'custom';
    const GROUP_CELL_RENDERER = 'agGroupCellRenderer';
    const EXPAND_ALL_LEVELS = -1;
    const CATEGORY_GROUP = 'Группа';
    const CATEGORY_ELEMENT = 'Элемент';
    const NUMBER_PATH_PREFIX = 'n:';
    const STRING_PATH_PREFIX = 's:';

    const $style = useCssModule();

    const theme = themeQuartz;
    const treeData = true;
    const treeDataDisplayType = TREE_DATA_DISPLAY_TYPE;
    const groupDefaultExpanded = EXPAND_ALL_LEVELS;

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
            cellRenderer: GROUP_CELL_RENDERER,
            cellRendererParams: {
                suppressCount: true,
            },
            valueGetter: (params: ValueGetterParams<TTreeItem>) => {
                if (!params.data) {
                    return '';
                }

                return isGroup(params.data) ? CATEGORY_GROUP : CATEGORY_ELEMENT;
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
        return typeof id === 'number' ? `${NUMBER_PATH_PREFIX}${id}` : `${STRING_PATH_PREFIX}${id}`;
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
