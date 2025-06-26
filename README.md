# Painel de Gestão de Cólera

[English version below ⬇️]

## Visão Geral

Este projeto é o **frontend** do sistema de gestão epidemiológica de cólera em Angola. Ele permite triagem inteligente, encaminhamento automático de pacientes, gestão de hospitais, ambulâncias, relatórios e monitoramento em tempo real, apoiando o Ministério da Saúde e profissionais de saúde.

O backend do sistema está disponível em:  
[https://github.com/PauloCelsio79/colera-gestao-saude-backend](https://github.com/PauloCelsio79/colera-gestao-saude-backend)

---

## Funcionalidades

- **Triagem de Pacientes:** Cadastro, avaliação de sintomas, geração de QR Code, histórico.
- **Encaminhamento Automático:** Pacientes de alto risco são encaminhados para o hospital mais próximo com leito disponível.
- **Gestão de Hospitais:** Cadastro, tipos, leitos, localização.
- **Gestão de Ambulâncias:** Cadastro, status, localização, designação para transportes.
- **Coordenação de Transportes:** Técnicos visualizam pedidos de ambulância e atualizam status.
- **Relatórios e Dashboard:** Estatísticas, gráficos, exportação em PDF/Excel.
- **Logs de Auditoria:** Todas as ações críticas são registradas.

---

## Tecnologias Utilizadas

- **Frontend:** Vue.js 3, Vite, TailwindCSS, Chart.js, qrcode.vue
- **Backend:** [Laravel (PHP)](https://github.com/PauloCelsio79/colera-gestao-saude-backend)
- **Banco de Dados:** MySQL
- **API RESTful** para integração frontend-backend

---

## Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone <url-deste-repositorio>
   cd painel-cliente
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o ambiente:**
   - Crie um arquivo `.env` se necessário (veja `.env.example` no backend).
   - Configure a URL da API backend em seus arquivos de configuração, se necessário.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

---

## Estrutura do Projeto
├── src/
│ ├── pages/ # Páginas principais (admin, médico, gestor, técnico)
│ ├── components/ # Componentes reutilizáveis
│ ├── api/ # Integração com backend
│ ├── assets/ # Imagens e estilos
│ └── ...
├── public/
├── package.json
├── tailwind.config.js
└── ...

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'Minha feature'`
4. Push para o fork: `git push origin minha-feature`
5. Abra um Pull Request

---

## Licença

Este projeto é open-source e está sob a licença MIT.

---

# Cholera Management Panel

## Overview

This project is the **frontend** for the cholera epidemiological management system in Angola. It enables smart triage, automatic patient referral, hospital and ambulance management, real-time dashboards, and reporting, supporting the Ministry of Health and healthcare professionals.

The backend is available at:  
[https://github.com/PauloCelsio79/colera-gestao-saude-backend](https://github.com/PauloCelsio79/colera-gestao-saude-backend)

---

## Features

- **Patient Triage:** Registration, symptom assessment, QR Code generation, history.
- **Automatic Referral:** High-risk patients are automatically referred to the nearest hospital with available beds.
- **Hospital Management:** Registration, types, beds, location.
- **Ambulance Management:** Registration, status, location, assignment for transport.
- **Transport Coordination:** Technicians view ambulance requests and update status.
- **Reports and Dashboard:** Statistics, charts, export to PDF/Excel.
- **Audit Logs:** All critical actions are logged.

---

## Technologies Used

- **Frontend:** Vue.js 3, Vite, TailwindCSS, Chart.js, qrcode.vue
- **Backend:** [Laravel (PHP)](https://github.com/PauloCelsio79/colera-gestao-saude-backend)
- **Database:** MySQL
- **RESTful API** for frontend-backend integration

---

## Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <this-repo-url>
   cd painel-cliente
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Create a `.env` file if needed (see `.env.example` in the backend).
   - Set the backend API URL in your config files if needed.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access in your browser:**
   ```
   http://localhost:5173
   ```

---

## Project Structure
├── src/
│ ├── pages/ # Páginas principais (admin, médico, gestor, técnico)
│ ├── components/ # Componentes reutilizáveis
│ ├── api/ # Integração com backend
│ ├── assets/ # Imagens e estilos
│ └── ...
├── public/
├── package.json
├── tailwind.config.js
└── ...

---

---

## Contributing

1. Fork the project
2. Create a branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -m 'My feature'`
4. Push to your fork: `git push origin my-feature`
5. Open a Pull Request

---

## License

This project is open-source and licensed under the MIT license.
