document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quiz_id");

  if (!quizId) {
      alert("Quiz ID not found. Redirecting to home.");
      window.location.href = "index.html";
      return;
  }

  const baseUrl = `${window.location.origin}/index.html`;
  const shareableLink = `${baseUrl}?quiz_id=${quizId}`;
  const shareLinkInput = document.getElementById("shareLink");
  shareLinkInput.value = shareableLink;

  document.getElementById("copyLink").addEventListener("click", () => {
      shareLinkInput.select();
      document.execCommand("copy");
      alert("Link copied to clipboard!");
  });

  document.getElementById("shareButton").addEventListener("click", () => {
      if (navigator.share) {
          navigator.share({
              title: "QuestionaryOn Quiz",
              text: "Check out this quiz!",
              url: shareableLink,
          }).catch((err) => console.error("Error sharing:", err));
      } else {
          alert("Sharing not supported on this browser. Please copy the link manually.");
      }
  });
});
