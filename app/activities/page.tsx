import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllData,
  buildActivityDays,
} from '@/lib/data'
import { getMission, MISSIONS_DATA, WEEK_THEMES, isMissionUnlocked } from '@/lib/missions'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Engineering Sprint mission timeline. Track past missions and preview upcoming ones for the 25MX Placement Readiness cohort.',
}

export const revalidate = 60

export default async function ActivitiesPage() {
  const { roster, attendance } = await getAllData()
  const activityDays = buildActivityDays(roster, attendance)

  // Build a map of date → submission data (only for dates that have submissions)
  const activityByDate = Object.fromEntries(activityDays.map(d => [d.id, d]))

  // Group missions by week
  const weeks = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(week => ({
    week,
    info: WEEK_THEMES[week],
    missions: MISSIONS_DATA.filter(m => m.week === week),
  }))

  const totalMissions    = MISSIONS_DATA.length
  const completedMissions = activityDays.length

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a0a0a] to-[#111111] border border-brand-500/20 p-8 lg:p-10 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
        <div className="relative z-20 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-brand-400 mb-4 font-bold uppercase tracking-widest bg-brand-500/10 w-max px-3 py-1.5 rounded-full border border-brand-500/20">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
            {totalMissions}-Day Engineering Sprint
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-3">
            Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-500 to-yellow-600">Control</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg">
            Each day is a new mission inspired by a world-class engineering company. 
            <span className="text-white"> {completedMissions} of {totalMissions} missions completed.</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 max-w-md">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Sprint Progress</span>
            <span className="text-brand-400 font-bold">{Math.round((completedMissions / totalMissions) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-yellow-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${Math.round((completedMissions / totalMissions) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deliverables reminder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { emoji: '📄', label: 'README.md', desc: 'Solution · Notes · Architecture · Resources', required: true },
          { emoji: '🪞', label: 'reflection.md', desc: 'What I learned · Mistakes · Time spent', required: true },
          { emoji: '💬', label: 'prompts.md', desc: 'Claude prompts · Useful outputs · Why they worked', required: true },
        ].map(d => (
          <div key={d.label} className="flex items-start gap-3 bg-[#050505] border border-slate-800 rounded-xl p-4">
            <span className="text-2xl">{d.emoji}</span>
            <div>
              <div className="font-mono font-bold text-sm text-brand-400">{d.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{d.desc}</div>
              <span className="mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest">Required</span>
            </div>
          </div>
        ))}
      </div>

      {/* Week-by-week mission grid */}
      {weeks.map(({ week, info, missions }) => (
        <div key={week}>
          {/* Week header */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-5 pb-4 border-b border-slate-800`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
              week === 1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              week === 2 ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' :
              week === 3 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              W{week}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-lg leading-tight">{info.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{info.companies}</p>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              {missions.filter(m => activityByDate[m.date]).length}/{missions.length} complete
            </div>
          </div>

          {/* Mission cards */}
          <div className="space-y-3">
            {missions.map((mission) => {
              const dayData = activityByDate[mission.date]
              const isComplete = !!dayData
              const pct = dayData?.submissionRate ?? 0
              const progressColor = pct >= 80 ? 'bg-brand-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'

              const dateObj = new Date(mission.date)
              const dayNum  = dateObj.getDate()
              const monthAbbr = dateObj.toLocaleString('default', { month: 'short' })
              const unlocked = isMissionUnlocked(mission.date)

              return (
                <div key={mission.date}>
                  {unlocked ? (
                    <Link href={`/activities/${mission.date}`}>
                      <div className="card-hover flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer">
                        <MissionCard
                          mission={mission}
                          dayNum={dayNum}
                          monthAbbr={monthAbbr}
                          pct={pct}
                          progressColor={progressColor}
                          submissionCount={dayData?.submissionCount ?? 0}
                          totalStudents={dayData?.totalStudents ?? Object.keys(roster).length}
                          isComplete={isComplete}
                          week={week}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="card flex flex-col sm:flex-row sm:items-center gap-4 opacity-40 grayscale cursor-not-allowed">
                      <MissionCard
                        mission={mission}
                        dayNum={dayNum}
                        monthAbbr={monthAbbr}
                        pct={0}
                        progressColor="bg-slate-700"
                        submissionCount={0}
                        totalStudents={Object.keys(roster).length}
                        isComplete={false}
                        week={week}
                        isLocked={true}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface MissionCardProps {
  mission: ReturnType<typeof getMission> & object
  dayNum: number
  monthAbbr: string
  pct: number
  progressColor: string
  submissionCount: number
  totalStudents: number
  isComplete: boolean
  week: number
  isLocked?: boolean
}

function MissionCard({
  mission,
  dayNum,
  monthAbbr,
  pct,
  progressColor,
  submissionCount,
  totalStudents,
  isComplete,
  week,
  isLocked = false,
}: MissionCardProps) {
  const weekColors: Record<number, any> = {
    1: { dot: 'bg-blue-500',   text: 'text-blue-400',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    2: { dot: 'bg-brand-500',  text: 'text-brand-400',  badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20' },
    3: { dot: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    4: { dot: 'bg-green-500',  text: 'text-green-400',  badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
    5: { dot: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    6: { dot: 'bg-blue-500',   text: 'text-blue-400',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    7: { dot: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    8: { dot: 'bg-red-500',    text: 'text-red-400',    badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
    9: { dot: 'bg-green-500',  text: 'text-green-400',  badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
    10: { dot: 'bg-yellow-500', text: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  }
  const wc = weekColors[week] || weekColors[1]

  return (
    <>
      {/* Date badge */}
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#050505] border border-slate-800 flex items-center justify-center text-center shadow-inner">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-400 to-yellow-600 leading-none">
            {dayNum}
          </div>
          <div className="text-[10px] font-bold text-brand-400 mt-1 uppercase tracking-widest">
            {monthAbbr}
          </div>
        </div>
      </div>

      {/* Mission info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-lg">{mission!.companyIcon}</span>
          <span className="font-black text-white text-base">{mission!.missionName}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${wc.badge}`}>
            {mission!.skill}
          </span>
          {mission!.isSpecial && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              ⭐ Special
            </span>
          )}
          {isLocked && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              🔒 Locked
            </span>
          )}
          {!isComplete && !isLocked && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
              Active Now
            </span>
          )}
        </div>
        <div className="text-sm text-slate-400 truncate">{mission!.title}</div>
        {isComplete && (
          <div className="mt-2">
            <div className="progress-bar w-full max-w-xs">
              <div className={`progress-fill ${progressColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {isComplete && (
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="font-bold text-white tabular-nums text-lg">
              {submissionCount}/{totalStudents}
            </div>
            <div className="text-xs text-slate-500">submitted</div>
          </div>
          <div className={`text-center ${pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            <div className="font-bold tabular-nums text-lg">{pct}%</div>
            <div className="text-xs text-slate-500">rate</div>
          </div>
        </div>
      )}
    </>
  )
}
