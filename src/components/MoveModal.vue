<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchCompanyWorkers } from '../services/api'

const props = defineProps<{
  isOpen: boolean
  companyCode: string
  documentCount: number
}>()

const emit = defineEmits(['close', 'move'])

interface Employee {
  employeeCode: string
  name: string
  department: string
}

const employees = ref<Employee[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const selectedEmployee = ref<Employee | null>(null)

// NSP Assignment State
const assignmentType = ref('employee')
const nspYear = ref(new Date().getFullYear().toString())

watch(() => props.isOpen, async (open) => {
  if (open && props.companyCode) {
    isLoading.value = true
    searchQuery.value = ''
    selectedEmployee.value = null
    assignmentType.value = 'employee'
    try {
      employees.value = await fetchCompanyWorkers(props.companyCode)
    } catch (e) {
      console.error('Failed to fetch workers', e)
    } finally {
      isLoading.value = false
    }
  }
})

// Simple client-side search
function getFilteredEmployees() {
  if (!searchQuery.value) return employees.value.slice(0, 50) // Show top 50 default to prevent lag
  const lower = searchQuery.value.toLowerCase()
  return employees.value.filter(e => 
    e.name?.toLowerCase().includes(lower) || 
    e.employeeCode?.toLowerCase().includes(lower) ||
    e.department?.toLowerCase().includes(lower)
  ).slice(0, 50)
}

function handleMove() {
  if (assignmentType.value === 'employee' && selectedEmployee.value) {
    emit('move', selectedEmployee.value)
  } else if (assignmentType.value === 'nsp') {
    emit('move', { 
      employeeCode: `NSP-${nspYear.value}`, 
      name: `National Service Personnel (${nspYear.value})`, 
      department: '' 
    })
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[85vh]">
      <div class="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 class="text-lg font-bold text-foreground">Move {{ documentCount }} Document(s)</h3>
        <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-6 flex-1 flex flex-col overflow-hidden">
        <p class="text-sm text-muted-foreground mb-4">
          Select an employee or special folder to assign these documents to.
        </p>

        <!-- Assignment Toggle -->
        <div class="flex gap-6 mb-4 p-3 bg-accent/50 rounded-lg border border-border">
          <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
            <input type="radio" v-model="assignmentType" value="employee" class="text-primary focus:ring-primary border-border" />
            Standard Employee
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
            <input type="radio" v-model="assignmentType" value="nsp" class="text-primary focus:ring-primary border-border" />
            National Service Personnel
          </label>
        </div>

        <template v-if="assignmentType === 'employee'">
          <!-- Search input -->
          <div class="relative mb-4">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search employees by name, ecode, or department..." 
              class="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
            />
          </div>

          <div v-if="isLoading" class="py-12 text-center text-sm text-muted-foreground">
            Loading employees...
          </div>

          <!-- Employee List -->
          <div v-else class="flex-1 overflow-y-auto border border-border rounded-md">
            <ul class="divide-y divide-border">
              <li v-if="getFilteredEmployees().length === 0" class="p-4 text-center text-sm text-muted-foreground">
                No employees found.
              </li>
              <li 
                v-for="emp in getFilteredEmployees()" 
                :key="emp.employeeCode"
                @click="selectedEmployee = emp"
                :class="['p-3 cursor-pointer hover:bg-accent transition-colors flex justify-between items-center', selectedEmployee?.employeeCode === emp.employeeCode ? 'bg-primary/10' : '']"
              >
                <div>
                  <div class="text-sm font-semibold text-foreground">{{ emp.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ emp.employeeCode }} · {{ emp.department }}</div>
                </div>
                <div v-if="selectedEmployee?.employeeCode === emp.employeeCode" class="text-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </li>
            </ul>
          </div>
        </template>
        
        <template v-else>
          <!-- NSP Form -->
          <div class="flex-1 flex flex-col pt-4">
            <label class="block text-sm font-medium text-foreground mb-1.5">Select Service Year</label>
            <select v-model="nspYear" class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary">
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </template>
      </div>
      
      <div class="px-6 py-4 border-t border-border bg-accent/30 flex justify-end gap-3 shrink-0">
        <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
        <button 
          @click="handleMove" 
          :disabled="assignmentType === 'employee' && !selectedEmployee" 
          class="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Move Documents
        </button>
      </div>
    </div>
  </div>
</template>
