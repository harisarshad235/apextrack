'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  X,
  Paperclip,
  Download,
  Printer,
  FileText,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  Flag,
  Tag,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { FullDocument } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentReaderModalProps {
  doc: FullDocument;
  onClose: () => void;
  onEdit: () => void;
}

// =========================================================================
// INTERACTIVE TAILWIND VISUAL WORKFLOW MOCKUPS
// =========================================================================

function VisualRegisterMockup() {
  return (
    <div className="my-6 p-4 md:p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          FLOW 2.1: ACCOUNT REGISTRATION & ONBOARDING PORTAL
        </span>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Interactive Mockup
        </span>
      </div>

      <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center justify-center gap-1.5 pb-2 border-b border-slate-700/60">
          <span className="font-bold text-sm text-white">ApexTrack</span>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-bold">v1.0</span>
        </div>
        <div className="grid grid-cols-2 p-0.5 bg-slate-900/80 rounded-lg text-xs font-semibold text-center">
          <span className="py-1 text-slate-400">Sign In</span>
          <span className="py-1 bg-blue-600 text-white rounded-md shadow-xs">Create Account</span>
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Full Name *</label>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs">Jordan Vance</div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Work Email Address *</label>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs">jordan.v@apextrack.io</div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Password *</label>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs">••••••••••••</div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Department</label>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs">Frontend Engineering</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
          🔒 <strong>Gated Security:</strong> New accounts land in the <strong>PENDING</strong> holding queue until approved by an Admin.
        </div>
        <button type="button" className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm">
          Create Account & Enter Approval Queue
        </button>
      </div>
    </div>
  );
}

function VisualHoldingRoomMockup() {
  return (
    <div className="my-6 p-4 md:p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-amber-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          FLOW 2.2: THE HOLDING ROOM (AWAITING APPROVAL)
        </span>
        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Pending State View
        </span>
      </div>

      <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-xl font-bold">
          ⏳
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Account Awaiting Administrator Approval</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Welcome, <strong className="text-white">Jordan Vance</strong>! Your account has been registered with status <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">PENDING</span>.
          </p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-[11px] text-slate-300 text-left space-y-1">
          <div className="flex justify-between"><span className="text-slate-500">Email:</span><span>jordan.v@apextrack.io</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Assigned Role:</span><span className="text-blue-400 font-semibold">Viewer (Pending)</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Admin Notification:</span><span className="text-emerald-400">✓ Dispatched</span></div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Check Status</button>
          <button type="button" className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg">Sign Out</button>
        </div>
      </div>
    </div>
  );
}

