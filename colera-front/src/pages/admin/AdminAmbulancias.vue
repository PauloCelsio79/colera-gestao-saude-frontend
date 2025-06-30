<template>
  <div class="p-6 bg-gray-900 min-h-screen text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-white">Gestão de Ambulâncias</h1>
      <button @click="openAddModal" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
        <i class="fas fa-plus mr-2"></i> Adicionar Ambulância
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" v-model="filters.placa" placeholder="Filtrar por Placa" class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
        <select v-model="filters.status" class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <option value="">Todos os Status</option>
          <option value="disponivel">Disponível</option>
          <option value="em_servico">Em Serviço</option>
          <option value="em_manutencao">Em Manutenção</option>
        </select>
        <button @click="applyFilters" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md w-full md:w-auto">
          <i class="fas fa-filter mr-2"></i> Aplicar Filtros
        </button>
      </div>
    </div>

    <!-- Tabela de Ambulâncias -->
    <div class="bg-secondary-800 rounded-lg shadow-lg overflow-hidden border border-secondary-700">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-secondary-700/50">
            <tr>
              <th class="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Placa</th>
              <th class="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Modelo</th>
              <th class="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Ano</th>
              <th class="py-3 px-6 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th class="py-3 px-6 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary-700">
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4 text-gray-400">
                <i class="fas fa-spinner fa-spin mr-2"></i> Carregando ambulâncias...
              </td>
            </tr>
            <tr v-else-if="filteredAmbulancias.length === 0">
              <td colspan="5" class="text-center py-4 text-gray-400">Nenhuma ambulância encontrada.</td>
            </tr>
            <tr v-for="ambulancia in filteredAmbulancias" :key="ambulancia.id" class="hover:bg-secondary-700/50 transition-colors duration-200">
              <td class="py-4 px-6 text-sm text-gray-100">{{ ambulancia.placa }}</td>
              <td class="py-4 px-6 text-sm text-gray-100">{{ ambulancia.modelo }}</td>
              <td class="py-4 px-6 text-sm text-gray-100">{{ ambulancia.ano }}</td>
              <td class="py-4 px-6 text-sm">
                <span :class="getStatusClass(ambulancia.status)" class="px-3 py-1 rounded-full text-xs font-semibold inline-block">
                  {{ formatStatus(ambulancia.status) }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <button @click="openEditModal(ambulancia)" class="text-blue-400 hover:text-blue-300 mr-3 transition-colors duration-200" title="Editar">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button @click="openDeleteModal(ambulancia)" class="text-red-500 hover:text-red-400 transition-colors duration-200" title="Excluir">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Adicionar/Editar Ambulância -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-white">{{ isEditMode ? 'Editar Ambulância' : 'Adicionar Nova Ambulância' }}</h2>
        <form @submit.prevent="saveAmbulancia">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input v-model="currentAmbulancia.placa" type="text" placeholder="Placa" required class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <input v-model="currentAmbulancia.modelo" type="text" placeholder="Modelo" required class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <input v-model="currentAmbulancia.ano" type="number" placeholder="Ano" required class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <select v-model="currentAmbulancia.status" required class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500">
              <option disabled value="">Selecione o Status</option>
              <option value="disponivel">Disponível</option>
              <option value="em_servico">Em Serviço</option>
              <option value="em_manutencao">Em Manutenção</option>
            </select>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-2">Hospital de Base</label>
              <select v-model="currentAmbulancia.hospital_id" required class="input-field bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full">
                <option disabled value="">Selecione o Hospital</option>
                <option v-for="hospital in hospitais" :key="hospital.id" :value="hospital.id">
                  {{ hospital.nome }}
                </option>
              </select>
            </div>
          </div>
          <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Localização da Base (Clique no mapa para definir)</label>
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
                    <l-marker v-if="currentAmbulancia.latitude && currentAmbulancia.longitude" :lat-lng="[currentAmbulancia.latitude, currentAmbulancia.longitude]">
                        <l-popup> Localização da Base da Ambulância </l-popup>
                    </l-marker>
                  </l-map>
              </div>
              <div class="mt-2 text-sm text-gray-400">
                Lat: {{ currentAmbulancia.latitude || 'N/A' }}, Long: {{ currentAmbulancia.longitude || 'N/A' }}
              </div>
          </div>
          <div class="flex justify-end gap-4 mt-8">
            <button type="button" @click="closeModal" class="btn-secondary bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancelar</button>
            <button type="submit" class="btn-primary bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg">
                <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
                {{ isEditMode ? 'Salvar Alterações' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4 text-white">Confirmar Exclusão</h2>
            <p class="text-gray-300 mb-6">Tem certeza de que deseja excluir a ambulância com placa <span class="font-bold text-accent-400">{{ ambulanciaToDelete.placa }}</span>? Esta ação não pode ser desfeita.</p>
            <div class="flex justify-end gap-4">
                <button @click="closeDeleteModal" class="btn-secondary bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancelar</button>
                <button @click="confirmDelete" class="btn-danger bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                    <i v-if="deleting" class="fas fa-spinner fa-spin mr-2"></i>
                    Excluir
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import api from '@/api';
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Corrige o caminho do ícone padrão do Leaflet no Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

// Estado reativo
const ambulancias = ref([]);
const hospitais = ref([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);

const filters = ref({
  placa: '',
  status: '',
});

const showModal = ref(false);
const showDeleteConfirmation = ref(false);
const isEditMode = ref(false);

const defaultAmbulancia = {
  id: null,
  placa: '',
  modelo: '',
  ano: new Date().getFullYear(),
  status: 'disponivel',
  latitude: null,
  longitude: null,
  hospital_id: null,
};
const currentAmbulancia = ref({ ...defaultAmbulancia });
const ambulanciaToDelete = ref(null);

// Configuração do mapa
const map = ref(null);
const zoom = ref(8);
const defaultCenter = [-14.25, 14.83]; // Centro da Província da Huíla
const mapCenter = ref(defaultCenter);
const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';


// Funções
const fetchData = async () => {
  loading.value = true;
  try {
    const [ambulanciasRes, hospitaisRes] = await Promise.all([
      api.get('/ambulancias'),
      api.get('/hospitais')
    ]);

    // Processa ambulâncias
    if (ambulanciasRes.data && Array.isArray(ambulanciasRes.data.data)) {
      ambulancias.value = ambulanciasRes.data.data;
    } else if (Array.isArray(ambulanciasRes.data)) {
      ambulancias.value = ambulanciasRes.data;
    }

    // Processa hospitais
    if (hospitaisRes.data && Array.isArray(hospitaisRes.data.data)) {
      hospitais.value = hospitaisRes.data.data;
    } else if (Array.isArray(hospitaisRes.data)) {
      hospitais.value = hospitaisRes.data;
    }

  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
    ambulancias.value = [];
    hospitais.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const filteredAmbulancias = computed(() => {
    return ambulancias.value.filter(amb => {
        const placaMatch = amb.placa.toLowerCase().includes(filters.value.placa.toLowerCase());
        const statusMatch = filters.value.status ? amb.status === filters.value.status : true;
        return placaMatch && statusMatch;
    });
});

const applyFilters = () => {
  // A filtragem já é reativa com o computed property,
  // mas um botão pode ser útil para UX em cenários mais complexos.
  // Neste caso, não faz nada extra, mas mantemos para consistência.
  console.log('Filtros aplicados:', filters.value);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'disponivel':
      return 'bg-green-500 bg-opacity-20 text-green-300';
    case 'em_deslocamento':
    case 'em_servico':
      return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
    case 'manutencao':
    case 'em_manutencao':
      return 'bg-red-500 bg-opacity-20 text-red-300';
    default:
      return 'bg-gray-500 bg-opacity-20 text-gray-300';
  }
};

const formatStatus = (status) => {
  const statusMap = {
    disponivel: 'Disponível',
    em_deslocamento: 'Em Deslocamento',
    em_servico: 'Em Serviço',
    manutencao: 'Manutenção',
    em_manutencao: 'Em Manutenção',
  };
  return statusMap[status] || status.replace('_', ' ');
};

const resetCurrentAmbulancia = () => {
    currentAmbulancia.value = { ...defaultAmbulancia };
    mapCenter.value = defaultCenter;
    zoom.value = 8;
};

const openAddModal = () => {
  resetCurrentAmbulancia();
  isEditMode.value = false;
  showModal.value = true;
  nextTick(() => {
    if (map.value) {
        map.value.leafletObject.invalidateSize();
        map.value.leafletObject.setView(mapCenter.value, zoom.value);
    }
  });
};

const openEditModal = (ambulancia) => {
  isEditMode.value = true;
  currentAmbulancia.value = { ...ambulancia };
  showModal.value = true;

  nextTick(() => {
      if (map.value) {
          const lat = parseFloat(ambulancia.latitude);
          const lng = parseFloat(ambulancia.longitude);
          const newCenter = [lat || defaultCenter[0], lng || defaultCenter[1]];
          const newZoom = (lat && lng) ? 15 : 8;
          
          map.value.leafletObject.invalidateSize();
          map.value.leafletObject.setView(newCenter, newZoom);
      }
  });
};

const openDeleteModal = (ambulancia) => {
    ambulanciaToDelete.value = ambulancia;
    showDeleteConfirmation.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetCurrentAmbulancia();
};

const closeDeleteModal = () => {
    showDeleteConfirmation.value = false;
    ambulanciaToDelete.value = null;
};

const saveAmbulancia = async () => {
  if (saving.value) return;
  saving.value = true;

  try {
    const dataToSend = currentAmbulancia.value;

    if (isEditMode.value) {
      await api.put(`/ambulancias/${dataToSend.id}`, dataToSend);
    } else {
      await api.post('/ambulancias', dataToSend);
    }
    await fetchData();
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar ambulância:', error);
    if (error.response && error.response.data) {
        // Log detalhado do erro de validação da API
        console.error('Detalhes do erro da API (422):', error.response.data);
        // Aqui você pode adicionar uma notificação para o usuário com o erro específico
        alert('Erro de validação: ' + (error.response.data.message || 'Verifique os dados e tente novamente.'));
    } else {
      // Usa a mensagem de erro personalizada se o hospital não for encontrado
      alert(error.message);
    }
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
    if (deleting.value) return;
    deleting.value = true;

    try {
        await api.delete(`/ambulancias/${ambulanciaToDelete.value.id}`);
        await fetchData();
        closeDeleteModal();
    } catch (error) {
        console.error('Erro ao excluir ambulância:', error);
    } finally {
        deleting.value = false;
    }
};

const handleMapClick = (event) => {
    if (event.latlng) {
        currentAmbulancia.value.latitude = event.latlng.lat;
        currentAmbulancia.value.longitude = event.latlng.lng;
    }
};
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 border rounded-lg transition-colors duration-300;
}

.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105;
}

/* Custom scrollbar for modal */
.max-h-\[90vh\] {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.max-h-\[90vh\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[90vh\]::-webkit-scrollbar-track {
  background: #2d3748;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 10px;
  border: 2px solid #2d3748;
}
</style>