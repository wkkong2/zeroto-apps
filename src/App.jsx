import { useState, useEffect, useRef } from 'react';

const AGENT_NAMES = [
  'Nova', 'Axiom', 'Pulse', 'Cipher', 'Vega', 'Orion', 'Helix', 'Flux',
  'Sage', 'Zeno', 'Atlas', 'Echo', 'Lyra', 'Titan', 'Quasar', 'Nimbus',
];

const PHASES = [
  { id: 'requirements', name: 'Requirements', icon: '📋' },
  { id: 'design',       name: 'Design',       icon: '🎨' },
  { id: 'dev',          name: 'Dev',           icon: '💻' },
  { id: 'qa',           name: 'QA',            icon: '🔍' },
  { id: 'deploy',       name: 'Deploy',        icon: '🚀' },
];

const ACTIVE_PHASE_INDEX = 2; // "Dev" is the active phase

const PHASE_PROGRESS_CONFIG = [
  { base: 100, speed: 0 },       // Requirements — complete
  { base: 100, speed: 0 },       // Design — complete
  { base: 62,  speed: 0.018 },   // Dev — active (animates)
  { base: 0,   speed: 0 },       // QA — queued
  { base: 0,   speed: 0 },       // Deploy — queued
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPhaseStatus(index) {
  if (index < ACTIVE_PHASE_INDEX) return 'complete';
  if (index === ACTIVE_PHASE_INDEX) return 'active';
  return 'queued';
}

function PulsingDot({ status }) {
  const colors = {
    complete: { dot: '#22c55e', ring: '#bbf7d0' },
    active:   { dot: '#6366f1', ring: '#c7d2fe' },
    queued:   { dot: '#9ca3af', ring: '#e5e7eb' },
  };
  const c = colors[status];

  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 12, height: 12 }}>
      {status !== 'queued' && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          backgroundColor: c.ring,
          animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
        }} />
      )}
      <span style={{
        position: 'relative', display: 'inline-block',
        width: 12, height: 12, borderRadius: '50%',
        backgroundColor: c.dot,
      }} />
    </span>
  );
}

