<template>
  <PainelPrevencaoColera />
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Triagens
        </h3>
        <button
          @click="openNewTriagemModal"
          class="btn-primary"
        >
          Nova Triagem
        </button>
      </div>
    </div>

    <!-- Filtros e ações -->
    <div class="px-4 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-2 sm:space-y-0 justify-between">
      <div class="flex flex-wrap gap-2 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Paciente</label>
          <input v-model="filtros.paciente" type="text" class="input-field" placeholder="Nome do paciente">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">BI</label>
          <input v-model="filtros.bi" type="text" class="input-field" placeholder="BI do paciente">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Risco</label>
          <select v-model="filtros.risco" class="input-field">
            <option value="">Todos</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Data</label>
          <input v-model="filtros.data" type="date" class="input-field">
        </div>
      </div>
      <button @click="excluirTodasTriagens" class="btn-danger flex items-center px-4 py-2 mt-2 sm:mt-0">
        <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Excluir Todas
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px]">Paciente</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[90px]">Data/Hora</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px]">Nível de Risco</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[110px]">Sintomas</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px]">Observações</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="triagensFiltradas && triagensFiltradas.length > 0">
            <tr v-for="triagem in triagensFiltradas" :key="triagem?.id"
                :class="[ 'hover:bg-gray-50', triagem?.nivel_risco === 'alto' ? 'bg-red-50 text-red-800 font-semibold' : '' ]">
              <td class="px-2 py-4 whitespace-nowrap max-w-[120px] truncate">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-600 font-medium text-xs">
                        {{ triagem?.paciente?.nome?.charAt(0) || '?' }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-2 min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">{{ triagem?.paciente?.nome || 'Paciente não encontrado' }}</div>
                    <div class="text-xs text-gray-500 truncate">BI: {{ triagem?.paciente?.bi_numero || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap max-w-[90px]">
                <div class="text-xs text-gray-900">{{ formatDate(triagem?.created_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(triagem?.created_at) }}</div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap max-w-[80px]">
                <span
                  :class="{
                    'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-red-100 text-red-800': triagem?.nivel_risco === 'alto',
                    'bg-yellow-100 text-yellow-800': triagem?.nivel_risco === 'medio',
                    'bg-green-100 text-green-800': triagem?.nivel_risco === 'baixo'
                  }"
                >
                  {{ triagem?.nivel_risco === 'alto' ? 'Alto' : 
                     triagem?.nivel_risco === 'medio' ? 'Médio' : 
                     'Baixo' }}
                </span>
              </td>
              <td class="px-2 py-4 max-w-[110px]">
                <div class="flex flex-col gap-1">
                  <span v-if="triagem?.sintomas?.diarreia" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate">Diarreia</span>
                  <span v-if="triagem?.sintomas?.vomito" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 truncate">Vômito</span>
                  <span v-if="triagem?.sintomas?.desidratacao" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 truncate">Desidratação</span>
                  <span v-if="triagem?.sintomas?.dor_abdominal" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 truncate">Dor Abdominal</span>
                  <span v-if="triagem?.sintomas?.fraqueza" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 truncate">Fraqueza</span>
                </div>
              </td>
              <td class="px-2 py-4 max-w-[120px] truncate">
                <div class="text-xs text-gray-900 truncate">
                  {{ triagem?.observacoes || 'Sem observações' }}
                </div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap text-right text-xs font-medium flex gap-2 justify-end">
                <button
                  @click="viewTriagem(triagem)"
                  class="text-primary-600 hover:text-primary-900 flex items-center"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Detalhes
                </button>
                <button
                  @click="gerarQRCode(triagem)"
                  class="text-blue-600 hover:text-blue-900 flex items-center"
                  title="Gerar QR Code"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v4m0 0h2m-2 0h-2m6 0h-2m2 0v4m0 0h2m-2 0h-2" />
                  </svg>
                  QR Code
                </button>
                <button
                  @click="excluirTriagem(triagem)"
                  class="text-red-600 hover:text-red-900 flex items-center"
                  title="Excluir triagem"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Nenhuma triagem encontrada
            </td>
          </tr>
        </tbody>
      </table>
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
              {{ isCreatingEncaminhamento ? 'Novo Encaminhamento' : 'Nova Triagem' }}
            </h3>
            
            <!-- Formulário de Nova Triagem -->
            <form v-if="!isCreatingEncaminhamento" @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Campo Paciente -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Paciente *</label>
                <select v-model="form.paciente_id" class="input-field" required>
                  <option value="">Selecione um paciente</option>
                  <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
                    {{ paciente.nome }} - {{ paciente.bi_numero }}
                  </option>
                </select>
              </div>

              <!-- Campo Sintomas -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sintomas *</label>
                <div class="space-y-2">
                  <label class="inline-flex items-center">
                    <input type="checkbox" v-model="form.sintomas.diarreia" class="form-checkbox">
                    <span class="ml-2">Diarreia</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="checkbox" v-model="form.sintomas.vomito" class="form-checkbox">
                    <span class="ml-2">Vômito</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="checkbox" v-model="form.sintomas.desidratacao" class="form-checkbox">
                    <span class="ml-2">Desidratação</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="checkbox" v-model="form.sintomas.dor_abdominal" class="form-checkbox">
                    <span class="ml-2">Dor Abdominal</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="checkbox" v-model="form.sintomas.fraqueza" class="form-checkbox">
                    <span class="ml-2">Fraqueza</span>
                  </label>
                </div>
              </div>

              <!-- Campo Nível de Risco -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Nível de Risco *</label>
                <input
                  type="text"
                  class="input-field"
                  :class="{
                    'bg-red-100 text-red-800 font-semibold': form.nivel_risco === 'alto',
                    'bg-yellow-100 text-yellow-800 font-semibold': form.nivel_risco === 'medio',
                    'bg-green-100 text-green-800 font-semibold': form.nivel_risco === 'baixo',
                    'bg-gray-100': !['alto','medio','baixo'].includes(form.nivel_risco)
                  }"
                  :value="(form.nivel_risco.charAt(0).toUpperCase() + form.nivel_risco.slice(1) + ' Risco')"
                  readonly
                />
              </div>

              <!-- Campo Observações -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="3"
                  class="input-field"
                  placeholder="Descreva as observações sobre a triagem..."
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
                >
                  Salvar Triagem
                </button>
              </div>
            </form>

            <!-- Formulário de Encaminhamento -->
            <form v-else @submit.prevent="handleEncaminhamentoSubmit" class="space-y-4">
              <!-- Campo Paciente (somente leitura) -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Paciente</label>
                <input
                  type="text"
                  :value="editingTriagem?.paciente?.nome || 'Paciente não encontrado'"
                  class="input-field bg-gray-100"
                  readonly
                  disabled
                />
              </div>

              <!-- Campo Hospital -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Hospital *</label>
                <select 
                  v-model="form.hospital_id" 
                  class="input-field" 
                  required
                  @change="console.log('Hospital selecionado:', form.hospital_id)"
                >
                  <option value="">Selecione um hospital</option>
                  
                  <!-- Direções Provinciais -->
                  <optgroup label="Direções Provinciais">
                    <option 
                      v-for="direcao in direcoesProvinciais" 
                      :key="'prov-' + direcao.id" 
                      :value="direcao.id"
                    >
                      {{ direcao.nome }} ({{ direcao.provincia }})
                    </option>
                  </optgroup>

                  <!-- Direções Municipais -->
                  <optgroup label="Direções Municipais">
                    <option 
                      v-for="direcao in direcoesMunicipais" 
                      :key="'mun-' + direcao.id" 
                      :value="direcao.id"
                    >
                      {{ direcao.nome }} ({{ direcao.municipio }})
                    </option>
                  </optgroup>

                  <!-- Hospitais -->
                  <optgroup label="Hospitais">
                    <option 
                      v-for="hospital in hospitais" 
                      :key="'hosp-' + hospital.id" 
                      :value="hospital.id"
                    >
                      {{ hospital.nome }}
                    </option>
                  </optgroup>
                </select>
                <p v-if="hospitais.length === 0 && direcoesProvinciais.length === 0 && direcoesMunicipais.length === 0" 
                   class="mt-1 text-sm text-red-600">
                  Carregando opções...
                </p>
                <p v-else class="mt-1 text-sm text-gray-500">
                  {{ hospitais.length + direcoesProvinciais.length + direcoesMunicipais.length }} opções disponíveis
                </p>
              </div>

              <!-- Campo Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Status *</label>
                <select v-model="form.status" class="input-field" required>
                  <option value="">Selecione um status</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_transito">Em Trânsito</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              <!-- Campo Data de Chegada (visível apenas quando status é concluido) -->
              <div v-if="form.status === 'concluido'">
                <label class="block text-sm font-medium text-gray-700">Data de Chegada *</label>
                <input
                  type="datetime-local"
                  v-model="form.data_chegada"
                  class="input-field"
                  required
                />
              </div>

              <!-- Campo Observações -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="3"
                  class="input-field"
                  placeholder="Descreva as observações sobre o encaminhamento..."
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
                >
                  Criar Encaminhamento
                </button>
              </div>
            </form>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ isCreatingEncaminhamento ? 'Cancelar' : 'Fechar' }}
            </button>
            <button
              v-if="!isCreatingEncaminhamento"
              type="button"
              @click="handleSubmit"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Salvar
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
                QR Code da Triagem
              </h3>
              <div v-if="qrCodeData" class="flex flex-col sm:flex-row items-center justify-center gap-6">
                <QrcodeVue :value="qrCodeData" :size="200" class="mb-4 sm:mb-0" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const router = useRouter()
