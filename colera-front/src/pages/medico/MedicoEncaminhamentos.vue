<template>
  <PainelPrevencaoColera />
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Encaminhamentos
        </h3>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-4 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-2 sm:space-y-0">
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <select v-model="filtros.status" class="input-field">
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="em_transito">Em Trânsito</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Paciente</label>
        <input v-model="filtros.paciente" type="text" class="input-field" placeholder="Nome ou BI do paciente">
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Hospital</label>
        <input v-model="filtros.hospital" type="text" class="input-field" placeholder="Nome do hospital">
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Paciente
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Hospital
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Data
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="encaminhamento in encaminhamentosPaginados" :key="encaminhamento.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-medium text-sm">
                      {{ encaminhamento.triagem?.paciente?.nome?.charAt(0) || '?' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ encaminhamento.triagem?.paciente?.nome || 'Paciente não encontrado' }}
                  </div>
                  <div class="text-sm text-gray-500 truncate">
                    BI: {{ encaminhamento.triagem?.paciente?.bi_numero || 'N/A' }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="min-w-0">
                <div class="text-sm text-gray-900 truncate">
                  {{ encaminhamento.hospital?.nome || 'Hospital não encontrado' }}
                </div>
                <div class="text-sm text-gray-500 truncate">
                  {{ encaminhamento.hospital?.endereco || 'N/A' }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="min-w-0">
                <div class="text-sm text-gray-900 truncate">
                  {{ formatDate(encaminhamento.created_at) }}
                </div>
                <div class="text-sm text-gray-500 truncate">
                  {{ formatTime(encaminhamento.created_at) }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-yellow-100 text-yellow-800': encaminhamento.status === 'pendente',
                  'bg-blue-100 text-blue-800': encaminhamento.status === 'em_transito',
                  'bg-green-100 text-green-800': encaminhamento.status === 'concluido',
                  'bg-red-100 text-red-800': encaminhamento.status === 'cancelado'
                }"
              >
                {{ encaminhamento.status === 'pendente' ? 'Pendente' :
                   encaminhamento.status === 'em_transito' ? 'Em Trânsito' :
                   encaminhamento.status === 'concluido' ? 'Concluído' :
                   encaminhamento.status === 'cancelado' ? 'Cancelado' : 'Status Desconhecido' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-3">
                <button
                  @click="viewEncaminhamento(encaminhamento)"
                  class="text-primary-600 hover:text-primary-900 flex items-center"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="hidden sm:inline">Detalhes</span>
                </button>
                <button
                  v-if="encaminhamento.status === 'em_transito'"
                  @click="updateStatus(encaminhamento, 'concluido')"
                  class="text-green-600 hover:text-green-900 flex items-center"
                >
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="hidden sm:inline">Concluir</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="totalPaginas > 1" class="flex justify-center items-center space-x-2 py-4">
      <button @click="irParaPagina(1)" :disabled="paginaAtual === 1" class="btn-secondary px-2">«</button>
      <button @click="paginaAnterior" :disabled="paginaAtual === 1" class="btn-secondary px-2">Anterior</button>
      <span class="mx-2 text-sm">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
      <button @click="proximaPagina" :disabled="paginaAtual === totalPaginas" class="btn-secondary px-2">Próxima</button>
      <button @click="irParaPagina(totalPaginas)" :disabled="paginaAtual === totalPaginas" class="btn-secondary px-2">»</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ isCreatingEncaminhamento ? 'Novo Encaminhamento' : 'Detalhes do Encaminhamento' }}
            </h3>
            
            <!-- Formulário de Novo Encaminhamento -->
            <form v-if="isCreatingEncaminhamento" @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Triagem (Apenas Alto Risco)</label>
                <select v-model="form.triagem_id" @change="buscarHospitaisProximosParaTriagem" class="input-field" required>
                  <option value="">Selecione uma triagem de alto risco</option>
                  <option v-for="triagem in triagensAltoRisco" :key="triagem.id" :value="triagem.id">
                    {{ triagem.paciente?.nome }} - {{ formatDate(triagem.created_at) }} - Nível de Risco: Alto
                  </option>
                </select>
              </div>

              <!-- Lista de Hospitais Próximos -->
              <div v-if="hospitaisProximos.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Hospitais Próximos</h4>
                <div class="space-y-3">
                  <div v-for="(hospital, index) in hospitaisProximos" :key="hospital.id" 
                       class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                       :class="{
                         'border-primary-500 bg-primary-50': form.hospital_id === hospital.id,
                         'border-green-500 bg-green-50': index === 0 && !form.hospital_id
                       }"
                       @click="selecionarHospital(hospital)">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">
                          {{ hospital.nome }}
                          <span v-if="index === 0 && !form.hospital_id" class="ml-2 text-xs text-green-600">
                            (Sugestão do sistema)
                          </span>
                        </h5>
                        <p class="text-sm text-gray-600">{{ hospital.endereco }}</p>
                      </div>
                      <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              :class="{
                                'bg-green-100 text-green-800': hospital.leitos_disponiveis > 5,
                                'bg-yellow-100 text-yellow-800': hospital.leitos_disponiveis > 0 && hospital.leitos_disponiveis <= 5,
                                'bg-red-100 text-red-800': hospital.leitos_disponiveis === 0
                              }">
                          {{ hospital.leitos_disponiveis }} leitos disponíveis
                        </span>
                      </div>
                    </div>
                    <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span class="text-gray-500">Distância:</span>
                        <span class="ml-1 font-medium">{{ hospital.distancia.toFixed(1) }} km</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Tempo estimado:</span>
                        <span class="ml-1 font-medium">{{ formatarTempoEstimado(hospital.tempoEstimado) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="form.triagem_id" class="text-center py-4 text-gray-500">
                <span v-if="carregandoHospitais">Carregando hospitais próximos...</span>
                <span v-else>Nenhum hospital próximo encontrado ou dados incompletos.<br>Verifique se há hospitais cadastrados com latitude/longitude e leitos disponíveis.</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="3"
                  class="input-field"
                  placeholder="Adicione observações adicionais sobre o encaminhamento..."
                ></textarea>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  :disabled="!form.hospital_id"
                >
                  Criar Encaminhamento
                </button>
              </div>
            </form>

            <!-- Detalhes do Encaminhamento -->
            <div v-else class="space-y-4">
              <!-- Informações do Paciente -->
              <div class="border-b pb-4">
                <h4 class="text-sm font-medium text-gray-500">Paciente</h4>
                <div class="mt-1">
                  <p class="text-sm text-gray-900">{{ selectedEncaminhamento?.triagem?.paciente?.nome || 'Paciente não encontrado' }}</p>
                  <p class="text-sm text-gray-500">BI: {{ selectedEncaminhamento?.triagem?.paciente?.bi_numero || 'N/A' }}</p>
                </div>
              </div>

              <!-- Informações do Hospital -->
              <div class="border-b pb-4">
                <h4 class="text-sm font-medium text-gray-500">Hospital</h4>
                <div class="mt-1">
                  <p class="text-sm text-gray-900">{{ selectedEncaminhamento?.hospital?.nome || 'Hospital não encontrado' }}</p>
                  <p class="text-sm text-gray-500">{{ selectedEncaminhamento?.hospital?.endereco || 'N/A' }}</p>
                </div>
              </div>

              <!-- Data e Hora -->
              <div class="border-b pb-4">
                <h4 class="text-sm font-medium text-gray-500">Data e Hora</h4>
                <div class="mt-1">
                  <p class="text-sm text-gray-900">
                    {{ formatDate(selectedEncaminhamento?.created_at) }}
                    às
                    {{ formatTime(selectedEncaminhamento?.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Status -->
              <div class="border-b pb-4">
                <h4 class="text-sm font-medium text-gray-500">Status</h4>
                <div class="mt-1">
                  <span
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': selectedEncaminhamento?.status === 'pendente',
                      'bg-blue-100 text-blue-800': selectedEncaminhamento?.status === 'em_transito',
                      'bg-green-100 text-green-800': selectedEncaminhamento?.status === 'concluido',
                      'bg-red-100 text-red-800': selectedEncaminhamento?.status === 'cancelado'
                    }"
                  >
                    {{ selectedEncaminhamento?.status === 'pendente' ? 'Pendente' :
                       selectedEncaminhamento?.status === 'em_transito' ? 'Em Trânsito' :
                       selectedEncaminhamento?.status === 'concluido' ? 'Concluído' :
                       selectedEncaminhamento?.status === 'cancelado' ? 'Cancelado' : 'Status Desconhecido' }}
                  </span>
                </div>
              </div>

              <!-- Observações -->
              <div>
                <h4 class="text-sm font-medium text-gray-500">Observações</h4>
                <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {{ selectedEncaminhamento?.observacoes || 'Sem observações' }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de QR Code -->
    <div v-if="showQRCodeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                QR Code do Paciente
              </h3>
              <div v-if="qrCodeData" class="flex flex-col sm:flex-row items-center justify-center gap-6">
                <qrcode-vue :value="qrCodeData" :size="200" class="mb-4 sm:mb-0" />
                <div class="text-sm text-gray-600 text-left w-full max-w-xs">
                  <template v-if="qrCodeData">
                    <p class="mb-2"><span class="font-semibold">Nome:</span> {{ JSON.parse(qrCodeData).nome }}</p>
                    <p class="mb-2"><span class="font-semibold">BI:</span> {{ JSON.parse(qrCodeData).bi }}</p>
                    <p class="mb-2"><span class="font-semibold">Telefone:</span> {{ JSON.parse(qrCodeData).telefone }}</p>
                    <p class="mb-2"><span class="font-semibold">Resultado:</span> {{ JSON.parse(qrCodeData).resultado }}</p>
                  </template>
                </div>
              </div>
              <div v-else class="text-red-600">
                Erro ao gerar QR Code
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="closeQRCodeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="triagensAltoRisco.length === 0" class="text-center py-4 text-gray-500">
      Nenhuma triagem de alto risco disponível para encaminhamento.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'
import QrcodeVue from 'qrcode.vue'

const router = useRouter()
const route = useRoute()
const encaminhamentos = ref([])
const triagens = ref([])
const hospitais = ref([])
const showModal = ref(false)
const selectedEncaminhamento = ref(null)
const isCreatingEncaminhamento = ref(false)
const form = ref({
  triagem_id: '',
  hospital_id: '',
  status: 'pendente',
  observacoes: ''
})
const showQRCodeModal = ref(false)
const qrCodeData = ref(null)
const hospitaisProximos = ref([])
const carregandoHospitais = ref(false)
const filtros = ref({
  status: '',
  paciente: '',
  hospital: ''
})
const paginaAtual = ref(1)
const itensPorPagina = 10

const triagensAltoRisco = computed(() => {
  if (!Array.isArray(triagens.value)) {
    console.warn('triagens.value não é um array:', triagens.value)
    return []
  }
  return triagens.value.filter(t => t.nivel_risco === 'alto' && !t.encaminhamento)
})

const encaminhamentosFiltrados = computed(() => {
  let lista = encaminhamentos.value
  if (filtros.value.status) {
    lista = lista.filter(e => e.status === filtros.value.status)
  }
  if (filtros.value.paciente) {
    const termo = filtros.value.paciente.toLowerCase()
    lista = lista.filter(e =>
      (e.triagem?.paciente?.nome || '').toLowerCase().includes(termo) ||
      (e.triagem?.paciente?.bi_numero || '').toLowerCase().includes(termo)
    )
  }
  if (filtros.value.hospital) {
    const termo = filtros.value.hospital.toLowerCase()
    lista = lista.filter(e =>
      (e.hospital?.nome || '').toLowerCase().includes(termo)
    )
  }
  return lista
})

const totalPaginas = computed(() => {
  return Math.ceil(encaminhamentosFiltrados.value.length / itensPorPagina) || 1
})

const encaminhamentosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  return encaminhamentosFiltrados.value.slice(inicio, inicio + itensPorPagina)
})

const paginaAnterior = () => {
  if (paginaAtual.value > 1) paginaAtual.value--
}
const proximaPagina = () => {
  if (paginaAtual.value < totalPaginas.value) paginaAtual.value++
}
const irParaPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) paginaAtual.value = pagina
}

watch([filtros, encaminhamentos], () => {
  paginaAtual.value = 1
})

const fetchEncaminhamentos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/encaminhamentos', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      encaminhamentos.value = response.data.map(enc => ({
        ...enc,
        triagem: enc.triagem || {},
        hospital: enc.hospital || {},
        paciente: enc.triagem?.paciente || {}
      }))
    } else if (response.data.data && Array.isArray(response.data.data)) {
      encaminhamentos.value = response.data.data.map(enc => ({
        ...enc,
        triagem: enc.triagem || {},
        hospital: enc.hospital || {},
        paciente: enc.triagem?.paciente || {}
      }))
    } else {
      console.error('Formato de dados inesperado:', response.data)
      encaminhamentos.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar encaminhamentos:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar encaminhamentos.')
          break
        default:
          alert('Erro ao carregar encaminhamentos. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    encaminhamentos.value = []
  }
}

