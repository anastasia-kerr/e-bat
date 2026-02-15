import React, { useState } from 'react'
import { SUBMIT_URL } from './config'

export default function App() {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const payload = {
      answer,
      timestamp: new Date().toISOString(),
    }

    if (!SUBMIT_URL) {
      // No remote configured — simulate success and show instructions
      setTimeout(() => setStatus('simulated'), 300)
      return
    }

    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) setStatus('ok')
      else setStatus('error:' + res.status)
    } catch (err) {
      setStatus('error:' + err.message)
    }
  }

  return (
    <div className="container">
      <h1 className="title">Quick question</h1>

      <form onSubmit={handleSubmit}>
        <p className="question">Do you like this demo React app?</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <label>
            <input type="radio" name="answer" value="Yes" checked={answer === 'Yes'} onChange={() => setAnswer('Yes')} /> Yes
          </label>
          <label>
            <input type="radio" name="answer" value="No" checked={answer === 'No'} onChange={() => setAnswer('No')} /> No
          </label>
        </div>

        <div className="buttons">
          <button type="submit" disabled={!answer || status === 'sending'}>Submit answer</button>
        </div>
      </form>

      <div style={{ marginTop: 14 }}>
        {status === null && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Submissions: {SUBMIT_URL ? 'enabled' : 'not enabled'}
          </div>
        )}

        {status === 'sending' && <div className="response">Sending...</div>}
        {status === 'ok' && <div className="response">Thanks — your answer was recorded.</div>}
        {status === 'simulated' && (
          <div className="response">
            Demo: submission simulated. To enable real submissions, set a Formspree endpoint in <code>src/config.js</code> (see README).
          </div>
        )}
        {status && status.startsWith('error') && <div className="response">Error submitting: {status}</div>}
      </div>
    </div>
  )
}
