<template>
  <div class="bg-white shadow rounded-lg p-8">
    <h1 class="text-2xl font-bold mb-4">Coordenação de Transportes</h1>
    <div v-if="erro" class="mb-4 p-2 bg-red-100 text-red-700 rounded">{{ erro }}</div>
    <div v-if="loading" class="mb-4 text-gray-500">Carregando pedidos...</div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="enc in encaminhamentos" :key="enc.id">
            <td class="px-4 py-2">{{ enc.triagem?.paciente?.nome || '-' }}</td>
            <td class="px-4 py-2">{{ enc.hospital?.nome || '-' }}</td>
            <td class="px-4 py-2">{{ formatarData(enc.created_at) }}</td>
            <td class="px-4 py-2">{{ enc.observacoes || '-' }}</td>
            <td class="px-4 py-2">
              <span class="text-yellow-700 font-semibold">{{ enc.status }}</span>
            </td>
            <td class="px-4 py-2">
              <button @click="abrirDetalhes(enc.id)" class="text-blue-600 hover:underline mr-2">Ver Detalhes</button>
              <button @click="abrirMapa(enc)" class="text-green-700 hover:underline mr-2">Ver Mapa</button>
              <button @click="aceitarEncaminhamento(enc.id)" class="text-green-700 hover:underline mr-2">Aceitar</button>
              <button @click="abrirModalAmbulancia(enc.id)" class="text-indigo-700 hover:underline mr-2">Designar Ambulância</button>
              <button @click="concluirEncaminhamento(enc.id)" class="text-gray-700 hover:underline">Concluir</button>
            </td>
          </tr>
          <tr v-if="!loading && encaminhamentos.length === 0">
            <td colspan="6" class="text-center text-gray-500 py-4">Nenhum pedido pendente encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="showDetalhes" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <h2 class="text-xl font-bold mb-4">Detalhes do Encaminhamento</h2>
        <div v-if="detalhes && detalhes.id">
          <div class="mb-2"><b>ID:</b> {{ detalhes.id || '-' }}</div>
          <div class="mb-2">
            <b>Status:</b>
            <select v-model="novoStatus" class="input-field w-auto" @change="alterarStatusEncaminhamento(detalhes)">
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          <div class="mb-2"><b>Data:</b> {{ detalhes.created_at ? formatarData(detalhes.created_at) : '-' }}</div>
          <div class="mb-2"><b>Observações:</b> {{ detalhes.observacoes || '-' }}</div>
          <div class="mb-2"><b>Hospital:</b> {{ detalhes.hospital?.nome || detalhes.hospital_nome || detalhes.hospital_id || 'Não informado' }}</div>
          <div class="mb-2"><b>Paciente:</b> {{ detalhes.triagem?.paciente?.nome || detalhes.paciente?.nome || detalhes.paciente_nome || 'Não informado' }}</div>
          <div class="mb-2"><b>BI Paciente:</b> {{ detalhes.triagem?.paciente?.bi_numero || detalhes.paciente?.bi_numero || detalhes.paciente_bi || 'Não informado' }}</div>
          <div class="mb-2"><b>Telefone Paciente:</b> {{ detalhes.triagem?.paciente?.telefone || detalhes.paciente?.telefone || detalhes.paciente_telefone || 'Não informado' }}</div>
          <div class="mb-2"><b>Nível de Risco:</b> {{ detalhes.triagem?.nivel_risco || detalhes.nivel_risco || 'Não informado' }}</div>
          <div class="mb-2"><b>Data da Triagem:</b> {{ detalhes.triagem?.created_at ? formatarData(detalhes.triagem.created_at) : (detalhes.triagem_created_at ? formatarData(detalhes.triagem_created_at) : '-') }}</div>
        </div>
        <div v-else-if="detalhes && !detalhes.id" class="text-gray-500">Encaminhamento não encontrado ou sem dados completos.</div>
        <div v-else class="text-gray-500">Carregando detalhes...</div>
        <button @click="fecharDetalhes" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    </div>

    <!-- Modal Designar Ambulância -->
    <div v-if="showModalAmbulancia" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 class="text-xl font-bold mb-4">Designar Ambulância</h2>
        <form @submit.prevent="designarAmbulancia">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Selecione a ambulância</label>
            <select v-model="ambulanciaSelecionada" class="input-field" required>
              <option value="" disabled>Selecione...</option>
              <option v-for="amb in ambulanciasDisponiveis" :key="amb.id" :value="amb.id">
                {{ amb.placa }} - {{ amb.modelo }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="fecharModalAmbulancia" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Designar</button>
          </div>
        </form>
        <button @click="fecharModalAmbulancia" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    </div>

    <!-- Modal Mapa -->
    <div v-if="showMapa" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
        <h2 class="text-xl font-bold mb-4">Localização no Mapa</h2>
        <div class="flex items-center gap-6 mb-2">
          <div class="flex items-center gap-2">
            <span class="inline-block w-4 h-4 rounded-full bg-blue-600"></span>
            <span>Paciente</span>
          </div>
          <div class="flex items-center gap-2">
            <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" alt="Ambulância" class="w-5 h-5" />
            <span>Ambulância</span>
          </div>
        </div>
        <div style="height: 400px; width: 100%">
          <l-map v-if="mapCenter" :zoom="14" :center="mapCenter" style="height: 100%; width: 100%">
            <l-tile-layer :url="tileUrl" :attribution="tileAttribution" />
            <l-marker v-if="pacienteMarker" :lat-lng="pacienteMarker">
              <l-popup>Paciente</l-popup>
            </l-marker>
            <l-marker v-if="ambulanciaMarker" :lat-lng="ambulanciaMarker" :icon="ambulanciaIcon">
              <l-popup>Ambulância</l-popup>
            </l-marker>
          </l-map>
        </div>
        <button @click="fecharMapa" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
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

async function aceitarEncaminhamento(id) {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${id}`, { status: 'em_transito' }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    await fetchEncaminhamentos()
  } catch (e) {
    erro.value = 'Erro ao aceitar encaminhamento.'
  }
}

async function concluirEncaminhamento(id) {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${id}`, { status: 'concluido' }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    await fetchEncaminhamentos()
  } catch (e) {
    erro.value = 'Erro ao concluir encaminhamento.'
  }
}

