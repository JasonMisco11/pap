<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  employeeName?: string
  employeeCode?: string
}>()

const emit = defineEmits(['close', 'upload'])

const file = ref<File | null>(null)
const title = ref('')
const isUploading = ref(false)

// NSP Assignment State
const isNSP = ref(false)
const nspYear = ref(new Date().getFullYear().toString())

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
    if (!title.value) {
      title.value = file.value.name.replace(/\.[^/.]+$/, "")
    }
  }
}

async function handleUpload() {
  if (!file.value) return
  isUploading.value = true
  try {
    let finalTitle = title.value
    
    // Prefix title based on assignment
    if (props.employeeCode) {
      finalTitle = `[${props.employeeCode}] ${title.value}`
    } else if (isNSP.value) {
      finalTitle = `[NSP-${nspYear.value}] ${title.value}`
    }
      
    emit('upload', { file: file.value, title: finalTitle })
    
    // reset
    file.value = null
    title.value = ''
    isNSP.value = false
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden">
      <div class="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 class="text-lg font-bold text-foreground">Upload Document</h3>
        <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-6 space-y-5">
        
        <!-- Target Info -->
        <div v-if="employeeName" class="bg-primary/10 text-primary border border-primary/20 p-3 rounded-lg text-sm flex items-center gap-3">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            Uploading to employee: <span class="font-bold">{{ employeeName }}</span> ({{ employeeCode }})
          </div>
        </div>
        
        <!-- NSP Toggle (Only if no employee is selected) -->
        <div v-else class="bg-accent/50 p-4 rounded-lg border border-border space-y-3">
          <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
            <input type="checkbox" v-model="isNSP" class="rounded border-border text-primary focus:ring-primary" />
            Assign to National Service Personnel (NSP)
          </label>
          
          <div v-if="isNSP" class="pl-6 animate-in slide-in-from-top-2 duration-200">
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">Select Service Year</label>
            <select v-model="nspYear" class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary">
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Document Title</label>
          <input v-model="title" type="text" class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Enter document title" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">File</label>
          <div class="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
            <input type="file" @change="handleFileChange" class="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
          </div>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-border bg-accent/30 flex justify-end gap-3">
        <button @click="emit('close')" :disabled="isUploading" class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">Cancel</button>
        <button @click="handleUpload" :disabled="!file || isUploading" class="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          <svg v-if="isUploading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>
    </div>
  </div>
</template>
