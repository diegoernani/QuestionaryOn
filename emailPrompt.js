function showFeedbackMessage(type, message) {
  const feedbackElement = document.getElementById("feedbackMessage");
  feedbackElement.className = `visible ${type}`; // Adiciona classes de estilo
  feedbackElement.innerText = message;

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
      feedbackElement.className = "hidden";
  }, 5000);
}

document.getElementById("emailForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quiz_id");
  const email = document.getElementById("email").value;

  if (!quizId) {
      showFeedbackMessage("error", "Questionário não encontrado.");
      window.location.href = "index.html";
      return;
  }

  if (!email) {
    showFeedbackMessage("error", "Por favor, informe um email válido.");
      return;
  }

  // Redirecionar para a tela do questionário com o e-mail anexado à URL
  window.location.href = `question.html?quiz_id=${quizId}&email=${encodeURIComponent(email)}`;
});
