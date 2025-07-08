// 1. Importar as dependências
require('dotenv').config(); // Carrega as variáveis de ambiente do ficheiro .env
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importa a biblioteca do Google AI

// Validação da Chave de API
if (!process.env.GEMINI_API_KEY) {
    throw new Error("A variável de ambiente GEMINI_API_KEY não está definida. Por favor, crie um ficheiro .env e adicione a sua chave.");
}

// 2. Inicializar a aplicação Express e o cliente Gemini
const app = express();
const PORT = 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Configurar os Middlewares
app.use(cors());
app.use(express.json());

// --- FUNÇÃO REAL DA IA (usando o Gemini) ---
const generateDescriptionFromAI = async (prompt) => {
    console.log(`Recebido prompt para o Gemini: "${prompt}"`);
    
    try {
        // CORREÇÃO: Atualizado o nome do modelo para uma versão mais recente.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Cria um prompt mais elaborado para guiar a IA a dar uma resposta no estilo de RPG
        const fullPrompt = `Aja como um Mestre de Jogo de RPG experiente. Descreva a seguinte cena, local ou personagem com uma linguagem vívida, imersiva e atmosférica. Foque nos detalhes sensoriais (cheiros, sons, temperatura) e crie um tom de mistério ou aventura. A descrição deve ser contida num único parágrafo.
        
        Cena a descrever: "${prompt}"`;

        // Gera o conteúdo
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        console.log("Resposta recebida do Gemini:", text);
        return text;

    } catch (error) {
        console.error("Erro ao comunicar com a API do Gemini:", error);
        // Devolve uma mensagem de erro amigável para o frontend
        return "O portal para o reino da IA está instável. O Bardo não conseguiu obter uma visão clara. Tente novamente mais tarde.";
    }
};

// 4. Definir as Rotas da API
app.post('/api/generate-description', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'O prompt é obrigatório.' });
        }

        const description = await generateDescriptionFromAI(prompt);

        res.json({ description });

    } catch (error) {
        console.error("Erro na rota /api/generate-description:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor da API a correr em http://localhost:${PORT}`);
    console.log('Conectado ao Google Gemini. Aguardando prompts...');
});
