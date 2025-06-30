<template>
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Estruturas
        </h3>
        <div class="flex space-x-4">
          <button
            @click="openNewModal('gabinete')"
            class="btn-primary"
          >
            Novo Gabinete
          </button>
          <button
            @click="openNewModal('direcao')"
            class="btn-primary"
          >
            Nova Direção
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-secondary-700">
      <nav class="-mb-px flex">
        <button
          @click="activeTab = 'gabinetes'"
          class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200"
          :class="activeTab === 'gabinetes' ? 'border-primary-500 text-primary-400' : 'border-transparent text-secondary-400 hover:text-secondary-200 hover:border-secondary-500'"
        >
          Gabinetes Provinciais
        </button>
        <button
          @click="activeTab = 'direcoes'"
          class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200"
          :class="activeTab === 'direcoes' ? 'border-primary-500 text-primary-400' : 'border-transparent text-secondary-400 hover:text-secondary-200 hover:border-secondary-500'"
        >
          Direções Municipais
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      <p class="mt-2 text-secondary-400">Carregando...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 text-center">
      <p class="text-red-400">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-primary-500 hover:text-primary-400">
        Tentar novamente
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="(activeTab === 'gabinetes' && !gabinetes.length) || (activeTab === 'direcoes' && !direcoes.length)" class="p-6 text-center">
      <p class="text-secondary-400">Nenhum registro encontrado</p>
    </div>

    <!-- Tables -->
    <div v-else class="overflow-x-auto">
      <!-- Gabinetes Table -->
      <table v-if="activeTab === 'gabinetes'" class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Província</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Diretor</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Contato</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="gabinete in gabinetes" :key="gabinete.id" class="hover:bg-secondary-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-secondary-100">{{ gabinete.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ gabinete.provincia }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ gabinete.diretor }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ gabinete.telefone }}</div>
              <div class="text-sm text-secondary-400">{{ gabinete.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editItem(gabinete, 'gabinete')"
                class="text-primary-500 hover:text-primary-400 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteItem(gabinete.id, 'gabinete')"
                class="text-red-500 hover:text-red-400"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Direções Table -->
      <table v-else class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Município</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Gabinete</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Diretor</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Contato</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="direcao in direcoes" :key="direcao.id" class="hover:bg-secondary-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-secondary-100">{{ direcao.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ direcao.municipio }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ getGabineteName(direcao.gabinete_provincial_id) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ direcao.diretor }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-100">{{ direcao.telefone }}</div>
              <div class="text-sm text-secondary-400">{{ direcao.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editItem(direcao, 'direcao')"
                class="text-primary-500 hover:text-primary-400 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteItem(direcao.id, 'direcao')"
                class="text-red-500 hover:text-red-400"
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
          <div class="absolute inset-0 bg-black opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleSubmit" class="p-6">
            <h3 class="text-lg font-medium text-secondary-100 mb-4">
              {{ editingItem ? 'Editar' : 'Novo' }} {{ modalType === 'gabinete' ? 'Gabinete Provincial' : 'Direção Municipal' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-300">Nome</label>
                <input
                  v-model="form.nome"
                  type="text"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">
                  {{ modalType === 'gabinete' ? 'Província' : 'Município' }}
                </label>
                <input
                  v-model="form[modalType === 'gabinete' ? 'provincia' : 'municipio']"
                  type="text"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div v-if="modalType === 'direcao'">
                <label class="block text-sm font-medium text-secondary-300">Gabinete Provincial</label>
                <select
                  v-model="form.gabinete_provincial_id"
                  class="input-field mt-1"
                  required
                >
                  <option v-for="gabinete in gabinetes" :key="gabinete.id" :value="gabinete.id">
                    {{ gabinete.nome }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Endereço</label>
                <input
                  v-model="form.endereco"
                  type="text"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Telefone</label>
                <input
                  v-model="form.telefone"
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
                <label class="block text-sm font-medium text-secondary-300">Diretor</label>
                <input
                  v-model="form.diretor"
                  type="text"
                  class="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-300">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="3"
                  class="input-field mt-1"
                ></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
               <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-secondary-600 text-secondary-100 rounded-md hover:bg-secondary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
              >
                {{ editingItem ? 'Salvar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'

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
      api.get('/gabinetes-provinciais'),
      api.get('/direcoes-municipais')
    ])
    
    gabinetes.value = (gabinetesRes.data && gabinetesRes.data.data) ? gabinetesRes.data.data : gabinetesRes.data
    direcoes.value = (direcoesRes.data && direcoesRes.data.data) ? direcoesRes.data.data : direcoesRes.data
  } catch (err) {
    console.error('Erro ao buscar dados:', err)
    error.value = 'Falha ao carregar os dados. Por favor, tente novamente.'
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
  const isEdit = !!editingItem.value
  const url = modalType.value === 'gabinete'
    ? (isEdit ? `/gabinetes-provinciais/${form.value.id}` : '/gabinetes-provinciais')
    : (isEdit ? `/direcoes-municipais/${form.value.id}` : '/direcoes-municipais')
  
  const method = isEdit ? 'put' : 'post'

  try {
    await api[method](url, form.value)
    await fetchData()
    closeModal()
  } catch (err) {
    console.error('Erro ao salvar:', err)
    // Adicionar notificação de erro
  }
}

const deleteItem = async (id, type) => {
  if (!confirm(`Tem certeza que deseja excluir este item?`)) return
  
  const url = type === 'gabinete' ? `/gabinetes-provinciais/${id}` : `/direcoes-municipais/${id}`

  try {
    await api.delete(url)
    await fetchData()
  } catch (err) {
    console.error(`Erro ao excluir ${type}:`, err)
    // Adicionar notificação de erro
  }
}

onMounted(() => {
  fetchData()
})
</script>