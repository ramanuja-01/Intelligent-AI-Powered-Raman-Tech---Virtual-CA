import React from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Clock, 
  Activity, 
  CheckCircle,
  FileCheck2,
  Moon,
  Sun
} from 'lucide-react';

export default function Settings({ 
  auditLogs, 
  setAuditLogs,
  theme,
  setTheme,
  documents,
  setDocuments,
  setFindings,
  setActiveSession
}) {

  const handleClearLogs = () => {
    setAuditLogs([
      {
        timestamp: new Date().toISOString(),
        action: "Audit Logs Cleared",
        details: "Chronological audit logs index was purged by user."
      }
    ]);
  };

  const handleWipeAllCache = () => {
    if (window.confirm("CAUTION: This will wipe the active workspace AND all saved Consultation IDs in this browser's local cache. This action cannot be undone. Proceed?")) {
      // Clear active workspace
      setDocuments([]);
      setFindings([]);
      setActiveSession(null);
      
      // Wipe localStorage session variables
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith("VCA_SESSION_") || k === "VCA_SESSION_INDEX") {
          localStorage.removeItem(k);
        }
      });

      // Reset logs
      setAuditLogs([
        {
          timestamp: new Date().toISOString(),
          action: "Secure Cache Hard Purge",
          details: "All local caches, IndexedDB, and localStorage variables deleted."
        }
      ]);
      alert("Local Cache fully purged.");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Add/remove class to body
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
          Security & Preferences Console
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Manage local cache variables, automated document deletion policies, visual layouts, and review historical logs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Settings Adjustments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Visual Preferences */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SettingsIcon size={18} style={{ color: 'var(--accent)' }} />
              <span>UI Preferences</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Color Theme</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Toggle between high-fidelity Dark Mode and Slate Light Mode
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} style={{ color: 'var(--bg-sidebar)' }} />
                    <span>Dark Theme</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} style={{ color: 'var(--accent)' }} />
                    <span>Light Theme</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Retention and Purge Policies */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} style={{ color: 'var(--color-critical)' }} />
              <span>Local Shredding Policies</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  defaultChecked={true}
                  style={{ marginTop: '4px', accentColor: 'var(--accent)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Auto-shred raw PDF files on session lock</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    Removes binary and raw data payloads immediately when closing sessions, leaving only aggregated numerical models.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  defaultChecked={false}
                  style={{ marginTop: '4px', accentColor: 'var(--accent)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Auto-wipe local browser cache after 24 hours</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    Forces complete browser cache deletion 24 hours after session initialization.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <button 
                onClick={handleWipeAllCache}
                className="btn btn-secondary"
                style={{ 
                  color: '#fff', 
                  background: 'hsl(0, 85%, 25%)', 
                  borderColor: 'hsl(0, 85%, 35%)',
                  fontSize: '0.8rem',
                  padding: '0.5rem 1rem' 
                }}
              >
                <Trash2 size={14} />
                <span>Hard Wipe Browser Caches</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Historical Audit Logs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={18} style={{ color: 'var(--color-low)' }} />
              <span>Console Audit Trail Logs</span>
            </h3>
            <button 
              onClick={handleClearLogs}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Purge Logs
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Chronological, immutable audit trail captured directly from state adjustments. Demonstrates local compliance and user consent logs.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {auditLogs.map((log, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '0.7rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent)' }}>{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
