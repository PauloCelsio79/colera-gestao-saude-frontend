<template>
  <PainelPrevencaoColera />
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Usuários
        </h3>
        <button
          @click="openNewUserModal"
          class="btn-primary"
        >
          Novo Usuário
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-4 bg-secondary-700 border-b border-secondary-600">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-secondary-300">Nome</label>
          <input
            v-model="filtros.nome"
            type="text"
            class="input-field mt-1"
            placeholder="Buscar por nome..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-300">Tipo</label>
          <select
            v-model="filtros.tipo"
            class="input-field mt-1"
          >
            <option value="">Todos</option>
            <option value="admin">Admin</option>
            <option value="medico">Médico</option>
            <option value="gestor">Gestor</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-300">Email</label>
          <input
            v-model="filtros.email"
            type="text"
            class="input-field mt-1"
            placeholder="Buscar por email..."
          />
        </div>
        <div class="flex items-end">
          <button
            @click="aplicarFiltros"
            class="btn-primary w-full justify-center"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Telefone
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <template v-if="usuariosFiltrados.length > 0">
            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="hover:bg-secondary-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-secondary-100">{{ usuario.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-secondary-300">{{ usuario.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                  'bg-purple-800 text-purple-100': usuario.tipo === 'admin',
                  'bg-blue-800 text-blue-100': usuario.tipo === 'medico',
                  'bg-green-800 text-green-100': usuario.tipo === 'gestor',
                  'bg-yellow-800 text-yellow-100': usuario.tipo === 'tecnico'
                }">
                  {{ formatTipo(usuario.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                {{ usuario.telefone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                  'bg-green-800 text-green-100': usuario.ativo,
                  'bg-red-800 text-red-100': !usuario.ativo
                }">
                  {{ usuario.ativo ? 'Ativo' : 'Bloqueado' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="toggleAcesso(usuario)"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                  :class="{
                    'bg-red-800 text-red-100 hover:bg-red-700': usuario.ativo,
                    'bg-green-800 text-green-100 hover:bg-green-700': !usuario.ativo
                  }"
                  :disabled="usuarioLogado && usuarioLogado.id === usuario.id"
                  :title="usuarioLogado && usuarioLogado.id === usuario.id ? 'Você não pode bloquear seu próprio usuário.' : (usuario.ativo ? 'Bloquear' : 'Permitir')"
                >
                  {{ usuario.ativo ? 'Bloquear' : 'Permitir' }}
                </button>
                <button
                  @click="editUser(usuario)"
                  class="ml-2 text-primary-500 hover:text-primary-400"
                >
                  Editar
                </button>
                <button
                  @click="deleteUser(usuario.id)"
                  class="ml-2 text-red-500 hover:text-red-400"
                  :disabled="usuarioLogado && usuarioLogado.id === usuario.id"
                  :title="usuarioLogado && usuarioLogado.id === usuario.id ? 'Você não pode excluir seu próprio usuário.' : 'Excluir'"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-secondary-500">
              Nenhum usuário encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-black opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleSubmit" class="p-6">
            <h3 class="text-lg font-medium text-secondary-100 mb-4">
              {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-300">Nome</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Tipo</label>
                <select
                  v-model="form.tipo"
                  class="input-field mt-1"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="gestor">Gestor</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Telefone</label>
                <input
                  v-model="form.telefone"
                  type="tel"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div v-if="!editingUser">
                <label class="block text-sm font-medium text-secondary-300">Senha</label>
                <input
                  v-model="form.password"
                  type="password"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div v-if="!editingUser">
                <label class="block text-sm font-medium text-secondary-300">Confirmar Senha</label>
                <input
                  v-model="form.password_confirmation"
                  type="password"
                  class="input-field mt-1"
                  required
                />
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                class="btn-primary w-full inline-flex justify-center sm:col-start-2"
              >
                {{ editingUser ? 'Salvar' : 'Criar' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-600 shadow-sm px-4 py-2 bg-secondary-700 text-base font-medium text-secondary-100 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="fixed z-20 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full" :class="{
                'bg-red-100': selectedUser?.ativo,
                'bg-green-100': !selectedUser?.ativo
              }">
                <svg class="h-6 w-6" :class="{
                  'text-red-600': selectedUser?.ativo,
                  'text-green-600': !selectedUser?.ativo
                }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ selectedUser?.ativo ? 'Bloquear Acesso' : 'Permitir Acesso' }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ selectedUser?.ativo 
                      ? `Tem certeza que deseja bloquear o acesso do usuário ${selectedUser?.name}?` 
                      : `Tem certeza que deseja permitir o acesso do usuário ${selectedUser?.name}?` 
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmarAcesso"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              :class="{
                'bg-red-600 hover:bg-red-700 focus:ring-red-500': selectedUser?.ativo,
                'bg-green-600 hover:bg-green-700 focus:ring-green-500': !selectedUser?.ativo
              }"
            >
              {{ selectedUser?.ativo ? 'Bloquear' : 'Permitir' }}
            </button>
            <button
              type="button"
              @click="cancelarAcesso"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'
import api from '@/api'

const users = ref([])
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingUser = ref(null)
const selectedUser = ref(null)
const filtros = ref({
  nome: '',
  tipo: '',
  email: ''
})

const form = ref({
  name: '',
  email: '',
  tipo: '',
  telefone: '',
  password: '',
  password_confirmation: ''
})

// Recupera o usuário logado do localStorage
const usuarioLogado = ref(null)
try {
  usuarioLogado.value = JSON.parse(localStorage.getItem('user'))
} catch (e) {
  usuarioLogado.value = null
}

// Computed property para filtrar usuários
const usuariosFiltrados = computed(() => {
  return users.value.filter(usuario => {
    const matchNome = !filtros.value.nome || 
      usuario.name.toLowerCase().includes(filtros.value.nome.toLowerCase())
    const matchTipo = !filtros.value.tipo || 
      usuario.tipo === filtros.value.tipo
    const matchEmail = !filtros.value.email || 
      usuario.email.toLowerCase().includes(filtros.value.email.toLowerCase())
    
    return matchNome && matchTipo && matchEmail
  })
})

// Função para formatar o tipo do usuário
const formatTipo = (tipo) => {
  const tipos = {
    'admin': 'Administrador',
    'medico': 'Médico',
    'gestor': 'Gestor',
    'tecnico': 'Técnico'
  }
  return tipos[tipo] || tipo
}

const aplicarFiltros = () => {
  // Os filtros são aplicados automaticamente através do computed property
  console.log('Filtros aplicados:', filtros.value)
}

const fetchUsers = async () => {
  try {
    console.log('Buscando usuários...')
    const response = await api.get('/users')
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    let usuariosData = []
    if (Array.isArray(response.data)) {
      usuariosData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      usuariosData = response.data.data
    }

    users.value = usuariosData
      .filter(usuario => usuario && typeof usuario === 'object')
      .map(usuario => ({
        id: usuario.id || null,
        name: usuario.name || 'Nome não informado',
        email: usuario.email || 'Email não informado',
        tipo: usuario.tipo || 'Tipo não informado',
        telefone: usuario.telefone || 'Telefone não informado',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true // Garante que o status seja carregado do backend
      }))

    console.log('Usuários processados:', users.value)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao carregar usuários')
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
    users.value = []
  }
}

const openNewUserModal = () => {
  editingUser.value = null
  form.value = {
    name: '',
    email: '',
    tipo: '',
    telefone: '',
    password: '',
    password_confirmation: ''
  }
  showModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  form.value = {
    name: user.name,
    email: user.email,
    tipo: user.tipo,
    telefone: user.telefone
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  form.value = {
    name: '',
    email: '',
    tipo: '',
    telefone: '',
    password: '',
    password_confirmation: ''
  }
}

const handleSubmit = async () => {
  const url = editingUser.value ? `/users/${editingUser.value.id}` : '/users'
  const method = editingUser.value ? 'put' : 'post'

  try {
    await api[method](url, form.value)
    await fetchUsers()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    if (error.response) {
      alert(error.response.data.message || 'Erro ao salvar usuário')
    }
  }
}

const deleteUser = async (userId) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return
  
  try {
    await api.delete(`/users/${userId}`)
    await fetchUsers()
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
  }
}

// Função para abrir modal de confirmação
const toggleAcesso = async (usuario) => {
  const originalStatus = usuario.ativo
  usuario.ativo = !usuario.ativo // Otimista

  try {
    await api.put(`/users/${usuario.id}`, { ...usuario, ativo: usuario.ativo })
    // Opcional: pode-se atualizar o usuário com a resposta da API
  } catch (error) {
    console.error('Erro ao alterar o status do usuário:', error)
    usuario.ativo = originalStatus // Reverte em caso de erro
    // Exibir mensagem de erro
  }
}

// Função para confirmar a alteração de acesso
const confirmarAcesso = async () => {
  try {
    const novoStatus = !selectedUser.value.ativo
    
    const response = await api.post('/admin/permitir-acesso', {
      user_id: selectedUser.value.id,
      permitir: novoStatus
    })

    // Atualiza o status do usuário localmente
    selectedUser.value.ativo = novoStatus
    
    // Mostra mensagem de sucesso
    alert(novoStatus ? 'Acesso permitido com sucesso!' : 'Acesso bloqueado com sucesso!')
    
    // Atualiza a lista de usuários mantendo o novo status
    const updatedUsers = users.value.map(u => {
      if (u.id === selectedUser.value.id) {
        return { ...u, ativo: novoStatus }
      }
      return u
    })
    users.value = updatedUsers

    // Fecha o modal
    showConfirmModal.value = false
    selectedUser.value = null

    // Recarrega os usuários para garantir sincronização com o backend
    await fetchUsers()

  } catch (error) {
    console.error('Erro ao alterar acesso:', error)
    if (error.response) {
      alert(error.response.data.message || 'Erro ao alterar acesso do usuário')
    }
  }
}

// Função para cancelar a alteração de acesso
const cancelarAcesso = () => {
  showConfirmModal.value = false
  selectedUser.value = null
}

onMounted(() => {
  fetchUsers()
})
</script>