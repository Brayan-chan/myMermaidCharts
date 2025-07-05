import { GoogleGenerativeAI } from "@google/generative-ai";

// Dark mode detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true
    }
});

// Elements
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const removeApiKeyBtn = document.getElementById('removeApiKeyBtn');
const manageApiKeyBtn = document.getElementById('manageApiKeyBtn');

const diagramTitle = document.getElementById('diagramTitle');
const diagramCategory = document.getElementById('diagramCategory');
const databaseOptions = document.getElementById('databaseOptions');
const databaseType = document.getElementById('databaseType');
const normalizedDb = document.getElementById('normalizedDb');
const diagramScope = document.getElementById('diagramScope');
const diagramDescription = document.getElementById('diagramDescription');
const generateButton = document.getElementById('generateButton');

const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChatButton');

const loadingContainer = document.getElementById('loadingContainer');
const diagramContainer = document.getElementById('diagramContainer');
const codePanel = document.getElementById('codePanel');
const mermaidCodeElement = document.getElementById('mermaidCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const exportMermaidBtn = document.getElementById('exportMermaidBtn');
const exportSvgBtn = document.getElementById('exportSvgBtn');

const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');

// State
let geminiModel = null;
let currentMermaidCode = '';
let conversationHistory = [];

// Initialize app
initializeApp();

function initializeApp() {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        try {
            initializeGemini(savedApiKey);
            apiKeySection.classList.add('hidden');
            removeApiKeyBtn.classList.remove('hidden');
        } catch (error) {
            showError("Error al inicializar la API de Gemini: " + error.message);
            localStorage.removeItem('gemini_api_key');
        }
    }

    updateGenerateButtonState();
}

// Event Listeners
manageApiKeyBtn.addEventListener('click', () => {
    apiKeySection.classList.toggle('hidden');
});

toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleApiKeyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                `;
    } else {
        apiKeyInput.type = 'password';
        toggleApiKeyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                `;
    }
});

saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showError('Por favor ingresa una clave API válida');
        return;
    }

    try {
        initializeGemini(apiKey);
        localStorage.setItem('gemini_api_key', apiKey);
        apiKeySection.classList.add('hidden');
        removeApiKeyBtn.classList.remove('hidden');
        updateGenerateButtonState();
    } catch (error) {
        showError("Error al inicializar la API de Gemini: " + error.message);
    }
});

removeApiKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('gemini_api_key');
    apiKeyInput.value = '';
    geminiModel = null;
    removeApiKeyBtn.classList.add('hidden');
    apiKeySection.classList.remove('hidden');
    updateGenerateButtonState();
});

diagramCategory.addEventListener('change', () => {
    if (diagramCategory.value === 'database') {
        databaseOptions.classList.remove('hidden');
    } else {
        databaseOptions.classList.add('hidden');
    }
    updateGenerateButtonState();
});

[diagramTitle, diagramCategory, diagramScope, diagramDescription].forEach(element => {
    element.addEventListener('input', updateGenerateButtonState);
});

generateButton.addEventListener('click', generateDiagram);
sendChatButton.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

copyCodeBtn.addEventListener('click', copyMermaidCode);
exportMermaidBtn.addEventListener('click', copyMermaidCode);
exportSvgBtn.addEventListener('click', exportSvg);

// Functions
function initializeGemini(apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (error) {
        console.error("Error inicializando Gemini:", error);
        throw new Error("Clave API inválida o error de inicialización");
    }
}

function updateGenerateButtonState() {
    const hasRequiredFields = diagramTitle.value.trim() &&
        diagramCategory.value &&
        diagramDescription.value.trim() &&
        geminiModel;
    generateButton.disabled = !hasRequiredFields;
}

async function generateDiagram() {
    if (!geminiModel) {
        showError('Por favor configura tu API Key de Gemini');
        return;
    }

    const config = {
        title: diagramTitle.value.trim(),
        category: diagramCategory.value,
        databaseType: databaseType.value,
        normalized: normalizedDb.checked,
        scope: diagramScope.value.trim(),
        description: diagramDescription.value.trim()
    };

    showLoading();

    try {
        const prompt = buildPrompt(config);
        conversationHistory = [{ role: 'user', content: prompt }];

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        conversationHistory.push({ role: 'assistant', content: text });

        const mermaidCode = extractMermaidCode(text);
        if (mermaidCode) {
            await renderDiagram(mermaidCode);
            chatSection.classList.remove('hidden');
            addChatMessage('IA', 'Diagrama generado exitosamente. ¿Hay algo que te gustaría modificar o mejorar?');
        } else {
            showError('No se pudo extraer el código Mermaid de la respuesta');
        }
    } catch (error) {
        console.error('Error generando diagrama:', error);
        showError('Error al generar el diagrama: ' + error.message);
    } finally {
        hideLoading();
    }
}

