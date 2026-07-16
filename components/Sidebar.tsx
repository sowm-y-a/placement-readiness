'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

const navLinks = [
  { href: '/',                  label: 'Dashboard',         icon: DashboardIcon },
  { href: '/leaderboard',       label: 'Leaderboard',       icon: TrophyIcon },
  { href: '/teams',             label: 'Teams',             icon: UsersIcon },
  { href: '/activities',        label: 'Missions',          icon: CalendarIcon },
  { href: '/how-to-contribute', label: 'How to Contribute', icon: QuestionIcon },
]

interface SidebarProps {
  githubOwner: string
  githubRepo: string
}

export default function Sidebar({ githubOwner, githubRepo }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-yellow-600 flex items-center justify-center text-sm font-black text-slate-950 shadow-lg shadow-brand-500/20">
            PR
          </div>
          <span className="font-bold text-white text-sm">25MX Readiness</span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href={`https://github.com/${githubOwner}/${githubRepo}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-bold transition-all hover:bg-brand-500/20 hover:scale-105 active:scale-95"
          >
            <span>⭐ Star</span>
          </a>
          <button onClick={() => setIsOpen(true)} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#050505] border-r border-slate-800/60 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-24 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-yellow-600 flex items-center justify-center text-lg font-black text-slate-950 shadow-lg shadow-brand-500/20">
            PR
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">25MX</span>
            <span className="font-bold text-white text-sm leading-tight">Placement Readiness</span>
          </div>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navLinks.map(link => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 shadow-[inset_4px_0_0_0_rgba(245,158,11,1)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
              <span className="font-semibold text-sm">{link.label}</span>
            </Link>
          )
        })}
        <a
          href={`https://github.com/${githubOwner}/${githubRepo}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all duration-300 border border-transparent"
        >
          <GitHubIcon className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-sm">GitHub</span>
        </a>
      </nav>

      {/* Star the Repo Card */}
      <div className="px-4 mb-4 mt-auto">
        <a
          href={`https://github.com/${githubOwner}/${githubRepo}`}
          target="_blank"
          rel="noreferrer"
          className="relative block overflow-hidden rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/10 group shadow-[0_4px_20px_rgba(245,158,11,0.02)]"
        >
          <div className="absolute -right-3 -top-3 text-brand-500/10 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
            </svg>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-brand-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
            </svg>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Star the Repo</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pr-4">
            Show support! Give a star to our repository on GitHub.
          </p>
        </a>
      </div>

      {/* Bottom section with hexagon */}
      <div className="px-6 pb-8 relative">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-800/60 rounded-xl p-4 relative z-10">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-400 leading-relaxed mb-4">
              MCA Department,<br />
              PSG College of Technology<br />
              25MX Cohort
            </p>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/50 flex items-center justify-center text-brand-500 text-xs font-bold shrink-0">
              {'</>'}
            </div>
          </div>
          <div className="mt-2 pt-3 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Developed By</p>
            <a href="https://tinobritty.me" target="_blank" rel="noopener noreferrer" className="block text-brand-400 hover:text-brand-300 transition-colors font-medium text-sm">
              Tino Britty J
            </a>
            <p className="text-xs text-slate-500 mt-0.5">Placement Representative</p>
          </div>
        </div>
      </div>
      </aside>
    </>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
