import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    socket.emit('get-document');

    socket.on('load-document', doc => {
      setContent(doc);
    });

    socket.on('receive-changes', delta => {
      setContent(delta);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    socket.emit('send-changes', value);
    socket.emit('save-document', value);
  };

  return (
    <div className="App">
      <h1>📝 Real-Time Collaborative Document</h1>
      <textarea
        value={content}
        onChange={handleChange}
        style={{ width: '90%', height: '400px', fontSize: '1rem' }}
      />
    </div>
  );
}

export default App;
