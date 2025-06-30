<template>
  <div class="min-h-screen bg-secondary-900">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-secondary-800 text-white transition-transform duration-300 transform">
      <div class="flex items-center justify-center h-20 bg-secondary-900">
        <h1 class="text-2xl font-bold text-primary-500">Painel do Gestor</h1>
      </div>
      <nav class="mt-6 px-4">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="group flex items-center px-3 py-3 text-base leading-6 font-semibold rounded-md text-secondary-200 hover:text-white hover:bg-primary-600 focus:outline-none focus:bg-primary-700 transition ease-in-out duration-150"
          :class="{ 'bg-primary-600 text-white': $route.path === item.path }"
        >
          <component :is="item.icon" class="mr-4 h-6 w-6" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Navigation -->
      <header class="bg-secondary-800 shadow-lg">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-secondary-100">
              {{ currentPageTitle }}
            </h1>
            <div class="flex items-center">
              <button 
                @click="logout" 
                class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoggingOut"
              >
                <span v-if="isLoggingOut">Saindo...</span>
                <span v-else>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TruckIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const isLoggingOut = ref(false)

const menuItems = [
  { name: 'Dashboard', path: '/dashboard/gestor', icon: ChartBarIcon },
  { name: 'Pacientes', path: '/dashboard/gestor/pacientes', icon: UserGroupIcon },
  { name: 'Hospitais', path: '/dashboard/gestor/hospitais', icon: BuildingOfficeIcon },
  { name: 'Ambulâncias', path: '/dashboard/gestor/ambulancias', icon: TruckIcon },
  { name: 'Relatórios', path: '/dashboard/gestor/relatorios', icon: DocumentChartBarIcon },
]

const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path === route.path)
  return currentItem ? currentItem.name : 'Dashboard'
})

const logout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  
  try {
    // Tenta fazer logout na API
    await api.post('/logout')
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error)
  } finally {
    // Limpa os dados locais independente do resultado da API
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    // Redireciona para a página de login
    router.push('/login')
    isLoggingOut.value = false
  }
}
</script> 