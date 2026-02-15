import React, { useState, useMemo } from 'react'
import questionsData from './questions.json'
import cluesData from './questions_3clues.json'
import mzqData from './questions_mzq.json'
import { SUBMIT_URL } from './config'

export default function App() {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [index, setIndex] = useState(0)
  const [dataset, setDataset] = useState('default')

  const questions = useMemo(() => {
    if (dataset === 'clues') return (cluesData && cluesData.results) || []
    if (dataset === 'mzq') {
      // mzqData has `items` with fields: question, answer -> convert to results shape
      return (mzqData && mzqData.items
        ? mzqData.items.map((it) => ({ question: it.question, correct_answer: it.answer || '' }))
        : [])
    }
    return (questionsData && questionsData.results) || []
  }, [dataset])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const payload = {
      question: questions[index]?.question || null,
      answer,
      timestamp: new Date().toISOString(),
    }

    // Evaluate correctness locally with fuzzy matching
    const result = checkAnswer(answer, questions[index]?.correct_answer || '')
    setResult({ ok: result.ok, score: result.score })

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
  const total = questions.length

  function nextQuestion() {
    setAnswer('')
    setStatus(null)
    setIndex((i) => (i + 1) % Math.max(1, questions.length))
  }

  // Normalize strings: lowercase, strip diacritics, remove punctuation, collapse spaces
  function normalizeText(s) {
    if (s === null || s === undefined) return ''
    return s
      .toString()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\p{L}\p{N} ]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Levenshtein distance
  function levenshtein(a, b) {
    const an = a.length
    const bn = b.length
    if (an === 0) return bn
    if (bn === 0) return an
    const v0 = new Array(bn + 1).fill(0)
    const v1 = new Array(bn + 1).fill(0)
    for (let i = 0; i <= bn; i++) v0[i] = i
    for (let i = 0; i < an; i++) {
      v1[0] = i + 1
      for (let j = 0; j < bn; j++) {
        const cost = a[i] === b[j] ? 0 : 1
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
      }
      for (let k = 0; k <= bn; k++) v0[k] = v1[k]
    }
    return v1[bn]
  }

  // Return similarity [0..1]
  function similarity(a, b) {
    const na = normalizeText(a)
    const nb = normalizeText(b)
    if (!na && !nb) return 1
    if (!na || !nb) return 0
    if (na === nb) return 1
    // If one contains the other, consider high similarity
    if (na.includes(nb) || nb.includes(na)) return 0.95
    const dist = levenshtein(na, nb)
    const maxLen = Math.max(na.length, nb.length)
    return Math.max(0, 1 - dist / maxLen)
  }

  function checkAnswer(user, correct) {
    const sim = similarity(user, correct)
    // threshold: consider correct if similarity >= 0.75
    return { ok: sim >= 0.75, score: sim }
  }

  return (
    <div className="container">
      <h1 className="title">Quiz</h1>

      {/* Progress indicator */}
      {total > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            Question {Math.min(index + 1, total)} of {total}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', height: 8, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', width: `${Math.round(((index + 1) / Math.max(1, total)) * 100)}%` }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, marginRight: 8 }}>Question set:</label>
        <select value={dataset} onChange={(e) => { setDataset(e.target.value); setIndex(0); setResult(null); setStatus(null); }}>
          <option value="default">Default</option>
          <option value="clues">3-clues set</option>
          <option value="mzq">MozgoQuiz (video)</option>
        </select>
        {dataset === 'clues' && cluesData && cluesData.source && (
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{cluesData.source} — {cluesData.note}</div>
        )}
      </div>

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
        {/* Show result based on local fuzzy evaluation stored in `result` */}
        {result && (
          <div style={{ marginTop: 10 }}>
            <strong>Result:</strong>{' '}
            {result.ok ? 'Correct!' : `Not an exact match — expected: ${current.correct_answer}`}
            <div style={{ fontSize: 13, opacity: 0.9 }}>Similarity: {(result.score * 100).toFixed(0)}%</div>
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
