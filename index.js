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
        
        const fileInput = document.getElementById('fileInput');
        const filePreview = document.getElementById('filePreview');
        const fileList = document.getElementById('fileList');
        const clearFilesBtn = document.getElementById('clearFilesBtn');
        const fileProcessingModal = document.getElementById('fileProcessingModal');
        const fileProcessingProgress = document.getElementById('fileProcessingProgress');
        
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
        let uploadedFiles = [];
        let processedFilesContent = [];

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

        // File handling
        fileInput.addEventListener('change', handleFileSelection);
        clearFilesBtn.addEventListener('click', clearAllFiles);

        // Drag and drop
        const dropZone = fileInput.closest('label');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary', 'bg-primary/5');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-primary/5');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-primary/5');
            
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
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

        function handleFileSelection(e) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }

        async function handleFiles(files) {
            const validFiles = files.filter(file => {
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    showError(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
                    return false;
                }
                return true;
            });

            if (validFiles.length === 0) return;

            uploadedFiles = [...uploadedFiles, ...validFiles];
            updateFilePreview();
            
            // Process files for content extraction
            await processFiles(validFiles);
        }

        async function processFiles(files) {
            if (!geminiModel) return;

            fileProcessingModal.classList.remove('hidden');
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                fileProcessingProgress.textContent = `Procesando ${file.name} (${i + 1}/${files.length})`;
                
                try {
                    let content = '';
                    
                    if (file.type.startsWith('image/')) {
                        content = await processImageFile(file);
                    } else if (file.type === 'text/plain' || file.type === 'text/csv') {
                        content = await readTextFile(file);
                    } else {
                        content = `Archivo: ${file.name} (${file.type}) - Contenido no procesable directamente, pero se ha incluido como referencia.`;
                    }
                    
                    processedFilesContent.push({
                        name: file.name,
                        type: file.type,
                        content: content
                    });
                    
                } catch (error) {
                    console.error(`Error procesando ${file.name}:`, error);
                    processedFilesContent.push({
                        name: file.name,
                        type: file.type,
                        content: `Error al procesar el archivo: ${error.message}`
                    });
                }
            }
            
            fileProcessingModal.classList.add('hidden');
        }

        async function processImageFile(file) {
            try {
                const base64Image = await fileToGenerativePart(file);
                
                const prompt = `Analiza esta imagen y describe detalladamente su contenido. Si contiene:
- Diagramas: describe la estructura, elementos y relaciones
- Texto: extrae el texto visible
- Tablas: describe la estructura y datos
- Procesos: explica los flujos o pasos mostrados
- Cualquier información relevante para crear diagramas

Sé específico y detallado en tu descripción.`;

                const result = await geminiModel.generateContent([prompt, base64Image]);
                const response = await result.response;
                return await response.text();
            } catch (error) {
                throw new Error(`Error al analizar imagen: ${error.message}`);
            }
        }

        function readTextFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('Error al leer archivo'));
                reader.readAsText(file);
            });
        }

        function fileToGenerativePart(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Data = reader.result.split(',')[1];
                    const mimeType = file.type;
                    
                    resolve({
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        function updateFilePreview() {
            if (uploadedFiles.length === 0) {
                filePreview.classList.add('hidden');
                return;
            }

            filePreview.classList.remove('hidden');
            fileList.innerHTML = '';

            uploadedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md';
                
                const fileInfo = document.createElement('div');
                fileInfo.className = 'flex items-center space-x-3';
                
                const fileIcon = getFileIcon(file.type);
                const fileName = document.createElement('span');
                fileName.className = 'text-sm font-medium truncate';
                fileName.textContent = file.name;
                
                const fileSize = document.createElement('span');
                fileSize.className = 'text-xs text-gray-500';
                fileSize.textContent = formatFileSize(file.size);
                
                fileInfo.appendChild(fileIcon);
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileSize);
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300';
                removeBtn.innerHTML = '✕';
                removeBtn.onclick = () => removeFile(index);
                
                fileItem.appendChild(fileInfo);
                fileItem.appendChild(removeBtn);
                fileList.appendChild(fileItem);
            });
        }

        function getFileIcon(fileType) {
            const icon = document.createElement('div');
            icon.className = 'w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-xs font-medium';
            
            if (fileType.startsWith('image/')) {
                icon.textContent = '🖼️';
            } else if (fileType.includes('pdf')) {
                icon.textContent = '📄';
            } else if (fileType.includes('word') || fileType.includes('document')) {
                icon.textContent = '📝';
            } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
                icon.textContent = '📊';
            } else {
                icon.textContent = '📁';
            }
            
            return icon;
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function removeFile(index) {
            uploadedFiles.splice(index, 1);
            processedFilesContent.splice(index, 1);
            updateFilePreview();
            
            // Reset file input
            fileInput.value = '';
        }

        function clearAllFiles() {
            uploadedFiles = [];
            processedFilesContent = [];
            updateFilePreview();
            fileInput.value = '';
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

            // Add file content context
            if (processedFilesContent.length > 0) {
                prompt += `**CONTEXTO ADICIONAL DE ARCHIVOS:**

`;
                processedFilesContent.forEach((fileContent, index) => {
                    prompt += `Archivo ${index + 1}: ${fileContent.name}
Tipo: ${fileContent.type}
Contenido analizado:
${fileContent.content}

`;
                });

                prompt += `Utiliza esta información adicional para crear un diagrama más preciso y contextualizado.

`;
            }

            prompt += `**INSTRUCCIONES CRÍTICAS PARA MERMAID:**

1. Genera ÚNICAMENTE el código Mermaid dentro de un bloque de código con \`\`\`mermaid
2. ASEGÚRATE de usar la sintaxis EXACTA de Mermaid - cualquier error causará fallo de renderizado
3. NO uses paréntesis en nombres de atributos o entidades
4. NO uses espacios en nombres de identificadores
5. Sigue ESTRICTAMENTE las reglas de sintaxis de Mermaid
6. El diagrama debe ser válido y renderizable

`;

            switch (config.category) {
                case 'database':
                    prompt += `**SINTAXIS ESPECÍFICA PARA DIAGRAMAS ER:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
erDiagram
    ENTIDAD1 {
        tipo_dato nombre_atributo
        int id PK
        string nombre
        date fecha_creacion
    }
    ENTIDAD2 {
        int id PK
        int entidad1_id FK
        string descripcion
    }
    ENTIDAD1 ||--o{ ENTIDAD2 : "tiene"
\`\`\`

REGLAS OBLIGATORIAS:
- Nombres de entidades en MAYÚSCULAS, sin espacios
- Tipos de datos: int, string, date, decimal, boolean
- PK para clave primaria, FK para clave foránea
- Relaciones: ||--o{, ||--||, }o--o{, etc.
- NO uses paréntesis en atributos
- NO uses espacios en nombres de atributos (usa guión_bajo)
`;
                    break;
                case 'flowchart':
                    prompt += `**SINTAXIS ESPECÍFICA PARA DIAGRAMAS DE FLUJO:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
flowchart TD
    A[Inicio] --> B{Decisión?}
    B -->|Sí| C[Proceso 1]
    B -->|No| D[Proceso 2]
    C --> E[Fin]
    D --> E
\`\`\`

REGLAS:
- IDs simples: A, B, C, etc.
- Formas: [] para procesos, {} para decisiones, () para inicio/fin
- Conexiones: --> para flechas
- Etiquetas: |texto| después de conexiones
`;
                    break;
                case 'sequence':
                    prompt += `**SINTAXIS ESPECÍFICA PARA DIAGRAMAS DE SECUENCIA:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
sequenceDiagram
    participant A as Usuario
    participant B as Sistema
    A->>B: Solicitud
    B-->>A: Respuesta
\`\`\`

REGLAS:
- participant para definir participantes
- ->> para mensajes síncronos
- -->> para respuestas
- NO uses espacios en IDs de participantes
`;
                    break;
                case 'class':
                    prompt += `**SINTAXIS ESPECÍFICA PARA DIAGRAMAS DE CLASES:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
classDiagram
    class Animal{
        +String name
        +int age
        +eat() void
        +sleep() void
    }
    class Dog{
        +String breed
        +bark() void
    }
    Animal <|-- Dog
\`\`\`

REGLAS:
- class para definir clases
- + público, - privado, # protegido
- <|-- para herencia, --> para asociación
`;
                    break;
                case 'gantt':
                    prompt += `**SINTAXIS ESPECÍFICA PARA DIAGRAMAS GANTT:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
gantt
    title Cronograma del Proyecto
    dateFormat YYYY-MM-DD
    section Sección 1
    Tarea 1 :a1, 2024-01-01, 30d
    Tarea 2 :after a1, 20d
\`\`\`
`;
                    break;
                case 'mindmap':
                    prompt += `**SINTAXIS ESPECÍFICA PARA MAPAS MENTALES:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
mindmap
  root((Tema Central))
    A(Rama 1)
      B[Subrama 1]
      C[Subrama 2]
    D(Rama 2)
      E[Subrama 3]
\`\`\`
`;
                    break;
                default:
                    prompt += `**SINTAXIS ESPECÍFICA PARA GRÁFICOS:**

- Usa EXACTAMENTE esta estructura:
\`\`\`
graph TD
    A[Nodo 1] --> B[Nodo 2]
    B --> C[Nodo 3]
\`\`\`
`;
            }

            prompt += `

**EJEMPLO VÁLIDO DE DIAGRAMA ER:**
\`\`\`mermaid
erDiagram
    USUARIO {
        int id PK
        string nombre
        string email
        date fecha_registro
    }
    PEDIDO {
        int id PK
        int usuario_id FK
        decimal total
        date fecha_pedido
    }
    PRODUCTO {
        int id PK
        string nombre
        decimal precio
        int stock
    }
    DETALLE_PEDIDO {
        int pedido_id FK
        int producto_id FK
        int cantidad
        decimal subtotal
    }
    USUARIO ||--o{ PEDIDO : "realiza"
    PEDIDO ||--o{ DETALLE_PEDIDO : "contiene"
    PRODUCTO ||--o{ DETALLE_PEDIDO : "incluido_en"
\`\`\`

Por favor, genera ÚNICAMENTE el código Mermaid válido siguiendo estas reglas EXACTAS:`;

            return prompt;
        }

        function extractMermaidCode(text) {
            const mermaidMatch = text.match(/```mermaid\s*([\s\S]*?)\s*```/);
            return mermaidMatch ? mermaidMatch[1].trim() : null;
        }

        function validateMermaidCode(code) {
            // Basic validation for common syntax errors
            const lines = code.split('\n');
            const errors = [];
            
            // Check for common ER diagram issues
            if (code.includes('erDiagram')) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.includes('(') && (line.includes('PK') || line.includes('FK'))) {
                        errors.push(`Línea ${i + 1}: No uses paréntesis en definiciones de atributos`);
                    }
                }
            }
            
            return errors;
        }

        function fixCommonMermaidErrors(code) {
            let fixedCode = code;
            
            // Fix common ER diagram syntax errors
            if (fixedCode.includes('erDiagram')) {
                // Remove parentheses from PK/FK definitions
                fixedCode = fixedCode.replace(/(\w+)\s*\(\s*([^)]+)\s*\)\s*(PK|FK)/g, '$1_$2 $3');
                fixedCode = fixedCode.replace(/PK\s*\([^)]+\)/g, 'PK');
                fixedCode = fixedCode.replace(/FK\s*\([^)]+\)/g, 'FK');
                
                // Replace spaces in attribute names with underscores
                const lines = fixedCode.split('\n');
                fixedCode = lines.map(line => {
                    if (line.trim() && !line.includes('{') && !line.includes('}') && !line.includes('||') && !line.includes('--')) {
                        // This is likely an attribute line
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 2) {
                            const type = parts[0];
                            const name = parts.slice(1).join('_').replace(/[()]/g, '');
                            return `        ${type} ${name}`;
                        }
                    }
                    return line;
                }).join('\n');
            }
            
            return fixedCode;
        }

        async function renderDiagram(mermaidCode) {
            currentMermaidCode = mermaidCode;
            
            // Show code panel first
            codePanel.classList.remove('hidden');
            const codeElement = mermaidCodeElement.querySelector('code');
            codeElement.textContent = currentMermaidCode;
            
            try {
                // Validate the code first
                const validationErrors = validateMermaidCode(mermaidCode);
                
                let codeToRender = mermaidCode;
                if (validationErrors.length > 0) {
                    console.warn('Validation errors found, attempting to fix:', validationErrors);
                    codeToRender = fixCommonMermaidErrors(mermaidCode);
                    currentMermaidCode = codeToRender;
                    codeElement.textContent = currentMermaidCode;
                }
                
                // Sanitize the mermaid code with DOMPurify
                const sanitizedCode = DOMPurify.sanitize(codeToRender);
                
                diagramContainer.innerHTML = '<div id="mermaid-diagram"></div>';
                const { svg } = await mermaid.render('mermaid-diagram-rendered', sanitizedCode);
                
                // Sanitize the generated SVG
                const sanitizedSvg = DOMPurify.sanitize(svg);
                
                const mermaidDiv = document.getElementById('mermaid-diagram');
                mermaidDiv.innerHTML = sanitizedSvg;
                
                exportMermaidBtn.classList.remove('hidden');
                exportSvgBtn.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error rendering Mermaid:', error);
                
                // Show error but keep the code visible
                diagramContainer.innerHTML = `
                    <div class="text-center p-6">
                        <div class="text-red-600 dark:text-red-400 mb-4">
                            <svg class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p class="font-semibold">Error al renderizar el diagrama</p>
                            <p class="text-sm mt-2">${DOMPurify.sanitize(error.message)}</p>
                        </div>
                        <details class="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">Ver sugerencias de corrección</summary>
                            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <p>• Revisa que no haya paréntesis en nombres de atributos</p>
                                <p>• Asegúrate de que los nombres no tengan espacios (usa guión_bajo)</p>
                                <p>• Verifica la sintaxis de las relaciones</p>
                                <p>• El código está disponible abajo para edición manual</p>
                            </div>
                        </details>
                        <button id="retryWithChat" class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                            Pedir corrección a la IA
                        </button>
                    </div>
                `;
                
                // Add retry functionality
                const retryBtn = document.getElementById('retryWithChat');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        chatInput.value = `Hay un error de sintaxis en el diagrama: "${error.message}". Por favor, corrige el código Mermaid y asegúrate de que cumpla con la sintaxis correcta.`;
                        sendChatMessage();
                    });
                }
                
                exportMermaidBtn.classList.remove('hidden');
            }
        }

        async function sendChatMessage() {
            const message = chatInput.value.trim();
            if (!message || !geminiModel) return;

            addChatMessage('Usuario', message);
            chatInput.value = '';

            const modifyPrompt = `${message}

Basándote en el diagrama anterior, modifica el código Mermaid según esta instrucción. Devuelve ÚNICAMENTE el código Mermaid actualizado dentro de un bloque \`\`\`mermaid\`\`\`. 

RECUERDA: NO uses paréntesis en atributos, NO uses espacios en nombres, sigue la sintaxis EXACTA de Mermaid.`;

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