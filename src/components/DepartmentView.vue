<script setup lang="ts">
import { ref } from 'vue'

const employees = [
  { id: 1, name: 'Applications', color: 'bg-yellow-400', docs: 12 },
  { id: 2, name: 'CSC', color: 'bg-blue-500', docs: 8 },
  { id: 3, name: 'IT&DC', color: 'bg-green-400', docs: 21 },
  { id: 4, name: 'NOC', color: 'bg-purple-500', docs: 5 },
]

const recentDocs = [
  { id: 101, name: 'Purchase Order 2026', type: 'Folder', status: 'Pending', statusColor: 'text-amber-600 bg-amber-100', date: '03/15/26' },
  { id: 102, name: 'Budget 2026', type: 'Folder', status: 'Approved', statusColor: 'text-green-600 bg-green-100', date: '02/15/26' },
  { id: 103, name: 'Laptop Requisition', type: 'Document', status: 'Revision', statusColor: 'text-blue-600 bg-blue-100', date: '01/10/26' },
  { id: 104, name: 'Marketing Budget', type: 'Worksheet', status: 'Rejected', statusColor: 'text-red-600 bg-red-100', date: '01/05/26' },
]

const selectedDocs = ref<number[]>([])

function toggleDoc(id: number) {
  if (selectedDocs.value.includes(id)) {
    selectedDocs.value = selectedDocs.value.filter(d => d !== id)
  } else {
    selectedDocs.value.push(id)
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-background p-6 lg:p-8">
    
    <!-- Stats Header (from Image 1) -->
    <div class="flex justify-between items-center bg-card rounded-xl border border-border p-6 shadow-sm mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
          E
        </div>
        <div>
          <h2 class="text-xl font-bold text-foreground">Engineering Department</h2>
          <p class="text-sm text-muted-foreground">San Francisco Office</p>
        </div>
      </div>
      <div class="flex gap-8 text-center divide-x divide-border">
        <div class="px-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Employees</p>
          <p class="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div class="px-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Missing Docs</p>
          <p class="text-2xl font-bold text-foreground">07</p>
        </div>
        <div class="px-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Pending Approvals</p>
          <p class="text-2xl font-bold text-foreground">12</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
       <div class="flex gap-4 items-center">
         <h3 class="text-lg font-bold text-foreground">Employees</h3>
       </div>
       <div class="flex gap-2 relative w-64">
         <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         <input type="text" placeholder="Search employees..." class="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
       </div>
    </div>

    <!-- Employee Folders (from Video/Image 2) -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
       <div v-for="emp in employees" :key="emp.id" class="group cursor-pointer flex flex-col items-center">
         <!-- Folder Icon SVG -->
         <div class="relative w-24 h-20 mb-3 transition-transform group-hover:scale-105 group-hover:-translate-y-1">
           <svg viewBox="0 0 100 80" class="w-full h-full drop-shadow-md">
             <path :class="emp.color" d="M5,15 L35,15 L45,25 L95,25 C97.76,25 100,27.24 100,30 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,20 C0,17.24 2.24,15 5,15 Z" fill="currentColor"/>
             <!-- Front flap -->
             <path class="text-white opacity-20" d="M0,35 L100,35 L100,75 C100,77.76 97.76,80 95,80 L5,80 C2.24,80 0,77.76 0,75 L0,35 Z" fill="currentColor"/>
             <!-- White Document inside -->
             <rect x="15" y="20" width="70" height="50" rx="2" fill="white" class="opacity-90 transition-transform group-hover:-translate-y-3" />
           </svg>
         </div>
         <h4 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center">{{ emp.name }}</h4>
         <p class="text-xs text-muted-foreground">{{ emp.docs }} documents</p>
       </div>
    </div>

    <!-- Recent Documents Table (from Image 1) -->
    <h3 class="text-lg font-bold text-foreground mb-4 mt-4">Recent Documents</h3>
    <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1">
       <table class="w-full text-left text-sm">
         <thead class="bg-accent border-b border-border text-muted-foreground">
           <tr>
             <th class="px-4 py-3 w-12 text-center">
               <input type="checkbox" class="rounded border-border text-primary focus:ring-primary" />
             </th>
             <th class="px-4 py-3 font-semibold">Name</th>
             <th class="px-4 py-3 font-semibold">All Types</th>
             <th class="px-4 py-3 font-semibold">Status</th>
             <th class="px-4 py-3 font-semibold">Last Modified</th>
             <th class="px-4 py-3 text-right font-semibold">Actions</th>
           </tr>
         </thead>
         <tbody class="divide-y divide-border">
           <tr v-for="doc in recentDocs" :key="doc.id" :class="['hover:bg-accent transition-colors', selectedDocs.includes(doc.id) ? 'bg-primary/5' : '']">
             <td class="px-4 py-3 text-center">
               <input type="checkbox" :checked="selectedDocs.includes(doc.id)" @change="toggleDoc(doc.id)" class="rounded border-border text-primary focus:ring-primary" />
             </td>
             <td class="px-4 py-3 flex items-center gap-3">
               <svg v-if="doc.type === 'Folder'" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
               <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
               <span class="font-medium text-foreground">{{ doc.name }}</span>
             </td>
             <td class="px-4 py-3 text-muted-foreground">{{ doc.type }}</td>
             <td class="px-4 py-3">
               <span :class="['px-2.5 py-1 text-xs font-semibold rounded-full border border-white/20', doc.statusColor]">{{ doc.status }}</span>
             </td>
             <td class="px-4 py-3 text-muted-foreground">{{ doc.date }}</td>
             <td class="px-4 py-3 text-right">
               <button class="text-muted-foreground hover:text-foreground">
                 <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
               </button>
             </td>
           </tr>
         </tbody>
       </table>
    </div>

    <!-- Floating Action Bar (From Video) -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 translate-y-10"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-10"
    >
      <div v-if="selectedDocs.length > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl border border-gray-700 z-50">
        <span class="text-sm font-medium bg-gray-800 px-3 py-1 rounded-full">{{ selectedDocs.length }} selected</span>
        <button class="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
           Move to
        </button>
        <button class="flex items-center gap-2 hover:text-red-400 transition-colors text-sm font-medium">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
           Delete
        </button>
      </div>
    </Transition>

  </div>
</template>