function buildPrompt(config) {
    let prompt = `Eres un experto en la creación de diagramas usando la sintaxis Mermaid. Necesito que generes un diagrama con las siguientes especificaciones:

**Título:** ${config.title}
**Categoría:** ${config.category}
**Ámbito/Contexto:** ${config.scope || 'General'}
**Descripción:** ${config.description}

`;

    if (config.category === 'database') {
        prompt += `**Tipo de Diagrama de BD:** ${config.databaseType}
**Normalización:** ${config.normalized ? 'Sí, aplicar normalización' : 'No aplicar normalización'}

`;
    }

    prompt += `Instrucciones específicas:
1. Genera ÚNICAMENTE el código Mermaid dentro de un bloque de código con \`\`\`mermaid
2. El diagrama debe ser claro, bien estructurado y fácil de entender
3. Utiliza la sintaxis correcta de Mermaid para el tipo de diagrama especificado
4. Incluye etiquetas descriptivas y relaciones apropiadas
5. El diseño debe ser limpio y profesional

`;

    switch (config.category) {
        case 'database':
            prompt += `Para diagramas de base de datos:
- Usa 'erDiagram' para diagramas entidad-relación
- Define entidades con sus atributos
- Especifica relaciones con cardinalidad apropiada
- Si es normalizado, asegúrate de eliminar redundancias
`;
            break;
        case 'flowchart':
            prompt += `Para diagramas de flujo:
- Usa 'flowchart TD' para flujo de arriba hacia abajo
- Incluye formas apropiadas para diferentes tipos de pasos
- Conecta los elementos de manera lógica
`;
            break;
        case 'conceptual':
            prompt += `Para mapas conceptuales:
- Usa 'graph TD' o 'mindmap'
- Organiza conceptos de manera jerárquica
- Conecta ideas relacionadas con etiquetas descriptivas
`;
            break;
        case 'sequence':
            prompt += `Para diagramas de secuencia:
- Usa 'sequenceDiagram'
- Define participantes claramente
- Muestra el flujo de mensajes en orden temporal
`;
            break;
        case 'class':
            prompt += `Para diagramas de clases:
- Usa 'classDiagram'
- Define clases con atributos y métodos
- Especifica relaciones de herencia, asociación, etc.
`;
            break;
        case 'gantt':
            prompt += `Para cronogramas Gantt:
- Usa 'gantt'
- Define tareas con fechas apropiadas
- Organiza por secciones si es necesario
`;
            break;
    }

    prompt += `\nPor favor, genera el código Mermaid ahora:`;

    return prompt;
}

function extractMermaidCode(text) {
    const mermaidMatch = text.match(/```mermaid\s*([\s\S]*?)\s*```/);
    return mermaidMatch ? mermaidMatch[1].trim() : null;
}

async function renderDiagram(mermaidCode) {
    currentMermaidCode = mermaidCode;

    try {
        // Sanitize the mermaid code with DOMPurify
        const sanitizedCode = DOMPurify.sanitize(mermaidCode);

        diagramContainer.innerHTML = '<div id="mermaid-diagram"></div>';
        const { svg } = await mermaid.render('mermaid-diagram-rendered', sanitizedCode);

        // Sanitize the generated SVG
        const sanitizedSvg = DOMPurify.sanitize(svg);

        const mermaidDiv = document.getElementById('mermaid-diagram');
        mermaidDiv.innerHTML = sanitizedSvg;

        // Show code panel
        codePanel.classList.remove('hidden');
        const codeElement = mermaidCodeElement.querySelector('code');
        codeElement.textContent = currentMermaidCode;
        exportMermaidBtn.classList.remove('hidden');
        exportSvgBtn.classList.remove('hidden');

    } catch (error) {
        console.error('Error rendering Mermaid:', error);
        diagramContainer.innerHTML = `
                    <div class="text-center text-red-600 dark:text-red-400">
                        <p>Error al renderizar el diagrama</p>
                        <p class="text-sm mt-2">${DOMPurify.sanitize(error.message)}</p>
                    </div>
                `;
    }
}

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || !geminiModel) return;

    addChatMessage('Usuario', message);
    chatInput.value = '';

    const modifyPrompt = `${message}

Basándote en el diagrama anterior, modifica el código Mermaid según esta instrucción. Devuelve ÚNICAMENTE el código Mermaid actualizado dentro de un bloque \`\`\`mermaid\`\`\`.`;

    conversationHistory.push({ role: 'user', content: modifyPrompt });

    try {
        const fullConversation = conversationHistory.map(msg => msg.content).join('\n\n');
        const result = await geminiModel.generateContent(fullConversation);
        const response = await result.response;
        const text = await response.text();

        conversationHistory.push({ role: 'assistant', content: text });

        const newMermaidCode = extractMermaidCode(text);
        if (newMermaidCode) {
            await renderDiagram(newMermaidCode);
            addChatMessage('IA', 'Diagrama actualizado exitosamente.');
        } else {
            addChatMessage('IA', 'Lo siento, no pude generar el código Mermaid actualizado. ¿Podrías ser más específico?');
        }
    } catch (error) {
        console.error('Error en chat:', error);
        addChatMessage('IA', 'Error al procesar tu solicitud: ' + error.message);
    }
}

function addChatMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg ${sender === 'Usuario' ? 'bg-blue-100 dark:bg-blue-900 ml-4' : 'bg-gray-100 dark:bg-gray-600 mr-4'}`;

    // Sanitize the message content
    const sanitizedMessage = DOMPurify.sanitize(message);

    messageDiv.innerHTML = `
                <div class="font-semibold text-sm mb-1">${DOMPurify.sanitize(sender)}</div>
                <div class="text-sm">${sanitizedMessage}</div>
            `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function copyMermaidCode() {
    navigator.clipboard.writeText(currentMermaidCode)
        .then(() => {
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                copyCodeBtn.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Error al copiar:', err);
            showError('Error al copiar el código');
        });
}

function exportSvg() {
    const svgElement = diagramContainer.querySelector('svg');
    if (!svgElement) {
        showError('No hay diagrama para exportar');
        return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${diagramTitle.value || 'diagrama'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
}

function showLoading() {
    loadingContainer.classList.remove('hidden');
    diagramContainer.classList.add('hidden');
    generateButton.disabled = true;
}

function hideLoading() {
    loadingContainer.classList.add('hidden');
    diagramContainer.classList.remove('hidden');
    generateButton.disabled = false;
}

function showError(message) {
    const sanitizedMessage = DOMPurify.sanitize(message);
    errorMessage.textContent = sanitizedMessage;
    errorContainer.classList.remove('hidden');
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}