import { useState } from 'react';

function ChatForm() {
  const [prompt, setPrompt] = useState('');
  const [chatResult, setChatResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      setChatResult(data.reply);
    } catch (error) {
      setChatResult('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Ask Gemini</h2>
      <input
        type="text"
        placeholder="Ask Gemini..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {chatResult && <pre>{chatResult}</pre>}
    </div>
  );
}

export default ChatForm;
