import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RenderApiModule,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { createApp } from 'vue';
import App from '@/App.vue';
import '@/styles/reset.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CellStyleModule,
    RenderApiModule,
    TreeDataModule,
]);

createApp(App).mount('#app');
