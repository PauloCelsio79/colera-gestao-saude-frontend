<template>
  <PainelPrevencaoColera />
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Pacientes
        </h3>
        <button @click="openNewPacienteModal" class="btn-primary">
          Novo Paciente
        </button>
      </div>
    </div>

    <!-- Gráfico de Risco dos Pacientes -->
    <div v-if="!loading && !error" class="p-4 flex flex-col items-center justify-center border-b border-secondary-700">
      <div class="w-full max-w-lg h-64 mx-auto">
        <canvas id="graficoRiscoPacientes"></canvas>
      </div>
    </div>

    <!-- Filtros -->
    <div v-if="!loading && !error" class="px-4 py-4 bg-secondary-700/50 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-2 sm:space-y-0">
      <div>
        <label class="block text-xs font-medium text-secondary-300 mb-1">Nome</label>
        <input v-model="filtros.nome" type="text" class="input-field" placeholder="Nome do paciente">
      </div>
      <div>
        <label class="block text-xs font-medium text-secondary-300 mb-1">BI</label>
        <input v-model="filtros.bi" type="text" class="input-field" placeholder="BI do paciente">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-900/50 border-l-4 border-red-700">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-200">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              BI
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Telefone
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Data de Nascimento
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="paciente in pacientesFiltrados" :key="paciente.id" class="hover:bg-secondary-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-secondary-100">{{ paciente.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ paciente.bi_numero }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ paciente.telefone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ formatDate(paciente.data_nascimento) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="editPaciente(paciente)" class="btn-link mr-4">
                Editar
              </button>
              <button @click="viewTriagens(paciente)" class="btn-link">
                Ver Triagens
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="inline-block align-bottom bg-secondary-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-secondary-700">
            <h3 class="text-lg font-medium text-secondary-100 mb-4">
              {{ editingPaciente ? 'Editar Paciente' : 'Novo Paciente' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-secondary-300">Nome</label>
                <input v-model="form.nome" type="text" class="input-field mt-1" required />
              </div>
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-secondary-300">Número do BI</label>
                <input v-model="form.bi_numero" type="text" class="input-field mt-1" required />
              </div>
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-secondary-300">Telefone</label>
                <input v-model="form.telefone" type="tel" class="input-field mt-1" required />
              </div>
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-secondary-300">Data de Nascimento</label>
                <input v-model="form.data_nascimento" type="date" class="input-field mt-1" required />
              </div>
               <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-secondary-300">Gênero</label>
                <select v-model="form.genero" class="input-field mt-1" required>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-secondary-300">Endereço</label>
                <input v-model="form.endereco" type="text" class="input-field mt-1" required />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-2">Localização (Clique no mapa para definir)</label>
                <div class="w-full h-64 rounded-lg shadow-inner bg-gray-700" id="map-container">
                    <l-map
                      ref="map"
                      v-model:zoom="zoom"
                      :center="mapCenter"
                      @click="handleMapClick"
                      style="height: 100%; width: 100%; z-index: 0;"
                    >
                      <l-tile-layer
                        :url="tileLayerUrl"
                        :attribution="attribution"
                      ></l-tile-layer>
                      <l-marker v-if="form.latitude && form.longitude" :lat-lng="[form.latitude, form.longitude]">
                          <l-popup> Localização do Paciente </l-popup>
                      </l-marker>
                    </l-map>
                </div>
                <div class="mt-2 text-sm text-gray-400">
                  Lat: {{ form.latitude || 'N/A' }}, Long: {{ form.longitude || 'N/A' }}
                </div>
              </div>
            </form>
          </div>
          <div class="bg-secondary-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-secondary-700">
            <button type="button" @click="handleSubmit" class="btn-primary sm:ml-3">
              Salvar
            </button>
            <button type="button" @click="closeModal" class="btn-secondary mt-3 sm:mt-0">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import api from '@/api'
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';

// Corrige o caminho do ícone padrão do Leaflet no Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const router = useRouter()
const pacientes = ref([])
const showModal = ref(false)
const editingPaciente = ref(null)
const loading = ref(true)
const error = ref(null)

const form = ref({
  nome: '',
  bi_numero: '',
  telefone: '',
  data_nascimento: '',
  endereco: '',
  genero: '',
  latitude: '',
  longitude: ''
})

// Configuração do mapa
const map = ref(null);
const zoom = ref(8); 
const defaultCenter = [-14.25, 14.83]; 
const mapCenter = ref(defaultCenter);
const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const filtros = ref({ nome: '', bi: '' })

const pacientesFiltrados = computed(() => {
  return pacientes.value.filter(p => {
    const nomeOk = !filtros.value.nome || (p.nome || '').toLowerCase().includes(filtros.value.nome.toLowerCase())
    const biOk = !filtros.value.bi || (p.bi_numero || '').toLowerCase().includes(filtros.value.bi.toLowerCase())
    return nomeOk && biOk
  })
})

const contagemRiscos = computed(() => {
  const contagem = { alto: 0, medio: 0, baixo: 0 }
  pacientesFiltrados.value.forEach(p => {
    const risco = (p.nivel_risco || '').toLowerCase()
    if (risco === 'alto') contagem.alto++
    else if (risco === 'medio' || risco === 'médio') contagem.medio++
    else contagem.baixo++
  })
  return contagem
})

let graficoRisco = null

const renderizarGrafico = () => {
  nextTick(() => {
    const ctx = document.getElementById('graficoRiscoPacientes')
    if (!ctx) return
    if (graficoRisco) graficoRisco.destroy()

    Chart.defaults.color = '#9ca3af';

    graficoRisco = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Alto Risco', 'Médio Risco', 'Baixo Risco'],
        datasets: [{
          label: 'Número de Pacientes',
          data: [contagemRiscos.value.alto, contagemRiscos.value.medio, contagemRiscos.value.baixo],
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)',
            'rgba(249, 115, 22, 0.6)',
            'rgba(34, 197, 94, 0.6)'
          ],
          borderColor: [
            '#ef4444',
            '#f97316',
            '#22c55e'
          ],
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Distribuição de Pacientes por Nível de Risco',
            color: '#d1d5db',
            padding: {
                bottom: 20
            },
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#d1d5db',
              precision: 0
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#d1d5db'
            }
          }
        }
      }
    })
  });
}

