'use client'
import { useRef, useState } from 'react'
import type { Session, Breakdown } from '@/lib/data'
import PracticeForm from '@/components/practice-form'
import { deletePractice } from '@/app/actions'
import { Trash2, Pencil, CheckCircle2 } from 'lucide-react'

interface PracticeWorkspaceProps {
  sessions: Session[]
  breakdowns: Breakdown[]
}

export default function PracticeWorkspace({ sessions, breakdowns }: PracticeWorkspaceProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setStatusMessage(null)
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCancel = () => {
    setEditingSession(null)
  }

  const handleSuccess = () => {
    setEditingSession(null)
    setStatusMessage('Practice record updated successfully! Your progress and scores are synced.')
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const sessionBreakdowns = editingSession
    ? breakdowns.filter(b => b.session_id === editingSession.id)
    : []

  return (
    <div>
      {statusMessage && (
        <div className="alert ok" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      <div ref={formRef}>
        <PracticeForm
          editingSession={editingSession}
          breakdowns={sessionBreakdowns}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>

      <section className="panel top-space">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SAVED RECORDS</span>
            <h2>Practice history</h2>
          </div>
          <span className="count-badge">{sessions.length} attempts</span>
        </div>

        <div className="table-scroller">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Book</th>
                <th>Test</th>
                <th>Skill</th>
                <th>Raw score</th>
                <th>Band</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length ? (
                sessions.map(s => {
                  const isCurrent = editingSession?.id === s.id
                  return (
                    <tr key={s.id} className={isCurrent ? 'tr-editing' : ''}>
                      <td>{s.attempted_on}</td>
                      <td>Cambridge {s.book_number}</td>
                      <td>Test {s.test_number}</td>
                      <td>
                        <span className="skill-chip">{s.skill}</span>
                      </td>
                      <td>{s.correct === null ? '—' : `${s.correct}/${s.total}`}</td>
                      <td>
                        <b>{s.band?.toFixed(1) ?? '—'}</b>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className={`icon-btn edit-btn ${isCurrent ? 'active' : ''}`}
                            title="Edit / modify this practice record"
                            onClick={() => handleEdit(s)}
                          >
                            <Pencil size={15} />
                          </button>
                          <form
                            action={deletePractice}
                            onSubmit={e => {
                              if (
                                !window.confirm(
                                  `Delete Cambridge ${s.book_number} · Test ${s.test_number} (${s.skill})?`,
                                )
                              ) {
                                e.preventDefault()
                              }
                            }}
                          >
                            <input hidden name="id" value={s.id} readOnly />
                            <button className="icon-btn delete-btn" type="submit" title="Delete this attempt">
                              <Trash2 size={15} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No mocks logged yet. Add your first above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

