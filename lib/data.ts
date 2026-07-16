/**
 * data.ts — Data fetching helpers for the Next.js app.
 *
 * All data comes from the flat JSON files in the GitHub repo, fetched via:
 *   - raw.githubusercontent.com  → JSON files (with 60-second ISR cache)
 *   - api.github.com/contents/   → Individual markdown files (on-demand only)
 *
 * This module is server-only (no 'use client').
 */

import { promises as fs } from 'fs'
import path from 'path'
import type {
  Roster,
  Scoreboard,
  Attendance,
  Teams,
  StudentSummary,
  TeamSummary,
  ActivityDay,
} from './types'

// ── Local fetch helpers ───────────────────────────────────────────────────────

async function fetchJSON<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    // Strip UTF-8 BOM if present
    const cleanContents = fileContents.replace(/^\uFEFF/, '')
    try {
      return JSON.parse(cleanContents) as T
    } catch (parseError) {
      console.error(`⚠️ JSON Parse Error in ${filePath}:`, parseError)
      // Return a safe fallback based on the expected type (usually an object)
      return {} as unknown as T
    }
  } catch (error) {
    console.error(`⚠️ Failed to read local file ${filePath}:`, error)
    return {} as unknown as T
  }
}

// ── Base data loaders ─────────────────────────────────────────────────────────

export async function getRoster(): Promise<Roster> {
  return fetchJSON<Roster>('data/roster.json')
}

export async function getScoreboard(): Promise<Scoreboard> {
  return fetchJSON<Scoreboard>('data/scoreboard.json')
}

export async function getAttendance(): Promise<Attendance> {
  return fetchJSON<Attendance>('data/attendance.json')
}

export async function getTeams(): Promise<Teams> {
  return fetchJSON<Teams>('data/teams.json')
}

// ── Derived helpers ───────────────────────────────────────────────────────────

/** Load all four JSON files in parallel */
export async function getAllData() {
  const [roster, scoreboard, attendance, teams] = await Promise.all([
    getRoster(),
    getScoreboard(),
    getAttendance(),
    getTeams(),
  ])
  return { roster, scoreboard, attendance, teams }
}

/** Compute how many days have been run (days that appear in attendance) */
export function getDaysRun(attendance: Attendance): string[] {
  const allDays = new Set<string>()
  for (const studentAtt of Object.values(attendance)) {
    for (const [day, status] of Object.entries(studentAtt)) {
      if (status === 'present' || status === 'manual-present') {
        allDays.add(day)
      }
    }
  }
  return Array.from(allDays).sort()
}

/** Get today's date in IST (YYYY-MM-DD) */
export function getTodayId(): string {
  const istTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const yyyy = istTime.getFullYear()
  const mm = String(istTime.getMonth() + 1).padStart(2, '0')
  const dd = String(istTime.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Build a sorted array of StudentSummary for leaderboard use */
export function buildStudentSummaries(
  roster: Roster,
  scoreboard: Scoreboard,
  attendance: Attendance,
): StudentSummary[] {
  const daysRun = getDaysRun(attendance)
  const todayId = getTodayId()

  return Object.entries(roster)
    .map(([roll, info]) => {
      const score = scoreboard[roll]
      const studentAtt = attendance[roll] ?? {}

      const attendanceCount = Object.values(studentAtt).filter(
        s => s === 'present' || s === 'manual-present'
      ).length

      const attendanceDays = daysRun.length
      const attendancePct = attendanceDays > 0
        ? Math.round((attendanceCount / attendanceDays) * 100)
        : 0

      const hasSubmittedToday = studentAtt[todayId] === 'present' || studentAtt[todayId] === 'manual-present'

      return {
        roll,
        name: info.name,
        github: info.github,
        team: info.team,
        total: score?.total ?? 0,
        attendanceCount,
        attendanceDays,
        attendancePct,
        hasSubmittedToday,
      } satisfies StudentSummary
    })
    .sort((a, b) => b.total - a.total)
}

/** Build TeamSummary array sorted by averageScore */
export function buildTeamSummaries(
  teams: Teams,
  roster: Roster,
  scoreboard: Scoreboard,
  attendance: Attendance,
): TeamSummary[] {
  const studentSummaries = buildStudentSummaries(roster, scoreboard, attendance)
  const summaryByRoll = Object.fromEntries(studentSummaries.map(s => [s.roll, s]))

  return Object.entries(teams)
    .map(([id, team]) => ({
      id,
      name: team.name,
      lab: team.lab,
      memberCount: team.members.length,
      averageScore: team.averageScore,
      attendanceRate: team.attendanceRate,
      helpingBonus: team.helpingBonus,
      members: team.members.map(roll => summaryByRoll[roll]).filter(Boolean),
    } satisfies TeamSummary))
    .sort((a, b) => b.averageScore - a.averageScore)
}

/** Build per-day activity data */
export function buildActivityDays(
  roster: Roster,
  attendance: Attendance,
): ActivityDay[] {
  const allDays = new Set<string>()
  for (const studentAtt of Object.values(attendance)) {
    for (const day of Object.keys(studentAtt)) allDays.add(day)
  }

  const days = Array.from(allDays).sort()
  const totalStudents = Object.keys(roster).length

  return days.map(id => {
    const submitters: string[] = []
    const nonSubmitters: string[] = []

    for (const roll of Object.keys(roster)) {
      const status = attendance[roll]?.[id]
      if (status === 'present' || status === 'manual-present') {
        submitters.push(roll)
      } else {
        nonSubmitters.push(roll)
      }
    }

    const label = new Date(id).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    return {
      id,
      label,
      submissionCount: submitters.length,
      totalStudents,
      submissionRate: totalStudents > 0 ? Math.round((submitters.length / totalStudents) * 100) : 0,
      submitters,
      nonSubmitters,
    } satisfies ActivityDay
  })
}

/**
 * Read a single markdown file's content from the local filesystem.
 */
export async function fetchMarkdownFile(filePath: string): Promise<string | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const content = await fs.readFile(fullPath, 'utf8')
    return content
  } catch {
    return null
  }
}
