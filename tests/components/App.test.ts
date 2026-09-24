// @vitest-environment jsdom

import type { TTreeItem } from '@/types/tree';
import { ITEMS_URL, LOAD_DELAY_MS } from '@/constants/app';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App.vue';

const TreeTableStub = defineComponent({
    name: 'TreeTable',
    props: {
        items: {
            type: Array,
            required: true,
        },
        treeStore: {
            type: Object,
            required: true,
        },
    },
    setup() {
        return () => h('div', { 'data-test': 'tree-table' });
    },
});

describe('App', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('shows loading state and renders fetched items after two seconds', async () => {
        const items: TTreeItem[] = [
            { id: 1, parent: null, label: 'Айтем 1' },
            { id: 2, parent: 1, label: 'Айтем 2' },
        ];
        const fetchMock = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(items),
        });
        vi.stubGlobal('fetch', fetchMock);

        const wrapper = mount(App, {
            global: {
                stubs: {
                    TreeTable: TreeTableStub,
                },
            },
        });

        expect(wrapper.text()).toContain('Загрузка данных…');
        expect(wrapper.findComponent(TreeTableStub).exists()).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(LOAD_DELAY_MS - 1);

        expect(fetchMock).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith(ITEMS_URL);
        expect(wrapper.text()).not.toContain('Загрузка данных…');

        const treeTable = wrapper.findComponent(TreeTableStub);

        expect(treeTable.exists()).toBe(true);
        expect(treeTable.props('items')).toEqual(items);
    });
});
