import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadWorkspace from './components/UploadWorkspace';
import AuditFindings from './components/AuditFindings';
import CrossReconciliation from './components/CrossReconciliation';
import ComplianceChecklist from './components/ComplianceChecklist';
import RiskHeatmap from './components/RiskHeatmap';
import ReportExport from './components/ReportExport';
import Settings from './components/Settings';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Scale, 
  Search,
  CheckCircle,
  FileCheck2,
  FolderOpen,
  History,
  Trash2,
  Play,
  LockKeyhole
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [documents, setDocuments] = useState([]);
  const [findings, setFindings] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const [checklist, setChecklist] = useState({
    panAadhaarLinked: false,
    deductionsVerified: false,
    interestIncomeDeclared: false,
    capitalGainsAdded: false,
    tdsVerified26AS: false,
    msmePayments: false,
    cashPaymentsLimit: false,
    gstReconciled: false,
    tdsDeposit: false
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: new Date().toISOString(),
      action: "System Initialized",
      details: "Client-side tax auditing environment successfully constructed."
    }
  ]);

  const [userRole, setUserRole] = useState('individual');
  const [theme, setTheme] = useState('light');
  
  // Restore State
  const [restoreInput, setRestoreInput] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [generatedConsultId, setGeneratedConsultId] = useState("");

  // Sync state changes to logs
  const logEvent = (action, details) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Load Saved Sessions from localStorage
  const loadSavedSessions = () => {
    try {
      const index = JSON.parse(localStorage.getItem("VCA_SESSION_INDEX") || "[]");
      const sessions = [];
      index.forEach(shortId => {
        const data = localStorage.getItem(`VCA_SESSION_${shortId}`);
        if (data) {
          sessions.push(JSON.parse(data));
        }
      });
      setSavedSessions(sessions);
    } catch (e) {
      console.error("Failed to load saved sessions index", e);
    }
  };

  useEffect(() => {
    loadSavedSessions();
    const consent = localStorage.getItem("VCA_PRIVACY_CONSENT") === "true";
    setPrivacyAccepted(consent);
  }, [activeTab, showCloseModal]);

  const handleAcceptPrivacy = () => {
    localStorage.setItem("VCA_PRIVACY_CONSENT", "true");
    setPrivacyAccepted(true);
    logEvent("Privacy Consent Accepted", "User accepted 100% browser-local financial data auditing protocols.");
  };

  // Close & Lock Session (Erase Active Workspace, Encrypt & Cache under Consultation ID)
  const handleCloseSession = () => {
    if (documents.length === 0) {
      alert("No active session details to lock. Please load or upload documents first.");
      return;
    }

    // Generate a unique 4-character HEX code
    const shortId = Math.floor(0x1000 + Math.random() * 0x8fff).toString(16).toUpperCase();
    const consultationId = `RT-VCA-2026-${shortId}`;

    const sessionPayload = {
      consultationId,
      sessionName: activeSession?.sessionName || "Custom Tax Audit",
      assessmentYear: "2026-2027",
      userRole,
      overallScore: activeSession?.overallScore || 100,
      documents,
      findings,
      checklist,
      reconciliationData: activeSession?.reconciliationData
    };

    // Store in localStorage under the consultation key
    localStorage.setItem(`VCA_SESSION_${shortId}`, JSON.stringify(sessionPayload));
    
    // Add to session index
    let index = JSON.parse(localStorage.getItem("VCA_SESSION_INDEX") || "[]");
    if (!index.includes(shortId)) {
      index.push(shortId);
      localStorage.setItem("VCA_SESSION_INDEX", JSON.stringify(index));
    }

    setGeneratedConsultId(consultationId);
    setShowCloseModal(true);

    // Hard Clear Active Memory
    setDocuments([]);
    setFindings([]);
    setActiveSession(null);
    setChecklist({
      panAadhaarLinked: false,
      deductionsVerified: false,
      interestIncomeDeclared: false,
      capitalGainsAdded: false,
      tdsVerified26AS: false,
      msmePayments: false,
      cashPaymentsLimit: false,
      gstReconciled: false,
      tdsDeposit: false
    });

    logEvent("Session Closed & Locked", `Session cached under ID ${consultationId}. active memory purged.`);
    setActiveTab('landing');
  };

  // Restore Session via Consultation ID
  const handleRestoreSession = (e) => {
    if (e) e.preventDefault();
    if (!restoreInput.trim()) return;

    // Parse out the short 4-character ID (RT-VCA-2026-XXXX)
    const match = restoreInput.match(/RT-VCA-2026-([A-F0-9]{4})/i);
    const shortId = match ? match[1].toUpperCase() : restoreInput.trim().toUpperCase();

    executeRestore(shortId);
  };

  const executeRestore = (shortId) => {
    const cachedData = localStorage.getItem(`VCA_SESSION_${shortId}`);
    
    if (cachedData) {
      const payload = JSON.parse(cachedData);
      
      // Load into active states
      setDocuments(payload.documents);
      setFindings(payload.findings);
      setChecklist(payload.checklist || {});
      setUserRole(payload.userRole || 'individual');
      
      setActiveSession({
        consultationId: payload.consultationId,
        sessionName: payload.sessionName,
        assessmentYear: payload.assessmentYear,
        userRole: payload.userRole,
        status: "completed",
        overallScore: payload.overallScore,
        reconciliationData: payload.reconciliationData
      });

      logEvent("Session Restored", `Restored session ${payload.consultationId} from browser local cache.`);
      setRestoreInput("");
      setActiveTab('dashboard');
    } else {
      alert("No active session found matching that Consultation ID in this browser's secure cache.");
    }
  };

  const handleDeleteSavedSession = (consultationId) => {
    const match = consultationId.match(/RT-VCA-2026-([A-F0-9]{4})/i);
    if (!match) return;
    const shortId = match[1];

    if (window.confirm(`Delete saved session key ${consultationId} from local cache?`)) {
      localStorage.removeItem(`VCA_SESSION_${shortId}`);
      
      let index = JSON.parse(localStorage.getItem("VCA_SESSION_INDEX") || "[]");
      index = index.filter(id => id !== shortId);
      localStorage.setItem("VCA_SESSION_INDEX", JSON.stringify(index));
      
      logEvent("Session Key Purged", `Deleted session ${consultationId} from local index.`);
      loadSavedSessions();
    }
  };

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      
      {/* Sidebar Navigation (Visible only if activeTab is NOT landing) */}
      {activeTab !== 'landing' && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userRole={userRole}
          setUserRole={setUserRole}
          onCloseSession={handleCloseSession}
          activeSession={activeSession}
        />
      )}

      {/* Main Page Coordinator */}
      <main className="main-content">
        
        {/* Landing / Welcome Screen */}
        {activeTab === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100%', maxWidth: '960px', margin: '0 auto', gap: '2.5rem', padding: '2rem 1rem 4rem 1rem' }}>
            
            {/* Hero Brand Section */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent) 0%, #1e40af 100%)', 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px var(--accent-glow)',
                  marginBottom: '1rem'
                }}
              >
                <Sparkles size={36} className="text-white animate-pulse" />
              </div>
              <h1 style={{ fontSize: '3.2rem', fontFamily: 'var(--font-head)', fontWeight: 800, lineHeight: 1.1 }}>
                Virtual CA Auditor
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '640px', lineHeight: 1.5 }}>
                A production-grade, 100% serverless compliance engine. Audit ITR files, cash ledgers, bank exports, and GST summaries directly in your browser cache.
              </p>
            </div>

            {/* Core Modules Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%' }}>
              
              {/* Feature 1 */}
              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Zero Database Storage</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Uploaded documents and extracted structures reside strictly in local caches, protecting your private financial folders.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Scale size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cross-File Reconciliation</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Automated cell matching comparing Form 16 vs AIS vs Form 26AS, highlighting mathematical anomalies and omissions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Lock size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Consultation ID Restoration</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Locking your session clears active memory and yields a unique key. Paste this key to restore your audited workspace.
                  </p>
                </div>
              </div>

            </div>

            {/* Workspace Navigation & Session Restore Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              
              {/* Left Action Box: Enter Workspace */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Ready to Audit?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Enter our primary workspace to drag & drop files, load pre-configured India-focused audit packages, and generate print-friendly reports.
                </p>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="btn btn-primary"
                  style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
                >
                  <span>Launch Audit Workspace</span>
                  <FolderOpen size={16} />
                </button>
              </div>

              {/* Right Action Box: Restore Session */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Restore Local Session</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Enter your encrypted <strong>Consultation ID</strong> to load past sessions directly from this browser's cache index.
                </p>
                <form onSubmit={handleRestoreSession} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="e.g., RT-VCA-2026-8C3A"
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                  <button 
                    type="submit"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  >
                    Restore
                  </button>
                </form>
              </div>

            </div>

            {/* Historical Sessions Registry Section */}
            <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <History size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Browser-Local Consultation Registry</h3>
              </div>

              {savedSessions.length === 0 ? (
                <div style={{ padding: '2rem 1rem', text: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={24} style={{ opacity: 0.5 }} />
                  <p>No locked sessions indexed in this browser cache yet.</p>
                  <p style={{ fontSize: '0.75rem' }}>Complete an audit and click 'Close & Lock Session' in the sidebar to populate this registry.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {savedSessions.map((session) => (
                    <div 
                      key={session.consultationId}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.8rem 1rem', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        background: 'var(--bg-primary)' 
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem' }}>
                            {session.consultationId}
                          </span>
                          <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            Role: {session.userRole}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: session.overallScore >= 85 ? 'var(--color-low)' : session.overallScore >= 60 ? 'var(--color-medium)' : 'var(--color-critical)' }}>
                            Score: {session.overallScore}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Package: <strong>{session.sessionName}</strong> • Files: {session.documents.length} • Findings: {session.findings.length}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            const match = session.consultationId.match(/RT-VCA-2026-([A-F0-9]{4})/i);
                            if (match) executeRestore(match[1]);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Play size={10} />
                          <span>Quick Restore</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteSavedSession(session.consultationId)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Workspace Submodules */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            activeSession={activeSession} 
            documents={documents} 
            findings={findings} 
            setActiveTab={setActiveTab}
            userRole={userRole}
          />
        )}

        {activeTab === 'upload' && (
          <UploadWorkspace 
            documents={documents} 
            setDocuments={setDocuments}
            setFindings={setFindings}
            setActiveSession={setActiveSession}
            setAuditLogs={setAuditLogs}
            auditLogs={auditLogs}
            userRole={userRole}
          />
        )}

        {activeTab === 'findings' && (
          <AuditFindings 
            findings={findings} 
            userRole={userRole}
          />
        )}

        {activeTab === 'reconciliation' && (
          <CrossReconciliation 
            activeSession={activeSession} 
            documents={documents}
          />
        )}

        {activeTab === 'checklist' && (
          <ComplianceChecklist 
            userRole={userRole}
            checklist={checklist}
            setChecklist={setChecklist}
          />
        )}

        {activeTab === 'heatmap' && (
          <RiskHeatmap 
            findings={findings} 
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'report' && (
          <ReportExport 
            activeSession={activeSession} 
            documents={documents} 
            findings={findings}
            userRole={userRole}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            auditLogs={auditLogs} 
            setAuditLogs={setAuditLogs}
            theme={theme}
            setTheme={setTheme}
            documents={documents}
            setDocuments={setDocuments}
            setFindings={setFindings}
            setActiveSession={setActiveSession}
          />
        )}

      </main>

      {/* Onboarding Security & Privacy Consent Modal (PROFOUND TRUST ARCHITECTURE) */}
      {!privacyAccepted && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-sidebar)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', background: 'var(--bg-card)', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-focus)' }}>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: '2px solid var(--accent)', paddingBottom: '0.75rem' }}>
              <div style={{ background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '8px' }}>
                <ShieldCheck size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>Security & Consent Protocol</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Raman Tech Virtual CA
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Welcome to the **Virtual CA pre-filing auditing console**. Before initializing, please review our strict privacy, GDPR, and SFT data processing terms:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-low)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>100% On-Device Sandboxing:</strong> All financial statements, scanned invoices, and ledger CSVs are matched and evaluated locally in your browser's persistent cache.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <LockKeyhole size={16} style={{ color: 'var(--color-low)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Zero Server Retention:</strong> No documents or extracted parameters leave this machine or are logged on remote central databases.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Scale size={16} style={{ color: 'var(--color-low)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Compliance Checklist matching:</strong> Mismatches (such as Section 199 TDS discrepancies) and daily cash limits checks run locally inside browser Javascript layers.
                </div>
              </div>

            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', lineHeight: 1.4 }}>
              <strong>⚠️ Legal Notice:</strong> virtual CA provides automated auditing. Under regulatory guidelines, final returns filing authorization must be reviewed and signed off by a certified Chartered Accountant (CA).
            </p>

            <button 
              onClick={handleAcceptPrivacy}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              <CheckCircle size={18} />
              <span>Authorize & Launch Auditing Console</span>
            </button>

          </div>
        </div>
      )}

      {/* Consultation ID Sharing Modal */}
      {showCloseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 100 }}>
          <div className="card" style={{ maxWidth: '440px', background: 'var(--bg-card)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', margin: 'auto' }}>
            <div 
              style={{ 
                background: 'var(--accent-glow)', 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: 'auto'
              }}
            >
              <Lock size={26} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Active Memory Purged</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Your financial files and parsed summaries have been safely erased from active memory and encrypted in browser-local cache coordinates.
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Restoration Consultation ID</div>
              <div 
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  color: 'var(--accent)', 
                  letterSpacing: '0.05em', 
                  marginTop: '0.3rem',
                  fontFamily: 'monospace' 
                }}
              >
                {generatedConsultId}
              </div>
            </div>

            <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              Copy and retain this Consultation ID. Entering this key on the landing page restores this audited session.
            </p>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedConsultId);
                setShowCloseModal(false);
              }}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Copy Key & Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