function VisualSignInMockup() {
  return (
    <div className="my-6 p-4 md:p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          FLOW 2.3: SIGN IN PORTAL & DEMO FAST-SWITCHER
        </span>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Authentication Gateway
        </span>
      </div>

      <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg space-y-3">
        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Work Email Address</label>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs">harisarshad235@gmail.com</div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="font-medium text-slate-400">Password</span>
              <span className="text-blue-400 font-semibold cursor-pointer">Forgot password?</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs flex justify-between">
              <span>••••••••••••</span>
              <span className="text-slate-400">👁️</span>
            </div>
          </div>
        </div>
        <button type="button" className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Sign In to Workspace
        </button>
        <div className="pt-2 border-t border-slate-700/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 font-mono">⚡ Fast Persona Switcher (Dev Mode)</span>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-left cursor-pointer">
              <div className="font-bold text-white truncate">Alex Chen</div>
              <div className="text-amber-400 font-mono">Admin</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-left cursor-pointer">
              <div className="font-bold text-white truncate">Sarah J.</div>
              <div className="text-blue-400 font-mono">Member</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-left cursor-pointer">
              <div className="font-bold text-white truncate">Devin V.</div>
              <div className="text-slate-400 font-mono">Viewer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualPasswordResetMockup() {
  return (
    <div className="my-6 p-4 md:p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-purple-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          FLOW 2.4: SELF-SERVICE PASSWORD RECOVERY LIFECYCLE
        </span>
        <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-mono">
          3-Step Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Step 1 */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span className="font-bold text-white">Request Link</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Enter work email at <code className="text-blue-300">/forgot-password</code></p>
            <div className="p-2 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] truncate">name@company.com</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-3">✓ Anti-harvesting protected</span>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span className="font-bold text-white">Resend Email</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Transactional email dispatched with HMAC signature.</p>
            <div className="p-2 rounded bg-blue-950/60 border border-blue-800/60 text-center">
              <span className="text-blue-300 font-bold text-[11px]">[ Reset Password Button ]</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-300 font-mono mt-3">⏳ 15-minute expiration TTL</span>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
              <span className="font-bold text-white">Set New Password</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Validated token updates PBKDF2 hash in D1 database.</p>
            <div className="p-2 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-[11px] font-bold text-center">
              ✓ Password Updated!
            </div>
          </div>
          <span className="text-[10px] text-blue-400 font-mono mt-3">🔒 Instant login redirect</span>
        </div>
      </div>
    </div>
  );
}

function VisualWipAlertMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-rose-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          FLOW 3.3: WORK-IN-PROGRESS (WIP) LIMIT & BOTTLENECK ALERT
        </span>
        <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Kanban Health Guard
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Normal Column */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200">IN PROGRESS</span>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">WIP 3/5 (Healthy)</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Under maximum capacity limit of 5 parallel issues.</p>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <span className="font-mono text-blue-400 text-[10px] font-bold">APEX-101</span> · D1 Edge Schema (5 pts)
          </div>
        </div>

        {/* Overloaded Column */}
        <div className="p-3.5 rounded-xl bg-red-950/30 border-2 border-red-500/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-300">IN REVIEW</span>
            <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">
              ⚠️ WIP 5/4 (OVERLOADED)
            </span>
          </div>
          <p className="text-[11px] text-red-300 font-medium mb-3">Capacity limit breached! Team must review tickets before taking new tasks.</p>
          <div className="p-2 rounded bg-slate-900 border border-red-500/50 text-xs text-slate-300">
            <span className="font-mono text-blue-400 text-[10px] font-bold">APEX-102</span> · Kanban Drag Focus (3 pts)
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualBacklogMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          FLOW 4.1: SPRINT BACKLOG & CAPACITY PLANNING
        </span>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Staging Pools
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Active Sprint */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Sprint 24 (Active)</span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.2 rounded font-mono">Oct 1 – Oct 15</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">28 pts committed</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[11px]">
              <span><span className="text-blue-400 font-mono font-bold mr-2">APEX-101</span> Design & connect D1 database</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono">5 pts</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[11px]">
              <span><span className="text-blue-400 font-mono font-bold mr-2">APEX-103</span> Confluence-style Docs editor</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono">8 pts</span>
            </div>
          </div>
        </div>

        {/* Backlog Pool */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-300">Product Backlog Pool (Unscheduled)</span>
            <span className="font-mono text-slate-400">4 issues</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
            <span><span className="text-blue-400 font-mono font-bold mr-2">APEX-105</span> Zero Trust SSO webhook payload schema</span>
            <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-400">2 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualVelocityMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-emerald-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          FLOW 4.2: SPRINT BURNDOWN & VELOCITY DASHBOARD
        </span>
        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Live Telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-[10px] text-slate-400 block font-mono">Completion Rate</span>
          <span className="font-bold text-sm text-emerald-400">75%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-[10px] text-slate-400 block font-mono">Velocity Burned</span>
          <span className="font-bold text-sm text-blue-400">28 / 35 pts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-[10px] text-slate-400 block font-mono">Active In-Flight</span>
          <span className="font-bold text-sm text-amber-400">5 issues</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-[10px] text-slate-400 block font-mono">Open Defects</span>
          <span className="font-bold text-sm text-rose-400">2 defects</span>
        </div>
      </div>

      {/* SVG Burndown Visual */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
        <div className="flex justify-between text-[11px] text-slate-400 mb-2">
          <span>Sprint 24 Burndown Trajectory</span>
          <span className="text-emerald-400 font-bold">● Ahead of Schedule</span>
        </div>
        <svg viewBox="0 0 400 120" className="w-full h-24 stroke-current">
          {/* Grid lines */}
          <line x1="40" y1="20" x2="380" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="40" y1="60" x2="380" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="40" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
          
          {/* Ideal line (dashed) */}
          <line x1="40" y1="20" x2="380" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
          
          {/* Actual line (solid blue) */}
          <polyline points="40,20 120,35 200,45 280,85 360,95" fill="none" stroke="#3b82f6" strokeWidth="3" />
        </svg>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>Day 1 (35 pts)</span>
          <span>Day 7 (Mid-Sprint)</span>
          <span>Day 14 (Target: 0 pts)</span>
        </div>
      </div>
    </div>
  );
}

function VisualAdminApprovalsMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-amber-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          FLOW 5.1: IN-APP USER APPROVALS & ROLE MANAGEMENT
        </span>
        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Admin Control Center
        </span>
      </div>

      <div className="rounded-xl border border-slate-700 overflow-hidden text-xs">
        <div className="grid grid-cols-4 p-2.5 bg-slate-800 font-bold text-slate-300 border-b border-slate-700">
          <span>User Name</span>
          <span>Email</span>
          <span>Role Assignment</span>
          <span className="text-right">Action</span>
        </div>
        <div className="grid grid-cols-4 p-2.5 bg-slate-900/90 items-center border-b border-slate-800">
          <span className="font-semibold text-white">Jordan Vance</span>
          <span className="text-slate-400 font-mono text-[11px]">jordan.v@apextrack.io</span>
          <div>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400 font-semibold text-[11px]">
              Member ▾
            </span>
          </div>
          <div className="text-right">
            <button type="button" className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold">
              ✓ Approve
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 p-2.5 bg-slate-900/60 items-center">
          <span className="font-semibold text-white">Priya Natarajan</span>
          <span className="text-slate-400 font-mono text-[11px]">priya.n@apextrack.io</span>
          <div>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
              Viewer ▾
            </span>
          </div>
          <div className="text-right">
            <button type="button" className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold">
              ✓ Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pure Tailwind UI Mockup Component for Workspace Layout Overview
function VisualWorkspaceMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          APEXTRACK WORKSPACE LAYOUT OVERVIEW
        </span>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Interactive UI Component
        </span>
      </div>

      {/* Mini Workspace Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Completion Rate</span>
          <span className="font-bold text-sm text-emerald-400">75%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Velocity</span>
          <span className="font-bold text-sm text-blue-400">28/35 pts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">In Flight</span>
          <span className="font-bold text-sm text-amber-400">5 issues</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Open Defects</span>
          <span className="font-bold text-sm text-rose-400">2 defects</span>
        </div>
      </div>

      {/* Mini Kanban Columns Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* To Do */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">TO DO</span>
            <span className="text-[10px] font-mono bg-slate-700 px-1.5 py-0.2 rounded text-slate-300">3</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-103</span>
            <p className="font-medium text-slate-200 text-xs mb-2">Knowledge Base Setup</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">8 pts</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300">IN PROGRESS</span>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded">WIP 5</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-amber-500/50 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-blue-400 font-bold">APEX-101</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded flex items-center gap-1 font-bold">
                🚩 Flagged
              </span>
            </div>
            <p className="font-medium text-slate-200 text-xs mb-2">D1 Edge Schema</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">5 pts</span>
          </div>
        </div>

        {/* In Review */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300">IN REVIEW</span>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">WIP 4</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-102</span>
            <p className="font-medium text-slate-200 text-xs mb-2">Kanban Drag Fix</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">3 pts</span>
          </div>
        </div>

        {/* Done */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300">DONE</span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">8</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-104</span>
            <p className="font-medium text-slate-200 text-xs mb-2">RBAC Auth Logic</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pure Tailwind UI Mockup Component for Issue Detail Drawer
function VisualDrawerMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xl font-sans not-prose">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">
            APEX-101
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
            Design & Connect Cloudflare D1 Distributed Edge Schema
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flag className="w-3 h-3 fill-amber-500 text-amber-500" /> Flagged Blocker
        </span>
      </div>

      {/* Subtasks Checklist Visual */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 dark:text-zinc-400">Subtask Progress Checklist</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">2 of 3 completed (66%)</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-2 rounded-full w-2/3 transition-all duration-300" />
        </div>
        <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300 pt-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="line-through text-slate-400">Define Drizzle ORM SQLite tables in db/schema.ts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="line-through text-slate-400">Generate D1 migration scripts via drizzle-kit</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
            <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 flex-shrink-0" />
            <span>Benchmark edge response times across Anycast PoPs</span>
          </div>
        </div>
      </div>

      {/* Linked Issue Chips */}
      <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
          <span className="text-slate-400 text-[11px]">blocks</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">APEX-102</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
          <span className="text-slate-400 text-[11px]">relates to</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">CORE-101</span>
        </span>
      </div>
    </div>
  );
}

export function DocumentReaderModal({
  doc,
  onClose,
  onEdit,
}: DocumentReaderModalProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const author = doc.author;
  const formattedDate = new Date(doc.updatedAt)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 16);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadMarkdown = () => {
    setIsExportOpen(false);
    const blob = new Blob([doc.content], {
      type: 'text/markdown;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (doc.title || 'document')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.setAttribute('download', `${safeTitle}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    setIsExportOpen(false);
    const innerHTMLContent = contentRef.current ? contentRef.current.innerHTML : '';
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${doc.title}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;padding:24px;color:#1e293b;} h1{font-size:24px;color:#0f172a;} h2{font-size:18px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-top:20px;} table{border-collapse:collapse;width:100%;margin:16px 0;} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;} th{background-color:#f1f5f9;font-weight:bold;} blockquote{border-left:4px solid #3b82f6;padding-left:12px;color:#475569;margin:16px 0;background-color:#f8fafc;} pre{background:#0f172a;color:#f8fafc;padding:12px;border-radius:6px;font-family:monospace;}</style></head><body>`;
    const blob = new Blob(['\ufeff' + header + innerHTMLContent + "</body></html>"], {
      type: 'application/msword;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (doc.title || 'document')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.setAttribute('download', `${safeTitle}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    setIsExportOpen(false);
    const innerHTMLContent = contentRef.current ? contentRef.current.innerHTML : '';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up window blocked. Please allow pop-ups to print/export as PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #0f172a; }
            h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; color: #1e293b; }
            h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
            tr:nth-child(even) { background-color: #f8fafc; }
            pre { background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; margin: 1.5rem 0; }
            blockquote { border-left: 4px solid #3b82f6; padding: 12px 16px; background-color: #eff6ff; border-radius: 0 8px 8px 0; margin: 1.5rem 0; color: #1e40af; }
            .no-print { display: none !important; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${innerHTMLContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Custom components for ReactMarkdown to render rich callouts, kanban cards & comparison tables
  const markdownComponents = {
    blockquote: ({ children }: any) => {
      let textContent = '';
      const extractText = (node: any) => {
        if (typeof node === 'string') textContent += node;
        else if (Array.isArray(node)) node.forEach(extractText);
        else if (node?.props?.children) extractText(node.props.children);
      };
      extractText(children);

      const trimmed = textContent.trim();

      if (trimmed.startsWith('[!NOTE]') || trimmed.startsWith('[!INFO]')) {
        const cleanText = trimmed.replace(/^\[!(NOTE|INFO)\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-blue-800 dark:text-blue-300 mb-1">
                NOTE
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      if (
        trimmed.startsWith('[!WARNING]') ||
        trimmed.startsWith('[!CAUTION]')
      ) {
        const cleanText = trimmed.replace(/^\[!(WARNING|CAUTION)\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-amber-800 dark:text-amber-300 mb-1">
                WARNING
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('[!TIP]')) {
        const cleanText = trimmed.replace(/^\[!TIP\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                PRO TIP
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      return (
        <blockquote className="my-5 pl-4 border-l-4 border-slate-300 dark:border-zinc-700 italic text-slate-700 dark:text-zinc-300 bg-slate-50/60 dark:bg-zinc-800/40 py-2.5 pr-4 rounded-r-lg">
          {children}
        </blockquote>
      );
    },

    pre: ({ children }: any) => {
      return (
        <pre className="my-4 p-4 text-xs font-mono bg-slate-900 dark:bg-zinc-950 text-slate-100 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-md">
          {children}
        </pre>
      );
    },

    img: ({ src, alt }: any) => {
      const s = (src || '').toLowerCase();
      const a = (alt || '').toLowerCase();

      if (s.includes('01-') || s.includes('create-account') || a.includes('create account') || a.includes('registration')) {
        return <VisualRegisterMockup />;
      }
      if (s.includes('02-') || s.includes('awaiting-approval') || a.includes('awaiting approval') || a.includes('holding')) {
        return <VisualHoldingRoomMockup />;
      }
      if (s.includes('03-') || s.includes('sign-in') || a.includes('sign in') || a.includes('login')) {
        return <VisualSignInMockup />;
      }
      if (s.includes('04-') || s.includes('password-reset') || a.includes('password reset') || a.includes('recovery')) {
        return <VisualPasswordResetMockup />;
      }
      if (s.includes('05-') || s.includes('wip') || a.includes('wip') || a.includes('work-in-progress')) {
        return <VisualWipAlertMockup />;
      }
      if (s.includes('06-') || s.includes('drawer') || a.includes('drawer') || a.includes('issue detail')) {
        return <VisualDrawerMockup />;
      }
      if (s.includes('07-') || s.includes('backlog') || a.includes('backlog') || a.includes('sprint planning')) {
        return <VisualBacklogMockup />;
      }
      if (s.includes('08-') || s.includes('velocity') || s.includes('burndown') || a.includes('velocity') || a.includes('burndown')) {
        return <VisualVelocityMockup />;
      }
      if (s.includes('09-') || s.includes('approval') || s.includes('admin') || a.includes('approval') || a.includes('team')) {
        return <VisualAdminApprovalsMockup />;
      }

      return (
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-2 text-center">
          <img src={src} alt={alt || 'Visual Documentation Screenshot'} className="max-w-full h-auto rounded-xl mx-auto shadow-md" />
          {alt && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{alt}</p>}
        </div>
      );
    },

    code: ({ node, inline, className, children, ...props }: any) => {
      const rawText = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';

      // Intercept ASCII wireframe code blocks and replace with Pure Tailwind UI Components
      if (rawText.includes('FLOW 2.1') || (rawText.includes('Full Name:') && rawText.includes('Create Account'))) {
        return <VisualRegisterMockup />;
      }
      if (rawText.includes('FLOW 2.2') || rawText.includes('Awaiting Administrator Approval') || rawText.includes('Holding Room')) {
        return <VisualHoldingRoomMockup />;
      }
      if (rawText.includes('FLOW 2.3') || (rawText.includes('Sign In to Workspace') && rawText.includes('Persona Switcher'))) {
        return <VisualSignInMockup />;
      }
      if (rawText.includes('FLOW 2.4') || rawText.includes('Password Recovery -> Email Link') || rawText.includes('Password Recovery')) {
        return <VisualPasswordResetMockup />;
      }
      if (rawText.includes('FLOW 3.3') || rawText.includes('WIP 5/4') || rawText.includes('WIP Exceeded') || rawText.includes('Pulsing Header')) {
        return <VisualWipAlertMockup />;
      }
      if (rawText.includes('ISSUE DETAIL DRAWER')) {
        return <VisualDrawerMockup />;
      }
      if (rawText.includes('FLOW 4.1') || rawText.includes('BACKLOG & CAPACITY') || rawText.includes('Sprint 24 (Active)')) {
        return <VisualBacklogMockup />;
      }
      if (rawText.includes('FLOW 4.2') || rawText.includes('BURNDOWN & VELOCITY') || rawText.includes('Sprint 24 Burndown')) {
        return <VisualVelocityMockup />;
      }
      if (rawText.includes('FLOW 5.1') || rawText.includes('IN-APP USER APPROVALS') || rawText.includes('Pending User Approvals')) {
        return <VisualAdminApprovalsMockup />;
      }
      if (
        lang === 'ascii' ||
        lang === 'wireframe' ||
        rawText.includes('APEXTRACK WORKSPACE') ||
        rawText.includes('+---------------------------------') ||
        rawText.includes('KANBAN BOARD')
      ) {
        return <VisualWorkspaceMockup />;
      }

      if (lang === 'kanban' || lang === 'card') {
        const lines = rawText.split('\n');
        const data: Record<string, string> = {};
        lines.forEach((line) => {
          const idx = line.indexOf(':');
          if (idx !== -1) {
            const k = line.substring(0, idx).trim().toLowerCase();
            const v = line.substring(idx + 1).trim();
            data[k] = v;
          }
        });

        return (
          <div className="my-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-md max-w-sm font-sans not-prose">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                {data.key || 'APEX-101'}
              </span>
              <div className="flex items-center gap-1.5">
                {data.flagged === 'true' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Flagged
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {data.status || 'In Progress'}
                </span>
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 mb-3">
              {data.title || 'Untitled Issue'}
            </h4>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <img
                  src={
                    data.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={data.assignee || 'Assignee'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                />
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  {data.assignee || 'Unassigned'}
                </span>
              </div>
              <span className="font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {data.points || '3 pts'}
              </span>
            </div>
          </div>
        );
      }

      if (!inline) {
        return (
          <code className="font-mono text-xs text-slate-100 leading-relaxed whitespace-pre" {...props}>
            {children}
          </code>
        );
      }

      return (
        <code
          className="bg-slate-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
      );
    },

    table: ({ children }: any) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700/80 shadow-xs">
        <table className="w-full text-left border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-slate-100/90 dark:bg-zinc-800/90 border-b border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="even:bg-slate-50/70 dark:even:bg-zinc-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="p-3 text-left font-bold text-slate-900 dark:text-zinc-100 border-r last:border-r-0 border-slate-200 dark:border-zinc-700 text-xs uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="p-3 text-slate-700 dark:text-zinc-300 border-r last:border-r-0 border-slate-200 dark:border-zinc-700/60 text-sm">
        {children}
      </td>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Notion / Confluence Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 no-print flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono px-2.5 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" /> {doc.category}
            </span>
            {author && (
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-full text-xs shadow-xs">
                <img
                  src={
                    author.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={author.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  {author.name}
                </span>
              </div>
            )}
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Updated {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Export Document</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Download Markdown (.md)
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Download Word (.doc)
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <Printer className="w-4 h-4 text-emerald-500" />
                    Print / Save as PDF
                  </button>
                </div>
              )}
            </div>

            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                title="Edit document"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-zinc-950/50">
          <div
            ref={contentRef}
            className="max-w-4xl mx-auto py-8 px-6 md:px-10 bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-border/40"
          >
            {/* ReactMarkdown prose container */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-table:w-full prose-table:border prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-td:border-b font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {doc.content}
              </ReactMarkdown>
            </div>

            {/* Attachments Section */}
            {doc.attachments && doc.attachments.length > 0 && (
              <div className="pt-8 mt-10 border-t border-slate-200 dark:border-zinc-800 no-print">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-500" />
                  Attachments ({doc.attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doc.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={`/api/attachments/${att.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs hover:border-blue-500 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="truncate">
                          <p className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                            {att.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(att.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


