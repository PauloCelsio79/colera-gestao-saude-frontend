<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Pacientes
        </h3>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
      <input v-model="filtros.nome" type="text" placeholder="Filtrar por nome" class="input-field" />
      <input v-model="filtros.bi" type="text" placeholder="Filtrar por BI" class="input-field" />
      <input v-model="filtros.telefone" type="text" placeholder="Filtrar por telefone" class="input-field" />
      <input v-model="filtros.data_nascimento" type="date" placeholder="Filtrar por data de nascimento" class="input-field" />
    </div>

    <!-- Total de pacientes -->
    <div class="px-4 py-2 text-sm text-gray-700 font-semibold">
      Total: {{ pacientesFiltrados.length }} pacientes (de {{ pacientes.length }})
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital de Destino</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="enc in encaminhamentos" :key="enc.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ enc.triagem?.paciente?.nome || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-xs font-semibold" :class="{
                'text-red-700': (enc.triagem?.nivel_risco || enc.triagem?.paciente?.risco) === 'alto',
                'text-yellow-700': (enc.triagem?.nivel_risco || enc.triagem?.paciente?.risco) === 'medio',
                'text-green-700': (enc.triagem?.nivel_risco || enc.triagem?.paciente?.risco) === 'baixo'
              }">
                {{ enc.triagem?.nivel_risco || enc.triagem?.paciente?.risco || '-' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ enc.hospital?.nome || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select v-model="enc.status" @change="alterarStatusEncaminhamento(enc, enc.status)" class="border rounded px-2 py-1 text-xs">
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
              <button @click="abrirModalTriagens(enc.triagem?.paciente)" class="text-primary-600 hover:text-primary-900">Ver Triagens</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Triagens do Paciente -->
    <div v-if="showModalTriagens" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Triagens de {{ pacienteAtual?.nome }}</h3>
          <button @click="closeModalTriagens" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Fechar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="triagensPaciente.length > 0">
          <ul>
            <li v-for="triagem in triagensPaciente" :key="triagem.id" class="mb-2 flex justify-between items-center">
              <span>ID: {{ triagem.id }} | Data: {{ formatDate(triagem.created_at) }} | Nível de risco: {{ triagem.nivel_risco }}</span>
              <button @click="verDetalhesTriagem(triagem.id)" class="ml-2 text-primary-600 hover:text-primary-900 text-xs">Ver Detalhes</button>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-500">Nenhuma triagem encontrada para este paciente.</div>
        <div v-if="detalhesTriagem">
          <h4 class="font-semibold mt-4 mb-2">Detalhes da Triagem</h4>
          <pre class="bg-gray-100 p-2 rounded text-xs">{{ detalhesTriagem }}</pre>
        </div>
        <div v-if="erroTriagem" class="text-red-600 mt-2">{{ erroTriagem }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const pacientes = ref([])
const encaminhamentos = ref([])

const filtros = ref({
  nome: '',
  bi: '',
  telefone: '',
  data_nascimento: ''
})

// Modal de triagens
const showModalTriagens = ref(false)
const pacienteAtual = ref(null)
const triagensPaciente = ref([])
const detalhesTriagem = ref(null)
const erroTriagem = ref('')

const fetchPacientes = async () => {
  try {
    console.log('Buscando lista de pacientes...')
    const response = await axios.get('http://127.0.0.1:8000/api/pacientes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      pacientes.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      pacientes.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      pacientes.value = []
    }

    console.log('Pacientes carregados:', pacientes.value)
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar pacientes.')
          break
        default:
          alert('Erro ao carregar pacientes. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    pacientes.value = []
  }
}

const excluirPaciente = async (paciente) => {
  if (!confirm(`Tem certeza que deseja excluir o paciente ${paciente.nome}?`)) return
  try {
    await axios.delete(`http://127.0.0.1:8000/api/pacientes/${paciente.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    alert('Paciente excluído com sucesso!')
    await fetchPacientes()
  } catch (error) {
    console.error('Erro ao excluir paciente:', error)
    alert('Erro ao excluir paciente. Por favor, tente novamente.')
  }
}

const pacientesFiltrados = computed(() => {
  return pacientes.value.filter(p => {
    const nomeOk = filtros.value.nome === '' || p.nome?.toLowerCase().includes(filtros.value.nome.toLowerCase())
    const biOk = filtros.value.bi === '' || p.bi_numero?.toLowerCase().includes(filtros.value.bi.toLowerCase())
    const telOk = filtros.value.telefone === '' || p.telefone?.includes(filtros.value.telefone)
    const dataOk = filtros.value.data_nascimento === '' || (p.data_nascimento && p.data_nascimento.startsWith(filtros.value.data_nascimento))
    return nomeOk && biOk && telOk && dataOk
  })
})

const abrirModalTriagens = async (paciente) => {
  pacienteAtual.value = paciente
  showModalTriagens.value = true
  detalhesTriagem.value = null
  erroTriagem.value = ''
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/pacientes/${paciente.id}/triagens`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    triagensPaciente.value = Array.isArray(response.data) ? response.data : (response.data?.data || [])
  } catch (error) {
    triagensPaciente.value = []
    erroTriagem.value = 'Erro ao buscar triagens do paciente.'
  }
}

const closeModalTriagens = () => {
  showModalTriagens.value = false
  pacienteAtual.value = null
  triagensPaciente.value = []
  detalhesTriagem.value = null
  erroTriagem.value = ''
}

const verDetalhesTriagem = async (triagemId) => {
  detalhesTriagem.value = null
  erroTriagem.value = ''
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/triagens/${triagemId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    detalhesTriagem.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    erroTriagem.value = 'Erro ao buscar detalhes da triagem.'
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const fetchEncaminhamentos = async () => {
  try {
    const resp = await axios.get('http://127.0.0.1:8000/api/encaminhamentos', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    encaminhamentos.value = Array.isArray(resp.data) ? resp.data : (resp.data.data || [])
  } catch (e) {
    encaminhamentos.value = []
  }
}

async function alterarStatusEncaminhamento(encaminhamento, novoStatus) {
  try {
    const payload = { status: novoStatus }
    if (novoStatus === 'concluido') {
      payload.data_chegada = new Date().toISOString()
    }
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${encaminhamento.id}`, payload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    encaminhamento.status = novoStatus
    alert('Status atualizado com sucesso!')
  } catch (e) {
    console.error(e.response?.data || e)
    alert('Erro ao atualizar status do encaminhamento.')
  }
}

onMounted(fetchPacientes)
onMounted(fetchEncaminhamentos)
</script> 