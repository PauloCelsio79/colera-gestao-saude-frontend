<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
    <div class="flex flex-1 items-center justify-center">
      <div class="card w-full max-w-sm relative">
        <div class="flex flex-col items-center mb-4">
          <h2 class="text-3xl font-extrabold mb-2 text-center text-primary-700 tracking-tight">Painel Saúde</h2>
          <span class="text-xs text-gray-400 mb-2">Gestão de Cólera</span>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
            <input 
              v-model="email" 
              type="email" 
              class="input-field" 
              required 
              :disabled="loading"
              placeholder="Digite seu e-mail"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input 
              v-model="password" 
              type="password" 
              class="input-field" 
              required 
              :disabled="loading"
              placeholder="Digite sua senha"
            />
          </div>
          <button 
            type="submit" 
            class="btn-primary w-full transition-all duration-200"
            :disabled="loading"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Entrar</span>
          </button>
          <p v-if="error" class="text-red-500 mt-4 text-center text-sm animate-pulse">{{ error }}</p>
        </form>
      </div>
    </div>
    <footer class="w-full text-center py-4 text-xs text-gray-400 select-none">
      &copy; {{ new Date().getFullYear() }} Painel Saúde - Sistema de Gestão de Cólera
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const response = await api.post(
      '/login',
      {
        email: email.value,
        password: password.value
      }
    )

    const { token, user } = response.data
    
    if (!token || !user) {
      throw new Error('Resposta inválida do servidor')
    }

    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Redireciona baseado no tipo de usuário
    if (user.tipo === 'admin') {
      router.push('/dashboard/admin/usuarios')
    } else if (user.tipo === 'medico') {
      router.push('/dashboard/medico/pacientes')
    } else if (user.tipo === 'gestor') {
      router.push('/dashboard/gestor')
    } else if (user.tipo === 'tecnico') {
      router.push('/dashboard/tecnico')
    } else {
      error.value = 'Tipo de usuário não suportado.'
    }
  } catch (e) {
    console.error('Erro no login:', e)
    if (e.response) {
      switch (e.response.status) {
        case 401:
          error.value = 'E-mail ou senha inválidos.'
          break
        case 422:
          error.value = 'Por favor, preencha todos os campos corretamente.'
          break
        default:
          error.value = 'Erro ao fazer login. Tente novamente.'
      }
    } else if (e.request) {
      error.value = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    } else {
      error.value = 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  @apply bg-white p-10 rounded-2xl shadow-xl border border-gray-100;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-150;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md;
}
</style>