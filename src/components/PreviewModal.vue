<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { getDocumentPreviewUrl } from '../services/api'

const props = defineProps<{
  isOpen: boolean
  documentId: number | null
  documentName: string
}>()

const emit = defineEmits(['close'])

const previewUrl = ref<string | null>(null)
const isLoading = ref(false)

watch(() => props.isOpen, async (open) => {
  if (open && props.documentId) {
    isLoading.value = true
    try {
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = await getDocumentPreviewUrl(props.documentId)
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  } else {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }
})

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-8">
    <div class="bg-card w-full h-full max-w-6xl rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
      <div class="px-6 py-4 border-b border-border flex justify-between items-center bg-accent/30 shrink-0">
        <h3 class="text-lg font-bold text-foreground truncate pr-4">{{ documentName }}</h3>
        <button @click="emit('close')" class="text-muted-foreground hover:text-foreground bg-background rounded-full p-1.5 border border-border shadow-sm hover:bg-accent transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
        <div v-if="isLoading" class="absolute flex flex-col items-center text-muted-foreground">
          <svg class="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading document...
        </div>
        
        <!-- The ObjectURL technique avoids CORS issues and passes the API auth header smoothly -->
        <iframe 
          v-if="previewUrl && !isLoading" 
          :src="previewUrl" 
          class="w-full h-full border-0 bg-transparent"
          title="Document Preview"
        ></iframe>
      </div>
    </div>
  </div>
</template>
