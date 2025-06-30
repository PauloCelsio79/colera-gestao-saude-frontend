<template>
  <div class="card">
    <!-- Header com Estatísticas -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Hospitais
        </h3>
        <button
          @click="openNewHospitalModal"
          class="btn-primary"
        >
          Novo Hospital
        </button>
      </div>
      
      <!-- Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div class="bg-blue-900/50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-200">Total de Hospitais</div>
          <div class="text-2xl font-bold text-blue-100">{{ estatisticas.total }}</div>
        </div>
        <div class="bg-green-900/50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-200">Hospitais Ativos</div>
          <div class="text-2xl font-bold text-green-100">{{ estatisticas.ativos }}</div>
        </div>
        <div class="bg-purple-900/50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-200">Pontos de Emergência</div>
          <div class="text-2xl font-bold text-purple-100">{{ estatisticas.emergencia }}</div>
        </div>
        <div class="bg-yellow-900/50 p-4 rounded-lg">
          <div class="text-sm font-medium text-yellow-200">Leitos Disponíveis</div>
          <div class="text-2xl font-bold text-yellow-100">{{ estatisticas.leitosDisponiveis }}/{{ estatisticas.leitosTotais }}</div>
        </div>
        <div class="bg-red-900/50 p-4 rounded-lg">
          <div class="text-sm font-medium text-red-200">Ocupação</div>
          <div class="text-2xl font-bold text-red-100">{{ estatisticas.ocupacao }}%</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <input v-model="searchTerm" type="text" placeholder="Buscar por nome ou endereço..." class="input-field w-full"/>
        </div>
        <div>
          <select v-model="selectedType" class="input-field w-full">
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
          <select v-model="selectedStatus" class="input-field w-full">
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Tipo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Leitos</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Contato</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <template v-if="filteredHospitais.length > 0">
            <tr v-for="hospital in filteredHospitais" :key="hospital.id" class="hover:bg-secondary-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-secondary-100">{{ hospital.nome }}</div>
                <div class="text-sm text-secondary-400">{{ hospital.endereco }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                  'bg-blue-800 text-blue-100': hospital.tipo === 'geral',
                  'bg-green-800 text-green-100': hospital.tipo === 'municipal',
                  'bg-purple-800 text-purple-100': hospital.tipo === 'provincial',
                  'bg-yellow-800 text-yellow-100': hospital.tipo === 'centro_medico',
                  'bg-pink-800 text-pink-100': hospital.tipo === 'clinica',
                  'bg-gray-700 text-gray-200': hospital.tipo === 'outro'
                }">
                  {{ formatTipo(hospital.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-secondary-100">{{ hospital.leitos_disponiveis }}/{{ hospital.leitos_totais }}</div>
                <div class="w-full bg-secondary-600 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full" :class="{
                      'bg-green-500': (hospital.leitos_disponiveis / hospital.leitos_totais) > 0.5,
                      'bg-yellow-500': (hospital.leitos_disponiveis / hospital.leitos_totais) > 0.2 && (hospital.leitos_disponiveis / hospital.leitos_totais) <= 0.5,
                      'bg-red-500': (hospital.leitos_disponiveis / hospital.leitos_totais) <= 0.2
                    }" :style="{ width: (hospital.leitos_disponiveis / hospital.leitos_totais * 100) + '%' }"></div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <button @click="updateHospitalStatus(hospital)" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" :class="{'bg-primary-600': hospital.ativo, 'bg-secondary-600': !hospital.ativo}" role="switch" :aria-checked="hospital.ativo">
                    <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="{'translate-x-5': hospital.ativo, 'translate-x-0': !hospital.ativo}" />
                  </button>
                  <span class="text-sm font-medium" :class="{'text-primary-400': hospital.ativo, 'text-secondary-400': !hospital.ativo}">
                    {{ hospital.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
                <div v-if="hospital.ponto_emergencia" class="mt-1">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-800 text-yellow-100">Emergência</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-secondary-100">{{ hospital.telefone }}</div>
                <div class="text-sm text-secondary-400">{{ hospital.email }}</div>
                <div class="text-sm text-secondary-400">Dir: {{ hospital.diretor }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="editHospital(hospital)" class="text-primary-500 hover:text-primary-400 mr-4">Editar</button>
                <button @click="deleteHospital(hospital.id)" class="text-red-500 hover:text-red-400">Excluir</button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-secondary-500">Nenhum hospital encontrado</td>
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
        <div class="inline-block align-bottom bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form @submit.prevent="handleSubmit" class="p-6">
            <h3 class="text-lg font-medium text-secondary-100 mb-4">{{ editingHospital ? 'Editar Hospital' : 'Novo Hospital' }}</h3>
            <div class="grid grid-cols-2 gap-6">
              <!-- Coluna da Esquerda - Formulário -->
              <div class="space-y-4">
                <div>
                  <label class="label">Nome</label>
                  <input v-model="form.nome" type="text" class="input-field mt-1" required />
                </div>
                <div>
                  <label class="label">Tipo</label>
                  <select v-model="form.tipo" class="input-field mt-1" required>
                    <option value="geral">Hospital Geral</option>
                    <option value="municipal">Hospital Municipal</option>
                    <option value="provincial">Hospital Provincial</option>
                    <option value="centro_medico">Centro Médico</option>
                    <option value="clinica">Clínica</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label class="label">Endereço</label>
                  <input v-model="form.endereco" type="text" class="input-field mt-1" required />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Latitude</label>
                    <input v-model="form.latitude" type="number" step="any" class="input-field mt-1" required />
                  </div>
                  <div>
                    <label class="label">Longitude</label>
                    <input v-model="form.longitude" type="number" step="any" class="input-field mt-1" required />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Leitos Totais</label>
                    <input v-model="form.leitos_totais" type="number" class="input-field mt-1" required />
                  </div>
                  <div>
                    <label class="label">Leitos Disponíveis</label>
                    <input v-model="form.leitos_disponiveis" type="number" class="input-field mt-1" required />
                  </div>
                </div>
              </div>
              <!-- Coluna da Direita - Mapa -->
              <div class="rounded-md overflow-hidden">
                <div id="map-modal" class="h-full w-full bg-secondary-700"></div>
              </div>
            </div>
            <div class="mt-6">
                <h4 class="text-md font-medium text-secondary-100 mb-2">Contato</h4>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="label">Telefone</label>
                        <input v-model="form.telefone" type="text" class="input-field mt-1" />
                    </div>
                    <div>
                        <label class="label">Email</label>
                        <input v-model="form.email" type="email" class="input-field mt-1" />
                    </div>
                    <div>
                        <label class="label">Diretor</label>
                        <input v-model="form.diretor" type="text" class="input-field mt-1" />
                    </div>
                </div>
            </div>
             <div class="flex items-center mt-4 space-x-4">
                <div class="flex items-center">
                    <input v-model="form.ativo" id="ativo" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <label for="ativo" class="ml-2 block text-sm text-secondary-200">Ativo</label>
                </div>
                <div class="flex items-center">
                    <input v-model="form.ponto_emergencia" id="ponto_emergencia" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <label for="ponto_emergencia" class="ml-2 block text-sm text-secondary-200">Ponto de Emergência</label>
                </div>
            </div>
            <div class="bg-secondary-800 pt-6 text-right space-x-3">
              <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary">Salvar Hospital</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import api from '@/api'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Data
const hospitais = ref([])
const showModal = ref(false)
const editingHospital = ref(null)
const form = ref({
  nome: '',
  tipo: 'geral',
  endereco: '',
  telefone: '',
  email: '',
  diretor: '',
  ativo: true,
  ponto_emergencia: false,
  leitos_totais: 0,
  leitos_disponiveis: 0,
  latitude: null,
  longitude: null,
  direcao_municipal_id: 1 // Adicionar um valor padrão ou buscar dinamicamente
})

// Leaflet
let mapInstance = null
const mapCenter = ref([-8.8368, 13.2343]) // Centro de Luanda
const mapZoom = ref(13)

const initMap = () => {
    // Evita múltiplas inicializações
    if (mapInstance) {
        mapInstance.remove();
    }
  
    mapInstance = L.map('map-modal').setView(mapCenter.value, mapZoom.value);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance);

    const customIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const marker = L.marker(mapCenter.value, { icon: customIcon, draggable: true }).addTo(mapInstance);
  
    marker.on('dragend', (event) => {
        const latlng = event.target.getLatLng();
        form.value.latitude = latlng.lat;
        form.value.longitude = latlng.lng;
    });

    mapInstance.on('click', (event) => {
        marker.setLatLng(event.latlng);
        form.value.latitude = event.latlng.lat;
        form.value.longitude = event.latlng.lng;
    });

    // Atualiza o form com a posição inicial do marcador
    form.value.latitude = mapCenter.value[0];
    form.value.longitude = mapCenter.value[1];
}


// Filtering
const searchTerm = ref('')
const selectedType = ref('todos')
const selectedStatus = ref('todos')

const formatTipo = (tipo) => {
  const tipos = {
    geral: 'Hospital Geral',
    municipal: 'Hospital Municipal',
    provincial: 'Hospital Provincial',
    centro_medico: 'Centro Médico',
    clinica: 'Clínica',
    outro: 'Outro',
  }
  return tipos[tipo] || tipo
}

const filteredHospitais = computed(() => {
  return hospitais.value.filter(h => {
    const searchMatch = h.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                        h.endereco.toLowerCase().includes(searchTerm.value.toLowerCase())
    const typeMatch = selectedType.value === 'todos' || h.tipo === selectedType.value
    const statusMatch = selectedStatus.value === 'todos' || h.ativo === (selectedStatus.value === 'ativo')
    return searchMatch && typeMatch && statusMatch
  })
})

const estatisticas = computed(() => {
    const total = hospitais.value.length
    const ativos = hospitais.value.filter(h => h.ativo).length
    const emergencia = hospitais.value.filter(h => h.ponto_emergencia).length
    const leitosTotais = hospitais.value.reduce((acc, h) => acc + (h.leitos_totais || 0), 0)
    const leitosDisponiveis = hospitais.value.reduce((acc, h) => acc + (h.leitos_disponiveis || 0), 0)
    const ocupacao = leitosTotais > 0 ? Math.round(((leitosTotais - leitosDisponiveis) / leitosTotais) * 100) : 0
    return { total, ativos, emergencia, leitosTotais, leitosDisponiveis, ocupacao }
})

const fetchHospitais = async () => {
  try {
    const response = await api.get('/hospitais')
    if (response.data && Array.isArray(response.data.data)) {
        hospitais.value = response.data.data
    } else if (Array.isArray(response.data)) {
        hospitais.value = response.data
    }
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error)
  }
}

const openNewHospitalModal = () => {
  editingHospital.value = null
  form.value = {
    nome: '',
    tipo: 'geral',
    endereco: '',
    telefone: '',
    email: '',
    diretor: '',
    ativo: true,
    ponto_emergencia: false,
    leitos_totais: 0,
    leitos_disponiveis: 0,
    latitude: null,
    longitude: null,
    direcao_municipal_id: 1 // Adicionar um valor padrão ou buscar dinamicamente
  }
  mapCenter.value = [-8.8368, 13.2343]
  showModal.value = true
}

const editHospital = (hospital) => {
  editingHospital.value = { ...hospital }
  form.value = { ...hospital }
  mapCenter.value = [hospital.latitude, hospital.longitude]
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingHospital.value = null
   if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
}

const handleSubmit = async () => {
  const method = editingHospital.value ? 'put' : 'post'
  const url = editingHospital.value ? `/hospitais/${editingHospital.value.id}` : '/hospitais'
  
  try {
    const response = await api[method](url, form.value)
    fetchHospitais()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar hospital:', error)
  }
}

const deleteHospital = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este hospital?')) return
  try {
    await api.delete(`/hospitais/${id}`)
    fetchHospitais()
  } catch (error) {
    console.error('Erro ao excluir hospital:', error)
  }
}

const updateHospitalStatus = async (hospital) => {
  try {
    const updatedHospital = { ...hospital, ativo: !hospital.ativo }
    const response = await api.put(`/hospitais/${hospital.id}`, updatedHospital)
    const index = hospitais.value.findIndex(h => h.id === hospital.id)
    if (index !== -1) {
      hospitais.value[index] = response.data.data || response.data
    }
  } catch (error) {
    console.error('Erro ao atualizar status do hospital:', error)
  }
}


watch(showModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
        initMap();
    });
  }
});

watch(mapCenter, (newCenter) => {
    if(mapInstance) {
        mapInstance.setView(newCenter, 13);
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                layer.setLatLng(newCenter);
            }
        });
        form.value.latitude = newCenter[0];
        form.value.longitude = newCenter[1];
    }
})

onMounted(fetchHospitais)
</script>

<style>
.leaflet-control-attribution {
  display: none !important;
}
.leaflet-tile-pane {
    filter: grayscale(1) invert(1) brightness(0.8) contrast(1.2);
}
#map-modal {
  z-index: 0;
}
</style>