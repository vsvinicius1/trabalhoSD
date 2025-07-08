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
            </div>
        `;

        try {
            // Chama a nossa API backend
            const response = await fetch('http://localhost:3000/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt, style: 'rpg' }),
            });

            if (!response.ok) {
                // Se a resposta da API não for bem-sucedida, lança um erro
                throw new Error(`Erro da API: ${response.statusText}`);
            }

            const data = await response.json();
            const description = data.description.split('Texto: ')?.[1] || data.description;

            // Atualiza o painel de descrição com a resposta real da API
            descriptionContent.innerHTML = `<p>${description}</p>`;

            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <p class="animate-pulse">O arcanista está idealizando a cena...</p>
                </div>
            `;

            const responsePromptImg = await fetch('http://localhost:3000/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: data.description, style: 'image' }),
            });

            if (!responsePromptImg.ok) {
                // Se a resposta da API não for bem-sucedida, lança um erro
                throw new Error(`Erro da API: ${responsePromptImg.statusText}`);
            }

            const dataPromptImg = await responsePromptImg.json();

            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <p class="animate-pulse">O arcanista está imaginando a cena...</p>
                </div>
            `;

            const responseImg = await fetch('http://localhost:3000/api/generate-img', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: dataPromptImg.description }),
            });

            if (!responseImg.ok) {
                // Se não foi, lança um erro com a mensagem de status
                throw new Error(`Erro na API: ${responseImg.status} ${responseImg.statusText}`);
            }

            const imageBlob = await responseImg.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <img src="${imageUrl}" alt="Imagem gerada pela IA para: ${prompt}" class="generated-image" style="opacity:0; transition: opacity 500ms;" onload="this.style.opacity=1">
                </div>
            `;

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