async function abrirModalAmbulancia(id) {
  encaminhamentoIdParaAmbulancia = id
  ambulanciaSelecionada.value = ''
  showModalAmbulancia.value = true
  await fetchAmbulanciasDisponiveis()
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
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    ambulanciasDisponiveis.value = response.data.data || response.data
  } catch (e) {
    ambulanciasDisponiveis.value = []
    erro.value = 'Erro ao buscar ambulâncias disponíveis.'
  }
}

async function designarAmbulancia() {
  if (!ambulanciaSelecionada.value || !encaminhamentoIdParaAmbulancia) return
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${encaminhamentoIdParaAmbulancia}`, { ambulancia_id: ambulanciaSelecionada.value }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    showModalAmbulancia.value = false
    await fetchEncaminhamentos()
  } catch (e) {
    erro.value = 'Erro ao designar ambulância.'
  }
}

function abrirMapa(enc) {
  // Pega localização do paciente
  const paciente = enc.triagem?.paciente
  if (paciente?.latitude && paciente?.longitude) {
    pacienteMarker.value = [parseFloat(paciente.latitude), parseFloat(paciente.longitude)]
    mapCenter.value = pacienteMarker.value
  } else {
    pacienteMarker.value = null
    mapCenter.value = null
  }
  // Pega localização da ambulância (se houver)
  if (enc.ambulancia && enc.ambulancia.latitude && enc.ambulancia.longitude) {
    ambulanciaMarker.value = [parseFloat(enc.ambulancia.latitude), parseFloat(enc.ambulancia.longitude)]
    // Centraliza entre os dois pontos se ambos existirem
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

async function alterarStatusEncaminhamento(enc) {
  if (!enc?.id || !novoStatus.value) return
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${enc.id}`, {
      triagem_id: enc.triagem_id || enc.triagem?.id,
      hospital_id: enc.hospital_id || enc.hospital?.id,
      status: novoStatus.value,
      observacoes: enc.observacoes || ''
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    await fetchEncaminhamentos()
    if (detalhes.value) detalhes.value.status = novoStatus.value
  } catch (e) {
    erro.value = 'Erro ao alterar status do encaminhamento.'
  }
}

onMounted(fetchEncaminhamentos)
</script> 