const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Registro do usuário via Supabase Auth
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar: ${response.statusText}`);
        }

        const result = await response.json();

        // Adicionar dados do usuário na tabela `users`
        await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ id: result.id, name, email })
        });

        alert("Usuário registrado com sucesso!");
        window.location.href = "login.html";
    } catch (error) {
        alert("Erro ao registrar: " + error.message);
    }
});
