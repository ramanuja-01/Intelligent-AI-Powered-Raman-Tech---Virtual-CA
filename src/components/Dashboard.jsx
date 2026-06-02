import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  FolderCheck, 
  AlertTriangle, 
  ChevronRight, 
  Info,
  TrendingUp,
  Coins,
  CheckSquare,
  Building,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ 
  activeSession, 
  documents, 
  findings, 
  setActiveTab,
  userRole,
  userProfile
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

  // Persona-specific titles & configurations
  const personaConfigurations = {
    individual: {
      subHeader: `Individual Taxpayer Portal — ${userProfile?.fullName || "Ramanuja Pathy (RAMAN)"} (Smart Pre-Filing)`,
      metric1Label: "Tax Credit (TDS) Alignment",
      metric1Value: activeSession ? "₹1,65,000 credited" : "No active filings",
      metric2Label: "Chapter VI-A Claims",
      metric2Value: activeSession ? "₹2,00,000 claimed" : "₹0 claimed",
      widgetTitle: "80C & 80D Tax Deduction Limits Monitor",
      widgetBody: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Section 80C Limit (PPF, ELSS, EPF)</span>
              <span>₹1,50,000 / ₹1,50,000 (100% Met)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-low)' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Section 80D Limit (Health Premium)</span>
              <span style={{ color: 'var(--color-critical)' }}>₹50,000 / ₹25,000 (Overlimit Risk)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-critical)' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '4px', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            <Info size={12} />
            <span>Over-claiming 80D deductions raises notices risk on CPC automated returns checks.</span>
          </div>
        </div>
      )
    },
    sme: {
      subHeader: `SME Compliance Desk — ${activeSession?.sessionName ? (activeSession.sessionName.replace("GST ITC & Vendor Audit - ", "").replace("Current Account Audit - ", "") || "Raman Tech Enterprises") : "Raman Tech Enterprises"} (Corporate Portal)`,
      metric1Label: "Unclaimed GST Input (ITC)",
      metric1Value: activeSession ? "₹90,000 asset leakage" : "₹0 tracked",
      metric2Label: "Section 43B(h) Payable Age",
      metric2Value: activeSession ? " G Gopal steel (60 Days)" : "No outstanding payables",
      widgetTitle: "MSME Payment & Cash Daily Limits Tracker",
      widgetBody: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>MSME payment cycle (Section 43B(h))</span>
              <span style={{ color: 'var(--color-high)' }}>60 days overdue (₹1.5 Lakhs)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--color-high)' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Cash Payments Cap (Section 40A(3))</span>
              <span style={{ color: 'var(--color-high)' }}>₹75,000 aggregate cash daily paid</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '90%', height: '100%', background: 'var(--color-high)' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '4px', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            <Info size={12} />
            <span>Payments to MSMEs over 45 days and cash over ₹10k per person/day are directly disallowed in tax.</span>
          </div>
        </div>
      )
    },
    ca: {
      subHeader: `CA Professional Workspace — CA ${userProfile?.fullName || "Ramanuja Pathy (RAMAN)"} (Enterprise Console)`,
      metric1Label: "Critical Risk Vectors",
      metric1Value: activeSession ? "Unexplained deposits + Smurfing" : "Clean risk index",
      metric2Label: "Client Form 3CD Compliance",
      metric2Value: activeSession ? "Checks: 3 of 6 completed" : "0 checklist completed",
      widgetTitle: "Professional Client Risk Coordinates Map Summary",
      widgetBody: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
            <strong>Section 68 Round-tripping check</strong>
            <span className="badge badge-critical">Critical</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
            <strong>Section 285BA Structuring smurfing</strong>
            <span className="badge badge-critical">Critical</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
            <strong>Section 40A(3) Daily cash disallowance</strong>
            <span className="badge badge-high">High</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--accent-glow)', padding: '0.4rem', borderRadius: '4px', display: 'flex', gap: '0.2rem', alignItems: 'center', marginTop: '0.2rem' }}>
            <Info size={12} />
            <span>Click the 'Risk Heatmap' tab in the left sidebar to plot coordinate exposure metrics.</span>
          </div>
        </div>
      )
    },
    accountant: {
      subHeader: `Consultant Desk — ${userProfile?.fullName?.split(" ")[0] || "Raman"} Bookkeeping & Bank Ledger Audit`,
      metric1Label: "Voucher Match Completeness",
      metric1Value: activeSession ? "120 book vouchers matching" : "0 vouchers audited",
      metric2Label: "Interest Schedules Extracted",
      metric2Value: activeSession ? "₹35,000 OS credits caught" : "₹0 savings interest",
      widgetTitle: "Ledger Reconciliation & Match Indices",
      widgetBody: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Bank Ledger match integrity</span>
              <span>120 / 120 matching vouchers (100% complete)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-low)' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <span>Duplicate vouchers flagged</span>
              <span style={{ color: 'var(--color-high)' }}>INV-9281 posted twice (Variance ₹2.95L)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--color-high)' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '4px', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            <Info size={12} />
            <span>Verify duplicate ledger entries under Settings checklist logs panel.</span>
          </div>
        </div>
      )
    }
  };

  const activeConf = personaConfigurations[userRole] || personaConfigurations.individual;

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            Intelligent AI Audit Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            {activeConf.subHeader}
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

        {/* Metric 4: Personalized Secondary Indicator Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{activeConf.metric1Label}</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-primary)' }}>{activeConf.metric1Value}</h4>
            </div>
            <div style={{ background: 'var(--color-medium-bg)', padding: '0.5rem', borderRadius: '8px' }}>
              <Coins size={24} style={{ color: 'var(--color-medium)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{activeConf.metric2Label}:</span>
            <span>{activeConf.metric2Value}</span>
          </div>
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

        {/* Column 2: Personalized Interactive Visualizer Panel & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Personalized visualizer widget */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontFamily: 'var(--font-head)' }}>
              {activeConf.widgetTitle}
            </h4>
            {activeConf.widgetBody}
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
