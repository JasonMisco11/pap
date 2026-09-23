<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchDocuments, fetchDepartmentWorkers, uploadDocument, updateDocumentTitle, deleteDocument } from '../services/api'
import UploadModal from './UploadModal.vue'
import MoveModal from './MoveModal.vue'
import PreviewModal from './PreviewModal.vue'

interface Employee {
  ecode?: string
  employeeCode?: string // From CompanyWorkers API
  name: string
  company: string
  department: string
  hireDate: string
  leavebalance?: number
}

const props = defineProps<{
  searchQuery?: string
  activeView: string
  companyCode: string
  selectedEmployeeEcode?: string
}>()

const emit = defineEmits(['update:selectedEmployeeEcode'])

const employees = ref<Employee[]>([])
const recentDocs = ref<any[]>([])
const isLoading = ref(true)
const isLoadingEmployees = ref(true)
const _selectedEmployee = ref<Employee | null>(null)

// Computed property to sync employee selection with parent hash router
import { computed } from 'vue'

const selectedEmployee = computed({
  get() {
    if (props.selectedEmployeeEcode) {
      if (props.selectedEmployeeEcode.startsWith('NSP-')) {
        const year = props.selectedEmployeeEcode.split('-')[1]
        return {
          ecode: props.selectedEmployeeEcode,
          name: `National Service Personnel (${year})`,
          department: props.activeView,
          company: props.companyCode,
          hireDate: ''
        }
      }
      
      // Try to find the full employee object from the loaded list
      const emp = employees.value.find(e => e.ecode === props.selectedEmployeeEcode || e.employeeCode === props.selectedEmployeeEcode)
      if (emp) return emp
      
      // If we jumped straight to a URL and haven't loaded the employee list yet, return a mock object for UI rendering
      return _selectedEmployee.value || {
        ecode: props.selectedEmployeeEcode,
        name: props.selectedEmployeeEcode,
        department: props.activeView,
        company: props.companyCode,
        hireDate: ''
      }
    }
    return null
  },
  set(val: Employee | null) {
    _selectedEmployee.value = val
    emit('update:selectedEmployeeEcode', val ? (val.ecode || val.employeeCode) : '')
  }
})

const isUploadModalOpen = ref(false)
const isMoveModalOpen = ref(false)
const isMoving = ref(false)
const isDeleting = ref(false)
const previewDocId = ref<number | null>(null)
const previewDocName = ref('')
const activeDropdown = ref<number | null>(null)
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => toastMessage.value = '', 3000)
}

// Folder color palette - user requested a uniform yellow
const folderColors = [
  'text-yellow-400'
]
function getColor(index: number) {
  return folderColors[index % folderColors.length]
}

async function onUploadDocument({ file, title }: { file: File, title: string }) {
  try {
    await uploadDocument(file, title)
    isUploadModalOpen.value = false
    showToast('Document uploaded successfully')
    
    // Refresh document list after successful upload
    if (selectedEmployee.value) {
      const query = selectedEmployee.value.ecode || selectedEmployee.value.employeeCode || selectedEmployee.value.name
      loadDocuments(query, currentPage.value)
    } else {
      loadDocuments(props.searchQuery, currentPage.value)
    }
  } catch (err) {
    console.error('Upload failed:', err)
    showToast('Failed to upload document.')
  }
}

async function onMoveDocuments(emp: Employee) {
  isMoving.value = true
  try {
    const ecode = emp.ecode || emp.employeeCode
    
    // For every selected document, prepend the new ecode (replacing any old ecode)
    const promises = selectedDocs.value.map(id => {
      const doc = recentDocs.value.find(d => d.id === id)
      if (doc) {
        // Strip any existing [prefix]
        const cleanName = doc.name.replace(/^\[.*?\]\s*/, '')
        const newTitle = `[${ecode}] ${cleanName}`
        return updateDocumentTitle(id, newTitle)
      }
    })
    
    await Promise.all(promises)
    
    isMoveModalOpen.value = false
    showToast(`Successfully moved ${selectedDocs.value.length} document(s) to ${emp.name}`)
    selectedDocs.value = [] // clear selection
    
    // Refresh the view
    if (selectedEmployee.value) {
      const query = selectedEmployee.value.ecode || selectedEmployee.value.employeeCode || selectedEmployee.value.name
      loadDocuments(query, currentPage.value)
    } else {
      loadDocuments(props.searchQuery, currentPage.value)
    }
    
  } catch (err) {
    console.error('Failed to move documents:', err)
    showToast('Failed to move some documents.')
  } finally {
    isMoving.value = false
  }
}

