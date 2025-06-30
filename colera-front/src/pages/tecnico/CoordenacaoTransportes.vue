<template>
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-secondary-100">
        Coordenação de Transportes (Pedidos Pendentes)
      </h3>
    </div>

    <div v-if="erro" class="m-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md">{{ erro }}</div>
    <div v-if="loading" class="p-4 text-center text-secondary-400">Carregando pedidos...</div>
    
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Paciente</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Hospital</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Data</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="enc in encaminhamentos" :key="enc.id" class="hover:bg-secondary-700">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-100">{{ enc.triagem?.paciente?.nome || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-300">{{ enc.hospital?.nome || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-secondary-300">{{ formatarData(enc.created_at) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-800 text-yellow-100">{{ enc.status }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
              <button @click="abrirDetalhes(enc.id)" class="btn-icon-link" title="Detalhes"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
              <button @click="abrirMapa(enc)" class="btn-icon-link" title="Ver Mapa"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H8.25m7.5 0v2.25m0-2.25h-1.5m1.5 0h.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
              <button @click="abrirModalAmbulancia(enc)" class="btn-icon-link text-accent-500" title="Designar Ambulância"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5a3.375 3.375 0 013.375-3.375H15M12 14.25h.008v.008H12v-.008z" /></svg></button>
            </td>
          </tr>
          <tr v-if="!loading && encaminhamentos.length === 0">
            <td colspan="6" class="text-center text-secondary-500 py-4">Nenhum pedido pendente encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="showDetalhes" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <div class="card p-0 transform transition-all sm:my-8 sm:max-w-xl sm:w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-secondary-700 flex-shrink-0">
          <h3 class="text-lg font-medium text-secondary-100">Detalhes do Encaminhamento</h3>
          <button @click="fecharDetalhes" class="btn-icon-secondary">
             <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
           <div v-if="detalhes && detalhes.id" class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><p class="label">Paciente:</p><p class="text-secondary-200">{{ detalhes.triagem?.paciente?.nome }}</p></div>
              <div><p class="label">BI:</p><p class="text-secondary-200">{{ detalhes.triagem?.paciente?.bi_numero }}</p></div>
              <div><p class="label">Hospital:</p><p class="text-secondary-200">{{ detalhes.hospital?.nome }}</p></div>
              <div><p class="label">Data Pedido:</p><p class="text-secondary-200">{{ formatarData(detalhes.created_at) }}</p></div>
              <div class="col-span-2"><p class="label">Observações:</p><p class="text-secondary-200">{{ detalhes.observacoes || 'Nenhuma.' }}</p></div>
            </div>
            <div class="mt-4 border-t border-secondary-700 pt-4">
              <label class="label">Alterar Status</label>
              <div class="flex items-center gap-2">
                <select v-model="novoStatus" class="input-field">
                  <option value="pendente">Pendente</option>
                  <option value="em_transito">Em Trânsito</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button @click="alterarStatusEncaminhamento(detalhes)" class="btn-primary" :disabled="novoStatus === detalhes.status">Salvar</button>
              </div>
            </div>
          </div>
          <div v-else class="text-secondary-400">Carregando detalhes...</div>
        </div>
        <div class="bg-secondary-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0">
          <button type="button" @click="fecharDetalhes" class="btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
    
    <!-- Modal Designar Ambulância -->
    <div v-if="showModalAmbulancia" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
        <div class="card p-0 transform transition-all sm:my-8 sm:max-w-md sm:w-full max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-secondary-700">
              <h3 class="text-lg font-medium text-secondary-100">Designar Ambulância</h3>
              <button @click="fecharModalAmbulancia" class="btn-icon-secondary">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>
          <form @submit.prevent="designarAmbulancia">
            <div class="p-6">
                <label class="label">Selecione a ambulância</label>
                <select v-model="ambulanciaSelecionada" class="input-field" required>
                    <option value="" disabled>Selecione uma ambulância disponível...</option>
                    <option v-for="amb in ambulanciasDisponiveis" :key="amb.id" :value="amb.id">
                        {{ amb.placa }} - {{ amb.modelo }}
                    </option>
                </select>
            </div>
            <div class="bg-secondary-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" class="btn-primary">Designar</button>
              <button type="button" @click="fecharModalAmbulancia" class="btn-secondary mr-3">Cancelar</button>
            </div>
          </form>
      </div>
    </div>
    
    <!-- Modal Mapa -->
    <div v-if="showMapa" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div class="card p-0 transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
        <div class="flex items-center justify-between p-4 border-b border-secondary-700">
          <h3 class="text-lg font-medium text-secondary-100">Localização no Mapa</h3>
          <button @click="fecharMapa" class="btn-icon-secondary">
             <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-6">
          <div style="height: 500px; width: 100%" class="rounded-md overflow-hidden">
            <l-map v-if="mapCenter" :zoom="14" :center="mapCenter" style="height: 100%; width: 100%; background-color: #374151;">
              <l-tile-layer :url="tileUrl" :attribution="tileAttribution" />
              <l-marker v-if="pacienteMarker" :lat-lng="pacienteMarker">
                <l-popup>Paciente</l-popup>
              </l-marker>
              <l-marker v-if="hospitalMarker" :lat-lng="hospitalMarker">
                <l-popup>Hospital</l-popup>
              </l-marker>
            </l-map>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const encaminhamentos = ref([])
const erro = ref('')
const loading = ref(false)

const showDetalhes = ref(false)
const detalhes = ref(null)
const novoStatus = ref('')

const showModalAmbulancia = ref(false)
const ambulanciasDisponiveis = ref([])
const ambulanciaSelecionada = ref('')
const encaminhamentoParaDesignar = ref(null)
const processandoDesignacao = ref(false)

const showMapa = ref(false)
const pacienteMarker = ref(null)
const hospitalMarker = ref(null)
const mapCenter = ref(null)

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function formatarData(data) {
    if (!data) return '-'
    return new Date(data).toLocaleString('pt-AO')
}

// Haversine formula para calcular distância
function haversineDistance(coords1, coords2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const fetchEncaminhamentos = async () => {
    erro.value = ''
    loading.value = true
    try {
        const response = await api.get('/encaminhamentos?status=pendente')
        encaminhamentos.value = (response.data.data || response.data)
    } catch (e) {
        console.error(e)
        erro.value = 'Erro ao buscar pedidos de encaminhamento.'
    } finally {
        loading.value = false
    }
}

async function abrirDetalhes(id) {
    showDetalhes.value = true
    detalhes.value = null
    try {
        const response = await api.get(`/encaminhamentos/${id}`)
        detalhes.value = response.data.data || response.data
        novoStatus.value = detalhes.value.status || 'pendente'
    } catch (e) {
        detalhes.value = null
        erro.value = 'Erro ao buscar detalhes do encaminhamento.'
    }
}

function fecharDetalhes() {
    showDetalhes.value = false
    detalhes.value = null
}

async function alterarStatusEncaminhamento(enc) {
    if (!enc?.id || !novoStatus.value) return
    try {
        await api.put(`/encaminhamentos/${enc.id}`, { status: novoStatus.value })
        await fetchEncaminhamentos()
        if (detalhes.value) detalhes.value.status = novoStatus.value
        fecharDetalhes();
    } catch (e) {
        console.error(e)
        erro.value = 'Erro ao alterar status do encaminhamento.'
    }
}

async function abrirModalAmbulancia(encaminhamento) {
    encaminhamentoParaDesignar.value = encaminhamento
    ambulanciaSelecionada.value = ''
    showModalAmbulancia.value = true
    
    try {
        const res = await api.get('/ambulancias?status=disponivel')
        const ambulancias = res.data.data || res.data
        
        const pacienteCoords = encaminhamento.triagem.paciente
        
        if (!pacienteCoords || !pacienteCoords.latitude || !pacienteCoords.longitude) {
            ambulanciasDisponiveis.value = ambulancias;
            return;
        }

        const ambulanciasComDistancia = ambulancias.map(amb => ({
            ...amb,
            distancia: haversineDistance(pacienteCoords, amb)
        })).sort((a, b) => a.distancia - b.distancia)
        
        ambulanciasDisponiveis.value = ambulanciasComDistancia
        
        if (ambulanciasComDistancia.length > 0) {
            ambulanciaSelecionada.value = ambulanciasComDistancia[0].id
        }

    } catch (e) {
        console.error(e)
        erro.value = "Erro ao carregar ambulâncias."
    }
}

function fecharModalAmbulancia() {
    showModalAmbulancia.value = false
    ambulanciaSelecionada.value = ''
    encaminhamentoParaDesignar.value = null
}

async function designarAmbulancia() {
    if (!ambulanciaSelecionada.value || !encaminhamentoParaDesignar.value) return
    processandoDesignacao.value = true
    erro.value = ''

    try {
        const now = new Date().toISOString();
        const payload = { status: 'concluido', data_chegada: now }
        console.log('Enviando para encaminhamento:', payload)
        await api.put(`/encaminhamentos/${encaminhamentoParaDesignar.value.id}`, payload)

        await api.put(`/ambulancias/${ambulanciaSelecionada.value}`, {
            status: 'em_deslocamento'
        })
        
        fecharModalAmbulancia()
        await fetchEncaminhamentos()

    } catch (e) {
        console.error('Erro detalhado:', e)
        if (e.response) {
            console.error('Resposta da API:', e.response.data)
            alert('Erro 422:\n' + JSON.stringify(e.response.data, null, 2))
        }
        erro.value = e.response?.data?.message || "Erro ao designar ambulância. A API pode não suportar associar uma ambulância diretamente. Verifique a documentação."
    } finally {
        processandoDesignacao.value = false
    }
}

function abrirMapa(enc) {
    const paciente = enc.triagem?.paciente;
    const hospital = enc.hospital;

    if (paciente && paciente.latitude && paciente.longitude) {
        pacienteMarker.value = L.latLng(paciente.latitude, paciente.longitude)
        mapCenter.value = pacienteMarker.value
    }

    if (hospital && hospital.latitude && hospital.longitude) {
        hospitalMarker.value = L.latLng(hospital.latitude, hospital.longitude)
        if(!mapCenter.value) mapCenter.value = hospitalMarker.value
    }
    
    showMapa.value = true
}

function fecharMapa() {
    showMapa.value = false
    pacienteMarker.value = null
    hospitalMarker.value = null
    mapCenter.value = null
}

onMounted(fetchEncaminhamentos)
</script> 