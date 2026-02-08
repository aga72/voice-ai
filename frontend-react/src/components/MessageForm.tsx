import { useState } from 'react';

function MessageForm() {
  // State: reactive variables that trigger re-renders when changed
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [result, setResult] = useState('');

  // Event handler: called when button is clicked
  const handleSave = async () => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, author })
    });

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
  };

  // JSX: HTML-like syntax that React converts to DOM elements
  return (
    <div>
      <h2>Save a Message</h2>
      <input
        type="text"
        placeholder="Your name..."
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        type="text"
        placeholder="Type something..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      {result && <pre>{result}</pre>}
    </div>
  );
}

export default MessageForm;