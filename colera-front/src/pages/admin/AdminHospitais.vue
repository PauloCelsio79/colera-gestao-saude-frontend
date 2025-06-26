<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header com Estatísticas -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Hospitais
        </h3>
        <button
          @click="openNewHospitalModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Novo Hospital
        </button>
      </div>
      
      <!-- Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-800">Total de Hospitais</div>
          <div class="text-2xl font-bold text-blue-900">{{ estatisticas.total }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-800">Hospitais Ativos</div>
          <div class="text-2xl font-bold text-green-900">{{ estatisticas.ativos }}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-800">Pontos de Emergência</div>
          <div class="text-2xl font-bold text-purple-900">{{ estatisticas.emergencia }}</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-yellow-800">Leitos Disponíveis</div>
          <div class="text-2xl font-bold text-yellow-900">{{ estatisticas.leitosDisponiveis }}/{{ estatisticas.leitosTotais }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-red-800">Ocupação</div>
          <div class="text-2xl font-bold text-red-900">{{ estatisticas.ocupacao }}%</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por nome ou endereço..."
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div>
          <select
            v-model="selectedType"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="geral">Hospital Geral</option>
            <option value="municipal">Hospital Municipal</option>
            <option value="provincial">Hospital Provincial</option>
            <option value="centro_medico">Centro Médico</option>
            <option value="clinica">Clínica</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedStatus"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leitos
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contato
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="filteredHospitais.length > 0">
            <tr v-for="hospital in filteredHospitais" :key="hospital.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ hospital.nome }}</div>
                <div class="text-sm text-gray-500">{{ hospital.endereco }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                  'bg-blue-100 text-blue-800': hospital.tipo === 'geral',
                  'bg-green-100 text-green-800': hospital.tipo === 'municipal',
                  'bg-purple-100 text-purple-800': hospital.tipo === 'provincial',
                  'bg-yellow-100 text-yellow-800': hospital.tipo === 'centro_medico',
                  'bg-pink-100 text-pink-800': hospital.tipo === 'clinica',
                  'bg-gray-100 text-gray-800': hospital.tipo === 'outro'
                }">
                  {{ formatTipo(hospital.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ hospital.leitos_disponiveis }}/{{ hospital.leitos_totais }}</div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="h-2.5 rounded-full" 
                    :class="{
                      'bg-green-500': (hospital.leitos_disponiveis / hospital.leitos_totais) > 0.5,
                      'bg-yellow-500': (hospital.leitos_disponiveis / hospital.leitos_totais) > 0.2,
                      'bg-red-500': (hospital.leitos_disponiveis / hospital.leitos_totais) <= 0.2
                    }"
                    :style="{ width: (hospital.leitos_disponiveis / hospital.leitos_totais * 100) + '%' }"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <button
                    @click="updateHospitalStatus(hospital)"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="{
                      'bg-green-500': hospital.ativo,
                      'bg-gray-200': !hospital.ativo
                    }"
                    role="switch"
                    :aria-checked="hospital.ativo"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="{
                        'translate-x-5': hospital.ativo,
                        'translate-x-0': !hospital.ativo
                      }"
                    />
                  </button>
                  <span class="text-sm font-medium" :class="{
                    'text-green-600': hospital.ativo,
                    'text-gray-500': !hospital.ativo
                  }">
                    {{ hospital.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
                <div v-if="hospital.ponto_emergencia" class="mt-1">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Emergência
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ hospital.telefone }}</div>
                <div class="text-sm text-gray-500">{{ hospital.email }}</div>
                <div class="text-sm text-gray-500">Dir: {{ hospital.diretor }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="editHospital(hospital)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Editar
                </button>
                <button
                  @click="deleteHospital(hospital.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Nenhum hospital encontrado
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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form @submit.prevent="handleSubmit" class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingHospital ? 'Editar Hospital' : 'Novo Hospital' }}
            </h3>
            
            <div class="grid grid-cols-2 gap-6">
              <!-- Coluna da Esquerda - Formulário -->
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
                  <label class="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    v-model="form.tipo"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="geral">Hospital Geral</option>
                    <option value="municipal">Hospital Municipal</option>
                    <option value="provincial">Hospital Provincial</option>
                    <option value="centro_medico">Centro Médico</option>
                    <option value="clinica">Clínica</option>
                    <option value="outro">Outro</option>
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
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      v-model="form.latitude"
                      type="number"
                      step="any"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      v-model="form.longitude"
                      type="number"
                      step="any"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      v-model="form.telefone"
                      type="tel"
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
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Leitos Totais</label>
                    <input
                      v-model="form.leitos_totais"
                      type="number"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Leitos Disponíveis</label>
                    <input
                      v-model="form.leitos_disponiveis"
                      type="number"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
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

                <div class="flex items-center">
                  <input
                    v-model="form.ponto_emergencia"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Ponto de Emergência
                  </label>
                </div>
                <div v-if="form.ponto_emergencia">
                  <label class="block text-sm font-medium text-gray-700">Serviços de Emergência</label>
                  <input
                    v-model="form.servicos_emergencia"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="UTI, Centro Cirúrgico, Trauma, etc."
                  />
                  <label class="block text-sm font-medium text-gray-700 mt-2">Capacidade de Emergência</label>
                  <input
                    v-model="form.capacidade_emergencia"
                    type="number"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <!-- Coluna da Direita - Mapa -->
              <div class="space-y-4">
                <label class="block text-sm font-medium text-gray-700">Selecione a localização no mapa</label>
                <div 
                  ref="mapContainer" 
                  class="h-[400px] w-full rounded-lg border border-gray-300"
                ></div>
                <p class="text-sm text-gray-500">
                  Arraste o marcador para selecionar a localização exata do hospital
                </p>
              </div>
            </div>
            
            <!-- Botões de ação -->
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
              >
                {{ editingHospital ? 'Salvar' : 'Criar' }}
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
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const hospitais = ref([])
const direcoesMunicipais = ref([])
const showModal = ref(false)
const editingHospital = ref(null)
const searchTerm = ref('')
const selectedType = ref('todos')
const selectedStatus = ref('todos')

