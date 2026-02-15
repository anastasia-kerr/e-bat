import React, { useState, useMemo } from 'react'
import questionsData from './questions.json'
import { SUBMIT_URL } from './config'

export default function App() {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(null)
  const [index, setIndex] = useState(0)

  const questions = useMemo(() => (questionsData && questionsData.results) || [], [])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const payload = {
      question: questions[index]?.question || null,
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

  function formatQuestion(q) {
    if (!q) return ''
    // replace <y>...</y> with <strong>...</strong>
    return q.replace(/<y>(.*?)<\/y>/g, '<strong>$1</strong>')
  }

  const current = questions[index]

  function nextQuestion() {
    setAnswer('')
    setStatus(null)
    setIndex((i) => (i + 1) % Math.max(1, questions.length))
  }

  function checkAnswer(user, correct) {
    if (!user) return false
    const normalize = (s) => s.toString().trim().toLowerCase()
    return normalize(user) === normalize(correct)
  }

  return (
    <div className="container">
      <h1 className="title">Quiz</h1>

      {current ? (
        <form onSubmit={handleSubmit}>
          <p className="question" dangerouslySetInnerHTML={{ __html: formatQuestion(current.question) }} />

          <div style={{ marginBottom: 12 }}>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here"
              style={{ width: '100%', padding: '8px', borderRadius: 6 }}
            />
          </div>

          <div className="buttons">
            <button type="submit" disabled={!answer || status === 'sending'}>Submit answer</button>
            <button type="button" onClick={nextQuestion} style={{ background: '#334155' }}>Skip</button>
          </div>
        </form>
      ) : (
        <div>No questions available.</div>
      )}

      <div style={{ marginTop: 14 }}>
        {status === null && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Submissions: {SUBMIT_URL ? 'enabled' : 'not enabled'}
          </div>
        )}

        {status === 'sending' && <div className="response">Sending...</div>}
        {status === 'ok' && <div className="response">Thanks — your answer was recorded.</div>}
        {status === 'simulated' && (
          <div className="response">Demo: submission simulated. To enable real submissions, set a Formspree endpoint in <code>src/config.js</code> (see README).</div>
        )}
        {status && status.startsWith('error') && <div className="response">Error submitting: {status}</div>}

        {/* show evaluation */}
        {status === 'ok' && (
          <div style={{ marginTop: 10 }}>
            <strong>Result:</strong> {checkAnswer(answer, current.correct_answer) ? 'Correct!' : `Incorrect — answer: ${current.correct_answer}`}
            <div style={{ marginTop: 8 }}>
              <button onClick={nextQuestion}>Next question</button>
            </div>
          </div>
        )}

        {status === 'simulated' && (
          <div style={{ marginTop: 10 }}>
            <strong>Result (simulated):</strong> {checkAnswer(answer, current.correct_answer) ? 'Looks correct' : `Expected: ${current.correct_answer}`}
            <div style={{ marginTop: 8 }}>
              <button onClick={nextQuestion}>Next question</button>
            </div>
          </div>
        )}

        {status && status.startsWith('error') && (
          <div style={{ marginTop: 10 }}>
            <div>Error submitting: {status}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={nextQuestion}>Next question</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
