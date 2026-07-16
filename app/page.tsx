import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Avatar from '@/components/Avatar'
import {
  getAllData,
  buildStudentSummaries,
  buildTeamSummaries,
  buildActivityDays,
  getDaysRun,
  getTodayId,
} from '@/lib/data'
import { CohortRadarChart } from '@/components/CohortRadarChart'
import { getTodayMission, getMission, MISSIONS_DATA } from '@/lib/missions'

export const metadata: Metadata = {
  title: 'Dashboard — Placement Readiness Portal',
  description: 'Daily submission tracking, leaderboard, and team standings for the 25MX Placement Readiness cohort.',
}

export const revalidate = 60

export default async function DashboardPage() {
  const { roster, scoreboard, attendance, teams } = await getAllData()
  const daysRun = getDaysRun(attendance)
  const todayId = getTodayId()
  const students = buildStudentSummaries(roster, scoreboard, attendance)
  const teamSummaries = buildTeamSummaries(teams, roster, scoreboard, attendance)
  const activityDays = buildActivityDays(roster, attendance)
  const todayMission = getTodayMission()

  const totalMissions = MISSIONS_DATA.length
  const totalStudents = Object.keys(roster).length
  const todayActivityDay = activityDays.find(d => d.id === todayId)
  
  const todaySubmissions = todayActivityDay ? todayActivityDay.submissionCount : 0
  const todaySubmittedStudents = todayActivityDay ? todayActivityDay.submitters : []

  const overallAttendancePct =
    daysRun.length > 0 && totalStudents > 0
      ? Math.round(
          (activityDays.reduce((sum, d) => sum + d.submissionCount, 0) /
            (daysRun.length * totalStudents)) *
            100
        )
      : 0

  const topTeam = teamSummaries[0]
  const topStudents = students.slice(0, 5)

  // Calculate day streak (mocked for now based on recent days)
  let dayStreak = 0;
  for (let i = daysRun.length - 1; i >= 0; i--) {
    const dayObj = activityDays.find(d => d.id === daysRun[i]);
    if (dayObj && dayObj.submissionRate >= 50) dayStreak++;
    else break;
  }

  // Format the today date cleanly in IST
  const istTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const currentDayLabel = istTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header & Hero ───────────────────────────────────────────── */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a0a0a] to-[#111111] border border-brand-500/20 p-8 lg:p-12 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 pointer-events-none hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0a0a] z-10" />
          <Image src="/rocket.png" alt="Rocket Illustration" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-right-top" priority />
        </div>
        
        <div className="relative z-20 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-brand-400 mb-4 font-bold uppercase tracking-widest bg-brand-500/10 w-max px-3 py-1.5 rounded-full border border-brand-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
            Live Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4 drop-shadow-lg">
            {totalMissions}-Day Engineering Sprint{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-500 to-yellow-600 drop-shadow-2xl whitespace-nowrap">
              — 25MX
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg">
            {daysRun.length} mission{daysRun.length !== 1 ? 's' : ''} complete.{' '}
            <span className="text-white">No login required — all {Object.keys(roster).length} students tracked.</span>
          </p>
          {(() => {
            const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER ?? 'brittytino'
            const REPO  = process.env.NEXT_PUBLIC_GITHUB_REPO  ?? 'placement-readiness'

            return (
              <div className="flex flex-wrap items-center gap-4 mt-6">
                {todayMission && (
                  <Link
                    href={`/activities/${todayMission.date}`}
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 hover:bg-brand-500/25 transition-all group"
                  >
                    <span className="text-xl">{todayMission.companyIcon}</span>
                    <div>
                      <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Today&apos;s Mission</div>
                      <div className="text-sm font-bold text-white">{todayMission.missionName}</div>
                    </div>
                    <span className="text-brand-500 ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}

                <a
                  href={`https://github.com/${OWNER}/${REPO}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#141414] border border-slate-800 hover:bg-[#1f1f1f] hover:border-slate-700 transition-all text-sm font-semibold text-slate-300 hover:text-white group"
                >
                  <svg className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                  </svg>
                  <span>Star on GitHub</span>
                  <span className="text-slate-500 group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
                </a>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── Top Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex items-center gap-5 group hover:border-brand-500/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-yellow-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
            <DocumentIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Submissions</div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              {todaySubmissions} <span className="text-lg text-brand-500">/{totalStudents}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{currentDayLabel}</div>
          </div>
        </div>

        <div className="card flex items-center gap-5 group hover:border-brand-500/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-yellow-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
            <UsersGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Attendance</div>
            <div className="text-3xl font-black text-brand-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {overallAttendancePct}%
            </div>
            <div className="text-xs text-slate-500 font-medium">across {daysRun.length} sessions</div>
          </div>
        </div>

        <div className="card flex items-center gap-5 group hover:border-brand-500/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-yellow-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
            <RabbitIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Score</div>
            <div className="text-3xl font-black text-white">
              {students[0]?.total ?? 0}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate w-32 uppercase">{students[0]?.name ?? '—'}</div>
          </div>
        </div>

        <div className="card flex items-center gap-5 group hover:border-brand-500/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-yellow-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
            <ShieldIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Team</div>
            <div className="text-3xl font-black text-white">
              {topTeam?.name ?? '—'}
            </div>
            <div className="text-xs text-slate-500 font-medium">{topTeam?.averageScore ?? 0} avg pts</div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Status & Standings ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Status */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Today's Status</h2>
            <Link href={`/activities/${todayId}`} className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
              View day detail →
            </Link>
          </div>
          
          <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white text-sm">{currentDayLabel} Submissions</span>
              <span className="text-brand-400 text-xs font-bold bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">
                {todaySubmissions}/{totalStudents} - {todayActivityDay ? todayActivityDay.submissionRate : 0}%
              </span>
            </div>
            <div className="progress-bar w-full bg-slate-900 h-2 mb-3 shadow-inner">
              <div 
                className="progress-fill bg-brand-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
                style={{ width: `${todayActivityDay ? todayActivityDay.submissionRate : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>🎉</span> {todaySubmissions === totalStudents ? 'Everyone has submitted!' : `${totalStudents - todaySubmissions} students pending.`}
            </p>
          </div>

          <div className="bg-[#050505] border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-green-500/20 text-green-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              Submitted – {currentDayLabel}
            </h3>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {todaySubmittedStudents.map(roll => (
                <div key={roll} className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-[#1a1500] text-brand-400 border border-brand-500/30 hover:bg-brand-500/20 cursor-default transition-colors">
                  {roll}
                </div>
              ))}
              {todaySubmittedStudents.length === 0 && (
                <div className="text-xs text-slate-500">No submissions found for today.</div>
              )}
            </div>
          </div>
        </div>

        {/* Team Standings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Team Standings</h2>
            <Link href="/teams" className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
              All teams →
            </Link>
          </div>
          <div className="space-y-3">
            {teamSummaries.slice(0, 5).map((team, i) => (
              <div key={team.id} className="flex items-center justify-between p-3 rounded-xl bg-[#050505] border border-slate-800/80 hover:border-brand-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-inner ${
                    i === 0 ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30' : 
                    i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/30' :
                    i === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{team.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Lab {team.lab}</div>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-slate-300">{team.averageScore}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Radar Chart & Top 5 ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Cohort Skill Mastery</h2>
            <span className="text-xs font-medium text-brand-500">Based on Submissions</span>
          </div>
          <div className="bg-[#050505] border border-slate-800 rounded-xl p-6 overflow-x-auto">
            <CohortRadarChart
            attendance={attendance}
            daysRun={daysRun}
            totalStudents={totalStudents}
            missions={MISSIONS_DATA}
          />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Top 5 Students</h2>
            <Link href="/leaderboard" className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
              Full leaderboard →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topStudents.map((s, i) => (
                  <tr key={s.roll} className="border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-500 font-mono ml-1">{i + 1}</span>}
                    </td>
                    <td className="py-3 flex items-center gap-2">
                      <Avatar seed={s.roll} size={24} />
                      <div>
                        <div className="font-semibold text-white text-xs truncate max-w-[120px] uppercase">{s.name}</div>
                        <div className="text-[10px] text-brand-500 font-mono">{s.roll}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{s.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Row 4: Team Overview Cards ────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-white">Team Standings Overview</h2>
          <Link href="/teams" className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
            View all teams →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {teamSummaries.slice(0, 7).map((team, i) => {
            const pct = Math.round((team.members.reduce((acc, s) => acc + s.attendanceCount, 0) / (team.members.length * (daysRun.length || 1))) * 100) || 0;
            const radius = 16;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (pct / 100) * circumference;
            
            return (
              <div key={team.id} className={`flex flex-col items-center bg-[#050505] rounded-2xl p-4 border transition-all duration-300 ${i === 0 ? 'border-brand-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-brand-500/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${i === 0 ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-400'}`}>
                  <CrownIcon className="w-4 h-4" />
                </div>
                <div className="font-bold text-white text-sm whitespace-nowrap">{team.name}</div>
                <div className="text-[10px] text-slate-400 mb-4">{team.averageScore} pts</div>
                
                {/* Mock Sparkline */}
                <div className="w-full h-8 mb-4 flex items-end justify-between px-1">
                  {[40, 70, 50, 90, 60, 100].map((val, idx) => (
                    <div key={idx} className="w-1 bg-brand-500 rounded-t-sm" style={{ height: `${val}%`, opacity: 0.3 + (idx * 0.1) }} />
                  ))}
                </div>

                {/* Circular Progress */}
                <div className="flex items-center gap-2 mt-auto">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 -rotate-90">
                      <circle cx="16" cy="16" r="14" className="stroke-slate-800 fill-none" strokeWidth="3" />
                      <circle cx="16" cy="16" r="14" className="stroke-brand-500 fill-none transition-all duration-1000" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[8px] font-bold text-white">{pct}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">Sub<br/>mitted</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Row 5: Recent & Progress ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Recent Submissions */}
        <div className="card xl:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Recent Submissions</h2>
            <Link href="/activities" className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
              View all →
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {todaySubmittedStudents.slice(0, 5).map((roll, i) => {
                  const student = students.find(s => s.roll === roll);
                  return (
                    <tr key={roll} className="border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar seed={roll} size={32} />
                          <div>
                            <div className="font-semibold text-white text-xs truncate max-w-[120px] uppercase">{student?.name || roll}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{roll}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Merged
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {todaySubmittedStudents.length === 0 && (
                   <tr><td colSpan={2} className="py-4 text-xs text-center text-slate-500">No submissions yet today.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Progress */}
        <div className="card flex flex-col xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-white">Activity Progress</h2>
            <Link href="/activities" className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
              View all activities →
            </Link>
          </div>
          <div className="flex-1 bg-[#050505] border border-slate-800 rounded-xl p-6 space-y-6">
            {activityDays.slice(0, 5).map((day, i) => {
              const m = getMission(day.id)
              return (
                <div key={day.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-400 text-base">
                        {m?.companyIcon ?? (i === 0 ? <ShieldIcon className="w-4 h-4" /> : i === 1 ? <DocumentIcon className="w-4 h-4" /> : <CrownIcon className="w-4 h-4" />)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-300 text-sm">{m?.missionName ?? day.label}</span>
                        {m && <div className="text-[10px] text-slate-600">{m.skill}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-500">{day.submissionCount}/{day.totalStudents}</span>
                      <span className="text-xs font-bold text-brand-400">{day.submissionRate}%</span>
                    </div>
                  </div>
                  <div className="progress-bar w-full bg-slate-900 h-1.5 ml-11" style={{ width: 'calc(100% - 2.75rem)' }}>
                    <div className={`progress-fill ${day.submissionRate >= 80 ? 'bg-brand-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-brand-500/50'}`} style={{ width: `${day.submissionRate}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="card flex flex-col xl:col-span-1">
          <h2 className="font-bold text-lg text-white mb-6">Quick Stats</h2>
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <UsersGroupIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-white">{totalStudents}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Total Students</div>
            </div>
            
            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <CrownIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-white">{Object.keys(teams).length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Teams</div>
            </div>

            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <CalendarIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-white">{activityDays.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Activities</div>
            </div>

            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <CodeIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-brand-400">{totalStudents * daysRun.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Expected PRs</div>
            </div>

            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <ActivityIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-brand-400">{overallAttendancePct}%</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Avg Attendance</div>
            </div>

            <div className="bg-[#050505] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:border-brand-500/30 transition-colors">
              <FireIcon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-black text-brand-400">{dayStreak}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Minimal Icons for dashboard
function DocumentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
function UsersGroupIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}
function RabbitIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2-1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}
function CrownIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
}
function CalendarIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
function CodeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
}
function ActivityIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
}
function FireIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 7.1 10c.1-1.1 1-2.9 3-4 .5-.3 1-.7 1.5-1.2.6.8 1.4 2 2.2 3.1 1.2 1.6 2.3 3.5 2.3 5.4 0 1.2-.4 2.2-1.1 3.1z" /></svg>
}