function ProgressBar({ progress, status, speed }) {
  const displayProgress = Math.min(100, Math.max(0, progress));
  const trackColor = status === 'queued' ? '#1e2130' : '#1e2130';

  const gradients = {
    complete: 'linear-gradient(90deg, #22c55e, #4ade80)',
    active:   'linear-gradient(90deg, #6366f1, #818cf8, #a5b4fc)',
    queued:   'linear-gradient(90deg, #374151, #4b5563)',
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: 8,
      borderRadius: 999, backgroundColor: '#1a1f2e', overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', borderRadius: 999,
        background: gradients[status],
        width: `${displayProgress}%`,
        transition: 'width 0.4s ease',
        position: 'relative', overflow: 'hidden',
      }}>
        {status === 'active' && (
          <div style={{
            position: 'absolute', top: 0, left: '-100%',
            width: '60%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }} />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    complete: { label: 'Complete', bg: '#052e16', color: '#4ade80', border: '#166534' },
    active:   { label: 'Active',   bg: '#1e1b4b', color: '#818cf8', border: '#3730a3' },
    queued:   { label: 'Queued',   bg: '#111827', color: '#6b7280', border: '#374151' },
  };
  const c = config[status];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999,
      backgroundColor: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  );
}

function PhaseCard({ phase, agentName, status, progress, isActive }) {
  return (
    <div style={{
      flex: '1 1 180px',
      minWidth: 160,
      maxWidth: 260,
      background: isActive
        ? 'linear-gradient(160deg, #1a1d2e 0%, #1e1b4b 100%)'
        : 'linear-gradient(160deg, #12151f 0%, #161929 100%)',
      borderRadius: 16,
      border: isActive ? '1px solid #4338ca' : '1px solid #1f2537',
      padding: '22px 20px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: isActive
        ? '0 0 0 1px #4338ca22, 0 8px 32px rgba(99,102,241,0.15)'
        : '0 4px 16px rgba(0,0,0,0.3)',
      position: 'relative',
      transition: 'box-shadow 0.3s ease',
    }}>
      {isActive && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #6366f1, #818cf8)',
          height: 2, width: '60%', borderRadius: '0 0 4px 4px',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: 22 }}>{phase.icon}</span>
        </div>
        <PulsingDot status={status} />
      </div>

      {/* Phase name */}
      <div>
        <div style={{
          fontSize: 16, fontWeight: 700, color: '#f1f5f9',
          letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          {phase.name}
        </div>
        <div style={{ marginTop: 2, fontSize: 12, color: '#64748b' }}>
          Phase {PHASES.indexOf(phase) + 1} of {PHASES.length}
        </div>
      </div>

      {/* Agent */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 8,
        backgroundColor: '#0d1017', border: '1px solid #1e2537',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {agentName[0]}
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Agent</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{agentName}</div>
        </div>
      </div>

      {/* Status badge */}
      <StatusBadge status={status} />

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>Progress</span>
          <span style={{ fontSize: 11, color: status === 'queued' ? '#374151' : '#94a3b8', fontWeight: 600 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar progress={progress} status={status} />
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 999,
      backgroundColor: '#1f0a0a', border: '1px solid #7f1d1d',
    }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          backgroundColor: '#fca5a5',
          animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
        }} />
        <span style={{
          position: 'relative', display: 'inline-block',
          width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444',
        }} />
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Live
      </span>
    </div>
  );
}

function MetricTile({ label, value, sub }) {
  return (
    <div style={{
      background: '#12151f', border: '1px solid #1f2537', borderRadius: 12,
      padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#334155' }}>{sub}</div>}
    </div>
  );
}

export default function PipelineDashboard() {
  const [agents] = useState(() => PHASES.map(() => pickRandom(AGENT_NAMES)));
  const [progresses, setProgresses] = useState(() =>
    PHASE_PROGRESS_CONFIG.map(c => c.base)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const progressesRef = useRef(progresses);
  progressesRef.current = progresses;

  useEffect(() => {
    let startTime = null;

    function tick(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      setElapsedSeconds(Math.floor(elapsed));

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setProgresses(prev => prev.map((p, i) => {
        const cfg = PHASE_PROGRESS_CONFIG[i];
        if (cfg.speed === 0) return p;
        const next = p + cfg.speed * 60 * dt;
        if (next >= 98) return 62 + Math.sin(timestamp / 2000) * 8; // oscillate
        return next;
      }));

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const completedCount = PHASES.filter((_, i) => getPhaseStatus(i) === 'complete').length;

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, #1a1040 0%, #080b12 55%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#f1f5f9',
        padding: '0 0 48px',
      }}>

        {/* Top Header */}
        <header style={{
          borderBottom: '1px solid #1a1f30',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(8,11,18,0.8)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16,
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              }}>
                Z
              </div>
              <span style={{
                fontSize: 18, fontWeight: 800, color: '#f1f5f9',
                letterSpacing: '-0.03em',
              }}>
                Zero<span style={{ color: '#818cf8' }}>To</span>
              </span>
            </div>

            {/* Project + Live */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Velocity Booking App</div>
                <div style={{ fontSize: 11, color: '#475569' }}>Pipeline · {completedCount}/{PHASES.length} phases done</div>
              </div>
              <LiveBadge />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>

          {/* Metrics row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 32,
            animation: 'fadeIn 0.5s ease both',
          }}>
            <MetricTile label="Session" value={formatElapsed(elapsedSeconds)} sub="hh:mm:ss" />
            <MetricTile label="Active Phase" value="Dev" sub="Phase 3 of 5" />
            <MetricTile label="Agents Running" value="5" sub="All assigned" />
            <MetricTile label="Phases Done" value={`${completedCount}/5`} sub="On schedule" />
          </div>

          {/* Section label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            animation: 'fadeIn 0.5s ease 0.1s both',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pipeline Phases
            </div>
            <div style={{ flex: 1, height: 1, backgroundColor: '#1a1f30' }} />
          </div>

          {/* Phase cards */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            animation: 'fadeIn 0.5s ease 0.2s both',
          }}>
            {PHASES.map((phase, i) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                agentName={agents[i]}
                status={getPhaseStatus(i)}
                progress={progresses[i]}
                isActive={i === ACTIVE_PHASE_INDEX}
              />
            ))}
          </div>

          {/* Activity log */}
          <div style={{
            marginTop: 32,
            background: '#0d1017',
            border: '1px solid #1a1f30',
            borderRadius: 14,
            padding: '18px 20px',
            animation: 'fadeIn 0.5s ease 0.3s both',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
            }}>
              Agent Activity Log
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { time: '00:00', agent: agents[0], msg: 'Requirements finalised — 12 user stories confirmed', phase: 'Requirements', color: '#22c55e' },
                { time: '00:04', agent: agents[1], msg: 'Design system applied — component library exported', phase: 'Design', color: '#22c55e' },
                { time: '00:09', agent: agents[2], msg: 'Building REST API layer and booking flow components…', phase: 'Dev', color: '#818cf8' },
                { time: '—',     agent: agents[3], msg: 'Waiting for Dev phase to complete before test suite runs', phase: 'QA', color: '#374151' },
                { time: '—',     agent: agents[4], msg: 'Deployment pipeline staged and ready', phase: 'Deploy', color: '#374151' },
              ].map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '8px 10px', borderRadius: 8,
                  backgroundColor: i === 2 ? '#1a1b2e' : 'transparent',
                  border: i === 2 ? '1px solid #2d2f52' : '1px solid transparent',
                }}>
                  <span style={{
                    fontSize: 11, color: '#334155', fontFamily: 'monospace',
                    minWidth: 36, paddingTop: 1,
                  }}>
                    {entry.time}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: entry.color, minWidth: 84, paddingTop: 2,
                  }}>
                    {entry.phase}
                  </span>
                  <span style={{ fontSize: 12, color: i < 2 ? '#64748b' : i === 2 ? '#94a3b8' : '#334155', lineHeight: 1.5 }}>
                    <strong style={{ color: i === 2 ? '#a5b4fc' : 'inherit', fontWeight: 600 }}>{entry.agent}:</strong>{' '}
                    {entry.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 24, textAlign: 'center',
            fontSize: 11, color: '#1e2537',
            animation: 'fadeIn 0.5s ease 0.4s both',
          }}>
            ZeroTo Pipeline Dashboard · Demo Mode · All activity is simulated
          </div>
        </main>
      </div>
    </>
  );
}