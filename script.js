// Configuração da API do Supabase
const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

const API_QUESTOES_URL = `${SUPABASE_URL}/rest/v1/questoes`;
const API_ALTERNATIVAS_URL = `${SUPABASE_URL}/rest/v1/alternativas`;
const API_EXEMPLOS_URL = `${SUPABASE_URL}/rest/v1/exemplos`;

let questions = [];
let currentQuestionIndex = 0;

// Busca todas as questões, alternativas e exemplos
async function fetchQuestions() {
    try {
        // Busca questões
        const questoesResponse = await fetch(API_QUESTOES_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!questoesResponse.ok) {
            throw new Error(`Erro ao buscar questões: ${questoesResponse.statusText}`);
        }

        const questoes = await questoesResponse.json();

        // Busca alternativas
        const alternativasResponse = await fetch(API_ALTERNATIVAS_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!alternativasResponse.ok) {
            throw new Error(`Erro ao buscar alternativas: ${alternativasResponse.statusText}`);
        }

        const alternativas = await alternativasResponse.json();

        // Busca exemplos
        const exemplosResponse = await fetch(API_EXEMPLOS_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!exemplosResponse.ok) {
            throw new Error(`Erro ao buscar exemplos: ${exemplosResponse.statusText}`);
        }

        const exemplos = await exemplosResponse.json();

        // Integra as questões com suas alternativas e exemplos
        questions = questoes.map(questao => ({
            ...questao,
            alternativas: alternativas.filter(alt => alt.questao_id === questao.id),
            exemplos: exemplos.filter(ex => ex.questao_id === questao.id)
        }));

        console.log("Questões completas:", questions);
        if (questions.length > 0) {
            loadQuestion(currentQuestionIndex);
        } else {
            console.warn("Nenhuma questão encontrada.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}


function loadQuestion(index) {
    if (questions.length === 0) {
        console.error("Nenhuma questão carregada.");
        return;
    }

    const question = questions[index];

    // Atualizar categoria e número da questão
    document.getElementById("category").innerText = `Categoria: ${question.categoria}`;
    document.getElementById("question-number").innerText = `Questão ${index + 1} de ${questions.length}`;
    document.getElementById("question-text").innerText = question.texto;

    // Atualizar exemplos
    const exampleElem = document.querySelector(".example");
    exampleElem.innerHTML = ""; // Limpa exemplos anteriores
    if (question.exemplos.length > 0) {
        exampleElem.style.display = "block";

        question.exemplos.forEach(example => {
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
    } else {
        exampleElem.style.display = "none";
    }

    // Atualizar alternativas
    const answersElem = document.querySelector(".answers");
    answersElem.innerHTML = ""; // Limpa as alternativas anteriores

    question.alternativas.forEach(option => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="answer" value="${option.id}"> ${option.texto}`;
        answersElem.appendChild(label);
    });

    // Limpa o feedback
    document.getElementById("feedback").innerText = "";
}



// Navegação entre as questões
document.getElementById("nextQuestion").addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
});

document.getElementById("prevQuestion").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

// Submeter resposta
document.getElementById("submitAnswer").addEventListener("click", () => {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        const answerId = parseInt(selectedOption.value);
        const correct = questions[currentQuestionIndex].alternativas.find(option => option.id === answerId).correta;

        const feedbackElem = document.getElementById("feedback");
        feedbackElem.innerText = correct ? "Correct!" : "Wrong answer. Try again.";
        feedbackElem.style.color = correct ? "green" : "red";
    } else {
        alert("Selecione uma resposta.");
    }
});

// Busca as perguntas ao carregar a página
fetchQuestions();
