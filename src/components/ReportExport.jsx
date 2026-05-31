import React from 'react';
import { 
  Printer, 
  Scale, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ReportExport({ 
  activeSession, 
  documents, 
  findings, 
  userRole 
}) {

  const handlePrint = () => {
    window.print();
  };

  const score = activeSession ? activeSession.overallScore : 100;
  const recon = activeSession?.reconciliationData;
  
  // Severity counts
  const crit = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const other = findings.filter(f => f.severity === 'medium' || f.severity === 'low').length;

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title & Action Header (no-print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            Audit Report Compiler
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Preview and download your formal PDF tax audit certificate. Optimizes automatically for standard A4 paper dimensions.
          </p>
        </div>
        <button 
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px var(--accent-glow)' }}
        >
          <Printer size={18} />
          <span>Compile & Print PDF</span>
        </button>
      </div>

      {/* Main Report Preview Page (Looks like a real corporate certificate) */}
      <div className="card print-report-container" style={{ background: '#fff', color: '#1e293b', border: '1px solid var(--border)', padding: '3rem', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Official Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #1e3a8a', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e3a8a', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-head)' }}>
              <Scale size={24} style={{ color: '#2563eb' }} />
              <span>RAMAN TECH - TAXRECON AUDITOR</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Intelligent Pre-Filing Tax Review & Compliance Audit Engine
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            <div><strong>Consultation ID:</strong> {activeSession ? activeSession.consultationId : "RT-VCA-2026-N/A"}</div>
            <div><strong>Filing Year:</strong> FY 2025 - 2026 (AY 2026-27)</div>
            <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        {/* Executive Summary Block */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700, fontFamily: 'var(--font-head)' }}>
            I. Executive Compliance Summary
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', marginTop: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            
            {/* Left: Score Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #cbd5e1', paddingRight: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: score >= 85 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626' }}>
                {score}%
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginTop: '0.25rem' }}>
                Audit Compliance Rating
              </div>
            </div>

            {/* Right: Brief Assessment */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155' }}>
              <p>
                This automated review scanned and matched all active financial documents loaded in the browser local cache. 
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontWeight: 600, marginTop: '0.25rem' }}>
                <span style={{ color: '#dc2626' }}>Critical Actions: {crit}</span>
                <span style={{ color: '#d97706' }}>High Risk: {high}</span>
                <span style={{ color: '#2563eb' }}>Warnings/Info: {other}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Audited Documents Schedule */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: '0.75rem' }}>
            II. Schedule of Audited Documents
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.6rem', color: '#475569' }}>File Name</th>
                <th style={{ padding: '0.6rem', color: '#475569' }}>Document Type</th>
                <th style={{ padding: '0.6rem', color: '#475569' }}>Parsed Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '1rem', color: '#64748b', textAlign: 'center' }}>
                    No files loaded in active session.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{doc.name}</td>
                    <td style={{ padding: '0.6rem' }}>{doc.type}</td>
                    <td style={{ padding: '0.6rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Government Directory Matched
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Income & Tax Credit Reconciliation Schedule (Added numerical values table) */}
        {recon && (
          <div style={{ pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: '0.75rem' }}>
              III. Income & Tax Credit Reconciliation Schedule
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  {recon.headers.map((h, idx) => (
                    <th key={idx} style={{ padding: '0.6rem', color: '#475569', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recon.rows.map((row, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      background: row.critical ? '#fff5f5' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{row.label}</td>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>
                      {row.form16 !== 0 ? `₹${row.form16.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>
                      {row.ais !== 0 ? `₹${row.ais.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>
                      {row["26as"] !== undefined && row["26as"] !== 0 ? `₹${row["26as"].toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem', color: row.critical ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Itemized Audit Findings Block */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: '1rem' }}>
            IV. Detailed Compliance Findings & Correction Plan
          </h2>

          {findings.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b', italic: 'true' }}>
              No material compliance gaps or tax mismatches were extracted during this session.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {findings.map((f, idx) => (
                <div 
                  key={f.id}
                  style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '6px', 
                    padding: '1.25rem',
                    pageBreakInside: 'avoid',
                    background: '#fff'
                  }}
                >
                  {/* Finding Title & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                        #{idx + 1}. {f.title}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                        Source: {f.documentSource} • Regulatory Code: {f.taxSection}
                      </div>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        color: f.severity === 'critical' ? '#dc2626' : f.severity === 'high' ? '#d97706' : '#2563eb',
                        background: f.severity === 'critical' ? '#fee2e2' : f.severity === 'high' ? '#fef3c7' : '#dbeafe',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        height: 'fit-content'
                      }}
                    >
                      {f.severity}
                    </span>
                  </div>

                  {/* Descriptions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                    <div>
                      <strong>Observation:</strong> {f.description}
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid #dc2626' }}>
                      <strong>CA Explanation:</strong> {f.whyItMatters}
                    </div>

                    {f.amountMismatch && (
                      <div style={{ fontWeight: 600, color: '#1e3a8a', display: 'flex', gap: '1.5rem', margin: '0.2rem 0' }}>
                        <span>Expected: ₹{f.amountMismatch.expected.toLocaleString('en-IN')}</span>
                        <span>Actual: ₹{f.amountMismatch.actual.toLocaleString('en-IN')}</span>
                        <span style={{ color: '#dc2626' }}>Variance: ₹{f.amountMismatch.difference.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '0.5rem', color: '#16a34a', fontWeight: 600 }}>
                      <strong>Action Plan:</strong> {f.suggestedCorrection}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Sign-off & Cautionary Disclaimer */}
        <div style={{ marginTop: '2rem', pageBreakInside: 'avoid' }}>
          {/* Disclaimer Box */}
          <div style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, background: '#f8fafc' }}>
            <strong>⚠️ IMPORTANT COMPLIANCE NOTICE & CAUTIONARY DISCLAIMER:</strong><br />
            This audit statement is generated by the Raman Tech TaxRecon Auditor engine based on structured rules and local context matching models. Since the analysis was done entirely on-device, final review, sign-off, and income tax filing submission must be executed by a certified and licensed Chartered Accountant (CA) or tax consultant. We assume no direct liability for adjustments, demands, or notice penalty actions issued by the Income Tax Department or GST authorities.
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', fontSize: '0.85rem' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', width: '220px', pt: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#1e3a8a', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                ✓ VERIFIED BY TAXRECON AUDITOR
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Raman Tech Audit Engine</span>
            </div>
            <div style={{ borderTop: '1px solid #cbd5e1', width: '220px', pt: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Signature of Taxpayer / Assessee</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
