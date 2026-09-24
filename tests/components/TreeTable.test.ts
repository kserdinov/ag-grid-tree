// @vitest-environment jsdom

import type { ColDef, GetDataPath, ValueGetterParams } from 'ag-grid-community';
import type { TTreeItem } from '@/types/tree';
import type { PropType } from 'vue';
import { TreeStore } from '@/store/TreeStore';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TreeTable from '@/components/TreeTable.vue';

const AgGridVueStub = defineComponent({
    name: 'AgGridVue',
    props: {
        columnDefs: {
            type: Array as PropType<ColDef<TTreeItem>[]>,
            required: true,
        },
        rowData: {
            type: Array as PropType<TTreeItem[]>,
            required: true,
        },
        treeData: {
            type: Boolean,
            required: true,
        },
        getDataPath: {
            type: Function as PropType<GetDataPath<TTreeItem>>,
            required: true,
        },
    },
    setup() {
        return () => h('div');
    },
});

function createItems(): TTreeItem[] {
    return [
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: '91064cef', parent: 1, label: 'Айтем 2' },
        { id: 7, parent: 4, label: 'Айтем 7' },
        { id: 4, parent: '91064cef', label: 'Айтем 4' },
    ];
}

type TCellParams = {
    data?: TTreeItem;
    node?: { rowIndex: number | null };
};

function getCellValue(column: ColDef<TTreeItem>, params: TCellParams): unknown {
    const { valueGetter } = column;

    if (typeof valueGetter !== 'function') {
        throw new Error(`Column ${column.headerName} has no value getter`);
    }

    return valueGetter(params as ValueGetterParams<TTreeItem>);
}

function mountTable() {
    const items = createItems();
    const wrapper = mount(TreeTable, {
        props: {
            items,
            treeStore: new TreeStore(items),
        },
        global: {
            stubs: {
                AgGridVue: AgGridVueStub,
            },
        },
    });

    return { items, grid: wrapper.findComponent(AgGridVueStub) };
}

describe('TreeTable', () => {
    it('passes tree data and three columns to the grid', () => {
        const { items, grid } = mountTable();

        expect(grid.props('treeData')).toBe(true);
        expect(grid.props('rowData')).toEqual(items);
        expect(grid.props('columnDefs').map((column) => column.headerName)).toEqual([
            '№ п/п',
            'Категория',
            'Наименование',
        ]);
    });

    it('shows the visible row number, category and label', () => {
        const { items, grid } = mountTable();
        const [numberColumn, categoryColumn, labelColumn] = grid.props('columnDefs');
        const [group, , element] = items;

        expect(getCellValue(numberColumn, { node: { rowIndex: 0 } })).toBe(1);
        expect(getCellValue(numberColumn, { node: { rowIndex: 4 } })).toBe(5);
        expect(getCellValue(categoryColumn, { data: group })).toBe('Группа');
        expect(getCellValue(categoryColumn, { data: element })).toBe('Элемент');
        expect(getCellValue(labelColumn, { data: group })).toBe('Айтем 1');
    });

    it('builds the tree path from the root to the item', () => {
        const { items, grid } = mountTable();

        expect(grid.props('getDataPath')(items[2])).toEqual(['n:1', 's:91064cef', 'n:4', 'n:7']);
    });
});
