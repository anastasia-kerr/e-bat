import React, { useState } from 'react'

export default function App() {
  const [answer, setAnswer] = useState(null)

  return (
    <div className="container">
      <h1 className="title">Quick question</h1>
      <p className="question">Do you like this demo React app?</p>

      <div className="buttons">
        <button onClick={() => setAnswer('Yes')}>Yes</button>
        <button onClick={() => setAnswer('No')}>No</button>
      </div>

      {answer && (
        <div className="response">
          You answered: <strong>{answer}</strong>
        </div>
      )}
    </div>
  )
}
