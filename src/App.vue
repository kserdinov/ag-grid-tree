<script setup lang="ts">
    import type { TTreeItem } from '@/types/tree';
    import { ITEMS_URL, LOAD_DELAY_MS } from '@/constants/app';
    import { TreeStore } from '@/store/TreeStore';
    import { onMounted, ref } from 'vue';
    import LoadingState from '@/components/LoadingState.vue';
    import TreeTable from '@/components/TreeTable.vue';

    const treeStore = new TreeStore([]);
    const items = ref<TTreeItem[]>([]);
    const isLoading = ref(true);

    async function loadItems() {
        await new Promise<void>((resolve) => {
            setTimeout(resolve, LOAD_DELAY_MS);
        });

        const response = await fetch(ITEMS_URL);
        const data: TTreeItem[] = await response.json();

        treeStore.setItems(data);
        items.value = treeStore.getAll();
        isLoading.value = false;
    }

    onMounted(() => {
        loadItems();
    });
</script>

<template>
    <div :class="$style.App">
        <LoadingState v-if="isLoading" />
        <TreeTable
            v-else
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
        height: 100dvh;
        padding: 1rem;
        box-sizing: border-box;
    }
</style>
