document.getElementById("save").addEventListener("click", async () => {
  const text = document.getElementById("text").value;

  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  document.getElementById("result").textContent = await res.text();
});
