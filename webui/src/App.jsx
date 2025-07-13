import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [output, setOutput] = useState('');

  const run = async (method) => {
    try {
      const res = await axios({ url: `/api/${method}`, method: method === 'status' ? 'get' : 'post' });
      setOutput(res.data);
    } catch (err) {
      setOutput(err.response ? err.response.data : 'Error');
    }
  };

  return (
    <div className="container">
      <h1>Media Server Stack</h1>
      <div className="buttons">
        <button onClick={() => run('status')}>Status</button>
        <button onClick={() => run('start')}>Start</button>
        <button onClick={() => run('stop')}>Stop</button>
      </div>
      <pre>{output}</pre>
    </div>
  );
}
