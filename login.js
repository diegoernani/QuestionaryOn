const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const feedbackMessage = document.getElementById("feedbackMessage");

    if (!email || !password) {
        feedbackMessage.innerText = "Por favor, preencha todos os campos.";
        feedbackMessage.className = "error";
        feedbackMessage.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {            
            const errorDetails = await response.json().catch(() => null); // Tenta ler o JSON, mas evita crashes
            const errorMsg = errorDetails?.error_description || errorDetails?.msg || "Erro desconhecido do servidor.";
            console.error("Erro detalhado:", errorDetails || response.statusText);
            feedbackMessage.innerText = errorMsg;
            feedbackMessage.className = "error";
            feedbackMessage.classList.remove("hidden");
            return;
        }

        const result = await response.json();
        console.log("Login bem-sucedido:", result);

        // Salvar token no localStorage
        localStorage.setItem("supabase.auth.token", result.access_token);

        feedbackMessage.innerText = "Login realizado com sucesso!";
        feedbackMessage.className = "success";
        feedbackMessage.classList.remove("hidden");
        setTimeout(() => window.location.href = "admin.html", 2000);
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        feedbackMessage.innerText = "Erro ao fazer login: " + (error.message || "Erro desconhecido.");
        feedbackMessage.className = "error";
        feedbackMessage.classList.remove("hidden");
    }
});
