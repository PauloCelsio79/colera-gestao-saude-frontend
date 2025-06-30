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
              <button @click="abrirModalAmbulancia(enc.id)" class="btn-icon-link text-accent-500" title="Designar Ambulância"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5a3.375 3.375 0 013.375-3.375H15M12 14.25h.008v.008H12v-.008z" /></svg></button>
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
              <l-marker v-if="ambulanciaMarker" :lat-lng="ambulanciaMarker" :icon="ambulanciaIcon">
                <l-popup>Ambulância</l-popup>
              </l-marker>
            </l-map>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const encaminhamentos = ref([])
const erro = ref('')
const loading = ref(false)
const showDetalhes = ref(false)
const detalhes = ref(null)
const showModalAmbulancia = ref(false)
const ambulanciasDisponiveis = ref([])
const ambulanciaSelecionada = ref('')
let encaminhamentoIdParaAmbulancia = null
const showMapa = ref(false)
const pacienteMarker = ref(null)
const ambulanciaMarker = ref(null)
const mapCenter = ref(null)
const ambulanciaIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2967/2967350.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = '© OpenStreetMap contributors'
const novoStatus = ref('')

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleString('pt-AO')
}

const fetchEncaminhamentos = async () => {
  erro.value = ''
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/encaminhamentos?status=pendente', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    encaminhamentos.value = (response.data.data || response.data).map(e => ({
      ...e,
      triagem: e.triagem || {},
      hospital: e.hospital || {}
    }))
  } catch (e) {
    erro.value = 'Erro ao buscar pedidos de encaminhamento.'
  } finally {
    loading.value = false
  }
}

async function abrirDetalhes(id) {
  showDetalhes.value = true
  detalhes.value = null
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/encaminhamentos/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    detalhes.value = response.data
    novoStatus.value = response.data.status || 'pendente'
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
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${enc.id}`, {
      status: novoStatus.value,
    }, { headers: { 'Authorization': `Bearer ${token}` }})
    await fetchEncaminhamentos()
    if (detalhes.value) detalhes.value.status = novoStatus.value
  } catch (e) {
    erro.value = 'Erro ao alterar status do encaminhamento.'
  }
}

async function abrirModalAmbulancia(id) {
  encaminhamentoIdParaAmbulancia = id
  ambulanciaSelecionada.value = ''
  await fetchAmbulanciasDisponiveis()
  showModalAmbulancia.value = true
}

function fecharModalAmbulancia() {
  showModalAmbulancia.value = false
  ambulanciaSelecionada.value = ''
  encaminhamentoIdParaAmbulancia = null
}

async function fetchAmbulanciasDisponiveis() {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://127.0.0.1:8000/api/ambulancias?status=disponivel', {
       headers: { 'Authorization': `Bearer ${token}` }
    })
    ambulanciasDisponiveis.value = response.data.data || response.data
  } catch (e) {
    erro.value = 'Erro ao buscar ambulâncias disponíveis.'
  }
}

async function designarAmbulancia() {
  if (!ambulanciaSelecionada.value || !encaminhamentoIdParaAmbulancia) return
  try {
    const token = localStorage.getItem('token')
    await axios.post(`http://127.0.0.1:8000/api/encaminhamentos/${encaminhamentoIdParaAmbulancia}/designar-ambulancia`, 
      { ambulancia_id: ambulanciaSelecionada.value }, 
      { headers: { 'Authorization': `Bearer ${token}` }}
    )
    showModalAmbulancia.value = false
    await fetchEncaminhamentos()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao designar ambulância.'
  }
}

function abrirMapa(enc) {
  const paciente = enc.triagem?.paciente
  if (paciente?.latitude && paciente?.longitude) {
    pacienteMarker.value = [parseFloat(paciente.latitude), parseFloat(paciente.longitude)]
    mapCenter.value = pacienteMarker.value
  } else {
    pacienteMarker.value = null
    mapCenter.value = [-8.8368, 13.2343] // Centro de Luanda como fallback
  }

  if (enc.ambulancia_designada?.latitude && enc.ambulancia_designada?.longitude) {
    ambulanciaMarker.value = [parseFloat(enc.ambulancia_designada.latitude), parseFloat(enc.ambulancia_designada.longitude)]
    if (pacienteMarker.value) {
      mapCenter.value = [
        (pacienteMarker.value[0] + ambulanciaMarker.value[0]) / 2,
        (pacienteMarker.value[1] + ambulanciaMarker.value[1]) / 2
      ]
    }
  } else {
    ambulanciaMarker.value = null
  }
  showMapa.value = true
}

function fecharMapa() {
  showMapa.value = false
  pacienteMarker.value = null
  ambulanciaMarker.value = null
  mapCenter.value = null
}

onMounted(fetchEncaminhamentos)
</script> 