watch(pacientesFiltrados, renderizarGrafico, { deep: true })

const fetchPacientes = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/pacientes')
    if (response.data && Array.isArray(response.data.data)) {
      pacientes.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      pacientes.value = response.data;
    }
  } catch (err) {
    console.error("Erro ao buscar pacientes:", err)
    error.value = 'Falha ao carregar pacientes.'
  } finally {
    loading.value = false
    renderizarGrafico()
  }
}

const openNewPacienteModal = () => {
  editingPaciente.value = null
  form.value = {
    nome: '',
    bi_numero: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    genero: '',
    latitude: defaultCenter[0],
    longitude: defaultCenter[1]
  }
  showModal.value = true
  nextTick(() => {
    mapCenter.value = defaultCenter;
    zoom.value = 8;
    if (map.value) {
        map.value.leafletObject.invalidateSize();
        map.value.leafletObject.setView(mapCenter.value, zoom.value);
    }
  });
}

const editPaciente = (paciente) => {
  editingPaciente.value = paciente
  form.value = { ...paciente }
  showModal.value = true
  nextTick(() => {
      if (map.value) {
          const lat = parseFloat(paciente.latitude);
          const lng = parseFloat(paciente.longitude);
          const newCenter = [lat || defaultCenter[0], lng || defaultCenter[1]];
          const newZoom = (lat && lng) ? 15 : 8;
          
          map.value.leafletObject.invalidateSize();
          map.value.leafletObject.setView(newCenter, newZoom);
      }
  });
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (editingPaciente.value) {
      await api.put(`/pacientes/${editingPaciente.value.id}`, form.value)
    } else {
      await api.post('/pacientes', form.value)
    }
    closeModal()
    fetchPacientes()
  } catch (err) {
    console.error("Erro ao salvar paciente:", err)
    error.value = 'Falha ao salvar paciente.'
  }
}

const viewTriagens = (paciente) => {
  router.push({ name: 'medico-paciente-triagens', params: { id: paciente.id } })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-AO')
}

const handleMapClick = (event) => {
    if (event.latlng) {
        form.value.latitude = event.latlng.lat;
        form.value.longitude = event.latlng.lng;
    }
};

onMounted(() => {
  fetchPacientes()
})
</script>

<style scoped>
/* ... */
</style> 