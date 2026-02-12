import { useState } from 'react';

function MessageForm() {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [result, setResult] = useState('');

  const handleSave = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, author })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Save a Message
      </h2>
      
      <input
        type="text"
        placeholder="Your name..."
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <input
        type="text"
        placeholder="Type something..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <button 
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
      >
        Save
      </button>
      
      {result && (
        <pre className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">
          {result}
        </pre>
      )}
    </div>
  );
}

export default MessageForm;
