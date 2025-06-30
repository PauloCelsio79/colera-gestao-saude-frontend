<template>
  <PainelPrevencaoColera />
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Triagens
        </h3>
        <button @click="openNewTriagemModal" class="btn-primary">
          Nova Triagem
        </button>
      </div>
    </div>

    <!-- Filtros e ações -->
    <div class="px-4 py-4 bg-secondary-700/50 border-b border-secondary-700 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-2 sm:space-y-0 justify-between">
      <div class="flex flex-wrap gap-2 items-end">
        <div>
          <label class="block text-xs font-medium text-secondary-300 mb-1">Paciente</label>
          <input v-model="filtros.paciente" type="text" class="input-field" placeholder="Nome do paciente">
        </div>
        <div>
          <label class="block text-xs font-medium text-secondary-300 mb-1">BI</label>
          <input v-model="filtros.bi" type="text" class="input-field" placeholder="BI do paciente">
        </div>
        <div>
          <label class="block text-xs font-medium text-secondary-300 mb-1">Risco</label>
          <select v-model="filtros.risco" class="input-field">
            <option value="">Todos</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-secondary-300 mb-1">Data</label>
          <input v-model="filtros.data" type="date" class="input-field">
        </div>
      </div>
      <button @click="excluirTodasTriagens" class="btn-danger flex items-center px-4 py-2 mt-2 sm:mt-0">
        <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Excluir Todas
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider max-w-[120px]">Paciente</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider max-w-[90px]">Data/Hora</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider max-w-[80px]">Nível de Risco</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider max-w-[110px]">Sintomas</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider max-w-[120px]">Observações</th>
            <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <template v-if="triagensFiltradas && triagensFiltradas.length > 0">
            <tr v-for="triagem in triagensFiltradas" :key="triagem?.id"
                :class="[ 'hover:bg-secondary-700', triagem?.nivel_risco === 'alto' ? 'bg-red-900/40' : '' ]">
              <td class="px-2 py-4 whitespace-nowrap max-w-[120px] truncate">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center">
                      <span class="text-primary-300 font-medium text-xs">
                        {{ triagem?.paciente?.nome?.charAt(0) || '?' }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-2 min-w-0">
                    <div class="text-xs font-medium text-secondary-100 truncate">{{ triagem?.paciente?.nome || 'Paciente não encontrado' }}</div>
                    <div class="text-xs text-secondary-400 truncate">BI: {{ triagem?.paciente?.bi_numero || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap max-w-[90px]">
                <div class="text-xs text-secondary-200">{{ formatDate(triagem?.created_at) }}</div>
                <div class="text-xs text-secondary-400">{{ formatTime(triagem?.created_at) }}</div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap max-w-[80px]">
                <span
                  :class="{
                    'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-red-800 text-red-100': triagem?.nivel_risco === 'alto',
                    'bg-yellow-800 text-yellow-100': triagem?.nivel_risco === 'medio',
                    'bg-green-800 text-green-100': triagem?.nivel_risco === 'baixo'
                  }"
                >
                  {{ triagem?.nivel_risco === 'alto' ? 'Alto' : 
                     triagem?.nivel_risco === 'medio' ? 'Médio' : 
                     'Baixo' }}
                </span>
              </td>
              <td class="px-2 py-4 max-w-[110px]">
                <div class="flex flex-col gap-1">
                  <span v-if="triagem?.sintomas?.diarreia" class="badge-symptom bg-blue-800 text-blue-100">Diarreia</span>
                  <span v-if="triagem?.sintomas?.vomito" class="badge-symptom bg-purple-800 text-purple-100">Vômito</span>
                  <span v-if="triagem?.sintomas?.desidratacao" class="badge-symptom bg-orange-800 text-orange-100">Desidratação</span>
                  <span v-if="triagem?.sintomas?.dor_abdominal" class="badge-symptom bg-pink-800 text-pink-100">Dor Abdominal</span>
                  <span v-if="triagem?.sintomas?.fraqueza" class="badge-symptom bg-indigo-800 text-indigo-100">Fraqueza</span>
                </div>
              </td>
              <td class="px-2 py-4 max-w-[120px] truncate">
                <div class="text-xs text-secondary-300 truncate" :title="triagem?.observacoes">
                  {{ triagem?.observacoes || 'Sem observações' }}
                </div>
              </td>
              <td class="px-2 py-4 whitespace-nowrap text-right text-xs font-medium flex gap-2 justify-end">
                <button @click="viewTriagem(triagem)" class="btn-icon-link" title="Detalhes">
                   <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button @click="gerarQRCode(triagem)" class="btn-icon-link" title="Gerar QR Code">
                   <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5a.75.75 0 00-.75.75v13.5a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75zM9 9.75h.008v.008H9v-.008zm3.002 0h.008v.008h-.008v-.008zm3.002 0h.008v.008h-.008v-.008zm-6.002 3h.008v.008H9v-.008zm3.002 0h.008v.008h-.008v-.008zm3.002 0h.008v.008h-.008v-.008zm-6.002 3h.008v.008H9v-.008zm3.002 0h.008v.008h-.008v-.008zm3.002 0h.008v.008h-.008v-.008z" />
                  </svg>
                </button>
                <button @click="excluirTriagem(triagem)" class="btn-icon-danger" title="Excluir triagem">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="6" class="px-6 py-4 text-center text-secondary-500">
              Nenhuma triagem encontrada
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <div class="card p-0 transform transition-all sm:my-8 sm:max-w-2xl sm:w-full max-h-[90vh] flex flex-col">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-secondary-700 flex-shrink-0">
          <h3 class="text-lg font-medium text-secondary-100">
            <span v-if="modalState === 'form'">{{ isEditing ? 'Editar Triagem' : 'Nova Triagem' }}</span>
            <span v-if="modalState === 'details'">Detalhes da Triagem</span>
            <span v-if="modalState === 'qr'">QR Code da Triagem</span>
          </h3>
          <button @click="closeModal" class="btn-icon-secondary">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto">
          <!-- Form State -->
          <form v-if="modalState === 'form'" @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="label">Paciente *</label>
              <select v-model="form.paciente_id" class="input-field" required>
                <option disabled value="">Selecione um paciente</option>
                <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
                  {{ paciente.nome }} - {{ paciente.bi_numero }}
                </option>
              </select>
            </div>
            <div>
              <label class="label mb-2">Sintomas *</label>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <label class="flex items-center text-secondary-300">
                  <input type="checkbox" v-model="form.sintomas.diarreia" class="form-checkbox">
                  <span class="ml-2">Diarreia</span>
                </label>
                <label class="flex items-center text-secondary-300">
                  <input type="checkbox" v-model="form.sintomas.vomito" class="form-checkbox">
                  <span class="ml-2">Vômito</span>
                </label>
                <label class="flex items-center text-secondary-300">
                  <input type="checkbox" v-model="form.sintomas.desidratacao" class="form-checkbox">
                  <span class="ml-2">Desidratação</span>
                </label>
                <label class="flex items-center text-secondary-300">
                  <input type="checkbox" v-model="form.sintomas.dor_abdominal" class="form-checkbox">
                  <span class="ml-2">Dor Abdominal</span>
                </label>
                <label class="flex items-center text-secondary-300">
                  <input type="checkbox" v-model="form.sintomas.fraqueza" class="form-checkbox">
                  <span class="ml-2">Fraqueza</span>
                </label>
              </div>
            </div>
            <div>
              <label class="label">Nível de Risco *</label>
              <div
                class="mt-1 p-2 rounded-md text-center font-semibold text-lg"
                :class="{
                  'bg-secondary-700 text-secondary-300': !form.nivel_risco,
                  'bg-red-800 text-red-100': form.nivel_risco === 'alto',
                  'bg-yellow-800 text-yellow-100': form.nivel_risco === 'medio',
                  'bg-green-800 text-green-100': form.nivel_risco === 'baixo'
                }"
              >
                {{ form.nivel_risco ? (form.nivel_risco.charAt(0).toUpperCase() + form.nivel_risco.slice(1)) : 'Não Calculado' }}
              </div>
            </div>
            <div>
              <label class="label">Observações</label>
              <textarea v-model="form.observacoes" rows="3" class="input-field" placeholder="Descreva as observações sobre a triagem..."></textarea>
            </div>
          </form>

          <!-- Details State -->
          <div v-if="modalState === 'details' && triagemAtual" class="space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div><p class="label">Paciente:</p><p class="text-secondary-200">{{ triagemAtual.paciente?.nome }}</p></div>
              <div><p class="label">BI:</p><p class="text-secondary-200">{{ triagemAtual.paciente?.bi_numero }}</p></div>
              <div><p class="label">Data:</p><p class="text-secondary-200">{{ formatDate(triagemAtual.created_at) }}</p></div>
              <div><p class="label">Hora:</p><p class="text-secondary-200">{{ formatTime(triagemAtual.created_at) }}</p></div>
              <div class="col-span-2"><p class="label">Nível de Risco:</p>
                <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{'bg-red-800 text-red-100': triagemAtual.nivel_risco === 'alto', 'bg-yellow-800 text-yellow-100': triagemAtual.nivel_risco === 'medio', 'bg-green-800 text-green-100': triagemAtual.nivel_risco === 'baixo'}">
                  {{ triagemAtual.nivel_risco }}
                </span>
              </div>
              <div class="col-span-2"><p class="label">Sintomas:</p>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span v-if="triagemAtual.sintomas?.diarreia" class="badge-symptom bg-blue-800 text-blue-100">Diarreia</span>
                  <span v-if="triagemAtual.sintomas?.vomito" class="badge-symptom bg-purple-800 text-purple-100">Vômito</span>
                  <span v-if="triagemAtual.sintomas?.desidratacao" class="badge-symptom bg-orange-800 text-orange-100">Desidratação</span>
                  <span v-if="triagemAtual.sintomas?.dor_abdominal" class="badge-symptom bg-pink-800 text-pink-100">Dor Abdominal</span>
                  <span v-if="triagemAtual.sintomas?.fraqueza" class="badge-symptom bg-indigo-800 text-indigo-100">Fraqueza</span>
                </div>
              </div>
              <div class="col-span-2"><p class="label">Observações:</p><p class="text-secondary-200">{{ triagemAtual.observacoes || 'Nenhuma.' }}</p></div>
            </div>
          </div>

          <!-- QR Code State -->
          <div v-if="modalState === 'qr' && triagemAtual" class="flex flex-col items-center justify-center p-6 md:flex-row md:items-start md:gap-6">
            <!-- QR Code on the left -->
            <div class="flex flex-shrink-0 flex-col items-center">
              <h4 class="mb-2 text-lg text-secondary-200">Triagem ID: {{ triagemAtual.id }}</h4>
              <div ref="qrCodeContainer" class="rounded-lg bg-white p-4"></div>
              <p class="mt-4 text-center text-sm text-secondary-400">Apresente este QR code para um<br />encaminhamento rápido.</p>
            </div>

            <!-- Patient and Triage Data on the right -->
            <div class="mt-6 w-full md:mt-0">
              <h4 class="mb-4 border-b border-secondary-700 pb-2 text-lg font-medium text-secondary-100">Resumo da Triagem</h4>
              <div class="space-y-3 text-sm">
                <!-- Patient data -->
                <div>
                  <p class="label">Paciente:</p>
                  <p class="text-base text-secondary-200">{{ triagemAtual.paciente?.nome }}</p>
                </div>
                <div>
                  <p class="label">BI:</p>
                  <p class="text-secondary-200">{{ triagemAtual.paciente?.bi_numero }}</p>
                </div>
                <div>
                  <p class="label">Data da Triagem:</p>
                  <p class="text-secondary-200">{{ formatDate(triagemAtual.created_at) }} às {{ formatTime(triagemAtual.created_at) }}</p>
                </div>

                <!-- Triage result -->
                <div class="border-t border-secondary-700 pt-3">
                  <p class="label">Nível de Risco:</p>
                  <p
                    class="text-lg font-semibold"
                    :class="{
                      'text-red-500': triagemAtual.nivel_risco === 'alto',
                      'text-yellow-500': triagemAtual.nivel_risco === 'medio',
                      'text-green-500': triagemAtual.nivel_risco === 'baixo'
                    }"
                  >
                    {{ triagemAtual.nivel_risco ? triagemAtual.nivel_risco.charAt(0).toUpperCase() + triagemAtual.nivel_risco.slice(1) : 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="label">Sintomas Apresentados:</p>
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span v-if="triagemAtual.sintomas?.diarreia" class="badge-symptom bg-blue-800 text-blue-100">Diarreia</span>
                    <span v-if="triagemAtual.sintomas?.vomito" class="badge-symptom bg-purple-800 text-purple-100">Vômito</span>
                    <span v-if="triagemAtual.sintomas?.desidratacao" class="badge-symptom bg-orange-800 text-orange-100">Desidratação</span>
                    <span v-if="triagemAtual.sintomas?.dor_abdominal" class="badge-symptom bg-pink-800 text-pink-100">Dor Abdominal</span>
                    <span v-if="triagemAtual.sintomas?.fraqueza" class="badge-symptom bg-indigo-800 text-indigo-100">Fraqueza</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-secondary-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0">
          <button v-if="modalState === 'form'" type="button" @click="handleSubmit" class="btn-primary">
            {{ isEditing ? 'Salvar Alterações' : 'Criar Triagem' }}
          </button>
          <button type="button" @click="closeModal" class="btn-secondary mr-3">
            Fechar
          </button>
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

<style>
.badge-symptom {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium truncate;
}
</style>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'
import QRCode from 'qrcode'
import api from '@/api'

const router = useRouter()
const triagens = ref([])
const pacientes = ref([])
const hospitais = ref([])
const direcoesProvinciais = ref([])
const direcoesMunicipais = ref([])
const showModal = ref(false)
const modalState = ref('form') // 'form', 'details', 'qr'
const triagemAtual = ref(null)
const isEditing = ref(false)
const qrCodeContainer = ref(null)

const filtros = ref({
  paciente: '',
  bi: '',
  risco: '',
  data: ''
})

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
  observacoes: ''
})

