<template>
  <div class="space-y-6">
    <!-- Formulário de Relatório -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Gerar Relatório
        </h3>
        <form @submit.prevent="gerarRelatorio" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Tipo de Relatório
              </label>
              <select v-model="form.tipo" class="input-field" required>
                <option value="casos_por_regiao">Casos por Região</option>
                <option value="evolucao_temporal">Evolução Temporal</option>
                <option value="ocupacao_hospitais">Ocupação de Hospitais</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Formato
              </label>
              <select v-model="form.formato" class="input-field" required>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <input
                v-model="form.periodo_inicio"
                type="date"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <input
                v-model="form.periodo_fim"
                type="date"
                class="input-field"
                required
              />
            </div>
          </div>

          <!-- Filtros Adicionais -->
          <div v-if="form.tipo === 'casos_por_regiao'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Nível de Risco
              </label>
              <select v-model="form.filtros.nivel_risco" class="input-field">
                <option value="">Todos</option>
                <option value="alto">Alto</option>
                <option value="medio">Médio</option>
                <option value="baixo">Baixo</option>
              </select>
            </div>
          </div>

          <div v-if="form.tipo === 'ocupacao_hospitais'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Status do Encaminhamento
              </label>
              <select v-model="form.filtros.status_encaminhamento" class="input-field">
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading"
            >
              {{ loading ? 'Gerando...' : 'Gerar Relatório' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Histórico de Relatórios -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-gray-900">
          Histórico de Relatórios
        </h3>
      </div>
      <div class="border-t border-gray-200">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="relatorio in relatorios" :key="relatorio.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ getTipoRelatorioLabel(relatorio.tipo) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(relatorio.created_at) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500">
                  {{ relatorio.formato.toUpperCase() }}
                </span>
                <button
                  @click="downloadRelatorio(relatorio)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Download
                </button>
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
import axios from 'axios'

const loading = ref(false)
const relatorios = ref([])

const form = ref({
  tipo: 'casos_por_regiao',
  formato: 'pdf',
  periodo_inicio: '',
  periodo_fim: '',
  filtros: {
    nivel_risco: '',
    status_encaminhamento: ''
  }
})

const fetchRelatorios = async () => {
  try {
    console.log('Buscando histórico de relatórios...')
    const response = await axios.get('http://127.0.0.1:8000/api/relatorios/listar', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      relatorios.value = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      relatorios.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      relatorios.value = []
    }

    console.log('Total de relatórios carregados:', relatorios.value.length)
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar relatórios.')
          break
        case 404:
          alert('Rota de relatórios não encontrada. Verifique a configuração da API.')
          break
        default:
          alert('Erro ao carregar relatórios. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    relatorios.value = []
  }
}

const gerarRelatorio = async () => {
  loading.value = true
  try {
    console.log('Iniciando geração de relatório...')
    console.log('Dados do formulário:', form.value)

    // Validação das datas
    const dataInicio = new Date(form.value.periodo_inicio)
    const dataFim = new Date(form.value.periodo_fim)
    
    if (dataInicio > dataFim) {
      alert('A data inicial não pode ser maior que a data final')
      loading.value = false
      return
    }

    // Preparar dados do relatório conforme documentação
    const dadosRelatorio = {
      tipo: form.value.tipo,
      periodo_inicio: form.value.periodo_inicio,
      periodo_fim: form.value.periodo_fim,
      formato: form.value.formato,
      filtros: {}
    }

    // Adicionar filtro de nível de risco apenas se preenchido e tipo correto
    if (form.value.tipo === 'casos_por_regiao' && form.value.filtros.nivel_risco) {
      dadosRelatorio.filtros.nivel_risco = form.value.filtros.nivel_risco
    }
    // Adicionar filtro de status_encaminhamento apenas se preenchido e tipo correto
    if (form.value.tipo === 'ocupacao_hospitais' && form.value.filtros.status_encaminhamento) {
      dadosRelatorio.filtros.status_encaminhamento = form.value.filtros.status_encaminhamento
    }

    // Remover filtros se estiverem vazios
    if (Object.keys(dadosRelatorio.filtros).length === 0) {
      delete dadosRelatorio.filtros
    }

    console.log('Payload enviado:', dadosRelatorio)

    const response = await axios.post('http://127.0.0.1:8000/api/relatorios/gerar', dadosRelatorio, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      responseType: form.value.formato === 'json' ? 'json' : 'blob'
    })

    console.log('Resposta do servidor recebida')

    // Download para JSON
    if (form.value.formato === 'json') {
      const jsonData = response.data
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const nomeArquivo = `relatorio_${form.value.tipo}_${new Date().toISOString().split('T')[0]}.json`
      link.setAttribute('download', nomeArquivo)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } else {
      // Download para PDF/Excel
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const nomeArquivo = `relatorio_${form.value.tipo}_${new Date().toISOString().split('T')[0]}.${form.value.formato}`
      link.setAttribute('download', nomeArquivo)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }

    // Atualizar lista de relatórios
    await fetchRelatorios()
    
    // Mostrar mensagem de sucesso
    alert('Relatório gerado com sucesso!')
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para gerar relatórios.')
          break
        case 404:
          alert('Rota de geração de relatórios não encontrada. Verifique a configuração da API.')
          break
        case 422:
          alert('Dados inválidos. Por favor, verifique os campos do formulário.')
          break
        default:
          alert('Erro ao gerar relatório. Por favor, tente novamente.')
      }
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}

const downloadRelatorio = async (relatorio) => {
  try {
    console.log('Iniciando download do relatório:', relatorio.id)
    const response = await axios.get(`http://127.0.0.1:8000/api/relatorios/${relatorio.id}/baixar`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      responseType: 'blob'
    })

    console.log('Resposta do download recebida')

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_${relatorio.id}.${relatorio.formato}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao baixar relatório:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para baixar relatórios.')
          break
        case 404:
          alert('Relatório não encontrado.')
          break
        default:
          alert('Erro ao baixar relatório. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const getTipoRelatorioLabel = (tipo) => {
  const labels = {
    casos_por_regiao: 'Casos por Região',
    evolucao_temporal: 'Evolução Temporal',
    ocupacao_hospitais: 'Ocupação de Hospitais'
  }
  return labels[tipo] || tipo
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-AO')
}

onMounted(fetchRelatorios)
</script> 