const fetchTriagens = async () => {
  try {
    console.log('Buscando triagens...')
    const response = await axios.get('http://127.0.0.1:8000/api/triagens', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      triagens.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      triagens.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      triagens.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar triagens:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar triagens.')
          break
        default:
          alert('Erro ao carregar triagens. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    triagens.value = []
  }
}

const fetchHospitais = async () => {
  try {
    const response = await axios.get('/api/hospitais', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    hospitais.value = response.data
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error)
  }
}

const openNewEncaminhamentoModal = () => {
  isCreatingEncaminhamento.value = true
  form.value = {
    triagem_id: '',
    hospital_id: '',
    status: 'pendente',
    observacoes: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEncaminhamento.value = null
  isCreatingEncaminhamento.value = false
  form.value = {
    triagem_id: '',
    hospital_id: '',
    status: 'pendente',
    observacoes: ''
  }
}

const buscarHospitaisProximos = async (latitude, longitude) => {
  try {
    console.log('Buscando hospitais próximos para:', { latitude, longitude })
    const response = await axios.get(`http://127.0.0.1:8000/api/hospitais/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius: 5000 // Raio de busca em metros (5km)
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API de hospitais próximos:', response.data)

    // Verifica diferentes formatos possíveis de resposta
    let hospitais = []

    if (response.data) {
      if (Array.isArray(response.data)) {
        hospitais = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        hospitais = response.data.data
      } else if (response.data.hospital) {
        if (Array.isArray(response.data.hospital)) {
          hospitais = response.data.hospital
        } else if (typeof response.data.hospital === 'object') {
          hospitais = [response.data.hospital]
        }
      } else if (typeof response.data === 'object') {
        hospitais = [response.data]
      }
    }

    // Verifica se os hospitais têm as propriedades necessárias
    hospitais = hospitais.filter(hospital => {
      const temPropriedadesNecessarias = 
        hospital && 
        typeof hospital === 'object' && 
        'id' in hospital && 
        'nome' in hospital &&
        'latitude' in hospital &&
        'longitude' in hospital

      if (!temPropriedadesNecessarias) {
        console.log('Hospital inválido:', hospital)
      }

      return temPropriedadesNecessarias
    })

    // Adiciona informações de distância e tempo usando a API do Google Maps
    const hospitaisComInfo = await Promise.all(hospitais.map(async hospital => {
      try {
        // Calcula a distância usando a fórmula de Haversine
        const distancia = calcularDistancia(
          latitude,
          longitude,
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        )

        // Calcula o tempo estimado usando a API do Google Maps
        const tempoEstimado = await calcularTempoGoogleMaps(
          latitude,
          longitude,
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        )

        return {
          ...hospital,
          distancia,
          tempoEstimado,
          score: calcularScore(hospital, distancia, tempoEstimado)
        }
      } catch (error) {
        console.error('Erro ao processar hospital:', hospital.nome, error)
        return {
          ...hospital,
          distancia: calcularDistancia(
            latitude,
            longitude,
            parseFloat(hospital.latitude),
            parseFloat(hospital.longitude)
          ),
          tempoEstimado: 'Não disponível',
          score: 0
        }
      }
    }))

    // Ordena hospitais por score (combinação de distância, tempo e disponibilidade)
    hospitaisComInfo.sort((a, b) => b.score - a.score)

    console.log('Hospitais processados:', hospitaisComInfo)
    return hospitaisComInfo

  } catch (error) {
    console.error('Erro ao buscar hospitais próximos:', error)
    if (error.response) {
      console.error('Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data
      })
    }
    return []
  }
}

const calcularTempoGoogleMaps = async (latOrigem, lngOrigem, latDestino, lngDestino) => {
  try {
    // Aqui você deve implementar a chamada para a API do Google Maps
    // Por enquanto, vamos usar uma estimativa baseada na distância
    const distancia = calcularDistancia(latOrigem, lngOrigem, latDestino, lngDestino)
    const tempoEmMinutos = (distancia / 40) * 60 // Considerando 40km/h em áreas urbanas
    return tempoEmMinutos
  } catch (error) {
    console.error('Erro ao calcular tempo com Google Maps:', error)
    return null
  }
}

const calcularScore = (hospital, distancia, tempoEstimado) => {
  // Fatores de pontuação
  const pesoDistancia = 0.4
  const pesoTempo = 0.3
  const pesoLeitos = 0.3

  // Normaliza a distância (menor distância = maior pontuação)
  const scoreDistancia = Math.max(0, 1 - (distancia / 10)) // 10km como distância máxima

  // Normaliza o tempo (menor tempo = maior pontuação)
  const scoreTempo = tempoEstimado ? Math.max(0, 1 - (tempoEstimado / 60)) : 0 // 60 minutos como tempo máximo

  // Normaliza a disponibilidade de leitos
  const scoreLeitos = hospital.leitos_disponiveis > 0 
    ? Math.min(1, hospital.leitos_disponiveis / 10) // 10 leitos como máximo
    : 0

  // Calcula o score final
  return (scoreDistancia * pesoDistancia) + 
         (scoreTempo * pesoTempo) + 
         (scoreLeitos * pesoLeitos)
}

const buscarHospitaisProximosParaTriagem = async () => {
  if (!form.value.triagem_id) return

  const triagemSelecionada = triagens.value.find(t => t.id === form.value.triagem_id)
  if (!triagemSelecionada || !triagemSelecionada.paciente) return

  const paciente = triagemSelecionada.paciente
  if (!paciente.latitude || !paciente.longitude) {
    alert('Localização do paciente não disponível.')
    return
  }

  try {
    carregandoHospitais.value = true
    const latitudePaciente = parseFloat(paciente.latitude)
    const longitudePaciente = parseFloat(paciente.longitude)

    const hospitais = await buscarHospitaisProximos(latitudePaciente, longitudePaciente)
    console.log('Hospitais retornados da API (antes do filtro):', hospitais)
    // Adiciona distância e tempo estimado para cada hospital
    hospitaisProximos.value = hospitais.map(hospital => ({
      ...hospital,
      distancia: calcularDistancia(
        latitudePaciente,
        longitudePaciente,
        parseFloat(hospital.latitude),
        parseFloat(hospital.longitude)
      )
    }))

    // Ordena por distância
    hospitaisProximos.value.sort((a, b) => a.distancia - b.distancia)
  } catch (error) {
    console.error('Erro ao buscar hospitais próximos:', error)
    alert('Erro ao buscar hospitais próximos. Por favor, tente novamente.')
  } finally {
    carregandoHospitais.value = false
  }
}

const calcularTempoEstimado = (distancia) => {
  // Considerando uma velocidade média de 40 km/h em áreas urbanas
  const tempoEmMinutos = (distancia / 40) * 60
  if (tempoEmMinutos < 1) {
    return 'Menos de 1 min'
  } else if (tempoEmMinutos < 60) {
    return `${Math.round(tempoEmMinutos)} min`
  } else {
    const horas = Math.floor(tempoEmMinutos / 60)
    const minutos = Math.round(tempoEmMinutos % 60)
    return `${horas}h ${minutos}min`
  }
}

const selecionarHospital = (hospital) => {
  form.value.hospital_id = hospital.id
}

const handleSubmit = async () => {
  try {
    if (!form.value.triagem_id || !form.value.hospital_id) {
      alert('Por favor, selecione uma triagem e um hospital.')
      return
    }

    const hospitalSelecionado = hospitaisProximos.value.find(h => h.id === form.value.hospital_id)
    if (!hospitalSelecionado) {
      alert('Hospital selecionado não encontrado.')
      return
    }

    // Criar o encaminhamento
    const encaminhamentoData = {
      triagem_id: form.value.triagem_id,
      hospital_id: form.value.hospital_id,
      status: 'pendente',
      nivel_risco: 'alto',
      observacoes: form.value.observacoes || `Encaminhamento para ${hospitalSelecionado.nome} - Distância: ${hospitalSelecionado.distancia.toFixed(1)}km - Tempo estimado: ${calcularTempoEstimado(hospitalSelecionado.distancia)}`
    }

    const response = await axios.post('http://127.0.0.1:8000/api/encaminhamentos', encaminhamentoData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Gerar QR Code automaticamente após criar o encaminhamento
    await gerarQRCode(response.data)

    alert('Encaminhamento criado com sucesso!')
    await fetchEncaminhamentos()
    closeModal()
  } catch (error) {
    console.error('Erro ao criar encaminhamento:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para criar encaminhamentos.')
          break
        case 422:
          const mensagensErro = error.response.data.errors || {}
          const mensagem = Object.entries(mensagensErro)
            .map(([campo, erros]) => `${campo}: ${erros.join(', ')}`)
            .join('\n')
          alert(`Erro ao criar encaminhamento:\n${mensagem}`)
          break
        default:
          alert('Erro ao criar encaminhamento. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const viewEncaminhamento = async (encaminhamento) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/encaminhamentos/${encaminhamento.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    if (response.data) {
      selectedEncaminhamento.value = response.data
      showModal.value = true
    } else {
      alert('Detalhes do encaminhamento não encontrados.')
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do encaminhamento:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar este encaminhamento.')
          break
        case 404:
          alert('Encaminhamento não encontrado.')
          break
        default:
          alert('Erro ao carregar detalhes do encaminhamento. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const updateStatus = async (encaminhamento, novoStatus) => {
  try {
    const response = await axios.put(`http://127.0.0.1:8000/api/encaminhamentos/${encaminhamento.id}`, {
      status: novoStatus
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Status atualizado com sucesso:', response.data)
    await fetchEncaminhamentos()
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para atualizar este encaminhamento.')
          break
        case 404:
          alert('Encaminhamento não encontrado.')
          break
        default:
          alert('Erro ao atualizar status. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-AO')
}

const formatTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleTimeString('pt-AO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLogout = async () => {
  try {
    // Primeiro, tenta fazer o logout na API
    await axios.post('http://127.0.0.1:8000/api/logout', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error)
    // Mesmo se der erro na API, continua com o logout local
  } finally {
    // Limpa os dados locais
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Redireciona para a página de login
    router.push('/login')
  }
}

const gerarQRCode = async (encaminhamento) => {
  try {
    // Exemplo: criar uma nova triagem antes de gerar o QRCode
    // (ajuste os dados conforme necessário)
    const pacienteId = encaminhamento.triagem?.paciente?.id || encaminhamento.triagem_id;
    if (!pacienteId) {
      alert('Paciente não encontrado para gerar triagem/QR Code.');
      return;
    }
    // Dados mínimos para POST /api/triagens
    const triagemPayload = {
      paciente_id: pacienteId,
      sintomas: {
        diarreia: false,
        vomito: false,
        desidratacao: false,
        dor_abdominal: false,
        fraqueza: false
      },
      nivel_risco: encaminhamento.triagem?.nivel_risco || 'alto',
      observacoes: 'Triagem gerada para QR Code.'
    };
    await axios.post('http://127.0.0.1:8000/api/triagens', triagemPayload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    // Depois, continue o fluxo normal de geração do QR Code
    const triagemId = encaminhamento.triagem_id || encaminhamento.triagem?.id;
    if (!triagemId) {
      alert('Triagem não encontrada para gerar QR Code.');
      return;
    }
    const response = await axios.get(`http://127.0.0.1:8000/api/triagens/${triagemId}/qr`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (response.data && response.data.dados) {
      qrCodeData.value = JSON.stringify(response.data.dados)
      showQRCodeModal.value = true
    } else {
      alert('Erro ao obter dados para QR Code: Formato de resposta inválido');
    }
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    alert('Erro ao gerar QR Code. Por favor, tente novamente.');
  }
};

const closeQRCodeModal = () => {
  showQRCodeModal.value = false
  qrCodeData.value = null
}

const formatarTempoEstimado = (tempoEmMinutos) => {
  if (!tempoEmMinutos) return 'Não disponível'
  if (tempoEmMinutos < 1) return 'Menos de 1 min'
  if (tempoEmMinutos < 60) return `${Math.round(tempoEmMinutos)} min`
  const horas = Math.floor(tempoEmMinutos / 60)
  const minutos = Math.round(tempoEmMinutos % 60)
  return `${horas}h ${minutos}min`
}

onMounted(() => {
  fetchEncaminhamentos()
  fetchTriagens()
  fetchHospitais()

  // Se houver um triagem_id na URL, abre o modal de novo encaminhamento
  const triagemId = route.query.triagem_id
  if (triagemId) {
    form.value.triagem_id = triagemId
    showModal.value = true
  }
})
</script> 