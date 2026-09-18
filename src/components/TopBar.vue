<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  company: string
}>()

const emit = defineEmits<{
  (e: 'update:company', val: string): void
}>()

const companies = ['CyberHawk', 'SuperTech']

function switchCompany(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:company', target.value)
}
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-sm">
    <div class="flex items-center gap-4">
      <div class="flex items-center justify-center font-bold text-xl text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        HR Portal
      </div>
    </div>
    
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <img v-if="props.company === 'CyberHawk'" :src="'/CYBERHAWK.png'" alt="CyberHawk" class="h-6 object-contain" />
        <img v-if="props.company === 'SuperTech'" :src="'/SuperTech.png'" alt="SuperTech" class="h-6 object-contain" />
        <select :value="props.company" @change="switchCompany" class="text-sm bg-accent border border-border text-foreground rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
          <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      
      <div class="flex items-center gap-3 border-l border-border pl-6">
         <div class="text-right hidden md:block">
            <p class="text-sm font-semibold text-foreground">Joshep Tony Rozario</p>
            <p class="text-xs text-green-500 font-medium">Available for work</p>
         </div>
         <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" class="w-10 h-10 rounded-full border border-border" />
      </div>
    </div>
  </header>
</template>
