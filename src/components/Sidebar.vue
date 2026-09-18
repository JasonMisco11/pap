<script setup lang="ts">
import { ref } from 'vue'

const activeItem = ref('Engineering')
const departments = ['HR', 'Finance', 'Engineering', 'Sales']

function select(item: string) {
  activeItem.value = item
}
</script>

<template>
  <aside class="w-64 border-r border-border bg-sidebar flex flex-col overflow-y-auto hidden md:flex">
    
    <div class="p-4 border-b border-border">
      <ul class="space-y-1">
        <li>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            My Documents
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Shared with me
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
             <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Recent documents
          </a>
        </li>
      </ul>
    </div>

    <div class="p-4">
      <h3 class="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Department</h3>
      <ul class="space-y-1">
        <li v-for="dept in departments" :key="dept">
          <button 
            @click="select(dept)"
            :class="['flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors', activeItem === dept ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']"
          >
            <svg v-if="activeItem === dept" class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            <svg v-else class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            {{ dept }}
          </button>
        </li>
      </ul>
    </div>

    <div class="p-4 mt-auto">
      <div class="bg-accent rounded-lg p-4">
         <h4 class="text-sm font-semibold text-foreground mb-1">Approvals</h4>
         <p class="text-xs text-muted-foreground mb-3">You have 3 pending approvals</p>
         <button class="w-full bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-md">View Approvals</button>
      </div>
    </div>
  </aside>
</template>
