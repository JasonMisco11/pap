<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCompanies } from '../services/api'

interface Company {
  company: string
  companycode: string
}

const props = defineProps<{
  companyCode: string
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'update:companyCode', val: string): void
  (e: 'update:searchQuery', val: string): void
  (e: 'search'): void
}>()

const companies = ref<Company[]>([])

// Only show CyberHawk & SuperTech
const allowedCodes = ['it', 'CYBH']

onMounted(async () => {
  try {
    const all = await fetchCompanies()
    companies.value = all.filter((c: Company) =>
      allowedCodes.includes(c.companycode)
    )
  } catch (err) {
    console.error('Failed to load companies:', err)
    // Fallback
    companies.value = [
      { company: 'SuperTech Limited', companycode: 'it' },
      { company: 'CyberHawk Limited', companycode: 'CYBH' }
    ]
  }
})

function switchCompany(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:companyCode', target.value)
}

function updateSearch(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

function triggerSearch() {
  emit('search')
}

// Resolve logo based on company code
function getLogo(code: string): string | null {
  if (code === 'CYBH') return '/CYBERHAWK.png'
  if (code === 'it') return '/SuperTech.png'
  return null
}
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-sm">
    <div class="flex items-center gap-4 w-1/4">
      <div class="flex items-center justify-center font-bold text-xl text-primary">
        <img src="/stl-g.jpeg" alt="STL Logo" class="h-8 w-auto mr-2" />
        
      </div>
    </div>
    
    <!-- Global Search -->
    <div class="flex-1 flex justify-center px-8">
      <div class="relative w-full max-w-2xl">
        <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          :value="props.searchQuery"
          @input="updateSearch"
          @keyup.enter="triggerSearch"
          placeholder="Global search documents..." 
          class="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-colors" 
        />
      </div>
    </div>

    <div class="flex items-center gap-6 w-1/4 justify-end">
      <div class="flex items-center gap-3">
        <img v-if="getLogo(props.companyCode)" :src="getLogo(props.companyCode)!" :alt="props.companyCode" class="h-6 object-contain" />
        <select :value="props.companyCode" @change="switchCompany" class="text-sm bg-accent border border-border text-foreground rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
          <option v-for="c in companies" :key="c.companycode" :value="c.companycode">{{ c.company }}</option>
        </select>
      </div>
      
      <div class="flex items-center gap-3 border-l border-border pl-6">
         <div class="text-right hidden md:block">
            <p class="text-sm font-semibold text-foreground">HR</p>
         </div>
         <div class="w-10 h-10 rounded-full border border-border bg-accent flex items-center justify-center text-muted-foreground">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
         </div>
      </div>
    </div>
  </header>
</template>
