<script setup lang="ts">
    import type { TTreeItem } from './types/tree';
    import { TreeStore } from './store/TreeStore';
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
    <div></div>
</template>
