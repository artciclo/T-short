function encurtar() {
  const urlInput = document.getElementById("urlInput");
  const originalUrl = urlInput.value;

  fetch("/api/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ originalUrl }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao encurtar URL");
      }
      return response.json();
    })
    .then((data) => {
      if (data.shortId) {
        document.getElementById(
          "resultado"
        ).textContent = `http://localhost:3000/${data.shortId}`;
      } else {
        document.getElementById("resultado").textContent =
          "Erro ao encurtar URL";
      }
    })
    .catch((error) => {
      console.error("Erro:", error);
      document.getElementById("resultado").textContent = "Erro ao encurtar URL";
    });
}
