import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import { createApp } from 'vue'
import './styles/reset.css'
import App from './App.vue'

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])

createApp(App).mount('#app')
