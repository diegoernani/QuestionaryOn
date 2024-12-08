const SUPABASE_URL = "https://yhgqblmnpvcrrkdbpodk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZ3FibG1ucHZjcnJrZGJwb2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM3NjEsImV4cCI6MjA0ODczOTc2MX0.C1grCzl6l8Um7-KddlForJ6slNSyz9pXJ5OwnnjWxVg";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionariouuid = urlParams.get("uuid"); // Usar UUID em vez de quiz_id

    if (!questionariouuid) {
        alert("Questionário não encontrado. Redirecionando para a página inicial.");
        window.location.href = "index.html";
        return;
    }

    const shareLinkInput = document.getElementById("shareLink");

    try {
        // Gera o link automaticamente ao carregar a página
        const response = await fetch(`${SUPABASE_URL}/rest/v1/shared_links`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
                Prefer: "return=representation",
            },
            body: JSON.stringify({ questionario_uuid: questionariouuid }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Erro ao gerar link de compartilhamento:", errorDetails);
            shareLinkInput.value = "Erro ao gerar link. Tente novamente.";
            return;
        }

        const data = await response.json();
        const sharedUuid = data[0].uuid; // Obtém o UUID do link gerado
        const link = `${window.location.origin}/shared.html?uuid=${sharedUuid}`;
        shareLinkInput.value = link; // Exibe o link automaticamente no campo de texto

    } catch (err) {
        console.error("Erro ao conectar ao Supabase:", err);
        shareLinkInput.value = "Erro ao gerar link. Tente novamente.";
    }

    // Copiar o link ao clicar no botão
    document.getElementById("copyLink").addEventListener("click", () => {
        shareLinkInput.select();
        document.execCommand("copy");
        alert("Link copiado para a área de transferência!");
    });
});