const triagensFiltradas = computed(() => {
  return triagens.value.filter(t => {
    const pacienteNome = t.paciente?.nome?.toLowerCase() || ''
    const pacienteBI = t.paciente?.bi_numero?.toLowerCase() || ''
    const filtroPaciente = filtros.value.paciente.toLowerCase()
    const filtroBI = filtros.value.bi.toLowerCase()

    const matchNome = !filtroPaciente || pacienteNome.includes(filtroPaciente)
    const matchBI = !filtroBI || pacienteBI.includes(filtroBI)
    const matchRisco = !filtros.value.risco || t.nivel_risco === filtros.value.risco
    const matchData = !filtros.value.data || t.created_at.startsWith(filtros.value.data)

    return matchNome && matchBI && matchRisco && matchData
  })
})

const calcularNivelRisco = () => {
  const sintomasAtivos = Object.values(form.value.sintomas).filter(Boolean).length
  if (sintomasAtivos >= 3) form.value.nivel_risco = 'alto'
  else if (sintomasAtivos >= 2) form.value.nivel_risco = 'medio'
  else if (sintomasAtivos >= 1) form.value.nivel_risco = 'baixo'
  else form.value.nivel_risco = ''
}

watch(() => form.value.sintomas, calcularNivelRisco, { deep: true })

