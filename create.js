const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

const questionsContainer = document.getElementById("questionsContainer");
let questionCount = 0;

// Adicionar uma nova pergunta
document.getElementById("addQuestion").addEventListener("click", () => {
    questionCount++;

    const questionBlock = document.createElement("div");
    questionBlock.className = "question-block";
    questionBlock.innerHTML = `
        <label for="question${questionCount}">Question ${questionCount}:</label>
        <input type="text" id="question${questionCount}" name="questions[]" required placeholder="Enter your question">
        <label for="category${questionCount}">Category:</label>
        <input type="text" id="category${questionCount}" name="categories[]" placeholder="Enter category (optional)">
        
        <div class="alternatives">
            <label>Alternatives:</label>
            <div id="alternatives${questionCount}">
                <input type="text" name="alternative${questionCount}[]" required placeholder="Alternative 1">
                <input type="text" name="alternative${questionCount}[]" required placeholder="Alternative 2">
            </div>
            <button type="button" onclick="addAlternative(${questionCount})">Add Alternative</button>
        </div>
        
        <label for="example${questionCount}">Example (optional):</label>
        <textarea id="example${questionCount}" name="examples[]" placeholder="Add example or code here"></textarea>
    `;

    questionsContainer.appendChild(questionBlock);
});

// Adicionar alternativa dinâmica
function addAlternative(questionId) {
    const alternativesContainer = document.getElementById(`alternatives${questionId}`);
    const newAlternative = document.createElement("input");
    newAlternative.type = "text";
    newAlternative.name = `alternative${questionId}[]`;
    newAlternative.required = true;
    newAlternative.placeholder = `Alternative ${alternativesContainer.children.length + 1}`;
    alternativesContainer.appendChild(newAlternative);
}

// Salvar questionário no Supabase

document.getElementById("questionnaireForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const quizName = formData.get("quizName");

    if (!quizName) {
        alert("O nome do questionário é obrigatório.");
        return;
    }

    try {
        const userId = 1; // ID fixo do usuário

        console.log("Preparando questionário...");
        const questionarioData = { nome: quizName, user_id: userId };

        // Salvar o questionário
        const responseQuiz = await fetch(`${SUPABASE_URL}/rest/v1/questionarios`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
                Prefer: "return=representation",
            },
            body: JSON.stringify(questionarioData),
        });

        if (!responseQuiz.ok) {
            const errorDetails = await responseQuiz.text();
            throw new Error(`Erro ao salvar questionário: ${errorDetails}`);
        }

        const createdQuiz = await responseQuiz.json();
        const questionarioId = createdQuiz[0]?.id;

        if (!questionarioId) {
            throw new Error("ID do questionário não retornado.");
        }

        console.log("Questionário salvo com sucesso:", createdQuiz);

        // Capturar perguntas, alternativas e exemplos
        const perguntas = [];
        const alternativas = [];
        const exemplos = [];
        const questionInputs = document.querySelectorAll('input[name="questions[]"]');

        questionInputs.forEach((questionInput, index) => {
            const texto = questionInput.value;
            const categoryInput = document.querySelector(`#category${index + 1}`); // Captura o campo categoria
            const categoria = categoryInput ? categoryInput.value : null; // Garante que o valor exista ou seja nulo
        
            if (texto) {
                const pergunta = {
                    texto,
                    questionario_id: questionarioId,
                    categoria, // Adiciona a categoria ao objeto pergunta
                };
                perguntas.push(pergunta);
        
                // Capturar alternativas associadas
                const alternativeInputs = document.querySelectorAll(`input[name="alternative${index + 1}[]"]`);
                alternativeInputs.forEach((altInput) => {
                    const alternativa = {
                        texto: altInput.value,
                        questao_id: null, // Será preenchido após salvar as perguntas
                        correta: false, // Ajuste se necessário
                    };
                    alternativas.push(alternativa);
                });
        
                // Capturar exemplo associado
                const exampleTextarea = document.querySelector(`#example${index + 1}`);
                if (exampleTextarea && exampleTextarea.value) {
                    const exemplo = {
                        codigo: exampleTextarea.value, // Campo atualizado
                        questao_id: null, // Será preenchido após salvar as perguntas
                    };
                    exemplos.push(exemplo);
                }
            }
        });
        

        console.log("Perguntas preparadas:", perguntas);
        console.log("Alternativas preparadas:", alternativas);
        console.log("Exemplos preparados:", exemplos);

        if (perguntas.length === 0) {
            throw new Error("Nenhuma pergunta foi preparada para envio.");
        }

        // Salvar perguntas no Supabase
        const responseQuestions = await fetch(`${SUPABASE_URL}/rest/v1/questoes`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
                Prefer: "return=representation",
            },
            body: JSON.stringify(perguntas),
        });

        if (!responseQuestions.ok) {
            const errorDetails = await responseQuestions.text();
            throw new Error(`Erro ao salvar perguntas: ${errorDetails}`);
        }

        const createdQuestions = await responseQuestions.json();
        console.log("Perguntas salvas com sucesso:", createdQuestions);

        // Associar alternativas às perguntas salvas
        createdQuestions.forEach((question, index) => {
            alternativas.forEach((alt, altIndex) => {
                const questionGroupIndex = Math.floor(altIndex / (alternativas.length / createdQuestions.length));
                if (questionGroupIndex === index) {
                    alt.questao_id = question.id;
                }
            });

            // Associar exemplos às perguntas salvas
            exemplos.forEach((ex, exIndex) => {
                if (exIndex === index) {
                    ex.questao_id = question.id;
                }
            });
        });

        console.log("Alternativas associadas às perguntas:", alternativas);
        console.log("Exemplos associados às perguntas:", exemplos);

        // Salvar alternativas no Supabase
        if (alternativas.length > 0) {
            const responseAlternatives = await fetch(`${SUPABASE_URL}/rest/v1/alternativas`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    apikey: SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                    Prefer: "return=representation",
                },
                body: JSON.stringify(alternativas),
            });

            if (!responseAlternatives.ok) {
                const errorDetails = await responseAlternatives.text();
                throw new Error(`Erro ao salvar alternativas: ${errorDetails}`);
            }

            console.log("Alternativas salvas com sucesso!");
        }

        // Salvar exemplos no Supabase
        if (exemplos.length > 0) {
            const responseExamples = await fetch(`${SUPABASE_URL}/rest/v1/exemplos`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    apikey: SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                    Prefer: "return=representation",
                },
                body: JSON.stringify(exemplos),
            });

            if (!responseExamples.ok) {
                const errorDetails = await responseExamples.text();
                throw new Error(`Erro ao salvar exemplos: ${errorDetails}`);
            }

            console.log("Exemplos salvos com sucesso!");
        }

        alert("Questionário, perguntas, alternativas e exemplos salvos com sucesso!");
        window.location.reload();
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        alert("Erro ao salvar dados. Consulte o console para mais detalhes.");
    }
});
