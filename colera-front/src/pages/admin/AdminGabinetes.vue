<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Estruturas
        </h3>
        <div class="flex space-x-4">
          <button
            @click="openNewModal('gabinete')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Novo Gabinete
          </button>
          <button
            @click="openNewModal('direcao')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Nova Direção
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex">
        <button
          @click="activeTab = 'gabinetes'"
          class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
          :class="activeTab === 'gabinetes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Gabinetes Provinciais
        </button>
        <button
          @click="activeTab = 'direcoes'"
          class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
          :class="activeTab === 'direcoes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Direções Municipais
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">Carregando...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 text-center">
      <p class="text-red-600">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-primary-600 hover:text-primary-700">
        Tentar novamente
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="(activeTab === 'gabinetes' && !gabinetes.length) || (activeTab === 'direcoes' && !direcoes.length)" class="p-4 text-center">
      <p class="text-gray-600">Nenhum registro encontrado</p>
    </div>

    <!-- Tables -->
    <div v-else class="overflow-x-auto">
      <!-- Gabinetes Table -->
      <table v-if="activeTab === 'gabinetes'" class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Província</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diretor</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="gabinete in gabinetes" :key="gabinete.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ gabinete.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ gabinete.provincia }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ gabinete.diretor }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ gabinete.telefone }}</div>
              <div class="text-sm text-gray-500">{{ gabinete.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editItem(gabinete, 'gabinete')"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteItem(gabinete.id, 'gabinete')"
                class="text-red-600 hover:text-red-900"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Direções Table -->
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Município</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gabinete</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diretor</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="direcao in direcoes" :key="direcao.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ direcao.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ direcao.municipio }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ getGabineteName(direcao.gabinete_provincial_id) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ direcao.diretor }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ direcao.telefone }}</div>
              <div class="text-sm text-gray-500">{{ direcao.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editItem(direcao, 'direcao')"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteItem(direcao.id, 'direcao')"
                class="text-red-600 hover:text-red-900"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleSubmit" class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingItem ? 'Editar' : 'Novo' }} {{ modalType === 'gabinete' ? 'Gabinete Provincial' : 'Direção Municipal' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  v-model="form.nome"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  {{ modalType === 'gabinete' ? 'Província' : 'Município' }}
                </label>
                <input
                  v-model="form[modalType === 'gabinete' ? 'provincia' : 'municipio']"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div v-if="modalType === 'direcao'">
                <label class="block text-sm font-medium text-gray-700">Gabinete Provincial</label>
                <select
                  v-model="form.gabinete_provincial_id"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option v-for="gabinete in gabinetes" :key="gabinete.id" :value="gabinete.id">
                    {{ gabinete.nome }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  v-model="form.endereco"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  v-model="form.telefone"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Diretor</label>
                <input
                  v-model="form.diretor"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
              >
                {{ editingItem ? 'Salvar' : 'Criar' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activeTab = ref('gabinetes')
const gabinetes = ref([])
const direcoes = ref([])
const showModal = ref(false)
const modalType = ref('gabinete')
const editingItem = ref(null)
const loading = ref(false)
const error = ref(null)

const form = ref({
  nome: '',
  provincia: '',
  municipio: '',
  gabinete_provincial_id: '',
  endereco: '',
  telefone: '',
  email: '',
  diretor: '',
  observacoes: ''
})

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [gabinetesRes, direcoesRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/gabinetes-provinciais', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      axios.get('http://127.0.0.1:8000/api/direcoes-municipais', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    ])
    
    gabinetes.value = Array.isArray(gabinetesRes.data) ? gabinetesRes.data : []
    direcoes.value = Array.isArray(direcoesRes.data) ? direcoesRes.data : []
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar dados. Por favor, tente novamente.'
    if (err.response) {
      console.error('Status do erro:', err.response.status)
      console.error('Dados do erro:', err.response.data)
      if (err.response.status === 404) {
        error.value = 'API não encontrada. Verifique se o servidor está rodando.'
      } else if (err.response.status === 401) {
        error.value = 'Sessão expirada. Por favor, faça login novamente.'
      }
    }
  } finally {
    loading.value = false
  }
}

const getGabineteName = (gabineteId) => {
  if (!gabineteId || !Array.isArray(gabinetes.value)) return 'N/A'
  const gabinete = gabinetes.value.find(g => g && g.id === gabineteId)
  return gabinete ? gabinete.nome : 'N/A'
}

const openNewModal = (type) => {
  modalType.value = type
  editingItem.value = null
  form.value = {
    nome: '',
    provincia: '',
    municipio: '',
    gabinete_provincial_id: '',
    endereco: '',
    telefone: '',
    email: '',
    diretor: '',
    observacoes: ''
  }
  showModal.value = true
}

const editItem = (item, type) => {
  modalType.value = type
  editingItem.value = item
  form.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  form.value = {
    nome: '',
    provincia: '',
    municipio: '',
    gabinete_provincial_id: '',
    endereco: '',
    telefone: '',
    email: '',
    diretor: '',
    observacoes: ''
  }
}

const handleSubmit = async () => {
  try {
    const data = { ...form.value }
    const url = modalType.value === 'gabinete' 
      ? 'http://127.0.0.1:8000/api/gabinetes-provinciais'
      : 'http://127.0.0.1:8000/api/direcoes-municipais'
    
    if (editingItem.value) {
      await axios.put(`${url}/${editingItem.value.id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    } else {
      await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
    
    await fetchData()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data)
      if (error.response.status === 404) {
        alert('API não encontrada. Verifique se o servidor está rodando.')
      } else if (error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else {
        const mensagensErro = error.response.data.errors || {}
        const mensagem = Object.entries(mensagensErro)
          .map(([campo, erros]) => `${campo}: ${erros.join(', ')}`)
          .join('\n')
        alert(`Erro ao salvar:\n${mensagem}`)
      }
    } else {
      alert('Erro ao salvar. Verifique a conexão com o servidor.')
    }
  }
}

const deleteItem = async (id, type) => {
  if (!id) return
  if (!confirm('Tem certeza que deseja excluir este registro?')) return
  
  try {
    const url = type === 'gabinete'
      ? `http://127.0.0.1:8000/api/gabinetes-provinciais/${id}`
      : `http://127.0.0.1:8000/api/direcoes-municipais/${id}`
    
    await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    await fetchData()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data)
      if (error.response.status === 404) {
        alert('API não encontrada. Verifique se o servidor está rodando.')
      } else if (error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else {
        alert(error.response.data.message || 'Erro ao excluir registro')
      }
    } else {
      alert('Erro ao excluir registro. Verifique a conexão com o servidor.')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>