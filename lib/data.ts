export type Skill = 'Listening' | 'Reading' | 'Writing' | 'Speaking'
export const SKILLS: Skill[] = ['Listening','Reading','Writing','Speaking']
export const QUESTION_TYPES = [
 'Multiple Choice','Matching Headings','Matching Information','Matching Features',
 'Matching Sentence Endings','True / False / Not Given','Yes / No / Not Given',
 'Sentence Completion','Summary Completion','Note Completion','Table Completion',
 'Flow-chart Completion','Diagram Label Completion','Short-answer Questions',
 'Map / Plan / Diagram Labelling','Form Completion','Classification','Pick from a List'
] as const
export type Session = {
 id: string; book_number: number; test_number: number; skill: Skill;
 attempted_on: string; correct: number | null; total: number | null;
 band: number | null; duration_minutes: number | null; notes: string; created_at: string
}
export type Breakdown = { id: string; session_id: string; category: string; label: string; correct: number; total: number }
export function estimateBand(skill: Skill, score: number): number {
 // Approximate Cambridge IELTS Academic band tables; exact conversion may vary by test.
 if (skill === 'Listening') {
  if(score===40)return 9; if(score>=39)return 8.5; if(score>=37)return 8;
  if(score>=35)return 7.5; if(score>=30)return 7; if(score>=26)return 6.5;
  if(score>=23)return 6; if(score>=18)return 5.5; if(score>=16)return 5;
  if(score>=13)return 4.5; if(score>=11)return 4; return Math.max(0, Math.round(score/3)/2)
 }
 if(score>=39)return 9; if(score>=37)return 8.5; if(score>=35)return 8;
 if(score>=33)return 7.5; if(score>=30)return 7; if(score>=27)return 6.5;
 if(score>=23)return 6; if(score>=19)return 5.5; if(score>=15)return 5;
 if(score>=13)return 4.5; if(score>=10)return 4; return Math.max(0,Math.round(score/3)/2)
}
export function pct(n: number, total: number) { return total ? Math.round(100*n/total) : 0 }