// Filtros computados
const filteredHospitais = computed(() => {
  return hospitais.value.filter(hospital => {
    const matchesSearch = hospital.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         hospital.endereco.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = selectedType.value === 'todos' || hospital.tipo === selectedType.value
    const matchesStatus = selectedStatus.value === 'todos' || 
                         (selectedStatus.value === 'ativo' && hospital.ativo) ||
                         (selectedStatus.value === 'inativo' && !hospital.ativo)
    return matchesSearch && matchesType && matchesStatus
  })
})

// Estatísticas computadas
const estatisticas = computed(() => {
  const total = hospitais.value.length
  const ativos = hospitais.value.filter(h => h.ativo).length
  const leitosTotais = hospitais.value.reduce((acc, h) => acc + h.leitos_totais, 0)
  const leitosDisponiveis = hospitais.value.reduce((acc, h) => acc + h.leitos_disponiveis, 0)
  const emergencia = hospitais.value.filter(h => h.ponto_emergencia).length

  return {
    total,
    ativos,
    leitosTotais,
    leitosDisponiveis,
    emergencia,
    ocupacao: leitosTotais ? ((leitosTotais - leitosDisponiveis) / leitosTotais * 100).toFixed(1) : 0
  }
})

const form = ref({
  nome: '',
  tipo: 'geral',
  endereco: '',
  latitude: '',
  longitude: '',
  telefone: '',
  email: '',
  diretor: '',
  leitos_totais: 0,
  leitos_disponiveis: 0,
  ponto_emergencia: false,
  servicos_emergencia: '',
  capacidade_emergencia: 0,
  ativo: true
})

