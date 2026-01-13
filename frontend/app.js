document.getElementById("save_message").addEventListener("click", async () => {
  const message = document.getElementById("message").value;
  const author = document.getElementById("author").value;

  const response = await fetch(
    "/api/messages", 
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, author })
    }
  );

  document.getElementById("result").textContent = await response.text();
});
