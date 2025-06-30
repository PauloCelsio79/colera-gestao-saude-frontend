<template>
  <PainelPrevencaoColera />
  <div class="space-y-6">
    <!-- Alerta de hospitais lotados -->
    <div v-if="hospitaisLotados.length > 0" class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative">
      <strong class="font-bold">Atenção!</strong>
      <span class="block">Os seguintes hospitais estão em capacidade máxima:</span>
      <ul class="list-disc ml-6 mt-2">
        <li v-for="h in hospitaisLotados" :key="h.id">{{ h.nome }}</li>
      </ul>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total de Pacientes -->
      <div class="card p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UserGroupIcon class="h-6 w-6 text-secondary-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-secondary-400 truncate">
                Total de Pacientes
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-secondary-100">
                  {{ metricas.totalPacientes }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Casos de Alto Risco -->
      <div class="card p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-secondary-400 truncate">
                Casos de Alto Risco
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-secondary-100">
                  {{ metricas.casosAltoRisco }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Leitos Disponíveis -->
      <div class="card p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <HomeIcon class="h-6 w-6 text-green-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-secondary-400 truncate">
                Leitos Disponíveis
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-secondary-100">
                  {{ metricas.leitosDisponiveis }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Ambulâncias Disponíveis -->
      <div class="card p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TruckIcon class="h-6 w-6 text-blue-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-secondary-400 truncate">
                Ambulâncias Disponíveis
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-secondary-100">
                  {{ metricas.ambulanciasDisponiveis }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <!-- Casos por Nível de Risco -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-secondary-100 mb-4">
          Casos por Nível de Risco
        </h3>
        <div class="h-64">
          <canvas ref="riscoChart"></canvas>
        </div>
      </div>

      <!-- Evolução de Casos -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-secondary-100 mb-4">
          Evolução de Casos
        </h3>
        <div class="h-64">
          <canvas ref="evolucaoChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Últimos Encaminhamentos -->
    <div class="card">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-secondary-100">
          Últimos Encaminhamentos
        </h3>
      </div>
      <div class="border-t border-secondary-700">
        <ul role="list" class="divide-y divide-secondary-700">
          <li v-for="encaminhamento in ultimosEncaminhamentos" :key="encaminhamento.id" class="px-4 py-4 sm:px-6 hover:bg-secondary-700/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="ml-3">
                  <p class="text-sm font-medium text-secondary-100">
                    {{ encaminhamento.paciente?.nome || 'N/A' }}
                  </p>
                  <p class="text-sm text-secondary-400">
                    {{ encaminhamento.hospital?.nome || 'N/A' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-800 text-yellow-100': encaminhamento.status === 'pendente',
                    'bg-blue-800 text-blue-100': encaminhamento.status === 'em_andamento',
                    'bg-green-800 text-green-100': encaminhamento.status === 'concluido'
                  }"
                >
                  {{ encaminhamento.status }}
                </span>
                <span class="ml-4 text-sm text-secondary-400">
                  {{ formatDate(encaminhamento.created_at) }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  TruckIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'

const metricas = ref({
  totalPacientes: 0,
  casosAltoRisco: 0,
  leitosDisponiveis: 0,
  ambulanciasDisponiveis: 0
})

const ultimosEncaminhamentos = ref([])
const riscoChart = ref(null)
const evolucaoChart = ref(null)

const hospitaisLotados = ref([])

// Configurações padrão para os gráficos no tema escuro
Chart.defaults.color = '#9ca3af'; // Cor do texto (cinza claro)
Chart.defaults.borderColor = '#4b5563'; // Cor das linhas de grade (cinza mais escuro)

const fetchMetricas = async () => {
  try {
    console.log('Buscando métricas do dashboard...')
    
    // Buscar estatísticas dos hospitais
    const responseHospitais = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de hospitais:', responseHospitais.data)

    // Calcular total de leitos disponíveis
    const hospitais = Array.isArray(responseHospitais.data) ? responseHospitais.data : 
                     (responseHospitais.data?.data || [])
    const leitosDisponiveis = hospitais.reduce((total, hospital) => {
      return total + (hospital.leitos_disponiveis || 0)
    }, 0)

    // Hospitais lotados
    hospitaisLotados.value = hospitais.filter(h => h.leitos_disponiveis === 0)

    // Buscar todas as triagens para calcular estatísticas
    const responseTriagens = await axios.get('http://127.0.0.1:8000/api/triagens', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de triagens:', responseTriagens.data)

    // Calcular estatísticas das triagens
    const triagens = Array.isArray(responseTriagens.data) ? responseTriagens.data : 
                    (responseTriagens.data?.data || [])

    const estatisticasTriagens = {
      total: triagens.length,
      alto_risco: triagens.filter(t => t.nivel_risco === 'alto').length,
      medio_risco: triagens.filter(t => t.nivel_risco === 'medio').length,
      baixo_risco: triagens.filter(t => t.nivel_risco === 'baixo').length,
      evolucao: calcularEvolucaoCasos(triagens)
    }

    console.log('Estatísticas calculadas:', estatisticasTriagens)

    // Buscar ambulâncias disponíveis
    const responseAmbulancias = await axios.get('http://127.0.0.1:8000/api/ambulancias', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de ambulâncias:', responseAmbulancias.data)

    // Calcular ambulâncias disponíveis
    const ambulancias = Array.isArray(responseAmbulancias.data) ? responseAmbulancias.data : 
                       (responseAmbulancias.data?.data || [])
    const ambulanciasDisponiveis = ambulancias.filter(a => a.status === 'disponivel').length

    // Atualizar métricas com os dados recebidos
    metricas.value = {
      totalPacientes: estatisticasTriagens.total,
      casosAltoRisco: estatisticasTriagens.alto_risco,
      leitosDisponiveis: leitosDisponiveis,
      ambulanciasDisponiveis: ambulanciasDisponiveis
    }

    console.log('Métricas atualizadas:', metricas.value)

    // Atualizar gráfico de risco
    createRiscoChart(estatisticasTriagens)

    // Atualizar gráfico de evolução
    createEvolucaoChart(estatisticasTriagens.evolucao)

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar estas estatísticas.')
          break
        default:
          alert('Erro ao carregar estatísticas. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const createRiscoChart = (data) => {
  if (riscoChart.value) {
    new Chart(riscoChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Alto Risco', 'Médio Risco', 'Baixo Risco'],
        datasets: [{
          data: [data.alto_risco, data.medio_risco, data.baixo_risco],
          backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
          borderColor: '#374151',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#d1d5db' // Cor do texto da legenda
            }
          }
        }
      }
    })
  }
}

const createEvolucaoChart = (data) => {
  if (evolucaoChart.value) {
    new Chart(evolucaoChart.value, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Novos Casos',
          data: Object.values(data),
          fill: true,
          borderColor: '#22c55e', // Cor da linha (verde primário)
          backgroundColor: 'rgba(34, 197, 94, 0.2)', // Área sob a linha
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#4b5563' // Cor da grade do eixo Y
            },
            ticks: {
              color: '#d1d5db' // Cor dos rótulos do eixo Y
            }
          },
          x: {
            grid: {
              color: '#4b5563' // Cor da grade do eixo X
            },
            ticks: {
              color: '#d1d5db' // Cor dos rótulos do eixo X
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }
}

// Função para calcular a evolução dos casos
const calcularEvolucaoCasos = (triagens) => {
  // Agrupar triagens por data
  const casosPorData = triagens.reduce((acc, triagem) => {
    const data = new Date(triagem.created_at).toLocaleDateString('pt-AO')
    acc[data] = (acc[data] || 0) + 1
    return acc
  }, {})

  // Ordenar datas
  const datas = Object.keys(casosPorData).sort((a, b) => new Date(a) - new Date(b))

  // Retornar dados formatados para o gráfico
  return {
    dates: datas,
    casos: datas.map(data => casosPorData[data])
  }
}

const fetchUltimosEncaminhamentos = async () => {
  try {
    console.log('Buscando últimos encaminhamentos...')
    const response = await axios.get('http://127.0.0.1:8000/api/encaminhamentos?limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Últimos encaminhamentos:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      ultimosEncaminhamentos.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      ultimosEncaminhamentos.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      ultimosEncaminhamentos.value = []
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
    ultimosEncaminhamentos.value = []
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-AO')
}

onMounted(() => {
  fetchMetricas()
  fetchUltimosEncaminhamentos()
})
</script> 