const map = ref(null)
const marker = ref(null)
const mapContainer = ref(null)

const fetchHospitais = async () => {
  try {
    console.log('Buscando hospitais...')
    const response = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    let hospitaisData = []
    if (Array.isArray(response.data)) {
      hospitaisData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      hospitaisData = response.data.data
    } else if (typeof response.data === 'object') {
      // Se for um objeto único, converte para array
      hospitaisData = [response.data]
    }

    // Processa e valida cada hospital
    hospitais.value = hospitaisData
      .filter(hospital => hospital && typeof hospital === 'object')
      .map(hospital => ({
        id: hospital.id || null,
        nome: hospital.nome || 'Nome não informado',
        tipo: hospital.tipo || 'outro',
        endereco: hospital.endereco || 'Endereço não informado',
        leitos_totais: parseInt(hospital.leitos_totais) || 0,
        leitos_disponiveis: parseInt(hospital.leitos_disponiveis) || 0,
        ativo: Boolean(hospital.ativo),
        telefone: hospital.telefone || 'Telefone não informado',
        email: hospital.email || 'Email não informado',
        diretor: hospital.diretor || 'Diretor não informado',
        ponto_emergencia: Boolean(hospital.ponto_emergencia),
        servicos_emergencia: hospital.servicos_emergencia || 'Não informado',
        capacidade_emergencia: parseInt(hospital.capacidade_emergencia) || 0,
        direcao_municipal_id: hospital.direcao_municipal_id || null,
        latitude: parseFloat(hospital.latitude) || 0,
        longitude: parseFloat(hospital.longitude) || 0
      }))

    console.log('Total de hospitais carregados:', hospitais.value.length)
    console.log('Hospitais processados:', hospitais.value)
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao carregar hospitais')
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
    hospitais.value = []
  }
}

const fetchDirecoesMunicipais = async () => {
  try {
    const response = await axios.get('/api/direcoes-municipais', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    direcoesMunicipais.value = response.data
  } catch (error) {
    console.error('Erro ao buscar direções municipais:', error)
  }
}

const initMap = () => {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([-8.838333, 13.234444], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  marker.value = L.marker([-8.838333, 13.234444], {
    draggable: true
  }).addTo(map.value)

  marker.value.on('dragend', (event) => {
    const position = event.target.getLatLng()
    form.value.latitude = position.lat
    form.value.longitude = position.lng
  })

  watch([() => form.value.latitude, () => form.value.longitude], ([lat, lng]) => {
    if (lat && lng && marker.value) {
      marker.value.setLatLng([lat, lng])
      map.value.setView([lat, lng])
    }
  })
}

watch(showModal, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize()
      } else {
        initMap()
      }
    }, 100)
  }
})

const openNewHospitalModal = () => {
  editingHospital.value = null
  form.value = {
    nome: '',
    tipo: 'geral',
    endereco: '',
    latitude: '',
    longitude: '',
    telefone: '',
    email: '',
    diretor: '',
    leitos_totais: 0,
    leitos_disponiveis: 0,
    ponto_emergencia: false,
    servicos_emergencia: '',
    capacidade_emergencia: 0,
    ativo: true
  }
  showModal.value = true
}

const editHospital = (hospital) => {
  editingHospital.value = hospital
  form.value = { ...hospital }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingHospital.value = null
  form.value = {
    nome: '',
    tipo: 'geral',
    endereco: '',
    latitude: '',
    longitude: '',
    telefone: '',
    email: '',
    diretor: '',
    leitos_totais: 0,
    leitos_disponiveis: 0,
    ponto_emergencia: false,
    servicos_emergencia: '',
    capacidade_emergencia: 0,
    ativo: true
  }
}

