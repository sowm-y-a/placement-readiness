import type { Metadata } from 'next'
import {
  getAllData,
  buildStudentSummaries,
  getDaysRun,
} from '@/lib/data'
import LeaderboardTable from '@/components/LeaderboardTable'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Full individual leaderboard for the 25MX Placement Readiness cohort, sorted by total score with attendance.',
}

export const revalidate = 60

export default async function LeaderboardPage() {
  const { roster, scoreboard, attendance } = await getAllData()
  const daysRun = getDaysRun(attendance)
  const students = buildStudentSummaries(roster, scoreboard, attendance)

  const maxScore = students[0]?.total ?? 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Individual <span className="text-gradient">Leaderboard</span>
        </h1>
        <p className="text-slate-400 mt-1">
          {students.length} students · {daysRun.length} days · Max possible: {daysRun.length * 30} pts
        </p>
      </div>

      {/* Quick distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform border border-brand-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="stat-label mb-2 opacity-80">Highest Score</div>
          <div className="stat-value text-3xl text-brand-400">{maxScore}</div>
          <div className="stat-sub mt-2 opacity-60">{students[0]?.name ?? '—'}</div>
        </div>
        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform border border-brand-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="stat-label mb-2 opacity-80">Average Score</div>
          <div className="stat-value text-3xl text-yellow-400">
            {students.length > 0
              ? Math.round(students.reduce((s, st) => s + st.total, 0) / students.length)
              : 0}
          </div>
          <div className="stat-sub mt-2 opacity-60">across {students.length} students</div>
        </div>
        <div className="stat-card p-6 glass hover:-translate-y-1 transition-transform border border-brand-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="stat-label mb-2 opacity-80">Lowest Score</div>
          <div className="stat-value text-3xl text-red-400">{students[students.length - 1]?.total ?? 0}</div>
          <div className="stat-sub mt-2 opacity-60">{students[students.length - 1]?.name ?? '—'}</div>
        </div>
      </div>

      {/* Full sortable table */}
      <LeaderboardTable students={students} showAttendance />
    </div>
  )
}
