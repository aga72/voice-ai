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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Ask Gemini
      </h2>
      
      <input
        type="text"
        placeholder="Ask Gemini..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <button 
        onClick={handleSend} 
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg transition-colors"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
      
      {chatResult && (
        <pre className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap">
          {chatResult}
        </pre>
      )}
    </div>
  );
}

export default ChatForm;
