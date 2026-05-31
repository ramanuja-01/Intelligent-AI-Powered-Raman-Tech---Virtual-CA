import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  FolderCheck, 
  AlertTriangle, 
  ChevronRight, 
  Info,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({ 
  activeSession, 
  documents, 
  findings, 
  setActiveTab,
  userRole 
}) {
  const score = activeSession ? activeSession.overallScore : 100;
  
  // Counts
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const otherCount = findings.filter(f => f.severity === 'medium' || f.severity === 'low').length;
  
  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Visual text for score
  let scoreText = "Excellent";
  let scoreColorClass = "var(--color-low)"; // green
  if (score < 60) {
    scoreText = "Critical Audit Issues";
    scoreColorClass = "var(--color-critical)";
  } else if (score < 85) {
    scoreText = "Modest Risk Discovered";
    scoreColorClass = "var(--color-medium)";
  }

  // Persona titles
  const personaTitles = {
    individual: "Taxpayer Portal — Smart Pre-Filing",
    sme: "SME Dashboard — Corporate Compliance",
    ca: "Chartered Accountant Workspace — Deep Audit",
    accountant: "Consultant Desk — Client Tax Review"
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            Intelligent AI Audit Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            {personaTitles[userRole] || personaTitles.individual}
          </p>
        </div>
        <div className="badge badge-low" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FolderCheck size={14} />
          <span>Local Cache Secured</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {/* Metric 1: Score Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Compliance Score</span>
            <h3 style={{ fontSize: '1.6rem', color: scoreColorClass, fontWeight: 800, marginTop: '0.2rem' }}>{score}%</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{scoreText}</p>
          </div>
          <div className="gauge-container">
            <svg className="gauge-svg">
              <circle className="gauge-bg" cx="60" cy="60" r={radius} />
              <circle 
                className="gauge-fill" 
                cx="60" 
                cy="60" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ stroke: scoreColorClass }}
              />
            </svg>
            <div className="gauge-text">{score}</div>
          </div>
        </div>

        {/* Metric 2: Documents */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Audited Documents</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{documents.length}</h3>
            </div>
            <div style={{ background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '8px' }}>
              <FileText size={24} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('upload')}
            style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <span>Workspace Manager</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Metric 3: Critical Issues */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Critical Actions</span>
              <h3 style={{ fontSize: '2rem', color: 'var(--color-critical)', fontWeight: 800, marginTop: '0.2rem' }}>{criticalCount}</h3>
            </div>
            <div style={{ background: 'var(--color-critical-bg)', padding: '0.5rem', borderRadius: '8px' }}>
              <ShieldAlert size={24} style={{ color: 'var(--color-critical)' }} />
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('findings')}
            style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-critical)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <span>Audit Findings</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Metric 4: High & Medium Risk */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>High / Medium Alerts</span>
              <h3 style={{ fontSize: '2rem', color: 'var(--color-high)', fontWeight: 800, marginTop: '0.2rem' }}>{highCount + otherCount}</h3>
            </div>
            <div style={{ background: 'var(--color-high-bg)', padding: '0.5rem', borderRadius: '8px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-high)' }} />
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('heatmap')}
            style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-high)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <span>Risk Analysis Map</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Column 1: Critical Alarms Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Flagged Compliance Mismatches</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Requires Remediation
            </span>
          </div>

          {findings.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '3rem 1rem', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <FolderCheck size={40} style={{ color: 'var(--accent)', opacity: 0.6 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No pending compliance gaps found.</p>
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>Please upload folders or financial packages in the Workspace.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {findings.map((finding) => (
                <div 
                  key={finding.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.9rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('findings')}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className={`badge badge-${finding.severity}`} style={{ minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                      {finding.severity}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{finding.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                        Source: {finding.documentSource} • Clause: {finding.taxSection}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Quick Information Card & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Privacy Trust Card */}
          <div className="card" style={{ background: 'var(--accent-light)', borderColor: 'var(--border-focus)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Info size={18} style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Zero Server Database Retention</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Intelligent Virtual CA runs fully serverless. Extracted records and tax parameters reside within your <strong>browser session cache</strong>. 
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              To clear active records from local memory, use the <strong>Close & Lock Session</strong> action. Save your <strong>Consultation ID</strong> to restore later.
            </p>
          </div>

          {/* Quick Tools Checklist */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('reconciliation')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <span>Reconcile Income Values</span>
              </button>
              <button 
                onClick={() => setActiveTab('report')}
                className="btn btn-primary" 
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                <FileText size={16} />
                <span>Compile PDF Tax Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
