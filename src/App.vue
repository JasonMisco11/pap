<script setup lang="ts">
import { ref } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/Sidebar.vue'
import DepartmentView from './components/DepartmentView.vue'

const currentCompanyCode = ref('it') // Default to SuperTech
const globalSearchQuery = ref('')
const currentView = ref('') // Will be auto-set by Sidebar after loading departments

function triggerGlobalSearch() {
  const event = new CustomEvent('global-search', { detail: globalSearchQuery.value })
  window.dispatchEvent(event)
}
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-background">
    <TopBar 
      v-model:companyCode="currentCompanyCode" 
      v-model:searchQuery="globalSearchQuery"
      @search="triggerGlobalSearch"
    />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar 
        v-model:activeView="currentView" 
        :companyCode="currentCompanyCode" 
      />
      <main class="flex-1 overflow-y-auto">
        <DepartmentView 
          :searchQuery="globalSearchQuery" 
          :activeView="currentView" 
          :companyCode="currentCompanyCode"
        />
      </main>
    </div>
  </div>
</template>