const fetchData = async () => {
  try {
    const [triagensRes, pacientesRes] = await Promise.all([
      api.get('/triagens'),
      api.get('/pacientes')
    ])
    triagens.value = triagensRes.data.data || triagensRes.data
    pacientes.value = pacientesRes.data.data || pacientesRes.data
  } catch (error) {
    console.error("Erro ao buscar dados iniciais:", error)
  }
}

onMounted(fetchData)

const openNewTriagemModal = () => {
  isEditing.value = false
  triagemAtual.value = null
  form.value = {
    paciente_id: '',
    sintomas: { diarreia: false, vomito: false, desidratacao: false, dor_abdominal: false, fraqueza: false },
    nivel_risco: '',
    observacoes: ''
  }
  modalState.value = 'form'
  showModal.value = true
}

const viewTriagem = (triagem) => {
  triagemAtual.value = triagem
  modalState.value = 'details'
  showModal.value = true
}

const gerarQRCode = (triagem) => {
  triagemAtual.value = triagem
  modalState.value = 'qr'
  showModal.value = true
  nextTick(() => {
    if (qrCodeContainer.value) {
      qrCodeContainer.value.innerHTML = ''
      QRCode.toCanvas(JSON.stringify({ triagemId: triagem.id, paciente: triagem.paciente.nome }), { width: 200 }, (err, canvas) => {
        if (err) console.error(err)
        qrCodeContainer.value.appendChild(canvas)
      })
    }
  })
}

