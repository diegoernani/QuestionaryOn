document.getElementById("emailForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const questionariouuid = urlParams.get("uuid");
  const email = document.getElementById("email").value;

  if (!questionariouuid) {
      alert("Questionário não encontrado.");
      window.location.href = "index.html";
      return;
  }

  if (!email) {
      alert("Por favor, informe um email válido.");
      return;
  }

  // Redirecionar para question.html com uuid e email na URL
  window.location.href = `question.html?uuid=${questionariouuid}&email=${encodeURIComponent(email)}`;
});
