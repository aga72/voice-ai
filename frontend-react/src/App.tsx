import './App.css';
import MessageForm from './components/MessageForm';
import ChatForm from './components/ChatForm';

function App() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <MessageForm />
      <hr />
      <ChatForm />
    </div>
  );
}

export default App;
