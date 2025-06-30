<template>
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gestão de Ambulâncias
        </h3>
        <button @click="abrirModalCadastro" class="btn-primary">Cadastrar Ambulância</button>
      </div>
    </div>
    
    <div v-if="erro" class="m-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md">{{ erro }}</div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Placa</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Modelo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Hospital</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="amb in ambulancias" :key="amb.id" class="hover:bg-secondary-700">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-100">{{ amb.placa }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-300">{{ amb.modelo }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-300">{{ amb.hospital_nome || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                'bg-green-800 text-green-100': amb.status === 'disponivel',
                'bg-blue-800 text-blue-100': amb.status === 'em_deslocamento',
                'bg-orange-800 text-orange-100': amb.status === 'ocupada',
                'bg-red-800 text-red-100': amb.status === 'manutencao',
                'bg-secondary-700 text-secondary-300': amb.status === 'inativa'
              }">
                {{ getStatusLabel(amb.status) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
              <button @click="verDetalhes(amb)" class="btn-icon-link" title="Detalhes"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
              <button @click="editarAmbulancia(amb)" class="btn-icon-link" title="Editar"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
              <button @click="removerAmbulancia(amb.id)" class="btn-icon-danger" title="Remover"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
            </td>
          </tr>
          <tr v-if="ambulancias.length === 0">
            <td colspan="5" class="text-center text-secondary-500 py-4">Nenhuma ambulância encontrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Unificado -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <div class="card p-0 transform transition-all sm:my-8 sm:max-w-lg sm:w-full max-h-[90vh] flex flex-col">
        
        <div class="flex items-center justify-between p-4 border-b border-secondary-700 flex-shrink-0">
          <h3 class="text-lg font-medium text-secondary-100">{{ modalTitle }}</h3>
          <button @click="fecharModal" class="btn-icon-secondary">
             <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <!-- Form State -->
          <form v-if="modalState === 'form'" @submit.prevent="salvarAmbulancia" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="label">Placa</label><input v-model="form.placa" class="input-field" required /></div>
              <div><label class="label">Modelo</label><input v-model="form.modelo" class="input-field" required /></div>
              <div class="sm:col-span-2"><label class="label">Hospital ID</label><input v-model.number="form.hospital_id" class="input-field" required type="number" min="1" /></div>
              <div><label class="label">Latitude</label><input v-model.number="form.latitude" class="input-field" required type="number" step="any" /></div>
              <div><label class="label">Longitude</label><input v-model.number="form.longitude" class="input-field" required type="number" step="any" /></div>
              <div class="sm:col-span-2"><label class="label">Status</label>
                <select v-model="form.status" class="input-field" required>
                  <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>
            </div>
          </form>

          <!-- Details State -->
          <div v-if="modalState === 'details' && detalhes" class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><p class="label">Placa:</p><p class="text-secondary-200">{{ detalhes.placa }}</p></div>
              <div><p class="label">Modelo:</p><p class="text-secondary-200">{{ detalhes.modelo }}</p></div>
              <div><p class="label">Hospital:</p><p class="text-secondary-200">{{ detalhes.hospital_nome || detalhes.hospital_id }}</p></div>
              <div><p class="label">Status:</p><p class="text-secondary-200">{{ getStatusLabel(detalhes.status) }}</p></div>
              <div><p class="label">Latitude:</p><p class="text-secondary-200">{{ detalhes.latitude }}</p></div>
              <div><p class="label">Longitude:</p><p class="text-secondary-200">{{ detalhes.longitude }}</p></div>
            </div>
          </div>
        </div>

        <div class="bg-secondary-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0">
          <button v-if="modalState === 'form'" type="button" @click="salvarAmbulancia" class="btn-primary">Salvar</button>
          <button type="button" @click="fecharModal" class="btn-secondary mr-3">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const ambulancias = ref([])
const erro = ref('')
const showModal = ref(false)
const modalState = ref('form') // 'form' or 'details'
const detalhes = ref(null)

const form = ref({
  id: null,
  placa: '',
  modelo: '',
  hospital_id: null,
  status: 'disponivel',
  latitude: '',
  longitude: ''
})

const statusLabels = {
  disponivel: 'Disponível',
  em_deslocamento: 'Em Deslocamento',
  ocupada: 'Ocupada',
  manutencao: 'Em Manutenção',
  inativa: 'Inativa'
}

const modalTitle = computed(() => {
  if (modalState.value === 'details') return 'Detalhes da Ambulância'
  return form.value.id ? 'Editar Ambulância' : 'Cadastrar Ambulância'
})

function getStatusLabel(status) {
  return statusLabels[status] || status
}

const fetchAmbulancias = async () => {
  erro.value = ''
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/ambulancias', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    // Adiciona hospital_nome se vier no objeto hospital
    ambulancias.value = (response.data.data || response.data).map(a => ({
      ...a,
      hospital_nome: a.hospital?.nome || a.hospital_nome || ''
    }))
  } catch (e) {
    erro.value = 'Erro ao buscar ambulâncias.'
  }
}

function abrirModalCadastro() {
  form.value = { id: null, placa: '', modelo: '', hospital_id: null, status: 'disponivel', latitude: '', longitude: '' }
  modalState.value = 'form'
  showModal.value = true
}

function fecharModal() {
  showModal.value = false
  erro.value = ''
  detalhes.value = null
}

async function salvarAmbulancia() {
  erro.value = ''
  const token = localStorage.getItem('token')
  const method = form.value.id ? 'put' : 'post'
  const url = form.value.id 
    ? `http://127.0.0.1:8000/api/ambulancias/${form.value.id}` 
    : 'http://127.0.0.1:8000/api/ambulancias'
  
  try {
    await axios[method](url, form.value, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    fecharModal()
    await fetchAmbulancias()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao salvar ambulância.'
  }
}

function editarAmbulancia(amb) {
  form.value = { ...amb }
  modalState.value = 'form'
  showModal.value = true
}

async function removerAmbulancia(id) {
  if (!confirm('Tem certeza que deseja remover esta ambulância?')) return
  erro.value = ''
  const token = localStorage.getItem('token')
  try {
    await axios.delete(`http://127.0.0.1:8000/api/ambulancias/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    await fetchAmbulancias()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao remover ambulância.'
  }
}

function verDetalhes(amb) {
  detalhes.value = amb
  modalState.value = 'details'
  showModal.value = true
}

onMounted(fetchAmbulancias)
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500;
}
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style> 