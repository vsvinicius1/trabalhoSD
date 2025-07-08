document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos do DOM ---
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const descriptionContent = document.getElementById('description-content');
    const imageContainer = document.getElementById('image-container');

    // --- Verificação de segurança para garantir que os elementos existem ---
    if (!chatForm || !chatInput || !chatMessages || !descriptionContent || !imageContainer) {
        console.error("Erro: Um ou mais elementos essenciais do DOM não foram encontrados. Verifique os IDs no seu ficheiro HTML.");
        return;
    }

    // --- Função para adicionar mensagem ao chat ---
    const addMessageToChat = (message) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-container user';

        const messageBody = document.createElement('div');
        messageBody.className = 'message-bubble user-bubble';
        messageBody.innerHTML = `<p>${message}</p>`;
        
        const userAvatar = document.createElement('div');
        userAvatar.className = 'avatar user-avatar';
        userAvatar.textContent = 'V'; // 'V' de Você

        messageWrapper.appendChild(messageBody);
        messageWrapper.appendChild(userAvatar);
        chatMessages.appendChild(messageWrapper);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // --- Função para obter a resposta da IA (AGORA CHAMA A API) ---
    const getAIResponse = async (prompt) => {
        // Mostra o estado de "carregando" na UI
        descriptionContent.innerHTML = `<p class="placeholder-text animate-pulse">O bardo está a consultar os ventos do éter sobre "${prompt}"...</p>`;
        
        // A geração de imagem continua simulada por enquanto
        imageContainer.innerHTML = `
            <div class="image-placeholder">
                 <p class="animate-pulse">O arcanista aguarda as palavras do bardo...</p>
            </div>`;

        try {
            // Chama a nossa API backend
            const response = await fetch('http://localhost:3000/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                // Se a resposta da API não for bem-sucedida, lança um erro
                throw new Error(`Erro da API: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Atualiza o painel de descrição com a resposta real da API
            descriptionContent.innerHTML = `<p>${data.description}</p>`;

            // Simula a geração da imagem após a descrição estar pronta
            const placeholderUrl = `https://placehold.co/600x400/111827/9ca3af?text=${encodeURIComponent(prompt)}`;
            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <img src="${placeholderUrl}" alt="Imagem gerada pela IA para: ${prompt}" class="generated-image" style="opacity:0; transition: opacity 500ms;" onload="this.style.opacity=1">
                </div>`;

        } catch (error) {
            console.error("Falha ao contactar a API:", error);
            // Exibe uma mensagem de erro clara na interface
            descriptionContent.innerHTML = `<p class="placeholder-text" style="color: #ef4444;">Ocorreu um erro ao tentar contactar os reinos místicos da IA. Verifique se o servidor (backend) está a correr e tente novamente.</p>`;
        }
    };

    // --- Função principal de envio ---
    const handleSend = () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat(message);
            getAIResponse(message); // Chama a nova função que contacta a API
            chatInput.value = '';
        }
    };

    // --- Event Listener para o formulário ---
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        handleSend();
    });

});
