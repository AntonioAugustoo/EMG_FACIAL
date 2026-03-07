# 😊 EMG FACIAL  📊

## 📋 Descrição do Projeto

O **EMG FACIAL** é um projeto inovador que mede a contração do músculo zigomático do rosto através de sinais EMG (eletromiografia), funcionando essencialmente como um "sorrisômetro". O sistema captura, processa e analisa os sinais elétricos musculares em tempo real, fornecendo dados precisos sobre a intensidade e qualidade dos sorrisos através de gráficos interativos e análise estatística.

## 🎯 Objetivo

Desenvolver um sistema de monitoramento não-invasivo que:
- Mede a atividade elétrica do músculo zigomático maior
- Quantifica a intensidade dos sorrisos em tempo real
- Fornece análise estatística detalhada dos dados coletados
- Permite exportação de dados para análises posteriores
- Oferece interface web intuitiva para visualização em tempo real

## 🌐 Demo Online

🔗 **[Acesse a Demo no GitHub Pages](https://antonioaugustoo.github.io/EMG_FACIAL/)**

> A demo utiliza dados simulados com ciclo de vida realista do sorriso (ataque, sustentação e queda)

## 🏗️ Arquitetura do Sistema

### Hardware (Backend - ESP32)
- **Microcontrolador**: ESP32 com WiFi integrado
- **Sensor**: Eletrodos para captura de sinais EMG
- **Entrada Analógica**: Pino 34 para leitura dos sinais
- **Comunicação**: Access Point WiFi para interface web

### Software (Frontend - Web Interface)
- **Interface**: HTML5 com CSS responsivo
- **Visualização**: Gráficos em tempo real usando Canvas nativo
- **Funcionalidades**: Captura, análise e exportação de dados
- **Compatibilidade**: Multiplataforma via navegador web

## 🚀 Funcionalidades

- 📈 **Gráfico em Tempo Real**: Visualização dinâmica dos sinais EMG
- 🧑‍⚕️ **Indicador de Conexão**: Status visual do eletrodo
- 🟢 **Controles Interativos**: Iniciar, parar, exportar e limpar dados
- 📊 **Estatísticas**: Amplitude, frequência, amostras e tempo de gravação
- 📋 **Tabela de Dados**: Registro detalhado das amostras
- 💾 **Exportação CSV**: Dados compatíveis com Excel, Python, R, MATLAB
- 🎭 **Modo Demo**: Simulação biologicamente realista para demonstração

## 🎨 Design

- Interface responsiva e moderna
- Cores suaves e gradientes
- Ícones e emojis para facilitar a navegação
- Animações sutis para feedback visual

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com animações e gradientes)
- JavaScript (ES6)
- [Chart.js](https://www.chartjs.org/) para gráficos

## 📂 Estrutura do Projeto

```
EMG_FACIAL/
├── index.html           # GitHub Pages - Página principal
├── style.css            # GitHub Pages - Estilos
├── script.js            # GitHub Pages - Lógica da aplicação
├── animations.js        # GitHub Pages - Animações
├── platformio.ini       # Configuração do PlatformIO
├── README.md            # Documentação do projeto
├── data/                # Arquivos para upload no ESP32 (SPIFFS)
│   ├── index.html       # Interface web do ESP32
│   ├── style.css        # Estilos da interface
│   ├── script.js        # Lógica da aplicação
│   └── animations.js    # Animações e efeitos
└── src/
    └── main.cpp         # Código do firmware ESP32
```

> **Nota**: Os arquivos front-end estão duplicados na raiz para GitHub Pages e na pasta `data/` para serem embarcados no ESP32.

## 💡 Como Usar

### No ESP32 (Modo Completo)
1. Faça upload do firmware e dos arquivos web para o ESP32
2. Conecte-se à rede WiFi "ESP32_AP" (senha: 12345678)
3. Acesse `http://192.168.4.1` no navegador
4. Conecte o eletrodo facial
5. Use os botões para iniciar/parar a captura, exportar ou limpar os dados
6. Visualize o gráfico e os dados em tempo real

### Demo Online (GitHub Pages)
1. Acesse https://antonioaugustoo.github.io/EMG_FACIAL/
2. Explore a interface (sem captura real de dados EMG)

## 🤝 Contribuição

Sinta-se à vontade para sugerir melhorias, adicionar novos recursos ou reportar bugs!

---

Feito com ❤️ por AntonioAugustoo e colaboradores.
