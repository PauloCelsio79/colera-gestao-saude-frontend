<template>
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Hospitais
        </h3>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-4 grid grid-cols-1 sm:grid-cols-5 gap-4 bg-secondary-700/50 border-b border-secondary-700">
      <input v-model="filtros.nome" type="text" placeholder="Filtrar por nome" class="input-field" />
      <input v-model="filtros.tipo" type="text" placeholder="Filtrar por tipo" class="input-field" />
      <input v-model="filtros.leitos_totais" type="number" placeholder="Leitos totais" class="input-field" />
      <input v-model="filtros.leitos_disponiveis" type="number" placeholder="Leitos disponíveis" class="input-field" />
      <select v-model="filtros.status" class="input-field">
        <option value="">Todos</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
    </div>

    <!-- Total de hospitais -->
    <div class="px-4 py-2 text-sm text-secondary-400 font-semibold">
      Total: {{ hospitaisFiltrados.length }} hospitais (de {{ hospitais.length }})
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
              Tipo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Leitos Totais
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Leitos Disponíveis
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
          <tr v-for="hospital in hospitaisFiltrados" :key="hospital.id" class="hover:bg-secondary-700"
              :class="{'bg-red-900/50 text-red-200': hospital.leitos_disponiveis === 0}">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-secondary-100">{{ hospital.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ hospital.tipo }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ hospital.leitos_totais }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold" :class="hospital.leitos_disponiveis > 0 ? 'text-green-400' : 'text-red-400'">{{ hospital.leitos_disponiveis }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-800 text-green-100': hospital.ativo,
                  'bg-red-800 text-red-100': !hospital.ativo
                }"
              >
                {{ hospital.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="verDetalhes(hospital.id)" class="text-primary-500 hover:text-primary-400">
                Ver Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="card p-0 max-w-2xl w-full">
        <div class="flex justify-between items-center p-6 border-b border-secondary-700">
          <h3 class="text-lg font-medium text-secondary-100">Detalhes do Hospital</h3>
          <button @click="closeModal" class="text-secondary-400 hover:text-white">
            <span class="sr-only">Fechar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="hospitalDetalhes" class="space-y-4 p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-secondary-500">Nome</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.nome }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Tipo</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.tipo }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Endereço</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.endereco }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Telefone</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.telefone }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Email</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.email }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Diretor</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.diretor }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Leitos Totais</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.leitos_totais }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Leitos Disponíveis</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.leitos_disponiveis }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Ponto de Emergência</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.ponto_emergencia ? 'Sim' : 'Não' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500">Status</p>
              <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.ativo ? 'Ativo' : 'Inativo' }}</p>
            </div>
          </div>

          <div v-if="hospitalDetalhes.servicos_emergencia">
            <p class="text-sm font-medium text-secondary-500">Serviços de Emergência</p>
            <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.servicos_emergencia }}</p>
          </div>

          <div v-if="hospitalDetalhes.capacidade_emergencia">
            <p class="text-sm font-medium text-secondary-500">Capacidade de Emergência</p>
            <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.capacidade_emergencia }} leitos</p>
          </div>

          <div v-if="hospitalDetalhes.observacoes">
            <p class="text-sm font-medium text-secondary-500">Observações</p>
            <p class="mt-1 text-sm text-secondary-200">{{ hospitalDetalhes.observacoes }}</p>
          </div>
        </div>

        <div v-else class="text-center py-10">
          <p class="text-secondary-500">Carregando detalhes...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const hospitais = ref([])
const showModal = ref(false)
const hospitalDetalhes = ref(null)

const filtros = ref({
  nome: '',
  tipo: '',
  leitos_totais: '',
  leitos_disponiveis: '',
  status: ''
})

const hospitaisFiltrados = computed(() => {
  return hospitais.value.filter(h => {
    const nomeOk = filtros.value.nome === '' || h.nome?.toLowerCase().includes(filtros.value.nome.toLowerCase())
    const tipoOk = filtros.value.tipo === '' || h.tipo?.toLowerCase().includes(filtros.value.tipo.toLowerCase())
    const leitosTotaisOk = filtros.value.leitos_totais === '' || String(h.leitos_totais) === String(filtros.value.leitos_totais)
    const leitosDispOk = filtros.value.leitos_disponiveis === '' || String(h.leitos_disponiveis) === String(filtros.value.leitos_disponiveis)
    const statusOk = filtros.value.status === '' || (filtros.value.status === 'ativo' ? h.ativo : !h.ativo)
    return nomeOk && tipoOk && leitosTotaisOk && leitosDispOk && statusOk
  })
})

const fetchHospitais = async () => {
  try {
    console.log('Buscando lista de hospitais...')
    const response = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      hospitais.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      hospitais.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      hospitais.value = []
    }

    console.log('Hospitais carregados:', hospitais.value)
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar hospitais.')
          break
        default:
          alert('Erro ao carregar hospitais. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    hospitais.value = []
  }
}

const verDetalhes = async (id) => {
  try {
    console.log('Buscando detalhes do hospital:', id)
    const response = await axios.get(`http://127.0.0.1:8000/api/hospitais/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Detalhes do hospital:', response.data)
    
    // Processa e valida os dados do hospital
    const hospitalData = response.data
    hospitalDetalhes.value = {
      id: hospitalData.id,
      nome: hospitalData.nome || 'Nome não informado',
      tipo: hospitalData.tipo || 'Tipo não informado',
      endereco: hospitalData.endereco || 'Endereço não informado',
      latitude: parseFloat(hospitalData.latitude) || 0,
      longitude: parseFloat(hospitalData.longitude) || 0,
      telefone: hospitalData.telefone || 'Telefone não informado',
      email: hospitalData.email || 'Email não informado',
      diretor: hospitalData.diretor || 'Diretor não informado',
      leitos_totais: hospitalData.leitos_totais || 0,
      leitos_disponiveis: hospitalData.leitos_disponiveis || 0,
      ponto_emergencia: hospitalData.ponto_emergencia || false,
      servicos_emergencia: hospitalData.servicos_emergencia || 'Serviços não informados',
      capacidade_emergencia: hospitalData.capacidade_emergencia || 0,
      ativo: hospitalData.ativo || false,
      observacoes: hospitalData.observacoes || 'Sem observações',
      direcao_municipal_id: hospitalData.direcao_municipal_id || null,
      created_at: hospitalData.created_at,
      updated_at: hospitalData.updated_at
    }

    showModal.value = true
  } catch (error) {
    console.error('Erro ao buscar detalhes do hospital:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar detalhes do hospital.')
          break
        case 404:
          alert('Hospital não encontrado.')
          break
        default:
          alert('Erro ao carregar detalhes do hospital. Por favor, tente novamente.')
      }
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
  }
}

const closeModal = () => {
  showModal.value = false
  hospitalDetalhes.value = null
}

onMounted(fetchHospitais)
</script> 