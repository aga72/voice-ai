console.log("app.js loaded");
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

document.getElementById("send_chat").addEventListener("click", async () => {
  console.log("Button clicked!");
  const prompt = document.getElementById("prompt").value;

  const response = await fetch(
    "/api/chat", 
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
    }
  );
  console.log("Post sent, awaiting response...");

  document.getElementById("chat_result").textContent = await response.text();
});