const triagens = ref([])
const pacientes = ref([])
const hospitais = ref([])
const direcoesProvinciais = ref([])
const direcoesMunicipais = ref([])
const showModal = ref(false)
const editingTriagem = ref({})
const isCreatingEncaminhamento = ref(false)
const form = ref({
  paciente_id: '',
  sintomas: {
    diarreia: false,
    vomito: false,
    desidratacao: false,
    dor_abdominal: false,
    fraqueza: false
  },
  nivel_risco: '',
  observacoes: '',
  triagem_id: '',
  hospital_id: '',
  status: 'pendente',
  data_chegada: ''
})

const filtros = ref({
  paciente: '',
  bi: '',
  risco: '',
  data: ''
})

const triagensFiltradas = computed(() => {
  return triagens.value.filter(t => {
    const nomeOk = !filtros.value.paciente || (t.paciente?.nome || '').toLowerCase().includes(filtros.value.paciente.toLowerCase())
    const biOk = !filtros.value.bi || (t.paciente?.bi_numero || '').toLowerCase().includes(filtros.value.bi.toLowerCase())
    const riscoOk = !filtros.value.risco || t.nivel_risco === filtros.value.risco
    const dataOk = !filtros.value.data || (t.created_at && t.created_at.startsWith(filtros.value.data))
    return nomeOk && biOk && riscoOk && dataOk
  })
})

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
    let triagensData = []
    if (Array.isArray(response.data)) {
      triagensData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      triagensData = response.data.data
    }

    // Processa e valida cada triagem
    triagens.value = triagensData
      .filter(triagem => triagem && typeof triagem === 'object')
      .map(triagem => ({
        id: triagem.id || null,
        paciente: triagem.paciente || { nome: 'Paciente não encontrado', bi_numero: 'N/A' },
        sintomas: triagem.sintomas || {},
        nivel_risco: triagem.nivel_risco || 'baixo',
        observacoes: triagem.observacoes || '',
        created_at: triagem.created_at || null
      }))

    console.log('Triagens processadas:', triagens.value)
  } catch (error) {
    console.error('Erro ao buscar triagens:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
    }
    triagens.value = []
  }
}

