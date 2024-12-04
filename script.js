// Configuração da API do Supabase
const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

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

    if (!quizId) {
        showHomePage();
        return;
    }

    if (!email) {
        showEmailPrompt(quizId);
        return;
    }

    document.getElementById("emailDisplay").innerText = `Respondendo como: ${email}`;
    await fetchQuestions(quizId);
}

// Mostra a página inicial
function showHomePage() {
    document.body.innerHTML = `
        <header>
            <h1>Welcome to QuestionaryOn</h1>
        </header>
        <main>
            <p>Create, share, and respond to quizzes effortlessly!</p>
            <a href="/index.html">Get Started</a>
        </main>
    `;
}

// Mostra a página de solicitação de e-mail
function showEmailPrompt(quizId) {
    document.body.innerHTML = `
        <header>
            <h1>Enter Your Email to Start</h1>
        </header>
        <main>
            <form id="emailForm">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                <button type="submit">Start Quiz</button>
            </form>
        </main>
    `;

    document.getElementById("emailForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        window.location.href = `question.html?quiz_id=${quizId}&email=${encodeURIComponent(email)}`;
    });
}

// Busca questões, alternativas e exemplos
async function fetchQuestions(quizId) {
    try {
        const headers = {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        };

        const [questoesRes, alternativasRes, exemplosRes] = await Promise.all([
            fetch(`${API_QUESTOES_URL}?quiz_id=eq.${quizId}`, { headers }),
            fetch(API_ALTERNATIVAS_URL, { headers }),
            fetch(API_EXEMPLOS_URL, { headers }),
        ]);

        if (!questoesRes.ok || !alternativasRes.ok || !exemplosRes.ok) {
            throw new Error("Erro ao carregar dados do Supabase.");
        }

        const questoes = await questoesRes.json();
        const alternativas = await alternativasRes.json();
        const exemplos = await exemplosRes.json();

        questions = questoes.map((questao) => ({
            ...questao,
            alternativas: alternativas.filter((alt) => alt.questao_id === questao.codigo),
            exemplos: exemplos.filter((ex) => ex.questao_id === questao.codigo),
        }));

        if (questions.length > 0) {
            loadQuestion(currentQuestionIndex);
        } else {
            alert("Nenhuma questão encontrada para este questionário.");
        }
    } catch (error) {
        console.error("Erro ao carregar questões:", error);
    }
}

// Carrega uma questão
function loadQuestion(index) {
    const question = questions[index];
    document.getElementById("category").innerText = `Categoria: ${question.categoria}`;
    document.getElementById("question-number").innerText = `Questão ${index + 1} de ${questions.length}`;
    document.getElementById("question-text").innerText = question.texto;

    const exampleElem = document.querySelector(".example");
    exampleElem.innerHTML = "";
    exampleElem.style.display = question.exemplos.length ? "block" : "none";

    question.exemplos.forEach((example) => {
        const exampleBlock = document.createElement("div");
        exampleBlock.className = "example-block";

        const description = document.createElement("p");
        description.innerText = example.descricao || "Exemplo:";
        exampleBlock.appendChild(description);

        const codeBlock = document.createElement("pre");
        codeBlock.innerText = example.codigo;
        exampleBlock.appendChild(codeBlock);

        exampleElem.appendChild(exampleBlock);
    });

    const answersElem = document.querySelector(".answers");
    answersElem.innerHTML = "";

    question.alternativas.forEach((option) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="answer" value="${option.id}"> ${option.texto}`;
        answersElem.appendChild(label);
    });
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

// Submeter resposta
document.getElementById("submitAnswer")?.addEventListener("click", async () => {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    const email = new URLSearchParams(window.location.search).get("email");
    const quizId = new URLSearchParams(window.location.search).get("quiz_id");

    if (!selectedOption || !email || !quizId) {
        alert("Por favor, selecione uma resposta.");
        return;
    }

    try {
        const response = await fetch(API_RESPONSES_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                questionario_id: quizId,
                questao_id: questions[currentQuestionIndex].codigo,
                resposta: selectedOption.value,
            }),
        });

        if (!response.ok) {
            throw new Error("Erro ao salvar resposta.");
        }

        alert("Resposta salva com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar resposta:", error);
    }
});

// Inicializar
init();
