<script setup lang="ts">
import { ref } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/Sidebar.vue'
import DepartmentView from './components/DepartmentView.vue'

const currentCompanyCode = ref('it') // Default to SuperTech
const globalSearchQuery = ref('')
const currentView = ref('') // Will be auto-set by Sidebar after loading departments
const currentEmployee = ref('') // Ecode of the selected employee

// Router Logic using URL hash
function syncToHash() {
  const params = new URLSearchParams()
  if (currentCompanyCode.value) params.set('company', currentCompanyCode.value)
  if (currentView.value) params.set('view', currentView.value)
  if (currentEmployee.value) params.set('employee', currentEmployee.value)
  if (globalSearchQuery.value) params.set('search', globalSearchQuery.value)
  
  const newHash = '#' + params.toString()
  if (window.location.hash !== newHash) {
    // Only push state if we actually have data, otherwise just replace to avoid empty history
    window.history.pushState(null, '', newHash)
  }
}

function syncFromHash() {
  if (!window.location.hash || window.location.hash === '#') return
  
  const params = new URLSearchParams(window.location.hash.substring(1))
  const newCompany = params.get('company')
  const newView = params.get('view')
  const newEmployee = params.get('employee') || ''
  const newSearch = params.get('search') || ''
  
  if (newCompany && newCompany !== currentCompanyCode.value) currentCompanyCode.value = newCompany
  if (newView && newView !== currentView.value) currentView.value = newView
  if (newEmployee !== currentEmployee.value) currentEmployee.value = newEmployee
  if (newSearch !== globalSearchQuery.value) globalSearchQuery.value = newSearch
}

// Watch state changes and sync to URL
import { watch, onMounted } from 'vue'

watch([currentCompanyCode, currentView, currentEmployee, globalSearchQuery], () => {
  syncToHash()
})

onMounted(() => {
  window.addEventListener('hashchange', syncFromHash)
  syncFromHash() // Initial load
})

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
          v-model:selectedEmployeeEcode="currentEmployee"
        />
      </main>
    </div>
  </div>
</template>
