# Painel de Gestão de Saúde - Cólera

Sistema web para gestão de casos de cólera, triagens, encaminhamentos, ambulâncias, hospitais e usuários, com dashboards, relatórios, mapas e classificação automática de risco.

## Tecnologias Utilizadas

- **Frontend:** Vue 3, Vite, Pinia, Vue Router, TailwindCSS, Chart.js, Axios, @vue-leaflet/vue-leaflet, Heroicons, qrcode.vue
- **Backend:** Laravel (API, não incluso neste repositório)
- **Outros:** Leaflet (mapas), jsPDF (relatórios PDF), jsPDF-Autotable

## Instalação e Execução

1. **Pré-requisitos:** Node.js 16+ e npm/yarn instalados.
2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
4. **Acesse:** [http://localhost:5173](http://localhost:5173)

## Estrutura do Projeto

```
colera-front/
├── src/
│   ├── components/         # Componentes reutilizáveis (PainelPrevencaoColera, Dashboard, etc)
│   ├── pages/              # Páginas por perfil (admin, medico, tecnico, gerente)
│   ├── layouts/            # Layouts por perfil
│   ├── routes/             # Definições de rotas
│   └── ...                 # Outros arquivos Vue
├── public/                 # Assets públicos
├── tailwind.config.js      # Configuração de cores e tema
├── vite.config.js          # Alias @ para src
├── package.json            # Dependências e scripts
└── README.md               # Este arquivo
```

## Funcionalidades Principais

- **Login e Perfis:** Admin, Médico, Gestor, Técnico. Cada perfil tem acesso a funcionalidades específicas.
- **Triagem de Pacientes:** Cadastro, sintomas, observações e classificação automática de risco (baixo, médio, alto) conforme sintomas.
- **Classificação Automática de Risco:**
  - **Alto risco:** Se marcar "desidratação" ou 3+ sintomas.
  - **Médio risco:** Se marcar exatamente 2 sintomas.
  - **Baixo risco:** 1 ou nenhum sintoma.
- **Encaminhamentos:** Criação, atualização de status, visualização detalhada, designação de ambulância, QR Code do paciente.
- **Ambulâncias:** Cadastro, edição, exclusão, visualização no mapa, status (disponível, em trânsito, manutenção).
- **Hospitais:** Cadastro, edição, exclusão, monitoramento de leitos, visualização de hospitais próximos.
- **Relatórios:** Geração de relatórios por região, evolução temporal, ocupação hospitalar (JSON, PDF, Excel).
- **Dashboards:** Métricas, gráficos, alertas de hospitais lotados, últimos encaminhamentos, dicas de prevenção.
- **Logs do Sistema:** Visualização e paginação de logs administrativos.
- **Painel de Prevenção:** Dicas de prevenção da cólera exibidas nos dashboards principais.
- **Filtros e Paginação:** Em todas as tabelas principais.
- **Mapas:** Localização de pacientes e ambulâncias usando Vue Leaflet.

## Fluxos de Uso

### 1. Autenticação e Perfis

- **Admin:** Gerencia usuários, hospitais, ambulâncias, gabinetes, logs.
- **Médico:** Realiza triagens, encaminha pacientes, visualiza histórico.
- **Gestor:** Acompanha estatísticas, relatórios, recursos.
- **Técnico:** Gerencia ambulâncias, coordena transportes, manutenção.

### 2. Triagem e Classificação de Risco

- O profissional preenche sintomas do paciente.
- O sistema calcula automaticamente o risco de cólera:
  - **Alto:** Desidratação marcada ou 3+ sintomas.
  - **Médio:** 2 sintomas.
  - **Baixo:** 1 ou nenhum sintoma.
- O campo de risco é somente leitura e exibido no modal.

### 3. Encaminhamento

- Após triagem de alto risco, o sistema sugere hospitais próximos com leitos.
- Permite designar ambulância e acompanhar status.
- Gera QR Code para identificação rápida do paciente.

### 4. Gestão de Recursos

- Admin e gestor podem cadastrar/editar/excluir hospitais, ambulâncias, gabinetes.
- Técnicos atualizam status de ambulâncias e coordenam transportes.

### 5. Relatórios e Dashboards

- Relatórios customizáveis por período, região, status.
- Dashboards com gráficos, métricas, alertas e dicas de prevenção.

## Configurações Especiais

- **Alias @:** Configurado no `vite.config.js` para facilitar imports.
- **Tailwind:** Cores customizadas para primário e secundário em `tailwind.config.js`.
- **Mapas:** Utiliza Vue Leaflet e Leaflet para exibir localização de pacientes e ambulâncias.

## Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento.
- `npm run build` — Gera build de produção.
- `npm run preview` — Visualiza build de produção localmente.

## Dependências Principais

Veja todas em `package.json`. Destaques:
- `vue`, `vue-router`, `pinia`, `axios`, `@vue-leaflet/vue-leaflet`, `chart.js`, `tailwindcss`, `@heroicons/vue`, `qrcode.vue`

## Integração com Backend

- O frontend consome uma API Laravel (não inclusa neste repositório).
- Todos os endpoints, payloads e exemplos estão em `documentacaoAPI.txt`.

## Observações

- O sistema é responsivo e otimizado para desktop.
- O painel de dicas de prevenção aparece nos dashboards principais e pode ser customizado.
- A classificação de risco é automática e não pode ser alterada manualmente pelo usuário.

---

Se precisar de instruções para deploy, integração com backend, ou exemplos de uso da API, consulte o arquivo `documentacaoAPI.txt` ou entre em contato com o desenvolvedor Paulo Celsio.
