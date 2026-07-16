'use client'

import React, { useMemo } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import type { Attendance } from '@/lib/types'
import type { Mission } from '@/lib/missions'

interface CohortRadarChartProps {
  attendance: Attendance
  daysRun: string[]
  totalStudents: number
  missions: Mission[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505]/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="text-brand-400 font-bold text-sm mb-1">{payload[0].payload.subject}</p>
        <p className="text-white text-xs">
          Submission Rate: <span className="font-bold tabular-nums text-brand-300">{payload[0].value}%</span>
        </p>
      </div>
    )
  }
  return null
}

export function CohortRadarChart({
  attendance,
  daysRun,
  totalStudents,
  missions,
}: CohortRadarChartProps) {
  const chartData = useMemo(() => {
    // 1. Initialize exactly 5 fixed buckets for a Pentagon Radar
    const themeStats = new Map<string, { possible: number; submitted: number }>([
      ['Core Engineering', { possible: 0, submitted: 0 }],
      ['Data & AI', { possible: 0, submitted: 0 }],
      ['Cloud & DevOps', { possible: 0, submitted: 0 }],
      ['Architecture', { possible: 0, submitted: 0 }],
      ['Security', { possible: 0, submitted: 0 }]
    ])

    if (!daysRun.length || !totalStudents) {
      return Array.from(themeStats.entries()).map(([subject]) => ({
        subject, A: 0, fullMark: 100
      }))
    }

    const getBucket = (theme: string) => {
      if (theme.includes('Data') || theme.includes('AI')) return 'Data & AI'
      if (theme.includes('Cloud')) return 'Cloud & DevOps'
      if (theme.includes('Security')) return 'Security'
      if (theme.includes('System') || theme.includes('Advanced')) return 'Architecture'
      return 'Core Engineering'
    }

    daysRun.forEach(day => {
      const mission = missions.find(m => m.date === day)
      if (!mission) return

      const theme = mission.weekTheme || mission.skill || 'Other'
      const bucket = getBucket(theme)
      const stats = themeStats.get(bucket)!
      
      // Add possible submissions for this day (all students)
      stats.possible += totalStudents

      // Count actual submissions for this day
      let daySubmissions = 0
      Object.values(attendance).forEach(studentAtt => {
        const s = studentAtt[day]
        if (s === 'present' || s === 'manual-present') {
          daySubmissions++
        }
      })
      stats.submitted += daySubmissions
    })

    // 2. Calculate percentages and format for Recharts
    const data = Array.from(themeStats.entries()).map(([subject, stats]) => {
      return {
        subject,
        A: stats.possible > 0 ? Math.round((stats.submitted / stats.possible) * 100) : 0,
        fullMark: 100,
      }
    })

    return data
  }, [attendance, daysRun, totalStudents, missions])

  return (
    <div className="relative w-full h-[320px] bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-3xl border border-slate-800/60 p-4 shadow-lg group">
      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none" />
      
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
        Cohort Mastery
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Cohort"
            dataKey="A"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="#f59e0b"
            fillOpacity={0.25}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
