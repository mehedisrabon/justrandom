'use client'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPractice, updatePractice } from '@/app/actions'
import { QUESTION_TYPES, SKILLS, type Skill, type Session, type Breakdown } from '@/lib/data'
import { Save, Info, Check, X } from 'lucide-react'

const initial = { error: '', success: false }

interface PracticeFormProps {
  editingSession?: Session | null
  breakdowns?: Breakdown[]
  onCancel?: () => void
  onSuccess?: () => void
}

export default function PracticeForm({
  editingSession,
  breakdowns = [],
  onCancel,
  onSuccess,
}: PracticeFormProps) {
  const isEditing = Boolean(editingSession)
  const [createState, createAction, createPending] = useActionState(createPractice, initial)
  const [updateState, updateAction, updatePending] = useActionState(updatePractice, initial)
  const state = isEditing ? updateState : createState
  const action = isEditing ? updateAction : createAction
  const pending = isEditing ? updatePending : createPending

  const [skill, setSkill] = useState<Skill>(editingSession?.skill ?? 'Listening')
  const [detail, setDetail] = useState(breakdowns.length > 0)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.refresh()
      if (isEditing) {
        if (onSuccess) onSuccess()
      } else {
        router.push('/dashboard')
      }
    }
  }, [state.success, isEditing, onSuccess, router])

  const isRaw = skill === 'Listening' || skill === 'Reading'

  const breakdownMap = new Map<string, { correct: number; total: number }>()
  for (const b of breakdowns) {
    breakdownMap.set(b.label, { correct: b.correct, total: b.total })
  }

  return (
    <form
      key={editingSession ? editingSession.id : 'new-practice'}
      className={`practice-form panel ${isEditing ? 'editing-mode' : ''}`}
      action={action}
    >
      {isEditing && <input type="hidden" name="id" value={editingSession?.id} />}

      <div className="section-title">
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="eyebrow" style={{ color: '#b27a29' }}>EDITING PRACTICE RECORD</span>
              <h2>Modify Cambridge {editingSession?.book_number} · Test {editingSession?.test_number}</h2>
              <p>Update your recorded score, test details, or notes below. The checklist updates automatically.</p>
            </div>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-outline btn-small" title="Cancel edit">
                <X size={14} /> Cancel edit
              </button>
            )}
          </div>
        ) : (
          <div>
            <span className="eyebrow">NEW PRACTICE ENTRY</span>
            <h2>Record a mock test</h2>
            <p>Save your practice once; the Cambridge checklist updates automatically.</p>
          </div>
        )}
      </div>

      <div className="form-grid">
        <label>
          Cambridge Book
          <select name="book_number" defaultValue={editingSession?.book_number ?? 21} required>
            {Array.from({ length: 21 }, (_, i) => 21 - i).map(n => (
              <option key={n} value={n}>
                Cambridge IELTS {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Test number
          <select name="test_number" defaultValue={editingSession?.test_number ?? 1}>
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>
                Test {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Skill
          <select name="skill" value={skill} onChange={e => setSkill(e.target.value as Skill)}>
            {SKILLS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Practice date
          <input
            type="date"
            name="attempted_on"
            defaultValue={editingSession?.attempted_on ?? new Date().toLocaleDateString('en-CA')}
            required
          />
        </label>
        {isRaw ? (
          <label>
            Correct answers / 40
            <input
              type="number"
              name="correct"
              min="0"
              max="40"
              defaultValue={editingSession?.correct ?? ''}
              placeholder="e.g. 32"
              required
            />
          </label>
        ) : (
          <label>
            Your assessed band
            <input
              type="number"
              name="band"
              min="0"
              max="9"
              step="0.5"
              defaultValue={editingSession?.band ?? ''}
              placeholder="e.g. 6.5"
              required
            />
          </label>
        )}
        <label>
          Time spent (minutes)
          <input
            type="number"
            name="duration_minutes"
            min="1"
            max="240"
            defaultValue={editingSession?.duration_minutes ?? ''}
            placeholder="Optional"
          />
        </label>
      </div>

      <label className="block-label">
        Notes / mistakes to review
        <textarea
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={editingSession?.notes ?? ''}
          placeholder="Which questions were difficult? What will you review next?"
        />
      </label>

      {isRaw && (
        <>
          <button type="button" className="detail-toggle" onClick={() => setDetail(!detail)}>
            {detail ? '− Hide' : '＋ Add'} detailed score breakdown <span>(optional)</span>
          </button>
          {detail && (
            <div className="detail-area">
              <div className="detail-title">
                {skill === 'Reading' ? 'Reading passages' : 'Listening sections'}
              </div>
              <p className="tiny-muted">Enter the correct count and the actual number of questions in each part.</p>
              <div className="detail-grid">
                {Array.from({ length: skill === 'Reading' ? 3 : 4 }, (_, i) => {
                  const partNum = i + 1
                  const key = `${skill === 'Reading' ? 'passage' : 'section'}${partNum}`
                  const label = `${skill === 'Reading' ? 'Passage' : 'Section'} ${partNum}`
                  const b = breakdownMap.get(label)
                  return (
                    <div className="detail-entry" key={key}>
                      <b>{label}</b>
                      <div>
                        <input
                          aria-label={`${key} correct`}
                          name={`c_${key}`}
                          min={0}
                          max={40}
                          type="number"
                          placeholder="Correct"
                          defaultValue={b?.correct ?? ''}
                        />
                        <input
                          aria-label={`${key} total`}
                          name={`t_${key}`}
                          min={1}
                          max={40}
                          type="number"
                          placeholder="Total"
                          defaultValue={b?.total ?? ''}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="detail-title space-top">Question-type performance</div>
              <p className="tiny-muted">Enter only the question types you encountered. The list covers common Academic Reading and Listening formats.</p>
              <div className="question-grid">
                {QUESTION_TYPES.map((q, i) => {
                  const b = breakdownMap.get(q)
                  return (
                    <div className="question-row" key={q}>
                      <span>{q}</span>
                      <input
                        aria-label={`${q} correct`}
                        name={`c_qt${i}`}
                        type="number"
                        min={0}
                        max={40}
                        placeholder="✓"
                        defaultValue={b?.correct ?? ''}
                      />
                      <input
                        aria-label={`${q} total`}
                        name={`t_qt${i}`}
                        type="number"
                        min={1}
                        max={40}
                        placeholder="Total"
                        defaultValue={b?.total ?? ''}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="form-footer">
        <div className="form-note">
          <Info size={16} /> Band estimates for Listening and Academic Reading are approximate.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isEditing && onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-outline" disabled={pending}>
              Cancel
            </button>
          )}
          <button disabled={pending} className="btn btn-primary" type="submit">
            {isEditing ? (
              <>
                <Check size={17} />
                {pending ? 'Updating...' : 'Update practice'}
              </>
            ) : (
              <>
                <Save size={17} />
                {pending ? 'Saving...' : 'Save practice'}
              </>
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <p className="alert error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
