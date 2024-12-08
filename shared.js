const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUuid = urlParams.get("uuid");

    const content = document.getElementById("content");

    if (!sharedUuid) {
        content.innerHTML = "<p>UUID inválido ou ausente na URL.</p>";
        return;
    }

    try {
        // Buscar o UUID do link compartilhado
        const responseSharedLink = await fetch(`${SUPABASE_URL}/rest/v1/shared_links?uuid=eq.${sharedUuid}`, {
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
            },
        });

        if (!responseSharedLink.ok) {
            const errorDetails = await responseSharedLink.text();
            console.error("Erro ao buscar link compartilhado:", errorDetails);
            content.innerHTML = "<p>Erro ao carregar o link compartilhado.</p>";
            return;
        }

        const sharedData = await responseSharedLink.json();
        if (sharedData.length === 0) {
            content.innerHTML = "<p>Link inválido ou expirado.</p>";
            return;
        }

        const questionariouuid = sharedData[0].questionario_uuid;

        // Redirecionar para question.html carregando o questionário
        window.location.href = `question.html?uuid=${questionariouuid}`;
    } catch (error) {
        console.error("Erro ao carregar questionário:", error);
        content.innerHTML = "<p>Erro inesperado. Consulte o console para mais detalhes.</p>";
    }
});
