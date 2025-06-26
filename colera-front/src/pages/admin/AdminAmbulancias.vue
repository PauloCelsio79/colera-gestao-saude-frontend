<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Ambulâncias
        </h3>
        <button
          @click="openNewAmbulanciaModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Nova Ambulância
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Placa
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modelo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hospital
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localização
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="ambulancia in ambulancias" :key="ambulancia.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ ambulancia.placa }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ ambulancia.modelo }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ getHospitalName(ambulancia.hospital_id) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                'bg-green-100 text-green-800': ambulancia.status === 'disponivel',
                'bg-yellow-100 text-yellow-800': ambulancia.status === 'em_deslocamento',
                'bg-blue-100 text-blue-800': ambulancia.status === 'ocupada',
                'bg-red-100 text-red-800': ambulancia.status === 'manutencao',
                'bg-gray-200 text-gray-700': ambulancia.status === 'inativa'
              }">
                {{ getStatusLabel(ambulancia.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ ambulancia.latitude }}, {{ ambulancia.longitude }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editAmbulancia(ambulancia)"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteAmbulancia(ambulancia.id)"
                class="text-red-600 hover:text-red-900"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Gráfico de Barras -->
    <div class="p-6 flex justify-center">
      <canvas id="ambulanciasBarChart" width="400" height="220" style="max-width: 100%;"></canvas>
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
              {{ editingAmbulancia ? 'Editar Ambulância' : 'Nova Ambulância' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Placa</label>
                <input
                  v-model="form.placa"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Modelo</label>
                <input
                  v-model="form.modelo"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Hospital</label>
                <div class="relative">
                  <input
                    v-model="hospitalSearch"
                    type="text"
                    placeholder="Buscar hospital..."
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    @input="filterHospitais"
                  />
                  <div v-if="showHospitalList" class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    <ul class="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      <li
                        v-for="hospital in filteredHospitais"
                        :key="hospital.id"
                        class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50"
                        @click="selectHospital(hospital)"
                      >
                        <div class="flex items-center">
                          <span class="ml-3 block truncate">{{ hospital.nome }}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="form.status"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="disponivel">Disponível</option>
                  <option value="em_deslocamento">Em Deslocamento</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="manutencao">Em Manutenção</option>
                  <option value="inativa">Inativa</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Localização</label>
                <div 
                  ref="mapContainer" 
                  class="mt-1 h-48 w-full rounded-lg border border-gray-300"
                ></div>
                <p class="mt-1 text-sm text-gray-500">
                  Clique no mapa para selecionar a localização da ambulância
                </p>
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
                    readonly
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
                    readonly
                  />
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
              >
                {{ editingAmbulancia ? 'Salvar' : 'Criar' }}
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
import { ref, onMounted, watch, onUnmounted } from 'vue'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Chart from 'chart.js/auto'

const ambulancias = ref([])
const hospitais = ref([])
const showModal = ref(false)
const editingAmbulancia = ref(null)
const form = ref({
  placa: '',
  modelo: '',
  hospital_id: '',
  status: 'disponivel',
  latitude: '',
  longitude: ''
})

const hospitalSearch = ref('')
const showHospitalList = ref(false)
const filteredHospitais = ref([])
const map = ref(null)
const marker = ref(null)
const mapContainer = ref(null)
let barChart = null

const fetchAmbulancias = async () => {
  try {
    console.log('Buscando ambulâncias...')
    const response = await axios.get('http://127.0.0.1:8000/api/ambulancias', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    let ambulanciasData = []
    if (Array.isArray(response.data)) {
      ambulanciasData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      ambulanciasData = response.data.data
    } else if (typeof response.data === 'object') {
      // Se for um objeto único, converte para array
      ambulanciasData = [response.data]
    }

    // Processa e valida cada ambulância
    ambulancias.value = ambulanciasData
      .filter(ambulancia => ambulancia && typeof ambulancia === 'object')
      .map(ambulancia => ({
        id: ambulancia.id || null,
        placa: ambulancia.placa || 'Placa não informada',
        modelo: ambulancia.modelo || 'Modelo não informado',
        hospital_id: ambulancia.hospital_id || null,
        status: ambulancia.status || 'disponivel',
        latitude: parseFloat(ambulancia.latitude) || 0,
        longitude: parseFloat(ambulancia.longitude) || 0
      }))

    console.log('Total de ambulâncias carregadas:', ambulancias.value.length)
    console.log('Ambulâncias processadas:', ambulancias.value)

    // Atualizar a lista de hospitais se necessário
    if (hospitais.value.length === 0) {
      await fetchHospitais()
    }
  } catch (error) {
    console.error('Erro ao buscar ambulâncias:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao carregar ambulâncias')
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
    ambulancias.value = []
  }
}

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
    
    console.log('Resposta da API de hospitais:', response.data)
    
    // Garante que os dados estejam no formato correto
    let hospitaisData = []
    if (Array.isArray(response.data)) {
      hospitaisData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      hospitaisData = response.data.data
    }

    // Processa e valida cada hospital
    hospitais.value = hospitaisData
      .filter(hospital => hospital && typeof hospital === 'object')
      .map(hospital => ({
        id: hospital.id,
        nome: hospital.nome || 'Nome não informado',
        tipo: hospital.tipo || 'outro',
        endereco: hospital.endereco || 'Endereço não informado'
      }))

    console.log('Total de hospitais carregados:', hospitais.value.length)
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

const getHospitalName = (hospitalId) => {
  if (!hospitalId || !Array.isArray(hospitais.value)) return 'N/A'
  const hospital = hospitais.value.find(h => h && h.id === hospitalId)
  return hospital ? hospital.nome : 'N/A'
}

const getStatusLabel = (status) => {
  const labels = {
    disponivel: 'Disponível',
    em_deslocamento: 'Em Deslocamento',
    ocupada: 'Ocupada',
    manutencao: 'Em Manutenção',
    inativa: 'Inativa'
  }
  return labels[status] || status
}

const filterHospitais = () => {
  if (!hospitalSearch.value) {
    filteredHospitais.value = hospitais.value
  } else {
    const search = hospitalSearch.value.toLowerCase()
    filteredHospitais.value = hospitais.value.filter(hospital => 
      hospital.nome.toLowerCase().includes(search)
    )
  }
  showHospitalList.value = true
}

const selectHospital = (hospital) => {
  form.value.hospital_id = hospital.id
  hospitalSearch.value = hospital.nome
  showHospitalList.value = false
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

  map.value.on('click', (event) => {
    const { lat, lng } = event.latlng
    marker.value.setLatLng([lat, lng])
    form.value.latitude = lat
    form.value.longitude = lng
  })
}

watch([() => form.value.latitude, () => form.value.longitude], ([lat, lng]) => {
  if (lat && lng && marker.value) {
    marker.value.setLatLng([lat, lng])
    map.value.setView([lat, lng])
  }
})

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

const openNewAmbulanciaModal = () => {
  editingAmbulancia.value = null
  form.value = {
    placa: '',
    modelo: '',
    hospital_id: '',
    status: 'disponivel',
    latitude: -8.838333,
    longitude: 13.234444
  }
  hospitalSearch.value = ''
  showModal.value = true
}

const editAmbulancia = (ambulancia) => {
  editingAmbulancia.value = ambulancia
  form.value = { ...ambulancia }
  const hospital = hospitais.value.find(h => h.id === ambulancia.hospital_id)
  hospitalSearch.value = hospital ? hospital.nome : ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAmbulancia.value = null
  form.value = {
    placa: '',
    modelo: '',
    hospital_id: '',
    status: 'disponivel',
    latitude: -8.838333,
    longitude: 13.234444
  }
  hospitalSearch.value = ''
}

const handleSubmit = async () => {
  try {
    console.log('Iniciando salvamento da ambulância...')
    console.log('Dados do formulário:', form.value)

    // Validação dos campos obrigatórios
    const camposObrigatorios = {
      placa: 'Placa',
      modelo: 'Modelo',
      hospital_id: 'Hospital',
      status: 'Status',
      latitude: 'Latitude',
      longitude: 'Longitude'
    }

    const camposFaltantes = []
    for (const [campo, label] of Object.entries(camposObrigatorios)) {
      if (!form.value[campo]) {
        camposFaltantes.push(label)
      }
    }

    if (camposFaltantes.length > 0) {
      alert(`Por favor, preencha os seguintes campos: ${camposFaltantes.join(', ')}`)
      return
    }

    // Preparação dos dados
    const data = {
      placa: form.value.placa.toUpperCase(),
      modelo: form.value.modelo,
      hospital_id: parseInt(form.value.hospital_id),
      status: form.value.status,
      latitude: parseFloat(form.value.latitude),
      longitude: parseFloat(form.value.longitude)
    }

    console.log('Dados preparados para envio:', data)

    if (editingAmbulancia.value) {
      // Atualizar ambulância existente
      console.log('Atualizando ambulância:', editingAmbulancia.value.id)
      const response = await axios.put(
        `http://127.0.0.1:8000/api/ambulancias/${editingAmbulancia.value.id}`,
        data,
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
      // Criar nova ambulância
      console.log('Criando nova ambulância')
      const response = await axios.post(
        'http://127.0.0.1:8000/api/ambulancias',
        data,
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

    // Atualizar a lista de ambulâncias
    await fetchAmbulancias()
    
    // Fechar o modal
    closeModal()
    
    // Mostrar mensagem de sucesso
    alert(editingAmbulancia.value ? 'Ambulância atualizada com sucesso!' : 'Ambulância criada com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar ambulância:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      const mensagensErro = error.response.data.errors || {}
      const mensagem = Object.entries(mensagensErro)
        .map(([campo, erros]) => `${campo}: ${erros.join(', ')}`)
        .join('\n')
      alert(`Erro ao salvar ambulância:\n${mensagem}`)
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
  }
}

const deleteAmbulancia = async (ambulanciaId) => {
  if (!ambulanciaId) return
  if (!confirm('Tem certeza que deseja excluir esta ambulância?')) return
  
  try {
    await axios.delete(`http://127.0.0.1:8000/api/ambulancias/${ambulanciaId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    await fetchAmbulancias()
  } catch (error) {
    console.error('Erro ao excluir ambulância:', error)
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data)
      alert(error.response.data.message || 'Erro ao excluir ambulância')
    } else {
      alert('Erro ao excluir ambulância. Verifique a conexão com o servidor.')
    }
  }
}

// Adicionar função para recarregar os dados
const reloadAmbulancias = () => {
  fetchAmbulancias()
}

// Atualizar o onMounted para incluir um intervalo de atualização
onMounted(() => {
  fetchAmbulancias()
  fetchHospitais()
  
  // Recarregar os dados a cada 30 segundos
  const interval = setInterval(() => {
    fetchAmbulancias()
  }, 30000)

  // Limpar o intervalo quando o componente for desmontado
  onUnmounted(() => {
    clearInterval(interval)
  })

  watch(ambulancias, () => {
    setTimeout(renderBarChart, 100)
  }, { deep: true, immediate: true })
})

function renderBarChart() {
  const statusLabels = [
    'Disponível',
    'Em Deslocamento',
    'Ocupada',
    'Em Manutenção',
    'Inativa'
  ]
  const statusKeys = [
    'disponivel',
    'em_deslocamento',
    'ocupada',
    'manutencao',
    'inativa'
  ]
  const statusColors = [
    '#34d399', // verde
    '#fbbf24', // amarelo
    '#60a5fa', // azul
    '#f87171', // vermelho
    '#d1d5db'  // cinza
  ]
  const counts = statusKeys.map(key => ambulancias.value.filter(a => a.status === key).length)
  const ctx = document.getElementById('ambulanciasBarChart').getContext('2d')
  if (barChart) barChart.destroy()
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: statusLabels,
      datasets: [{
        label: 'Quantidade de Ambulâncias',
        data: counts,
        backgroundColor: statusColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Resumo das Ambulâncias por Status' }
      },
      scales: {
        y: { beginAtZero: true, precision: 0 }
      }
    }
  })
}
</script>

<style>
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>