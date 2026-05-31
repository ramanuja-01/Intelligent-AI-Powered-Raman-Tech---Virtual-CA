import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { mockAuditPackages } from '../data/mockAuditPackages';

export default function UploadWorkspace({ 
  documents, 
  setDocuments, 
  setFindings, 
  setActiveSession,
  setAuditLogs,
  auditLogs,
  userRole
}) {
  const [consent, setConsent] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePkgId, setActivePkgId] = useState("");

  const logEvent = (action, details) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Triggers loading a preloaded audit package
  const handleLoadPackage = (pkgId) => {
    if (!consent) {
      alert("Please accept the data processing consent notice first to run the audit.");
      return;
    }
    
    setUploading(true);
    setProgress(15);
    setActivePkgId(pkgId);

    const pkg = mockAuditPackages.find(p => p.id === pkgId);
    
    // Simulate multi-stage audit pipeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Complete load
          setDocuments(pkg.documents);
          setFindings(pkg.findings);
          
          // Generate Consultation ID for restoration mapping
          const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
          const consultationId = `RT-VCA-2026-${randomHex}`;

          setActiveSession({
            consultationId,
            sessionName: pkg.name,
            assessmentYear: "2026-2027",
            userRole: userRole,
            status: "completed",
            overallScore: pkg.overallScore,
            reconciliationData: pkg.reconciliationData
          });

          logEvent("Audit Executed Successfully", `Loaded package: ${pkg.name}. Mapped to ID ${consultationId}.`);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleClearWorkspace = () => {
    setDocuments([]);
    setFindings([]);
    setActiveSession(null);
    setActivePkgId("");
    logEvent("Workspace Cleared", "All documents and findings cleared from browser memory.");
  };

  const handleDeleteDoc = (docId) => {
    const deleted = documents.find(d => d.id === docId);
    const updated = documents.filter(d => d.id !== docId);
    setDocuments(updated);
    
    // If no docs, clear audit
    if (updated.length === 0) {
      setFindings([]);
      setActiveSession(null);
      setActivePkgId("");
    }
    logEvent("Document Removed", `Removed ${deleted?.name} from audit workspace.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title */}
      <div>
        <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
          Finance Document Dropzone
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Upload income tax filings, invoices, ledgers, and bank summaries for automated rules checking & AI synthesis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left Side: Upload Zone & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Security/Consent Box */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={22} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Privacy First • 100% Client-Side Encryption</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.2rem' }}>
                  No folders or tax schedules are stored on centralized cloud databases. Document indexing and accounting rules run instantly in your browser cache.
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={consent} 
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span>I authorize local analysis of financial data under privacy terms.</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Upload Dropzone */}
          <div 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '3rem 1.5rem', 
              border: '2.5px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              background: uploading ? 'var(--accent-light)' : 'var(--bg-card)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all var(--transition-normal)'
            }}
          >
            <UploadCloud size={48} style={{ color: uploading ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Drag & Drop Financial Folders Here
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', marginBottom: '1rem' }}>
              Supports PDF, Excel (.xlsx), CSV, and scanned invoice prints (PNG/JPEG). Max 10MB per document.
            </p>

            {uploading ? (
              <div style={{ width: '100%', maxWidth: '280px', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)' }}>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>OCR Field Extraction...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  id="file-uploader" 
                  style={{ display: 'none' }}
                  onChange={() => handleLoadPackage("pkg-salary-mismatch")}
                />
                <button 
                  onClick={() => document.getElementById("file-uploader").click()}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Active Documents List */}
          {documents.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Indexed Workspace Documents</h4>
                <button 
                  onClick={handleClearWorkspace}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)' }}
                >
                  <Trash2 size={12} />
                  <span>Erase All</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 0.9rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--bg-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <FileText size={20} style={{ color: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                          <span>Size: {doc.size}</span>
                          <span>•</span>
                          <span>Format: {doc.type}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-low)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                            <CheckCircle size={10} /> parsed
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDoc(doc.id)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Trash2 size={15} className="hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Demo Packages for Auditing */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Instant Demo Audit Packages</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            No mock files on hand? Click any of our curated India-focused tax audit bundles to load synthetic data and trigger the full virtual CA audit flow instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {mockAuditPackages.map((pkg) => {
              const isActive = activePkgId === pkg.id;
              return (
                <div 
                  key={pkg.id}
                  style={{ 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    borderColor: isActive ? 'var(--border-focus)' : 'var(--border)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => handleLoadPackage(pkg.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {pkg.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--bg-primary)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {pkg.documents.length} Files
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {pkg.description}
                  </p>
                  {isActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-low)', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.6rem' }}>
                      <CheckCircle size={12} />
                      <span>Loaded & Audited in Cache</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
