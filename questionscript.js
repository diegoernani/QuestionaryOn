// Configuração da API do Supabase
const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

const API_QUESTIONARIOS_URL = `${SUPABASE_URL}/rest/v1/questionarios`;
const API_QUESTOES_URL = `${SUPABASE_URL}/rest/v1/questoes`;
const API_ALTERNATIVAS_URL = `${SUPABASE_URL}/rest/v1/alternativas`;
const API_EXEMPLOS_URL = `${SUPABASE_URL}/rest/v1/exemplos`;
const API_RESPONSES_URL = `${SUPABASE_URL}/rest/v1/questions_response`;

let questions = [];
let currentQuestionIndex = 0;

// Função Principal
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get("quiz_id");
    const email = urlParams.get("email");

    // Sempre iniciar na função showEmailPrompt
    if (!quizId) {
        alert("Questionário não encontrado.");
        window.location.href = "index.html";
        return;
    }

    if (!email) {
        alert("Por favor, informe seu email antes de acessar o questionário.");
        window.location.href = `emailPrompt.html?quiz_id=${quizId}`;
        return;
    }

    // Exibir email no cabeçalho
    const userEmailElement = document.getElementById("userEmail");
    if (userEmailElement) {
        userEmailElement.innerText = `Logado como: ${email}`;
    }

    // Carregar nome do questionário
    try {
        const response = await fetch(`${API_QUESTIONARIOS_URL}?id=eq.${quizId}`, {
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
            },
        });
        const data = await response.json();

        if (data.length > 0) {
            const quizTitleElement = document.getElementById("quizTitle");
            if (quizTitleElement) {
                quizTitleElement.innerText = data[0].nome;
            }
        } else {
            throw new Error("Questionário não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao carregar nome do questionário:", error);
        window.location.href = "404.html";
        return;
    }

    // Carregar perguntas
    await fetchQuestions(quizId);
}

// Mostra a página de solicitação de e-mail

// Busca questões, alternativas e exemplos
async function fetchQuestions(quizId) {
    console.log("Iniciando fetchQuestions com Quiz ID:", quizId);

    try {
        const headers = {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        };

        // Buscando todas as questões relacionadas ao questionário
        const questoesRes = await fetch(`${API_QUESTOES_URL}?questionario_id=eq.${quizId}`, { headers });

        if (!questoesRes.ok) {
            const errorMsg = await questoesRes.text();
            console.error("Erro ao buscar questões:", errorMsg);
            throw new Error("Erro ao buscar questões.");
        }

        const questoes = await questoesRes.json();
        console.log("Questões retornadas:", questoes);

        // Preparar promessas para buscar alternativas e exemplos de cada questão
        const alternativasPromises = questoes.map((questao) =>
            fetch(`${API_ALTERNATIVAS_URL}?questao_id=eq.${questao.id}`, { headers }).then((res) =>
                res.ok ? res.json() : []
            )
        );

        const exemplosPromises = questoes.map((questao) =>
            fetch(`${API_EXEMPLOS_URL}?questao_id=eq.${questao.id}`, { headers }).then((res) =>
                res.ok ? res.json() : []
            )
        );

        // Resolve todas as promessas
        const alternativasList = await Promise.all(alternativasPromises);
        const exemplosList = await Promise.all(exemplosPromises);

        // Combina as questões com alternativas e exemplos
        questions = questoes.map((questao, index) => ({
            ...questao,
            alternativas: alternativasList[index],
            exemplos: exemplosList[index],
        }));

        console.log("Questões completas:", questions);

        if (questions.length > 0) {
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Nenhuma questão encontrada para este questionário.");
        }
    } catch (error) {
        console.error("Erro ao carregar questões:", error);
    }
}

function loadQuestion(index) {
    if (questions.length === 0) {
        console.error("Nenhuma questão carregada.");
        return;
    }

    const question = questions[index];

    // Atualizar categoria e número da questão
    document.getElementById("category").innerText = `${question.categoria}`;
    document.getElementById("question-number").innerText = `Questão ${index + 1} de ${questions.length}`;
    document.getElementById("question-text").innerText = question.texto;

    // Atualizar exemplos
    const exampleElem = document.querySelector(".example");
    exampleElem.innerHTML = ""; // Limpa exemplos anteriores
    if (question.exemplos && question.exemplos.length > 0) {
        exampleElem.style.display = "block";

        question.exemplos.forEach((example) => {
            const exampleBlock = document.createElement("div");
            exampleBlock.className = "example-block";

            const codeBlock = document.createElement("pre");
            codeBlock.innerText = example.codigo || "Nenhum código fornecido.";
            exampleBlock.appendChild(codeBlock);

            exampleElem.appendChild(exampleBlock);
        });
    } else {
        exampleElem.style.display = "none";
    }

    // Atualizar alternativas
    const answersElem = document.querySelector(".answers");
    answersElem.innerHTML = ""; // Limpa as alternativas anteriores

    if (question.alternativas && question.alternativas.length > 0) {
        question.alternativas.forEach((option) => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="radio" name="answer" value="${option.id}"> ${option.texto}`;
            answersElem.appendChild(label);
        });
    } else {
        const noAlternatives = document.createElement("p");
        noAlternatives.innerText = "Nenhuma alternativa disponível.";
        answersElem.appendChild(noAlternatives);
    }

    // Limpa o feedback
    document.getElementById("feedback").innerText = "";
}

// Navegação entre questões
document.getElementById("nextQuestion")?.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
});

document.getElementById("prevQuestion")?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

// Função para pular a questão
document.getElementById("skipQuestion").addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        alert("Você chegou ao final do questionário!");
    }
});

// Submeter resposta
async function submitAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    const email = new URLSearchParams(window.location.search).get("email");
    const quizId = new URLSearchParams(window.location.search).get("quiz_id");

    if (!selectedOption) {
        alert("Por favor, selecione uma resposta antes de enviar.");
        return;
    }

    if (!email || !quizId) {
        alert("Erro: Email ou ID do questionário ausente.");
        return;
    }

    const resposta = {
        questionario_id: quizId,
        questao_id: questions[currentQuestionIndex].id,
        email: email,
        resposta: selectedOption.value,
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/respostas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY,
            },
            body: JSON.stringify(resposta),
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar resposta: ${response.statusText}`);
        }

        alert("Resposta enviada com sucesso!");

        // Carregar próxima questão, se houver
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Você respondeu todas as perguntas. Obrigado!");
            // Redirecionar ou mostrar tela de conclusão
            window.location.href = `confirmation.html?quiz_id=${quizId}`;
        }
    } catch (error) {
        console.error("Erro ao salvar resposta:", error);
        alert("Ocorreu um erro ao enviar a resposta. Tente novamente.");
    }
}

// Inicializar
init();