import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen
} from 'lucide-react';

// Static suggested questions outside component to optimize render cycles
const PREBUILT_QUESTIONS = [
  { text: "What is wrong in my ITR / Tax audit?", tag: "General" },
  { text: "Which tax deductions look risky?", tag: "80C/80D" },
  { text: "Why does my ledger expense mismatch GST?", tag: "GST" },
  { text: "Show suspicious transactions.", tag: "Cash/Bank" }
];

export default function AuditFindings({ 
  findings, 
  userRole 
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: "assistant", 
      text: "Namaste! I am your AI TaxRecon Auditor Copilot. I have audited your uploaded session cache documents. What would you like to review?" 
    }
  ]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filters
  const filteredFindings = findings.filter(f => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical") return f.severity === "critical";
    if (activeFilter === "high") return f.severity === "high";
    if (activeFilter === "other") return f.severity === "medium" || f.severity === "low";
    return true;
  });

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate CA-AI synthesis response
    setTimeout(() => {
      let responseText = "";
      const q = text.toLowerCase();

      if (q.includes("wrong in my itr") || q.includes("general")) {
        const crit = findings.filter(f => f.severity === 'critical');
        if (findings.length === 0) {
          responseText = "I don't see any files in the active workspace. Go to the Upload Workspace and load the 'Salary Mismatch' or 'GST Ledger' bundle to trigger findings.";
        } else {
          responseText = `Our audit uncovered ${findings.length} findings, including ${crit.length} Critical errors. The main issue is: ${findings[0]?.title} (${findings[0]?.description}). I suggest resolving this immediately.`;
        }
      } else if (q.includes("deductions") || q.includes("risky")) {
        const sub80D = findings.find(f => f.taxSection.includes("80D"));
        if (sub80D) {
          responseText = `Yes, your claim under Section 80D is marked as high-risk. ${sub80D.description} Specifically, statutory limits are set at ₹25,000 unless senior criteria are declared.`;
        } else {
          responseText = "Under Section 80C and 80D, ensure claims are backed by premium receipts, ELSS statements, or PF passbooks. Currently, no risky deduction claims are active in this workspace.";
        }
      } else if (q.includes("gst") || q.includes("ledger") || q.includes("invoice")) {
        const gst = findings.find(f => f.taxSection.includes("GST"));
        if (gst) {
          responseText = `Correct. In Invoice INV-9281, we found that ${gst.description} Expensing the full amount instead of booking GST Input Tax Credit (ITC) causes a direct tax leakage of ₹90,000.`;
        } else {
          responseText = "To audit GST compliance, load the 'GST Invoices vs Ledger Audit' package. It will automatically match invoice tax distributions against book ledgers.";
        }
      } else if (q.includes("suspicious") || q.includes("cash") || q.includes("bank")) {
        const susp = findings.find(f => f.title.includes("Cash") || f.title.includes("Round-Tripping"));
        if (susp) {
          responseText = `We flagged a critical item: ${susp.title}. ${susp.description} Accumulating structured cash entries or quick loans from vendor channels represents extreme tax audit risk under Section 68 and 285BA.`;
        } else {
          responseText = "I will scan bank transactions for Cash structuring (under ₹5 Lakh PAN reporting caps) or unexplained vendor loans. Please load the 'Suspicious Bank Ledger' package to verify.";
        }
      } else {
        responseText = "I am reviewing your audited session cache. I recommend looking at the 'Cross-Document Reconciliation' sheet for a complete cell-by-cell variance breakdown.";
      }

      setChatMessages(prev => [...prev, { sender: "assistant", text: responseText }]);
    }, 500);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
      
      {/* Left Column: Audit Findings List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            Audit Review Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Collated anomalies, compliance gaps, and tax deviations extracted across active files.
          </p>
        </div>

        {/* Severity Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          {["all", "critical", "high", "other"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`btn ${activeFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              {tab === 'all' && 'All Severity'}
              {tab === 'critical' && 'Critical Gaps'}
              {tab === 'high' && 'High Risks'}
              {tab === 'other' && 'Warnings & Info'}
            </button>
          ))}
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '5rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <ShieldAlert size={48} style={{ color: 'var(--accent)', opacity: 0.5, marginBottom: '0.5rem' }} />
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No active findings identified</h4>
            <p style={{ fontSize: '0.8rem', maxWidth: '320px' }}>
              Your workspace is clean or has no files. Navigate to the <strong>Upload Workspace</strong> to pull preloaded files or custom invoices.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredFindings.map((finding) => {
              const isExpanded = expandedId === finding.id;
              return (
                <div 
                  key={finding.id} 
                  className="card"
                  style={{ 
                    padding: '1.25rem',
                    borderLeft: `5px solid var(--color-${finding.severity})`,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {/* Header Row */}
                  <div 
                    onClick={() => toggleExpand(finding.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${finding.severity}`}>{finding.severity}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {finding.documentSource}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--bg-primary)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <BookOpen size={10} /> {finding.taxSection}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.1rem' }}>{finding.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--accent-glow)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                        Match Conf: {Math.round(finding.confidenceScore * 100)}%
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      {/* Description */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Description of Issue</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {finding.description}
                        </p>
                      </div>

                      {/* Why it may be wrong */}
                      <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-critical)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Info size={14} />
                          <span>CA Compliance Explanation</span>
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {finding.whyItMatters}
                        </p>
                      </div>

                      {/* Numerical Mismatch Box (If present) */}
                      {finding.amountMismatch && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Expected (Reconciled)</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-low)' }}>
                              ₹{finding.amountMismatch.expected.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Actual (Reported)</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-critical)' }}>
                              ₹{finding.amountMismatch.actual.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Discrepancy Variance</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-high)' }}>
                              ₹{finding.amountMismatch.difference.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Corrective Action */}
                      <div style={{ borderLeft: '3px solid var(--color-low)', paddingLeft: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-low)' }}>Suggested Action Plan</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {finding.suggestedCorrection}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Embedded Chat Assistant */}
      <div className="card chat-drawer no-print animate-slide-in-right" style={{ borderRadius: 'var(--radius-md)', padding: 0 }}>
        
        {/* Chat Header */}
        <div className="chat-header">
          <div style={{ background: 'var(--accent-glow)', padding: '0.4rem', borderRadius: '6px' }}>
            <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>CA Audit Assistant</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Active Local Synthesis</span>
          </div>
        </div>

        {/* Message Panel */}
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          
          {/* Permanent Disclaimer */}
          <div className="chat-disclaimer">
            <strong>⚠️ Cautionary Disclaimer:</strong> This TaxRecon Auditor assistant provides compliance checking. Final tax filing validation should be executed by a qualified Chartered Accountant (CA).
          </div>
        </div>

        {/* Quick Questions Suggestions */}
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Suggested Queries:</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {PREBUILT_QUESTIONS.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                style={{ 
                  textAlign: 'left',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                {q.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Query (e.g. deductions)..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
            style={{ 
              flex: 1, 
              padding: '0.45rem 0.75rem', 
              fontSize: '0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              outline: 'none',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          />
          <button 
            onClick={() => handleSendMessage(chatInput)}
            className="btn btn-primary"
            style={{ padding: '0.45rem', borderRadius: '6px' }}
          >
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
