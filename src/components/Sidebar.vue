<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchDepartments, fetchDocuments } from '../services/api'

const props = defineProps<{
  activeView: string
  companyCode: string
}>()

const emit = defineEmits<{
  (e: 'update:activeView', val: string): void
}>()

const departments = ref<string[]>([])
const isLoading = ref(false)
const recentDocs = ref<any[]>([])
const isCollapsed = ref(false)

async function loadDepartments(code: string) {
  if (!code) return
  isLoading.value = true
  try {
    const data = await fetchDepartments(code)
    departments.value = data.map((d: any) => d.department)
    // Auto-select first department if current view is not in the new list
    if (departments.value.length > 0 && !departments.value.includes(props.activeView) && !['My Documents', 'Recent documents', 'Shared with me'].includes(props.activeView)) {
      emit('update:activeView', departments.value[0])
    }
  } catch (err) {
    console.error('Failed to load departments:', err)
    departments.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadRecentActivity() {
  try {
    const data = await fetchDocuments('', 1)
    // Get the first 3 most recent documents
    recentDocs.value = data.results.slice(0, 3)
  } catch (err) {
    console.error('Failed to load recent activity', err)
  }
}

onMounted(() => {
  loadDepartments(props.companyCode)
  loadRecentActivity()
})

watch(() => props.companyCode, (newCode) => {
  loadDepartments(newCode)
})

function select(item: string) {
  emit('update:activeView', item)
}
</script>

<template>
  <aside :class="['border-r border-border bg-sidebar flex flex-col hidden md:flex transition-all duration-300 relative', isCollapsed ? 'w-20' : 'w-64']">
    
    <!-- Sidebar Header & Toggle -->
    <div class="p-4 border-b border-border flex items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
      <span v-if="!isCollapsed" class="font-bold text-sm text-foreground tracking-wide uppercase">Menu</span>
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
        :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <svg v-if="!isCollapsed" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
      </button>
    </div>

    <div class="p-4 border-b border-border">
      <ul class="space-y-1">
        <li>
          <button @click="select('My Documents')" :class="['w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors', props.activeView === 'My Documents' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground', isCollapsed ? 'justify-center' : '']" :title="isCollapsed ? 'My Documents' : ''">
            <svg :class="['w-5 h-5 shrink-0', isCollapsed ? '' : 'mr-3']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            <span v-if="!isCollapsed" class="truncate">My Documents</span>
          </button>
        </li>
        <li>
          <button @click="select('Recent documents')" :class="['w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors', props.activeView === 'Recent documents' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground', isCollapsed ? 'justify-center' : '']" :title="isCollapsed ? 'Recent documents' : ''">
             <svg :class="['w-5 h-5 shrink-0', isCollapsed ? '' : 'mr-3']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span v-if="!isCollapsed" class="truncate">Recent documents</span>
          </button>
        </li>
        <li>
          <button @click="select('Shared with me')" :class="['w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors', props.activeView === 'Shared with me' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground', isCollapsed ? 'justify-center' : '']" :title="isCollapsed ? 'Shared with me' : ''">
            <svg :class="['w-5 h-5 shrink-0', isCollapsed ? '' : 'mr-3']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span v-if="!isCollapsed" class="truncate">Shared with me</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="p-4 flex-1 overflow-y-auto overflow-x-hidden">
      <h3 v-if="!isCollapsed" class="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Department</h3>
      <h3 v-else class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center" title="By Department">DEPTS</h3>
      
      <div v-if="isLoading" class="px-3 py-4 text-sm text-muted-foreground text-center">
        <svg v-if="isCollapsed" class="animate-spin w-5 h-5 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span v-else>Loading...</span>
      </div>
      
      <ul v-else class="space-y-1">
        <li v-for="dept in departments" :key="dept">
          <button 
            @click="select(dept)"
            :class="['flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors', props.activeView === dept ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground', isCollapsed ? 'justify-center' : '']"
            :title="isCollapsed ? dept : ''"
          >
            <!-- Generic Folder Icon for departments when collapsed -->
            <svg v-if="isCollapsed" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            <span v-else class="truncate text-xs">{{ dept }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div v-if="!isCollapsed" class="p-4 mt-auto">
      <div class="bg-accent rounded-lg p-4">
         <h4 class="text-sm font-semibold text-foreground mb-3">Recent Activity</h4>
         <div v-if="recentDocs.length > 0" class="space-y-3 mb-4">
           <div v-for="doc in recentDocs" :key="doc.id" class="flex items-start gap-2 overflow-hidden">
             <svg class="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             <p class="text-xs text-muted-foreground truncate" :title="doc.title">{{ doc.title }}</p>
           </div>
         </div>
         <p v-else class="text-xs text-muted-foreground mb-3">No recent uploads</p>
         <button @click="select('Recent documents')" class="w-full bg-primary hover:bg-primary/90 transition-colors text-primary-foreground text-xs font-semibold py-2 rounded-md">View All</button>
      </div>
    </div>
  </aside>
</template>
