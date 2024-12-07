const user = supabase.auth.getUser();

document.getElementById("userEmail").innerText = `Logado como: ${user.email}`;

document.getElementById("logoutButton").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
});

// Carregar lista de questionários
async function loadQuizzes() {
    const { data, error } = await supabase.from("questionarios").select("*").eq("user_id", user.id);

    if (error) {
        console.error("Erro ao carregar questionários:", error);
        return;
    }

    const quizList = document.getElementById("quizList");
    quizList.innerHTML = "";

    data.forEach((quiz) => {
        const li = document.createElement("li");
        li.innerText = quiz.nome;
        quizList.appendChild(li);
    });
}

document.querySelectorAll(".sidebar nav ul li a").forEach((link) => {
  link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const section = link.getAttribute("data-section");
      const sections = document.querySelectorAll(".content-section");

      // Esconde todas as seções
      sections.forEach((sec) => sec.classList.add("hidden"));

      // Mostra a seção selecionada
      const activeSection = document.getElementById(section);
      if (activeSection) {
          activeSection.classList.remove("hidden");
          document.getElementById("sectionTitle").innerText = link.innerText;
      }
  });
});



loadQuizzes();
