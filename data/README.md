# 🧑‍🦲 EMG Facial FrontEnd

Bem-vindo ao FrontEnd do projeto **EMG Facial**! Aqui você encontra a interface moderna e interativa para monitoramento de sinais EMG faciais, visualização de dados em tempo real e exportação de registros. 

## 🚀 Funcionalidades

- 📈 **Gráfico em Tempo Real:** Visualize o sinal do eletrodo facial com atualização dinâmica.
- 🧑‍⚕️ **Indicador de Conexão:** Mostra se o eletrodo está conectado.
- 🟢 **Botões Interativos:**
  - ▶️ Iniciar Captura
  - ⏹️ Parar Captura
  - 💾 Exportar Dados
  - 🧹 Limpar Registro
- 📊 **Estatísticas:** Amplitude, frequência média, amostras coletadas e tempo de gravação.
- 📋 **Tabela de Dados:** Registro detalhado das amostras capturadas.
- 🔔 **Toast de Exportação:** Mensagem temporária ao exportar dados.

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

## 📂 Estrutura da Pasta

```
data/
├── index.html        # Página principal da interface
├── style.css         # Estilos e design da interface
├── script.js         # Lógica da aplicação web
├── animations.js     # Animações e efeitos visuais
└── README.md         # Esta documentação
```

## 💡 Como Usar

### No ESP32 (Modo Completo)
1. Faça upload do firmware e dos arquivos web para o ESP32
2. Conecte-se à rede WiFi "ESP32_AP" (senha: 12345678)
3. Acesse `http://192.168.4.1` no navegador
4. Conecte o eletrodo facial
5. Use os botões para iniciar/parar a captura, exportar ou limpar os dados
6. Visualize o gráfico e os dados em tempo real

### Demo Online (GitHub Pages)
1. Acesse https://antonioaugustoo.github.io/EMG_FACIAL/data/
2. Explore a interface (sem captura real de dados EMG)

## 🤝 Contribuição

Sinta-se à vontade para sugerir melhorias, adicionar novos recursos ou reportar bugs!

---

Feito com ❤️ por AntonioAugustoo e colaboradores.