const handleSubmit = async () => {
  try {
    console.log('Iniciando salvamento do hospital...')
    console.log('Dados do formulário:', form.value)

    // Validação básica
    if (!form.value.nome || !form.value.tipo || !form.value.endereco) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Preparar dados para envio
    const hospitalData = {
      nome: form.value.nome,
      tipo: form.value.tipo,
      endereco: form.value.endereco,
      latitude: parseFloat(form.value.latitude) || 0,
      longitude: parseFloat(form.value.longitude) || 0,
      telefone: form.value.telefone,
      email: form.value.email,
      diretor: form.value.diretor,
      leitos_totais: parseInt(form.value.leitos_totais) || 0,
      leitos_disponiveis: parseInt(form.value.leitos_disponiveis) || 0,
      ponto_emergencia: Boolean(form.value.ponto_emergencia),
      servicos_emergencia: form.value.servicos_emergencia,
      capacidade_emergencia: parseInt(form.value.capacidade_emergencia) || 0,
      ativo: Boolean(form.value.ativo)
    }

    console.log('Dados preparados para envio:', hospitalData)

    if (editingHospital.value) {
      // Atualizar hospital existente
      console.log('Atualizando hospital:', editingHospital.value.id)
      const response = await axios.put(
        `http://127.0.0.1:8000/api/hospitais/${editingHospital.value.id}`,
        hospitalData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )
      console.log('Resposta da atualização:', response.data)
    } else {
      // Criar novo hospital
      console.log('Criando novo hospital')
      const response = await axios.post(
        'http://127.0.0.1:8000/api/hospitais',
        hospitalData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )
      console.log('Resposta da criação:', response.data)
    }

    // Atualizar a lista de hospitais
    await fetchHospitais()
    
    // Fechar o modal
    closeModal()
    
    // Mostrar mensagem de sucesso
    alert(editingHospital.value ? 'Hospital atualizado com sucesso!' : 'Hospital criado com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar hospital:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao salvar hospital')
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
  }
}

const deleteHospital = async (hospitalId) => {
  if (!confirm('Tem certeza que deseja excluir este hospital?')) return
  
  try {
    await axios.delete(`/api/hospitais/${hospitalId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    await fetchHospitais()
  } catch (error) {
    console.error('Erro ao excluir hospital:', error)
  }
}

// Função para formatar o tipo do hospital
const formatTipo = (tipo) => {
  const tipos = {
    'geral': 'Hospital Geral',
    'municipal': 'Hospital Municipal',
    'provincial': 'Hospital Provincial',
    'centro_medico': 'Centro Médico',
    'clinica': 'Clínica',
    'outro': 'Outro'
  }
  return tipos[tipo] || tipo
}

// Adicionar função para recarregar os dados
const reloadHospitais = () => {
  fetchHospitais()
}

// Atualizar o onMounted para incluir um intervalo de atualização
onMounted(() => {
  fetchHospitais()
  fetchDirecoesMunicipais()
  
  // Recarregar os dados a cada 30 segundos
  const interval = setInterval(() => {
    fetchHospitais()
  }, 30000)

  // Limpar o intervalo quando o componente for desmontado
  onUnmounted(() => {
    clearInterval(interval)
  })
})

// Função para atualizar o status do hospital
const updateHospitalStatus = async (hospital) => {
  try {
    console.log('Atualizando status do hospital:', hospital.id)
    const response = await axios.put(
      `http://127.0.0.1:8000/api/hospitais/${hospital.id}`,
      {
        ...hospital,
        ativo: !hospital.ativo
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
    console.log('Resposta da atualização:', response.data)
    
    // Atualizar a lista de hospitais
    await fetchHospitais()
    
    // Mostrar mensagem de sucesso
    alert(`Hospital ${hospital.ativo ? 'desativado' : 'ativado'} com sucesso!`)
  } catch (error) {
    console.error('Erro ao atualizar status do hospital:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao atualizar status do hospital')
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
  }
}
</script>

<style>
.leaflet-container {
  height: 100%;
  width: 100%;
}

/* Adicionar estilos para o toggle switch */
.toggle-switch:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>