const fetchPacientes = async () => {
  try {
    console.log('Buscando pacientes...')
    const response = await axios.get('http://127.0.0.1:8000/api/pacientes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    let pacientesData = []
    if (Array.isArray(response.data)) {
      pacientesData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      pacientesData = response.data.data
    }

    pacientes.value = pacientesData
      .filter(paciente => paciente && typeof paciente === 'object')
      .map(paciente => ({
        id: paciente.id || null,
        nome: paciente.nome || 'Nome não informado',
        bi_numero: paciente.bi_numero || 'N/A'
      }))

    console.log('Pacientes processados:', pacientes.value)
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
    }
    pacientes.value = []
  }
}

const fetchHospitais = async () => {
  try {
    console.log('Iniciando busca de hospitais...')
    const token = localStorage.getItem('token')
    console.log('Token:', token)

    if (!token) {
      console.error('Token não encontrado')
      return
    }

    const response = await axios({
      method: 'get',
      url: 'http://127.0.0.1:8000/api/hospitais',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Resposta completa:', response)
    console.log('Dados dos hospitais:', response.data)

    if (!response.data) {
      console.error('Resposta vazia da API')
      hospitais.value = []
      return
    }

    // Tenta diferentes formatos de resposta
    let hospitaisData = []
    if (Array.isArray(response.data)) {
      hospitaisData = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      hospitaisData = response.data.data
    } else if (typeof response.data === 'object') {
      hospitaisData = [response.data]
    }

    console.log('Dados processados:', hospitaisData)

    // Mapeia os hospitais
    hospitais.value = hospitaisData.map(hospital => {
      console.log('Processando hospital:', hospital)
      return {
        id: hospital.id,
        nome: hospital.nome || 'Hospital sem nome'
      }
    })

    console.log('Lista final de hospitais:', hospitais.value)
  } catch (error) {
    console.error('Erro detalhado ao buscar hospitais:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      console.error('Headers do erro:', error.response.headers)
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
    } else {
      console.error('Mensagem de erro:', error.message)
    }
    hospitais.value = []
  }
}

const fetchDirecoesProvinciais = async () => {
  try {
    console.log('Buscando direções provinciais...')
    const response = await axios.get('http://127.0.0.1:8000/api/gabinetes-provinciais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta direções provinciais:', response.data)
    direcoesProvinciais.value = Array.isArray(response.data) ? response.data : 
                               response.data.data ? response.data.data : []
  } catch (error) {
    console.error('Erro ao buscar direções provinciais:', error)
    direcoesProvinciais.value = []
  }
}

const fetchDirecoesMunicipais = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/direcoes-municipais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (Array.isArray(response.data)) {
      direcoesMunicipais.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      direcoesMunicipais.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      direcoesMunicipais.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar direções municipais:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar direções municipais.')
          break
        case 404:
          console.warn('Endpoint de direções municipais não encontrado. Verificando permissões...')
          break
        default:
          alert('Erro ao carregar direções municipais. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    direcoesMunicipais.value = []
  }
}

const openNewTriagemModal = () => {
  form.value = {
    paciente_id: '',
    sintomas: {
      diarreia: false,
      vomito: false,
      desidratacao: false,
      dor_abdominal: false,
      fraqueza: false
    },
    nivel_risco: '',
    observacoes: ''
  }
  showModal.value = true
  isCreatingEncaminhamento.value = false
}

const closeModal = () => {
  showModal.value = false
  editingTriagem.value = {}
  isCreatingEncaminhamento.value = false
  hospitais.value = []
  form.value = {
    paciente_id: '',
    sintomas: {
      diarreia: false,
      vomito: false,
      desidratacao: false,
      dor_abdominal: false,
      fraqueza: false
    },
    nivel_risco: '',
    observacoes: '',
    triagem_id: '',
    hospital_id: '',
    status: 'pendente',
    data_chegada: ''
  }
}

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = x => (x * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const handleSubmit = async () => {
  try {
    // Validação dos campos obrigatórios
    if (!form.value.paciente_id) {
      alert('Por favor, selecione um paciente.')
      return
    }

    // Validação de pelo menos um sintoma
    const temSintomas = Object.values(form.value.sintomas).some(sintoma => sintoma === true)
    if (!temSintomas) {
      alert('Por favor, selecione pelo menos um sintoma.')
      return
    }

    // Validação do nível de risco
    if (!form.value.nivel_risco) {
      alert('Por favor, selecione o nível de risco.')
      return
    }

    // Envia a triagem para o backend
    const response = await axios.post('http://127.0.0.1:8000/api/triagens', {
      paciente_id: form.value.paciente_id,
      sintomas: form.value.sintomas,
      nivel_risco: form.value.nivel_risco,
      observacoes: form.value.observacoes
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Mensagem de sucesso
    alert('Triagem cadastrada com sucesso!')

    // (Opcional) Se o backend retornar info do encaminhamento, exiba:
    if (response.data.encaminhamento) {
      alert('Encaminhamento automático realizado para o hospital: ' + (response.data.encaminhamento.hospital?.nome || ''))
    }

    // Atualize a lista de triagens, feche modal, etc.
    await fetchTriagens()
    closeModal()
  } catch (error) {
    // Trate os erros normalmente
    console.error('Erro ao salvar triagem:', error)
    alert('Erro ao salvar triagem. Por favor, tente novamente.')
  }
}

const viewTriagem = async (triagem) => {
  try {
    console.log('Buscando detalhes da triagem:', triagem.id)
    const response = await axios.get(`http://127.0.0.1:8000/api/triagens/${triagem.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Detalhes da triagem:', response.data)
    
    if (!response.data) {
      throw new Error('Dados da triagem não encontrados')
    }

    showModal.value = true
    isCreatingEncaminhamento.value = false
    editingTriagem.value = {
      ...response.data,
      paciente: response.data.paciente || {},
      sintomas: response.data.sintomas || {}
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes da triagem:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar esta triagem.')
          break
        case 404:
          alert('Triagem não encontrada.')
          break
        default:
          alert('Erro ao carregar detalhes da triagem. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const createEncaminhamento = async (triagem) => {
  try {
    console.log('Criando encaminhamento para triagem:', triagem.id)
    
    // Primeiro, buscar hospitais disponíveis
    const responseHospitais = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!responseHospitais.data || responseHospitais.data.length === 0) {
      alert('Não há hospitais disponíveis para encaminhamento.')
      return
    }

    // Abrir modal de encaminhamento
    showModal.value = true
    isCreatingEncaminhamento.value = true
    editingTriagem.value = triagem
    form.value = {
      triagem_id: triagem.id,
      hospital_id: '',
      status: 'pendente',
      observacoes: '',
      data_chegada: ''
    }
    hospitais.value = responseHospitais.data
  } catch (error) {
    console.error('Erro ao preparar encaminhamento:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para criar encaminhamentos.')
          break
        default:
          alert('Erro ao carregar hospitais. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const handleEncaminhamentoSubmit = async () => {
  try {
    if (!form.value.hospital_id) {
      alert('Por favor, selecione um hospital.')
      return
    }

    if (!form.value.status) {
      alert('Por favor, selecione um status.')
      return
    }

    // Validação da data de chegada quando o status é concluido
    if (form.value.status === 'concluido' && !form.value.data_chegada) {
      alert('Por favor, informe a data de chegada quando o status for concluído.')
      return
    }

    // Preparar os dados no formato correto para a API
    const encaminhamentoData = {
      triagem_id: form.value.triagem_id,
      hospital_id: form.value.hospital_id,
      status: form.value.status,
      observacoes: form.value.observacoes || '',
      data_chegada: form.value.status === 'concluido' ? form.value.data_chegada : null
    }

    console.log('Enviando encaminhamento:', encaminhamentoData)
    const response = await axios.post('http://127.0.0.1:8000/api/encaminhamentos', encaminhamentoData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Encaminhamento criado com sucesso:', response.data)
    alert('Encaminhamento criado com sucesso!')
    closeModal()
    await fetchTriagens() // Atualiza a lista de triagens
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

const encaminharPaciente = async (triagem) => {
  try {
    if (!isValidTriagem(triagem)) {
      console.error('Triagem inválida:', triagem)
      alert('Erro: Triagem inválida')
      return
    }

    console.log('Preparando encaminhamento para paciente:', triagem.paciente?.nome)
    
    const responseHospitais = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const hospitaisData = responseHospitais.data?.data || responseHospitais.data || []
    
    if (!hospitaisData.length) {
      alert('Não há hospitais disponíveis para encaminhamento.')
      return
    }

    showModal.value = true
    isCreatingEncaminhamento.value = true
    editingTriagem.value = triagem
    form.value = {
      triagem_id: triagem.id,
      hospital_id: '',
      status: 'pendente',
      observacoes: `Encaminhamento para ${triagem.paciente?.nome || 'paciente'}`,
      data_chegada: ''
    }
    hospitais.value = hospitaisData
  } catch (error) {
    console.error('Erro ao preparar encaminhamento:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para criar encaminhamentos.')
          break
        default:
          alert('Erro ao carregar hospitais. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('pt-AO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const excluirTriagem = async (triagem) => {
  if (!confirm(`Tem certeza que deseja excluir esta triagem?`)) return
  try {
    await axios.delete(`http://127.0.0.1:8000/api/triagens/${triagem.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    alert('Triagem excluída com sucesso!')
    await fetchTriagens()
  } catch (error) {
    console.error('Erro ao excluir triagem:', error)
    alert('Erro ao excluir triagem. Por favor, tente novamente.')
  }
}

const excluirTodasTriagens = async () => {
  if (!confirm('Tem certeza que deseja excluir TODAS as triagens filtradas?')) return
  try {
    for (const t of triagensFiltradas.value) {
      await axios.delete(`http://127.0.0.1:8000/api/triagens/${t.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
    alert('Triagens excluídas com sucesso!')
    await fetchTriagens()
  } catch (error) {
    console.error('Erro ao excluir triagens:', error)
    alert('Erro ao excluir triagens. Por favor, tente novamente.')
  }
}

// Função para calcular o risco automaticamente
function calcularRisco(sintomas) {
  const total = Object.values(sintomas).filter(Boolean).length;
  if (sintomas.desidratacao || total >= 3) return 'alto';
  if (total === 2) return 'medio';
  return 'baixo';
}

// Atualiza o risco automaticamente ao mudar sintomas
watch(() => form.value.sintomas, (novosSintomas) => {
  form.value.nivel_risco = calcularRisco(novosSintomas);
}, { deep: true });

const qrCodeData = ref(null)
const showQRCodeModal = ref(false)

const gerarQRCode = async (triagem) => {
  try {
    if (!triagem?.id) {
      alert('Triagem não encontrada para gerar QR Code.');
      return;
    }
    const response = await axios.get(`http://127.0.0.1:8000/api/triagens/${triagem.id}/qr`, {
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

onMounted(async () => {
  console.log('Componente montado, iniciando carregamento de dados...')
  try {
    await Promise.all([
      fetchTriagens(),
      fetchPacientes(),
      fetchHospitais(),
      fetchDirecoesProvinciais(),
      fetchDirecoesMunicipais()
    ])
    console.log('Todos os dados iniciais carregados com sucesso')
  } catch (error) {
    console.error('Erro ao inicializar componente:', error)
  }
})
</script> 