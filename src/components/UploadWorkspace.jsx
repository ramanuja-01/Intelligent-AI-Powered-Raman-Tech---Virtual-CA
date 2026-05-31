import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  RefreshCw,
  Info,
  Eye,
  ScanFace
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
  
  // OCR Bounding Box Inspector State
  const [selectedDocId, setSelectedDocId] = useState("");
  const [hoveredField, setHoveredField] = useState(null);

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
          setSelectedDocId(pkg.documents[0].id); // Select first doc for OCR view
          
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
    setSelectedDocId("");
    setHoveredField(null);
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
      setSelectedDocId("");
      setHoveredField(null);
    } else {
      if (selectedDocId === docId) {
        setSelectedDocId(updated[0].id);
      }
    }
    logEvent("Document Removed", `Removed ${deleted?.name} from audit workspace.`);
  };

  const currentDoc = documents.find(d => d.id === selectedDocId);

  // Bounding boxes definitions for visual mock overlay
  const getBoundingBoxes = (docType) => {
    if (docType === "Form 16") {
      return [
        { id: "pan", name: "Employee PAN", top: "16%", left: "38%", width: "22%", height: "8%", value: "BHUPR1982M", conf: "99.8%" },
        { id: "tan", name: "Employer TAN", top: "16%", left: "68%", width: "22%", height: "8%", value: "MUMT01928E", conf: "99.2%" },
        { id: "salary", name: "Gross Salary (Sec 17)", top: "42%", left: "65%", width: "25%", height: "8%", value: "₹18,50,000", conf: "98.5%" },
        { id: "ded80C", name: "80C Deductions", top: "66%", left: "65%", width: "25%", height: "8%", value: "₹1,50,000", conf: "97.9%" },
        { id: "tds", name: "TDS Claimed", top: "86%", left: "65%", width: "25%", height: "8%", value: "₹1,85,000", conf: "99.5%" }
      ];
    }
    if (docType === "Invoice") {
      return [
        { id: "invNo", name: "Invoice No", top: "12%", left: "32%", width: "20%", height: "8%", value: "INV-9281", conf: "99.9%" },
        { id: "gstin", name: "Vendor GSTIN", top: "25%", left: "32%", width: "40%", height: "8%", value: "27AAACT0012P1ZA", conf: "98.7%" },
        { id: "base", name: "Base Taxable Value", top: "64%", left: "65%", width: "25%", height: "8%", value: "₹5,00,000", conf: "99.1%" },
        { id: "cgst", name: "CGST (9%)", top: "74%", left: "65%", width: "25%", height: "8%", value: "₹45,000", conf: "99.0%" },
        { id: "sgst", name: "SGST (9%)", top: "84%", left: "65%", width: "25%", height: "8%", value: "₹45,000", conf: "99.0%" }
      ];
    }
    if (docType === "AIS") {
      return [
        { id: "pan", name: "Assessee PAN", top: "15%", left: "35%", width: "25%", height: "8%", value: "BHUPR1982M", conf: "99.8%" },
        { id: "salAIS", name: "Salary payments Reflected", top: "44%", left: "65%", width: "25%", height: "8%", value: "₹20,50,000", conf: "99.4%" },
        { id: "intAIS", name: "Interest Credit Reflected", top: "72%", left: "65%", width: "25%", height: "8%", value: "₹35,000", conf: "98.9%" }
      ];
    }
    return [];
  };

  const activeBoxes = currentDoc ? getBoundingBoxes(currentDoc.type) : [];

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
                {documents.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div 
                      key={doc.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 0.9rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--accent-light)' : 'var(--bg-primary)',
                        borderColor: isSelected ? 'var(--border-focus)' : 'var(--border)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => setSelectedDocId(doc.id)}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isSelected && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem', background: 'var(--bg-secondary)', padding: '0.15rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                            <Eye size={10} /> OCR Active
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoc(doc.id);
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* OCR High-Fidelity Bounding Box Visualizer section (Visible when packages are loaded) */}
      {documents.length > 0 && currentDoc && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ScanFace size={22} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>OCR Raw Coordinate Bounding Box Inspector</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--accent-light)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
              Hover bounding boxes to inspect Tesseract / Textract JSON confidence indices
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            
            {/* Visual scanned document emulator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Visual Coordinate Bounding Overlay
              </span>
              
              <div 
                style={{ 
                  aspectRatio: '0.73',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: 'inset 0 0 12px rgba(0,0,0,0.02)',
                  position: 'relative',
                  padding: '2rem',
                  overflow: 'hidden',
                  fontFamily: 'monospace',
                  color: '#334155',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  lineHeight: '1.3'
                }}
              >
                {/* Visual Watermark background representing scanned document */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', opacity: 0.03, display: 'flex', alignItems: 'center', justify: 'center', transform: 'rotate(-30deg)', pointerEvents: 'none', select: 'none', fontSize: '3rem', fontWeight: 900 }}>
                  SCANNED TAX DOCUMENT
                </div>

                {/* Overlaid Absolute Bounding Boxes */}
                {activeBoxes.map((box) => (
                  <div 
                    key={box.id}
                    onMouseEnter={() => setHoveredField(box)}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{ 
                      position: 'absolute',
                      top: box.top,
                      left: box.left,
                      width: box.width,
                      height: box.height,
                      border: hoveredField?.id === box.id ? '2.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                      background: hoveredField?.id === box.id ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.03)',
                      borderRadius: '4px',
                      cursor: 'crosshair',
                      zIndex: 5,
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}

                {/* Document layout content emulator */}
                {currentDoc.type === "Form 16" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', border: '1px solid #94a3b8', padding: '1rem', background: '#fff' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #334155', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                      FORM NO. 16 - PART B (SALARY CERTIFICATE)
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', gap: '1rem' }}>
                      <div>
                        <strong>Employer Name:</strong> Raman Tech Corp <br />
                        <strong>PAN of Employer:</strong> AAACR0192A <br />
                        <strong>TAN of Employer:</strong> <span style={{ opacity: 0.6 }}>MUMT01928E</span>
                      </div>
                      <div>
                        <strong>Employee Name:</strong> Raman Kumar <br />
                        <strong>PAN of Employee:</strong> <span style={{ opacity: 0.6 }}>BHUPR1982M</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                        <span>1. Gross Salary under Section 17(1)</span>
                        <span style={{ fontWeight: 'bold' }}>₹18,50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                        <span>2. Deductions under Section 16 (Standard)</span>
                        <span>₹50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                        <span>3. Deductions under Chapter VI-A (Section 80C)</span>
                        <span style={{ fontWeight: 'bold' }}>₹1,50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                        <span>4. Deductions under Section 80D</span>
                        <span>₹50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem', marginTop: 'auto' }}>
                        <strong>5. Net Tax Deducted at Source (TDS)</strong>
                        <strong style={{ color: '#1e3a8a' }}>₹1,85,000</strong>
                      </div>
                    </div>
                  </div>
                )}

                {currentDoc.type === "Invoice" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', border: '1px solid #94a3b8', padding: '1.25rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #334155', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>TAX INVOICE</span>
                      <span>No: <span style={{ opacity: 0.6 }}>INV-9281</span></span>
                    </div>

                    <div>
                      <strong>Seller:</strong> TechBrands Solutions Ltd <br />
                      <strong>GSTIN of Seller:</strong> <span style={{ opacity: 0.6 }}>27AAACT0012P1ZA</span>
                    </div>

                    <div style={{ border: '1px solid #cbd5e1', marginTop: '1rem', borderRadius: '4px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr', borderBottom: '1px solid #cbd5e1', padding: '0.4rem', fontWeight: 'bold', background: '#f1f5f9' }}>
                        <span>Item Description</span>
                        <span>Qty</span>
                        <span>Amount</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr', padding: '0.4rem' }}>
                        <span>Consulting services</span>
                        <span>1</span>
                        <span>₹5,00,000</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-end', width: '220px', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Base Total:</span>
                        <span>₹5,00,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>CGST (9%):</span>
                        <span>₹45,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SGST (9%):</span>
                        <span>₹45,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #334155', paddingTop: '0.4rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                        <span>Invoice Total:</span>
                        <span>₹5,90,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentDoc.type === "AIS" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', border: '1px solid #94a3b8', padding: '1.25rem', background: '#fff' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #334155', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                      TAX DEPT. ANNUAL INFORMATION STATEMENT (AIS)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.7rem' }}>
                      <div>
                        <strong>Financial Year:</strong> 2025-26 <br />
                        <strong>PAN Number:</strong> <span style={{ opacity: 0.6 }}>BHUPR1982M</span>
                      </div>
                      <div>
                        <strong>Statement Date:</strong> 31-May-2026
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', flex: 1 }}>
                      <strong>Part B: Taxpayer Information Summary</strong>
                      
                      <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                          <span>1. Salary Earnings (Reflected Sec 192)</span>
                          <span style={{ fontWeight: 'bold' }}>₹20,50,000</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Deductor: Raman Tech Corp</span>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.2rem' }}>
                          <span>2. Interest Credited (Saving & FD)</span>
                          <span style={{ fontWeight: 'bold' }}>₹35,000</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Deductor: HDFC Bank Ltd</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Structured OCR Output metadata inspector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Structured JSON Entity Extractor
              </span>

              <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
                {!hoveredField ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '5rem 1rem', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <ScanFace size={36} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Coordinate Scanner Ready</h4>
                    <p style={{ fontSize: '0.75rem', maxWidth: '240px' }}>
                      Hover or tap the dashed bounding boxes on the visual tax sheet to inspect real-time OCR confidence scores.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div style={{ background: 'var(--accent-light)', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Entity Target</div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.15rem' }}>
                        {hoveredField.name}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Extracted Field Value</span>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{hoveredField.value}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>OCR Engine Confidence</span>
                        <strong style={{ color: 'var(--color-low)' }}>{hoveredField.conf}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Field Registry Match</span>
                        <strong style={{ color: 'var(--color-low)' }}>100% Validated</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Target Index Key</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          doc.extractedData.{hoveredField.id}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tesseract OCR JSON Response</span>
                      <pre style={{ fontSize: '0.68rem', overflowX: 'auto', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
{`{
  "boundingBox": {
    "top": "${hoveredField.top}",
    "left": "${hoveredField.left}",
    "width": "${hoveredField.width}",
    "height": "${hoveredField.height}"
  },
  "confidence": ${hoveredField.conf.replace('%', '') / 100},
  "field": "${hoveredField.id}",
  "value": "${hoveredField.value}"
}`}
                      </pre>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
