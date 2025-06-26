<template>
  <div class="bg-white shadow rounded-lg p-8">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Gestão de Ambulâncias</h1>
      <button @click="abrirModalCadastro" class="btn-primary">Cadastrar Ambulância</button>
    </div>
    <div v-if="erro" class="mb-4 p-2 bg-red-100 text-red-700 rounded">{{ erro }}</div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="amb in ambulancias" :key="amb.id">
            <td class="px-4 py-2">{{ amb.placa }}</td>
            <td class="px-4 py-2">{{ amb.modelo }}</td>
            <td class="px-4 py-2">{{ amb.hospital_nome || '-' }}</td>
            <td class="px-4 py-2">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                'bg-green-100 text-green-800': amb.status === 'disponivel',
                'bg-yellow-100 text-yellow-800': amb.status === 'em_deslocamento',
                'bg-blue-100 text-blue-800': amb.status === 'ocupada',
                'bg-red-100 text-red-800': amb.status === 'manutencao',
                'bg-gray-200 text-gray-700': amb.status === 'inativa'
              }">
                {{ getStatusLabel(amb.status) }}
              </span>
            </td>
            <td class="px-4 py-2 space-x-2">
              <button @click="verDetalhes(amb.id)" class="text-blue-600 hover:underline">Detalhes</button>
              <button @click="editarAmbulancia(amb)" class="text-yellow-600 hover:underline">Editar</button>
              <button @click="removerAmbulancia(amb.id)" class="text-red-600 hover:underline">Remover</button>
            </td>
          </tr>
          <tr v-if="ambulancias.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-4">Nenhuma ambulância encontrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Cadastro/Edição -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <h2 class="text-xl font-bold mb-4">{{ editando ? 'Editar' : 'Cadastrar' }} Ambulância</h2>
        <form @submit.prevent="salvarAmbulancia">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Placa</label>
            <input v-model="form.placa" class="input-field" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Modelo</label>
            <input v-model="form.modelo" class="input-field" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Hospital ID</label>
            <input v-model="form.hospital_id" class="input-field" required type="number" min="1" />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="form.status" class="input-field" required>
              <option value="disponivel">Disponível</option>
              <option value="em_deslocamento">Em Deslocamento</option>
              <option value="ocupada">Ocupada</option>
              <option value="manutencao">Em Manutenção</option>
              <option value="inativa">Inativa</option>
            </select>
          </div>
          <div class="mb-3 flex gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1">Latitude</label>
              <input v-model="form.latitude" class="input-field" required type="number" step="0.000001" />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1">Longitude</label>
              <input v-model="form.longitude" class="input-field" required type="number" step="0.000001" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="fecharModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Salvar</button>
          </div>
        </form>
        <button @click="fecharModal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="showDetalhes" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 class="text-xl font-bold mb-4">Detalhes da Ambulância</h2>
        <div v-if="detalhes">
          <p><b>Placa:</b> {{ detalhes.placa }}</p>
          <p><b>Modelo:</b> {{ detalhes.modelo }}</p>
          <p><b>Hospital ID:</b> {{ detalhes.hospital_id }}</p>
          <p><b>Status:</b> {{ detalhes.status }}</p>
          <p><b>Latitude:</b> {{ detalhes.latitude }}</p>
          <p><b>Longitude:</b> {{ detalhes.longitude }}</p>
        </div>
        <div v-else class="text-gray-500">Carregando...</div>
        <button @click="showDetalhes = false" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const ambulancias = ref([])
const erro = ref('')
const showModal = ref(false)
const showDetalhes = ref(false)
const detalhes = ref(null)
const editando = ref(false)
const form = ref({
  placa: '',
  modelo: '',
  hospital_id: '',
  status: 'disponivel',
  latitude: '',
  longitude: ''
})
let editId = null

function getStatusLabel(status) {
  const labels = {
    disponivel: 'Disponível',
    em_deslocamento: 'Em Deslocamento',
    ocupada: 'Ocupada',
    manutencao: 'Em Manutenção',
    inativa: 'Inativa'
  }
  return labels[status] || status
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
  editando.value = false
  form.value = { placa: '', modelo: '', hospital_id: '', status: 'disponivel', latitude: '', longitude: '' }
  showModal.value = true
  editId = null
}

function fecharModal() {
  showModal.value = false
  erro.value = ''
}

async function salvarAmbulancia() {
  erro.value = ''
  const token = localStorage.getItem('token')
  try {
    if (editando.value && editId) {
      await axios.put(`http://127.0.0.1:8000/api/ambulancias/${editId}`, form.value, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    } else {
      await axios.post('http://127.0.0.1:8000/api/ambulancias', form.value, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
    showModal.value = false
    await fetchAmbulancias()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao salvar ambulância.'
  }
}

function editarAmbulancia(amb) {
  editando.value = true
  form.value = { ...amb }
  showModal.value = true
  editId = amb.id
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

async function verDetalhes(id) {
  showDetalhes.value = true
  detalhes.value = null
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/ambulancias/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    detalhes.value = response.data
  } catch (e) {
    detalhes.value = null
    erro.value = 'Erro ao buscar detalhes.'
  }
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