GRUPO : VINICIUS PASSOS, GUILHERME LIMA, GUILHERME MESSIAS ALBERNAZ, JOÃO BATISTA

Visão Inicial: Pré-Modelagem de Ameaças

Nesta fase inicial, a arquitetura era funcional, mas apresentava falhas de segurança significativas, pois a lógica de comunicação e as credenciais estavam expostas no lado do cliente (frontend).

Arquitetura:

Frontend (index.html, script.js): O usuário inseria o comando.

Lógica Exposta: O próprio script.js continha a chave da API do Google Gemini e toda a lógica de "prompt engineering" para formatar as requisições para as IAs.

Comunicação Direta (Hipótese): O frontend faria chamadas diretas ou quase diretas às IAs, com a lógica e a chave visíveis no código-fonte do navegador.

Ameaças Identificadas:

Exposição de Credenciais (Ameaça Grave): A chave da API do Gemini estava visível no script.js. Um usuário mal-intencionado poderia copiar essa chave inspecionando o código da página e usá-la para fazer chamadas ilimitadas à API, gerando custos altíssimos e consumindo a cota do projeto.

Exposição de Lógica de Negócios: Os prompts detalhados, que são a "receita secreta" do projeto para obter respostas de qualidade das IAs, estavam no frontend. Isso permitiria que qualquer um copiasse a propriedade intelectual do sistema facilmente.

Abuso e Falta de Controle: Sem um backend para mediar as requisições, não haveria como controlar, limitar ou monitorar o uso da API, tornando o sistema vulnerável a ataques de negação de serviço ou abuso.

Visão Final: Pós-Implementação das Medidas de Mitigação

A arquitetura foi refatorada para um modelo cliente-servidor seguro, onde o backend atua como um intermediário protegido (proxy), resolvendo as vulnerabilidades identificadas.

Arquitetura Refatorada:

Frontend (script.js): Agora é um componente que apenas coleta o comando do usuário e faz uma chamada para sua própria API backend, sem conhecer chaves ou prompts complexos.

Comunicação Segura: O backend recebe a solicitação simples do frontend, constrói a requisição completa e a envia para os agentes de IA.

Medidas de Mitigação Implementadas:

Ocultação de Credenciais: A chave da API foi movida para o server.js e carregada como uma variável de ambiente usando o pacote dotenv. Ela nunca é exposta ao cliente.

Centralização da Lógica de Negócios: Toda a engenharia de prompt foi movida para o backend, protegendo a propriedade intelectual do projeto. O server.js agora contém os templates complexos que guiam o comportamento das IAs.

Implementação de um Gateway de API: O backend funciona como um gateway seguro. Ele valida e processa as solicitações, adiciona as credenciais e a lógica necessária, e só então se comunica com os serviços de IA. Isso centraliza o controle e a segurança.

Validação do Problema
O problema que o "RPG Assistant" busca resolver é real e relevante no universo dos jogos de RPG de mesa.

Mestres de RPG (Game Masters) frequentemente enfrentam o desafio de criar conteúdo descritivo, imersivo e original para suas campanhas. Esse processo demanda tempo, criatividade e preparação.

A dificuldade em visualizar cenas, personagens e itens pode ser uma barreira tanto para o mestre quanto para os jogadores, diminuindo a imersão.

A principal "dor" é o tempo e o esforço mental exigidos para a criação de conteúdo. Mestres precisam descrever locais, NPCs (personagens não-jogadores) e itens mágicos de forma vívida. O "RPG Assistant" atua como um co-piloto criativo, gerando instantaneamente descrições ricas e imagens inspiradoras a partir de um simples comando.

Parar o jogo para improvisar uma descrição complexa pode quebrar o ritmo da sessão. A ferramenta permite que o mestre obtenha conteúdo de alta qualidade em tempo real, mantendo os jogadores engajados na história.

Muitas mesas de RPG se beneficiam de auxílios visuais. No entanto, encontrar ou criar a imagem perfeita para um item ou cena específica é difícil e demorado. O sistema resolve isso gerando uma imagem customizada com base na descrição textual, unificando a visão do mestre e dos jogadores.

O projeto, portanto, não é apenas um exercício técnico, mas uma solução direcionada a uma necessidade clara da comunidade de RPG, visando otimizar a preparação e enriquecer a experiência de jogo.