const closeModal = () => {
  showModal.value = false
  triagemAtual.value = null
}

const handleSubmit = async () => {
  const data = {
    ...form.value
  };

  try {
    if (isEditing.value) {
      await api.put(`/triagens/${triagemAtual.value.id}`, data)
    } else {
      await api.post('/triagens', data)
    }
    closeModal()
    fetchData()
  } catch (error) {
    console.error("Erro ao salvar triagem:", error)
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const errorMessage = Object.values(errors).flat().join('\n');
      alert(`Erro de validação:\n${errorMessage}`);
    } else {
      alert('Ocorreu um erro ao salvar a triagem.');
    }
  }
}

const excluirTriagem = async (triagem) => {
  if (confirm(`Tem certeza que deseja excluir a triagem do paciente ${triagem.paciente.nome}?`)) {
    try {
      await api.delete(`/triagens/${triagem.id}`)
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir triagem:", error)
    }
  }
}

const excluirTodasTriagens = async () => {
  if (confirm('TEM CERTEZA? Esta ação vai excluir TODAS as triagens e não pode ser desfeita.')) {
    try {
      await api.delete('/triagens/excluir-todas')
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir todas as triagens:", error)
      alert("Ocorreu um erro ao excluir todas as triagens. Verifique se a funcionalidade é suportada pela API.");
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('pt-AO')
}
const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-AO')
}

const qrCodeData = ref(null)
const showQRCodeModal = ref(false)

const closeQRCodeModal = () => {
  showQRCodeModal.value = false
  qrCodeData.value = null
}
</script> 