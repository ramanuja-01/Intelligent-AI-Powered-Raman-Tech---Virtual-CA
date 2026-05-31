import React from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

export default function CrossReconciliation({ 
  activeSession, 
  documents 
}) {
  const recon = activeSession?.reconciliationData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
          Cross-Document Reconciliation Sheet
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Cell-by-cell numerical comparison across various reporting documents to detect omissions and claims variance.
        </p>
      </div>

      {!recon ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 1rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <Scale size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
          <h4 style={{ fontWeight: 700 }}>No Reconciliation Sheet Loaded</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
            Please go to the **Upload Workspace** and load an audit package first (e.g. Salary Mismatch Package) to populate this table.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Reconciliation Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)' }}>Active Audit: {activeSession.sessionName}</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-critical)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={14} />
                <span>Unresolved variances require ledger adjustments</span>
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                    {recon.headers.map((h, idx) => (
                      <th key={idx} style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recon.rows.map((row, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        borderBottom: '1px solid var(--border)', 
                        background: row.critical ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                        {row.form16 !== 0 ? `₹${row.form16.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                        {row.ais !== 0 ? `₹${row.ais.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                        {row["26as"] !== undefined && row["26as"] !== 0 ? `₹${row["26as"].toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            background: row.critical ? 'var(--color-critical-bg)' : 'var(--color-low-bg)', 
                            color: row.critical ? 'var(--color-critical)' : 'var(--color-low)',
                            borderColor: row.critical ? 'var(--color-critical-border)' : 'var(--color-low-border)',
                            borderWidth: '1px'
                          }}
                        >
                          {row.critical ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                          <span style={{ marginLeft: '0.2rem' }}>{row.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core explanation notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingDown size={16} style={{ color: 'var(--color-critical)' }} />
                <span>Notice Vulnerability Risk Assessment</span>
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Under Section 143(1)(a) of the Income Tax Act, tax filings that contain arithmetic errors or internal discrepancies (such as claiming more TDS than reflected in Form 26AS) trigger **automated adjustment demands**. Filing with unresolved mismatch values will immediately block tax refunds.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HelpCircle size={16} style={{ color: 'var(--accent)' }} />
                <span>How to Reconcile?</span>
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                1. <strong>TDS Mismatch:</strong> Contact payroll to deposit outstanding tax or amend their Form 24Q TDS filing.<br />
                2. <strong>Gross Income Variance:</strong> Add omitted bonuses or capital gains listed in your AIS statement back into your draft ITR to maintain income reporting symmetry.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