async function onDeleteDocuments() {
  if (!confirm(`Are you sure you want to delete ${selectedDocs.value.length} document(s)? This action cannot be undone.`)) return
  
  isDeleting.value = true
  try {
    const promises = selectedDocs.value.map(id => deleteDocument(id))
    await Promise.all(promises)
    
    showToast(`Successfully deleted ${selectedDocs.value.length} document(s)`)
    selectedDocs.value = [] // clear selection
    
    // Refresh the view
    if (selectedEmployee.value) {
      const query = selectedEmployee.value.ecode || selectedEmployee.value.employeeCode || selectedEmployee.value.name
      loadDocuments(query, currentPage.value)
    } else {
      loadDocuments(props.searchQuery, currentPage.value)
    }
  } catch (err) {
    console.error('Failed to delete documents:', err)
    showToast('Failed to delete some documents.')
  } finally {
    isDeleting.value = false
  }
}

async function loadEmployees(department: string) {
  isLoadingEmployees.value = true
  selectedEmployee.value = null
  try {
    const data = await fetchDepartmentWorkers(department)
    employees.value = data
  } catch (err) {
    console.error('Failed to load employees:', err)
    employees.value = []
  } finally {
    isLoadingEmployees.value = false
  }
}

const currentPage = ref(1)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)
const totalDocuments = ref(0)

async function loadDocuments(query = '', page = 1) {
  isLoading.value = true
  selectedDocs.value = [] // Clear selection when loading new docs
  try {
    const data = await fetchDocuments(query, page)
    
    currentPage.value = page
    hasNextPage.value = !!data.next
    hasPrevPage.value = !!data.previous
    totalDocuments.value = data.count || 0

    recentDocs.value = data.results.map((doc: any) => ({
      id: doc.id,
      name: doc.title,
      type: doc.document_type ? 'Document' : 'File',
      status: 'Valid',
      statusColor: 'text-green-600 bg-green-100',
      date: new Date(doc.modified).toLocaleDateString()
    }))
  } catch (error) {
    console.error('Failed to load documents:', error)
  } finally {
    isLoading.value = false
  }
}

function openEmployeeFolder(emp: Employee) {
  selectedEmployee.value = emp
  currentPage.value = 1
  const query = emp.ecode || emp.employeeCode || emp.name
  loadDocuments(query, 1)
}

function goBackToDepartment() {
  selectedEmployee.value = null
  currentPage.value = 1
  loadDocuments('', 1)
}

function changePage(direction: 'next' | 'prev') {
  if (direction === 'next' && hasNextPage.value) {
    const nextPage = currentPage.value + 1
    if (selectedEmployee.value) {
      const query = selectedEmployee.value.ecode || selectedEmployee.value.employeeCode || selectedEmployee.value.name
      loadDocuments(query, nextPage)
    } else {
      loadDocuments('', nextPage)
    }
  } else if (direction === 'prev' && hasPrevPage.value) {
    const prevPage = currentPage.value - 1
    if (selectedEmployee.value) {
      const query = selectedEmployee.value.ecode || selectedEmployee.value.employeeCode || selectedEmployee.value.name
      loadDocuments(query, prevPage)
    } else {
      loadDocuments('', prevPage)
    }
  }
}

onMounted(() => {
  currentPage.value = 1
  loadDocuments('', 1)
  if (props.activeView && !['My Documents', 'Recent documents', 'Shared with me'].includes(props.activeView)) {
    loadEmployees(props.activeView)
  }
  window.addEventListener('global-search', (e: any) => {
    currentPage.value = 1
    loadDocuments(e.detail, 1)
  })
})

