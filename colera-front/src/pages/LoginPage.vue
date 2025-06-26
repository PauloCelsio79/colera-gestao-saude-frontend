<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="card w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
      <form @submit.prevent="handleLogin">
      <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            v-model="email" 
            type="email" 
            class="input-field" 
            required 
            :disabled="loading"
          />
      </div>
      <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            v-model="password" 
            type="password" 
            class="input-field" 
            required 
            :disabled="loading"
          />
      </div>
        <button 
          type="submit" 
          class="btn-primary w-full"
          :disabled="loading"
        >
          <span v-if="loading">Processando...</span>
          <span v-else>Entrar</span>
        </button>
        <p v-if="error" class="text-red-500 mt-4 text-center text-sm">{{ error }}</p>
    </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/login',
      {
        email: email.value,
        password: password.value
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const { token, user } = response.data
    
    if (!token || !user) {
      throw new Error('Resposta inválida do servidor')
    }

    localStorage.setItem('token', token)
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
  @apply bg-white p-8 rounded-lg shadow-md;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>