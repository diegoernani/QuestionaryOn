// Configuração da API do Supabase
const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

const API_QUESTIONARIOS_URL = `${SUPABASE_URL}/rest/v1/questionarios`;
const API_QUESTOES_URL = `${SUPABASE_URL}/rest/v1/questoes`;
const API_ALTERNATIVAS_URL = `${SUPABASE_URL}/rest/v1/alternativas`;
const API_EXEMPLOS_URL = `${SUPABASE_URL}/rest/v1/exemplos`;
const API_RESPONSTAS_URL = `${SUPABASE_URL}/rest/v1/respostas`;


let questions = [];
let currentQuestionIndex = 0;
let userEmail = "";

// Função Principal
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const questionariouuid = urlParams.get("uuid");
    userEmail = urlParams.get("email");

    if (!questionariouuid || !userEmail) {
        // alert("Dados insuficientes para carregar o questionário.");
        window.location.href = "emailprompt.html?uuid=" + questionariouuid;
        return;
    }

    // Exibir o email no cabeçalho
    const userEmailElement = document.getElementById("userEmail");
    if (userEmailElement) {
        userEmailElement.textContent = `Logado como: ${userEmail}`;
    }

    // Carregar nome do questionário
    try {
        const response = await fetch(`${API_QUESTIONARIOS_URL}?uuid=eq.${questionariouuid}`, {
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

            // Exibir modal de email
            await fetchQuestions(questionariouuid);
        } else {
            throw new Error("Questionário não encontrado.");
        }
        // Configuração dos botões após carregar as perguntas
        configureButtons();

    } catch (error) {
        console.error("Erro ao carregar questionário:", error);
        alert("Erro ao carregar questionário. Verifique o console para mais detalhes.");
        window.location.href = "404.html";
    }
}

// Validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Buscar questões, alternativas e exemplos
async function fetchQuestions(questionariouuid) {
    console.log("Iniciando fetchQuestions com UUID do Questionário:", questionariouuid);

    try {
        const headers = {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        };

        // Buscar todas as questões relacionadas ao questionário pelo UUID
        const questoesRes = await fetch(`${API_QUESTOES_URL}?questionariouuid=eq.${questionariouuid}`, { headers });

        if (!questoesRes.ok) {
            const errorMsg = await questoesRes.text();
            console.error("Erro ao buscar questões:", errorMsg);
            throw new Error("Erro ao buscar questões.");
        }

        const questoes = await questoesRes.json();
        console.log("Questões retornadas:", questoes);

        // Iterar sobre as questões para buscar alternativas e exemplos
        for (const questao of questoes) {
            const alternativasRes = await fetch(`${API_ALTERNATIVAS_URL}?questao_id=eq.${questao.id}`, { headers });
            const alternativas = alternativasRes.ok ? await alternativasRes.json() : [];

            const exemplosRes = await fetch(`${API_EXEMPLOS_URL}?questao_id=eq.${questao.id}`, { headers });
            const exemplos = exemplosRes.ok ? await exemplosRes.json() : [];

            questions.push({
                ...questao,
                alternativas: alternativas,
                exemplos: exemplos,
            });
        }

        console.log("Questões completas com alternativas e exemplos:", questions);

        if (questions.length > 0) {
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Nenhuma questão encontrada para este questionário.");
        }
    } catch (error) {
        console.error("Erro ao carregar questões:", error);
    }
}


// Carregar uma questão
function loadQuestion(index) {
    if (questions.length === 0) {
        console.error("Nenhuma questão carregada.");
        return;
    }

    const question = questions[index];

    document.getElementById("category").innerText = `${question.categoria}`;
    document.getElementById("question-number").innerText = `Questão ${index + 1} de ${questions.length}`;
    document.getElementById("question-text").innerText = question.texto;

    const exampleElem = document.querySelector(".example");
    exampleElem.innerHTML = "";
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

    const answersElem = document.querySelector(".answers");
    answersElem.innerHTML = "";

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

    document.getElementById("feedback").innerText = "";
}

function configureButtons() {
    document.getElementById("prevQuestion").addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    });

    document.getElementById("nextQuestion").addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        }
    });

    document.getElementById("submitAnswer").addEventListener("click", submitAnswer);

    document.getElementById("skipQuestion").addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Você já está na última pergunta.");
        }
    });
}


async function submitAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');

    if (!selectedOption) {
        alert("Por favor, selecione uma resposta antes de enviar.");
        return;
    }

    const answerId = selectedOption.value;
    const currentQuestion = questions[currentQuestionIndex];

    const answerData = {
        questao_id: currentQuestion.id,
        alternativa_id: answerId,
        resposta: 'true',
        email: userEmail, // Variável global corrigida
        questionariouuid: currentQuestion.questionariouuid,
    };

    console.log("Enviando resposta:", answerData);

    try {
        const response = await fetch(`${API_RESPONSTAS_URL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(answerData),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Erro ao enviar resposta: ${errorDetails}`);
        }

        console.log("Resposta enviada com sucesso!");
        alert("Resposta enviada com sucesso!");

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Você concluiu o questionário! Obrigado por participar.");
            window.location.href = "index.html"; // Redirecionar para página inicial ou outra página válida
        }
    } catch (error) {
        console.error("Erro ao enviar resposta:", error);
        alert("Erro ao enviar a resposta. Consulte o console para mais detalhes.");
    }
}

// Inicializar
init();