watch(() => props.activeView, (newView) => {
  selectedEmployee.value = null
  currentPage.value = 1
  if (['My Documents', 'Recent documents', 'Shared with me'].includes(newView)) {
    employees.value = []
    loadDocuments('', 1)
  } else {
    loadEmployees(newView)
    loadDocuments('', 1)
  }
})

watch(() => props.selectedEmployeeEcode, (newEcode) => {
  if (newEcode) {
    currentPage.value = 1
    const query = newEcode
    loadDocuments(query, 1)
  } else if (!newEcode && selectedEmployee.value === null) {
    // We went back to department view
    currentPage.value = 1
    loadDocuments('', 1)
  }
})

const selectedDocs = ref<number[]>([])

function toggleDoc(id: number) {
  if (selectedDocs.value.includes(id)) {
    selectedDocs.value = selectedDocs.value.filter(d => d !== id)
  } else {
    selectedDocs.value.push(id)
  }
}
function openPreview(doc: any) {
  previewDocId.value = doc.id
  previewDocName.value = doc.name
}
</script>

<template>
  <div class="flex flex-col h-full bg-background p-6 lg:p-8 relative">
    
    <!-- Stats Header -->
    <div class="flex justify-between items-center bg-card rounded-xl border border-border p-6 shadow-sm mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-lg uppercase">
          {{ selectedEmployee ? selectedEmployee.name.substring(0, 2) : props.activeView.substring(0, 3) }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-foreground">
            {{ selectedEmployee ? selectedEmployee.name : props.activeView }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ selectedEmployee ? `${selectedEmployee.department} · ${selectedEmployee.ecode || selectedEmployee.employeeCode}` : 'Department' }}
          </p>
        </div>
      </div>
      <div class="flex gap-8 text-center divide-x divide-border">
        <div class="px-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Employees</p>
          <p class="text-2xl font-bold text-blue-600">{{ employees.length }}</p>
        </div>
        <div class="px-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Documents</p>
          <p class="text-2xl font-bold text-foreground">{{ recentDocs.length }}</p>
        </div>
      </div>
    </div>

    <!-- Breadcrumb when inside an employee folder -->
    <div v-if="selectedEmployee" class="flex items-center gap-2 mb-6 text-sm">
      <button @click="goBackToDepartment" class="text-primary hover:underline font-medium">
        {{ props.activeView }}
      </button>
      <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      <span class="text-foreground font-semibold">{{ selectedEmployee.name }}</span>
    </div>

    <!-- Employee Folders (show when viewing a department, not drilled into an employee) -->
    <template v-if="!selectedEmployee && !['My Documents', 'Recent documents', 'Shared with me'].includes(props.activeView)">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-foreground">Employees</h3>
      </div>

      <div v-if="isLoadingEmployees" class="text-center py-12 text-muted-foreground">
        Loading employees...
      </div>

      <div v-else-if="employees.length === 0" class="text-center py-12 text-muted-foreground">
        No employees found in this department.
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        <div 
          v-for="(emp, index) in employees" 
          :key="emp.ecode" 
          @click="openEmployeeFolder(emp)"
          class="group cursor-pointer flex flex-col items-center"
        >
          <!-- Folder Icon SVG -->
          <div class="relative w-24 h-20 mb-3 transition-transform group-hover:scale-105 group-hover:-translate-y-1">
            <svg viewBox="0 0 100 80" class="w-full h-full drop-shadow-md">
              <!-- Back flap / Main body -->
              <path :class="getColor(index)" d="M5,15 L35,15 L45,25 L95,25 C97.76,25 100,27.24 100,30 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,20 C0,17.24 2.24,15 5,15 Z" fill="currentColor"/>
              <!-- White Document inside (drawn BEFORE front flap so it tucks inside) -->
              <rect x="15" y="15" width="70" height="50" rx="2" fill="white" class="opacity-90 transition-transform group-hover:-translate-y-4" />
              <!-- Front flap -->
              <path class="text-white opacity-20" d="M0,35 L100,35 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,35 Z" fill="currentColor"/>
              <!-- Folder crease / shadow overlay on front flap -->
              <path class="text-black opacity-10" d="M0,35 L100,35 L100,40 L0,40 Z" fill="currentColor"/>
            </svg>
          </div>
          <h4 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center capitalize">
            {{ emp.name.toLowerCase() }}
          </h4>
          <p class="text-xs text-muted-foreground">{{ emp.ecode }}</p>
        </div>
      </div>
      
      <!-- Special Folders Grid (NSP) -->
      <div class="flex justify-between items-center mb-6 mt-8">
        <h3 class="text-lg font-bold text-foreground">Special Folders</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        <div 
          v-for="year in ['2024', '2025', '2026']" 
          :key="year" 
          @click="openEmployeeFolder({ ecode: `NSP-${year}`, name: `National Service Personnel (${year})`, company: props.companyCode, department: props.activeView, hireDate: '' })"
          class="group cursor-pointer flex flex-col items-center"
        >
          <!-- Special Folder Icon SVG (Gray) -->
          <div class="relative w-24 h-20 mb-3 transition-transform group-hover:scale-105 group-hover:-translate-y-1">
            <svg viewBox="0 0 100 80" class="w-full h-full drop-shadow-md text-slate-400">
              <path class="text-slate-400" d="M5,15 L35,15 L45,25 L95,25 C97.76,25 100,27.24 100,30 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,20 C0,17.24 2.24,15 5,15 Z" fill="currentColor"/>
              <rect x="15" y="15" width="70" height="50" rx="2" fill="white" class="opacity-90 transition-transform group-hover:-translate-y-4" />
              <path class="text-white opacity-20" d="M0,35 L100,35 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,35 Z" fill="currentColor"/>
              <path class="text-black opacity-10" d="M0,35 L100,35 L100,40 L0,40 Z" fill="currentColor"/>
            </svg>
          </div>
          <h4 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center">
            NSP {{ year }}
          </h4>
          <p class="text-xs text-muted-foreground">National Service Personnel</p>
        </div>
      </div>
    </template>

    <!-- Documents Table (Hide in Department View unless a global view) -->
    <template v-if="selectedEmployee || ['My Documents', 'Recent documents', 'Shared with me'].includes(props.activeView)">
      <div class="flex justify-between items-center mb-4 mt-4">
        <h3 class="text-lg font-bold text-foreground">
          {{ selectedEmployee ? `${selectedEmployee.name}'s Documents` : 'Recent Documents' }}
        </h3>
      <button 
        @click="isUploadModalOpen = true" 
        class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        Upload Document
      </button>
    </div>

    <!-- Upload Modal -->
    <UploadModal 
      :isOpen="isUploadModalOpen" 
      :employeeName="selectedEmployee?.name"
      :employeeCode="selectedEmployee?.ecode"
      @close="isUploadModalOpen = false" 
      @upload="onUploadDocument" 
    />

    <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
      Loading documents...
    </div>

    <div v-else class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1">
       <table class="w-full text-left text-sm">
         <thead class="bg-accent border-b border-border text-muted-foreground">
           <tr>
             <th class="px-4 py-3 w-12 text-center">
               <input type="checkbox" class="rounded border-border text-primary focus:ring-primary" />
             </th>
             <th class="px-4 py-3 font-semibold">Name</th>
             <th class="px-4 py-3 font-semibold">Type</th>
             <th class="px-4 py-3 font-semibold">Status</th>
             <th class="px-4 py-3 font-semibold">Last Modified</th>
             <th class="px-4 py-3 text-right font-semibold">Actions</th>
           </tr>
         </thead>
         <tbody class="divide-y divide-border">
           <tr v-if="recentDocs.length === 0">
             <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
               No documents found.
             </td>
           </tr>
           <tr v-for="doc in recentDocs" :key="doc.id" :class="['hover:bg-accent transition-colors', selectedDocs.includes(doc.id) ? 'bg-primary/5' : '']">
             <td class="px-4 py-3 text-center">
               <input type="checkbox" :checked="selectedDocs.includes(doc.id)" @change="toggleDoc(doc.id)" class="rounded border-border text-primary focus:ring-primary" />
             </td>
             <td class="px-4 py-3 flex items-center gap-3 cursor-pointer group" @click="openPreview(doc)">
               <svg class="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
               <span class="font-medium text-foreground group-hover:text-primary group-hover:underline transition-colors">{{ doc.name }}</span>
             </td>
             <td class="px-4 py-3 text-muted-foreground">{{ doc.type }}</td>
             <td class="px-4 py-3">
               <span :class="['px-2.5 py-1 text-xs font-semibold rounded-full border border-white/20', doc.statusColor]">{{ doc.status }}</span>
             </td>
             <td class="px-4 py-3 text-muted-foreground">{{ doc.date }}</td>
             <td class="px-4 py-3 text-right">
               <button @click="openPreview(doc)" class="text-muted-foreground hover:text-primary transition-colors mr-3" title="Preview">
                 <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
               </button>
               <div class="relative inline-block text-left">
                 <button @click.stop="activeDropdown = activeDropdown === doc.id ? null : doc.id" class="text-muted-foreground hover:text-foreground">
                   <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                 </button>
                 <div v-if="activeDropdown === doc.id">
                   <div @click="activeDropdown = null" class="fixed inset-0 z-40"></div>
                   <div class="absolute right-0 mt-2 w-36 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
                     <button @click.stop="selectedDocs = [doc.id]; isMoveModalOpen = true; activeDropdown = null" class="w-full text-left px-4 py-2 text-sm hover:bg-accent text-foreground flex items-center gap-2 transition-colors">
                       <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                       Move to
                     </button>
                     <button @click.stop="selectedDocs = [doc.id]; onDeleteDocuments(); activeDropdown = null" class="w-full text-left px-4 py-2 text-sm hover:bg-accent text-red-600 flex items-center gap-2 transition-colors">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       Delete
                     </button>
                   </div>
                 </div>
               </div>
             </td>
           </tr>
         </tbody>
       </table>
       
       <!-- Pagination Footer -->
       <div v-if="!isLoading && (hasNextPage || hasPrevPage)" class="flex justify-between items-center px-4 py-3 border-t border-border bg-accent/30">
         <div class="text-sm text-muted-foreground">
           Showing page <span class="font-medium text-foreground">{{ currentPage }}</span> 
           <span v-if="totalDocuments > 0">of <span class="font-medium text-foreground">{{ Math.ceil(totalDocuments / 25) }}</span> ({{ totalDocuments }} total documents)</span>
         </div>
         <div class="flex gap-2">
           <button 
             @click="changePage('prev')" 
             :disabled="!hasPrevPage"
             class="px-3 py-1 text-sm font-medium border border-border rounded-md bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             Previous
           </button>
           <button 
             @click="changePage('next')" 
             :disabled="!hasNextPage"
             class="px-3 py-1 text-sm font-medium border border-border rounded-md bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             Next
           </button>
         </div>
       </div>
    </div>
    </template>

    <!-- Floating Action Bar -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 translate-y-10"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-10"
    >
      <div v-if="selectedDocs.length > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl border border-gray-700 z-40">
        <span class="text-sm font-medium bg-gray-800 px-3 py-1 rounded-full">{{ selectedDocs.length }} selected</span>
        <button 
          @click="isMoveModalOpen = true"
          :disabled="isMoving"
          class="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium disabled:opacity-50"
        >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
           {{ isMoving ? 'Moving...' : 'Move to' }}
        </button>
        <button 
          @click="onDeleteDocuments"
          :disabled="isDeleting"
          class="flex items-center gap-2 hover:text-red-400 transition-colors text-sm font-medium disabled:opacity-50"
        >
           <svg v-if="isDeleting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
           {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </Transition>

    <!-- Move Modal -->
    <MoveModal
      :isOpen="isMoveModalOpen"
      :companyCode="props.companyCode"
      :documentCount="selectedDocs.length"
      @close="isMoveModalOpen = false"
      @move="onMoveDocuments"
    />

    <!-- Preview Modal -->
    <PreviewModal
      :isOpen="previewDocId !== null"
      :documentId="previewDocId"
      :documentName="previewDocName"
      @close="previewDocId = null"
    />

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div v-if="toastMessage" class="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>

  </div>
</template>
