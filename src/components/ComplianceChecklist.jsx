import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  User, 
  Briefcase, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function ComplianceChecklist({ 
  userRole,
  checklist,
  setChecklist
}) {
  
  // Define checklist items for different roles
  const checklistTemplates = {
    individual: [
      { id: "panLinked", text: "PAN - Aadhaar Integration status checked (mandatory for filing)", law: "Section 139AA" },
      { id: "deductions80C", text: "Section 80C aggregate limits capped at ₹1,50,000 (PPF, ELSS, EPF)", law: "Section 80C" },
      { id: "deductions80D", text: "Section 80D premium matches medical bills & within ₹25K/₹50K limit", law: "Section 80D" },
      { id: "interestDeclared", text: "Declared Savings Account interest income under Schedule OS", law: "Section 80TTA / 80TTB" },
      { id: "aisMatched", text: "Salary & dividend allocations matched against active AIS reports", law: "Rule 114-I" },
      { id: "bankReconciled", text: "High-value cash transactions reconciled against SFT caps", law: "Section 285BA" }
    ],
    sme: [
      { id: "msmePayments", text: "MSME payment cycles cleared within 45 days limits to avoid disallowance", law: "Section 43B(h)" },
      { id: "cashPaymentsLimit", text: "Cash expenses checked to ensure no single-party payment exceeds ₹10K/day", law: "Section 40A(3)" },
      { id: "gstReconciled", text: "Input Tax Credit (ITC) checked in GSTR-2B before claiming in GSTR-3B", law: "GST Section 16(2)(aa)" },
      { id: "tdsDeposit", text: "TDS deposits cleared by the 7th of the following month", law: "Section 200(1)" },
      { id: "directorsDeed", text: "Director related borrowing matched to compliance thresholds", law: "Companies Act Sec 185" },
      { id: "depreciationAudit", text: "Depreciation rates calculated under block of assets rules", law: "Section 32" }
    ],
    ca: [
      { id: "auditReport", text: "Tax Audit Report Form 3CD prepared and items cross-referenced", law: "Section 44AB" },
      { id: "msmePayments", text: "MSME payments verified under the MSMED Act criteria", law: "Section 43B(h)" },
      { id: "cashPaymentsLimit", text: "Cash transactions audited under Section 40A(3) thresholds", law: "Section 40A(3)" },
      { id: "relatedParty", text: "Related party transactions checked for fair market pricing structures", law: "Section 40A(2)(b)" },
      { id: "capitalAssets", text: "Audit of capital expense allocations vs revenue expense deductions", law: "Section 37(1)" },
      { id: "undisclosedIncomes", text: "Search for unexplained credits or cash structuring anomalies", law: "Section 68 / 69" }
    ],
    accountant: [
      { id: "basicVouching", text: "Bank ledger reconciliations executed and outstanding checks listed", law: "AS 1 / Bookkeeping" },
      { id: "panLinked", text: "PAN numbers validated with active government directories", law: "Section 139AA" },
      { id: "deductions80C", text: "Gathered premium certificates for ELSS, life premium, & home loan principal", law: "Section 80C" },
      { id: "gstReconciled", text: "GST input schedules aligned with vendor filings in GSTR-2B", law: "GST Rules" },
      { id: "interestDeclared", text: "Savings and FD interest extracted from annual bank passbooks", law: "Section 80TTA" }
    ]
  };

  const activeRole = userRole || "individual";
  const activeItems = checklistTemplates[activeRole] || checklistTemplates.individual;

  // Initialize checklist state if items are not yet tracked
  useEffect(() => {
    const updatedState = { ...checklist };
    let hasChanged = false;

    activeItems.forEach(item => {
      if (updatedState[item.id] === undefined) {
        updatedState[item.id] = false;
        hasChanged = true;
      }
    });

    if (hasChanged) {
      setChecklist(updatedState);
    }
  }, [activeRole, checklist, setChecklist]);

  const toggleCheck = (itemId) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const checkedCount = activeItems.filter(item => checklist[item.id]).length;
  const progressPercent = Math.round((checkedCount / activeItems.length) * 100) || 0;

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
          Compliance Checklist
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Interactive pre-filing requirements and verification points custom-tailored to your persona.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Checklist Items */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Progress Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)' }}>Pre-Audit Progress</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {checkedCount} of {activeItems.length} compliance checkpoints completed
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>{progressPercent}%</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ready to File</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '-0.75rem' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
          </div>

          {/* Checklist Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {activeItems.map((item) => {
              const isChecked = !!checklist[item.id];
              return (
                <div 
                  key={item.id}
                  style={{ 
                    display: 'flex', 
                    gap: '0.9rem', 
                    alignItems: 'flex-start',
                    padding: '0.8rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: isChecked ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    borderColor: isChecked ? 'var(--border-focus)' : 'var(--border)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => toggleCheck(item.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => {}} // toggled on container click
                    style={{ 
                      marginTop: '4px', 
                      width: '16px', 
                      height: '16px', 
                      accentColor: 'var(--accent)',
                      cursor: 'pointer' 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={11} style={{ color: 'var(--accent)' }} />
                      <span>Regulatory Clause: {item.law}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Explanatory Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Persona Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {activeRole === 'individual' || activeRole === 'accountant' ? (
                <User size={20} style={{ color: 'var(--accent)' }} />
              ) : (
                <Briefcase size={20} style={{ color: 'var(--accent)' }} />
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {activeRole === 'individual' && 'Taxpayer Filing Safeguards'}
                {activeRole === 'sme' && 'SME Audit Safeguards'}
                {activeRole === 'ca' && 'CA Assessment Safeguards'}
                {activeRole === 'accountant' && 'Bookkeeping Safeguards'}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              The Indian Income Tax Department employs powerful automated matching algorithms (such as the Insight Portal and SFT matching) to cross-verify filings against external transactions.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Executing this checklist guarantees that all common tax flags, standard declarations, and disclosure rules are met <strong>before</strong> compiling the final audit statement.
            </p>
          </div>

          {/* Critical Tax Notice Notice */}
          <div className="card" style={{ background: 'var(--color-critical-bg)', borderColor: 'var(--color-critical-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-critical)' }}>⚠️ MSME Section 43B(h) Warning</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Starting FY 2024-25, any business liability owed to registered MSMEs (micro & small enterprises) that remains outstanding beyond 45 days (if written agreement exists) or 15 days (no agreement) is <strong>disallowed as an expense deduction</strong>. It will be added directly back to your taxable business profits!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
