<script setup lang="ts">
import { ref } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/Sidebar.vue'
import DepartmentView from './components/DepartmentView.vue'

const currentCompany = ref('CyberHawk')
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-background">
    <TopBar v-model:company="currentCompany" />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 overflow-y-auto">
        <DepartmentView />
      </main>
    </div>
  </div>
</template>
