// 1. Importar as dependências
require('dotenv').config(); // Carrega as variáveis de ambiente do ficheiro .env
const http = require('http');
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

app.use(express.static('./'))

// --- FUNÇÃO REAL DA IA (usando o Gemini) ---
const generateDescriptionFromAI = async (prompt, style) => {
    console.log(`Recebido prompt para o Gemini: "${prompt}"`);
    
    try {
        // CORREÇÃO: Atualizado o nome do modelo para uma versão mais recente.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Cria um prompt mais elaborado para guiar a IA a dar uma resposta no estilo de RPG
        const fullPrompt = style === "rpg" ? `
# PERSONA #
Aja como um Mestre de Jogo de RPG (Mestre de Jogo) experiente e criativo.

# OBJETIVO #
Gerar uma descrição imersiva e atmosférica para um elemento de RPG (Cena, Item ou Personagem), focando em detalhes sensoriais e um tom de mistério, perigo ou aventura.

# ESTRUTURA LÓGICA E REGRAS #

Identifique o TIPO de elemento a ser descrito: Cena, Item ou Personagem e sempre comece o resultado a ser exibido pro usuário com "Tipo: <tipo> | Texto: ".

Mantenha a base para todos os tipos: A descrição deve ser contida num único parágrafo, usar linguagem vívida e apelar para os sentidos (olfato, audição, tato/temperatura).

Adapte o FOCO da descrição de acordo com o TIPO:

Se for uma CENA ou LOCAL: Dê ênfase à escala e ambiente. Descreva a arquitetura ou a geografia, a iluminação (ou a falta dela), a flora e a fauna, os sons ambientes, e a sensação geral do lugar no espaço (aberto, claustrofóbico, grandioso, etc.).

Se for um ITEM: Dê ênfase aos detalhes físicos e à sua aura. Descreva o tamanho, peso aparente, materiais, cores, inscrições ou runas, estado de conservação (novo, antigo, danificado), e qualquer sensação ou energia que ele emana (calor, frio, uma vibração sutil, um brilho fraco).

Se for um PERSONAGEM: Dê ênfase à aparência e à presença. Descreva suas roupas e equipamentos, traços faciais e expressão, postura corporal, o som de sua voz ou silêncio, e qualquer detalhe que sugira sua história, intenção ou personalidade (um olhar cansado, mãos calejadas, um tique nervoso, um sorriso enigmático).

# PROMPT DO USUÁRIO #

[${prompt}]

Exemplos de Como Usar o Template:
Exemplo 1 (Cena):

[TIPO: Cena]

[DESCRIÇÃO: Um pântano antigo ao luar, com ruínas afundadas na lama.]

Possível Resultado da IA:

O ar gelado e pesado do pântano se agarra em seus pulmões com o cheiro adocicado de decomposição e terra úmida, um silêncio opressor quebrado apenas pelo coro gutural de sapos invisíveis e o zumbido ocasional de um inseto perto de seu ouvido. O luar, pálido e doentio, vaza por entre os galhos retorcidos de ciprestes cobertos de musgo, revelando o brilho fantasmagórico da água parada e os contornos de estruturas de pedra afundadas, cujas paredes de ângulos estranhos são agora o lar de trepadeiras escuras e segredos submersos. Cada passo na lama fétida é um som úmido e sugador, um lembrete constante de que este lugar não deseja nada além de engolir tudo o que o perturba.

Exemplo 2 (Item):

[TIPO: Item]

[DESCRIÇÃO: Um amuleto de obsidiana encontrado no peito de um esqueleto.]

Possível Resultado da IA:

Repousando sobre as costelas empoeiradas, o amuleto parece absorver a pouca luz do ambiente, uma peça de obsidiana polida, fria como o toque da morte ao seu alcance. Ele é surpreendentemente pesado para seu tamanho, com a forma de uma lágrima retorcida, e sua superfície negra como a noite é atravessada por uma única veia de um vermelho opaco, semelhante a sangue coagulado. Ao pegá-lo, você não sente calor nem frio, mas um zumbido quase inaudível reverbera diretamente em seus ossos, uma vibração dormente que parece carregar o peso de um juramento antigo e esquecido.

Exemplo 3 (Personagem):

[TIPO: Personagem]

[DESCRIÇÃO: A guardiã de uma biblioteca esquecida, que não é inteiramente humana.]

Possível Resultado da IA:

Sentada em uma cadeira alta de espaldar, uma figura observa vocês por trás de uma montanha de livros, seu silêncio mais pesado que as grossas camadas de poeira no ar. Ela usa mantos escuros e desbotados que escondem sua forma, mas suas mãos, que repousam sobre um tomo aberto, são longas e pálidas, com dedos que se afilam em garras de ébano polido que tamborilam suavemente na capa de couro. Seu rosto é uma máscara de porcelana de feições serenas, mas seus olhos são poços de escuridão líquida, sem íris ou pupila, refletindo a luz da sua tocha com uma profundidade desconcertante que sugere uma vasta e paciente sabedoria, indiferente à passagem das eras.
        `: style === "image" ? `
Entregue apenas o prompt para a geração da imagem em inglês, imaginando a seguinte cena retratada em uma imagem, em caso de item gere um altar com apenas um item posicionado nele, em caso de personagem gere uma foto especificando que é apenas uma pessoa e com uma expressão neutra, e em caso de cena imagine como é a cena sendo fiel a descrição: ${prompt}
        ` : prompt;

        console.log("Prompt completo enviado para o Gemini:", fullPrompt);

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
        const { prompt, style } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'O prompt é obrigatório.' });
        }

        const description = await generateDescriptionFromAI(prompt, style);

        res.json({ description });

    } catch (error) {
        console.error("Erro na rota /api/generate-description:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});

app.post('/api/generate-img', (req, res) => {
    // 1. Pegar o prompt da query string da URL (?prompt=...)
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'O parâmetro "prompt" é obrigatório.' });
    }

    console.log(`Recebido prompt: "${prompt}"`);

    // 2. Montar o payload (dados) que a API do Stable Diffusion espera.
    const payload = {
        prompt: prompt,
        steps: 25,
        cfg_scale: 12,
        width: 1280,
        height: 720,
        negative_prompt: "",
        sampler_name: "Euler a"
    };

    const payloadString = JSON.stringify(payload);

    // 3. Configurar as opções para a requisição POST
    const options = {
        hostname: 'host.docker.internal', // Usar 'host.docker.internal' para acessar o host do Docker
        port: 7860,
        path: '/sdapi/v1/txt2img',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadString),
        },
    };

    // 4. Fazer a requisição para a API do Stable Diffusion
    console.log('Enviando requisição para a API do Stable Diffusion...');
    const sdRequest = http.request(options, (sdResponse) => {
        let responseData = '';

        sdResponse.on('data', (chunk) => {
            responseData += chunk;
        });

        // 5. Quando a resposta da API do SD for recebida por completo
        sdResponse.on('end', () => {
            console.log('Resposta recebida da API.');
            try {
                const parsedResponse = JSON.parse(responseData);
                
                // A API retorna a imagem como uma string em base64
                if (parsedResponse.images && parsedResponse.images.length > 0) {
                    const base64Image = parsedResponse.images[0];
                    const imageBuffer = Buffer.from(base64Image, 'base64');

                    // 6. Enviar a imagem de volta para o usuário que fez o GET
                    res.set('Content-Type', 'image/png');
                    res.send(imageBuffer);
                } else {
                    // Se não houver imagem, pode ter ocorrido um erro na API do SD
                    console.error('API do SD não retornou imagens. Resposta:', parsedResponse);
                    res.status(500).json({ error: 'A API do Stable Diffusion não retornou uma imagem.', details: parsedResponse });
                }
            } catch (error) {
                console.error('Erro ao processar a resposta da API do Stable Diffusion:', error);
                res.status(500).json({ error: 'Erro ao processar a resposta da API do Stable Diffusion.' });
            }
        });
    });

    sdRequest.on('error', (error) => {
        console.error('Erro na requisição para a API do Stable Diffusion:', error);
        res.status(500).json({ error: 'Não foi possível conectar à API do Stable Diffusion. Verifique se ela está rodando com o argumento --api.' });
    });

    // Envia o payload
    sdRequest.write(payloadString);
    sdRequest.end();
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor da API a correr em http://localhost:${PORT}`);
    console.log('Conectado ao Google Gemini. Aguardando prompts...');
});
