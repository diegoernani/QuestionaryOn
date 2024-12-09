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
        <label for="question${questionCount}">Questão ${questionCount}:</label>
        <input type="text" id="question${questionCount}" name="questions[]" required placeholder="Escreva sua questão">
        <label for="category${questionCount}">Categoria:</label>
        <input type="text" id="category${questionCount}" name="categories[]" placeholder="Escreva uma categoria (opcional)">
        
        <div class="alternatives">
            <label>Alternativas:</label>
            <div id="alternatives${questionCount}">
                <div class="alternative-row">
                    <input type="checkbox" name="correctAlternative${questionCount}[]" value="1" class="checkbox">
                    <input type="text" name="alternative${questionCount}[]" required placeholder="Alternativa 1" class="input">
                </div>
                <div class="alternative-row">
                    <input type="checkbox" name="correctAlternative${questionCount}[]" value="2" class="checkbox">
                    <input type="text" name="alternative${questionCount}[]" required placeholder="Alternativa 2" class="input">
                </div>
            </div>
            <button type="button" onclick="addAlternative(${questionCount})">Adicionar Alternativa</button>
        </div>

        <div class="material-input-container">
            <label for="example${questionCount}" class="material-label">Exemplos (opcional):</label>
            <textarea id="example${questionCount}" name="examples[]" class="material-textarea" placeholder="Adicione exemplos ou código fonte aqui"></textarea>
        </div>
    `;

    questionsContainer.appendChild(questionBlock);
});

// Adicionar alternativa dinâmica
function addAlternative(questionId) {
    const alternativesContainer = document.getElementById(`alternatives${questionId}`);
    const alternativeCount = alternativesContainer.children.length + 1;

    const alternativeBlock = document.createElement("div");
    alternativeBlock.className = "alternative-row"; // Classe para estilização no CSS

    const correctCheckbox = document.createElement("input");
    correctCheckbox.type = "checkbox";
    correctCheckbox.name = `correctAlternative${questionId}[]`;
    correctCheckbox.value = alternativeCount;
    correctCheckbox.className = "checkbox"; // Classe para estilização no CSS

    const newAlternative = document.createElement("input");
    newAlternative.type = "text";
    newAlternative.name = `alternative${questionId}[]`;
    newAlternative.required = true;
    newAlternative.placeholder = `Alternativa ${alternativeCount}`;
    newAlternative.className = "input"; // Classe para estilização no CSS

    alternativeBlock.appendChild(correctCheckbox);
    alternativeBlock.appendChild(newAlternative);

    alternativesContainer.appendChild(alternativeBlock);
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
        const questionariouuid = createdQuiz[0]?.uuid;

        if (!questionariouuid) {
            throw new Error("UUID do questionário não retornado.");
        }

        console.log("Questionário salvo com sucesso:", createdQuiz);

        // Capturar perguntas, alternativas e exemplos
        const perguntas = [];
        const alternativas = [];
        const exemplos = [];
        const questionInputs = document.querySelectorAll('input[name="questions[]"]');

        questionInputs.forEach((questionInput, index) => {
            const texto = questionInput.value;
            const categoryInput = document.querySelector(`#category${index + 1}`);
            const categoria = categoryInput ? categoryInput.value : null;

            if (texto) {
                const pergunta = {
                    texto,
                    questionariouuid: questionariouuid,
                    categoria,
                };
                perguntas.push(pergunta);

                // Capturar alternativas associadas
                const alternativeInputs = document.querySelectorAll(`input[name="alternative${index + 1}[]"]`);
                const correctCheckboxes = document.querySelectorAll(`input[name="correctAlternative${index + 1}[]"]:checked`);

                alternativeInputs.forEach((altInput, altIndex) => {
                    alternativas.push({
                        texto: altInput.value,
                        questao_id: null,
                        correta: Array.from(correctCheckboxes).some(cb => parseInt(cb.value) === altIndex + 1),
                    });
                });

                // Capturar exemplos associados
                const exampleTextarea = document.querySelector(`#example${index + 1}`);
                if (exampleTextarea && exampleTextarea.value) {
                    exemplos.push({
                        codigo: exampleTextarea.value,
                        questao_id: null,
                    });
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

        // Associar alternativas e exemplos às perguntas salvas
        createdQuestions.forEach((pergunta, index) => {
            const start = index * alternativas.length / createdQuestions.length;
            const end = (index + 1) * alternativas.length / createdQuestions.length;

            alternativas.slice(start, end).forEach((alt) => {
                alt.questao_id = pergunta.id;
            });

            exemplos.forEach((ex, exIndex) => {
                if (exIndex === index) {
                    ex.questao_id = pergunta.id;
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
                body: JSON.stringify(alternativas.map((alt) => ({
                    texto: alt.texto,
                    questao_id: alt.questao_id,
                    correta: alt.correta,
                }))),
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
                body: JSON.stringify(exemplos.map((ex) => ({
                    codigo: ex.codigo,
                    questao_id: ex.questao_id,
                }))),
            });

            if (!responseExamples.ok) {
                const errorDetails = await responseExamples.text();
                throw new Error(`Erro ao salvar exemplos: ${errorDetails}`);
            }

            console.log("Exemplos salvos com sucesso!");
        }

        alert("Questionário salvo com sucesso!");

        // Redirecionar para confirmation.html com o UUID do questionário
        window.location.href = `confirmation.html?uuid=${questionariouuid}`;
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        alert("Erro ao salvar dados. Consulte o console para mais detalhes.");
    }
});
