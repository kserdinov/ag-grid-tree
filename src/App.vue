<script setup lang="ts">
    import type { TTreeItem } from './types/tree';
    import { TreeStore } from './store/TreeStore';
    import TreeTable from './components/TreeTable.vue';
    import { onMounted, ref } from 'vue';

    const LOAD_DELAY_MS = 2000;

    const treeStore = new TreeStore([]);
    const items = ref<TTreeItem[]>([]);

    async function loadItems() {
        await new Promise<void>((resolve) => {
            setTimeout(resolve, LOAD_DELAY_MS);
        });

        const response = await fetch('/items.json');
        const data: TTreeItem[] = await response.json();

        treeStore.setItems(data);
        items.value = treeStore.getAll();
    }

    onMounted(() => {
        loadItems();
    });
</script>

<template>
    <div :class="$style.App">
        <TreeTable
            :items="items"
            :tree-store="treeStore"
        />
    </div>
</template>

<style module>
    :global(html),
    :global(body),
    :global(#app) {
        height: 100%;
    }

    .App {
        height: 100%;
        padding: 16px;
        box-sizing: border-box;
    }
</style>
