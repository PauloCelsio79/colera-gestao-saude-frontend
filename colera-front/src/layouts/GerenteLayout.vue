<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-primary-800 text-white transition-transform duration-300 transform">
      <div class="flex items-center justify-center h-16 bg-primary-900">
        <h1 class="text-xl font-bold">Painel do Gestor</h1>
      </div>
      <nav class="mt-5 px-2">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 transition ease-in-out duration-150"
          :class="{ 'bg-primary-700': $route.path === item.path }"
        >
          <component :is="item.icon" class="mr-4 h-6 w-6" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Navigation -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ currentPageTitle }}
            </h1>
            <div class="flex items-center">
              <button 
                @click="logout" 
                class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
import axios from 'axios'

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
  const token = localStorage.getItem('token')
  
  try {
    // Tenta fazer logout na API
    if (token) {
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error)
  } finally {
    // Limpa os dados locais independente do resultado da API
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Redireciona para a página de login
    router.push('/login')
    isLoggingOut.value = false
  }
}
</script> 