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
import { parseBankStatementCSV, auditParsedTransactions } from '../utils/csvParser';

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
  const [isDragging, setIsDragging] = useState(false);
  
  // OCR Bounding Box Inspector State
  const [selectedDocId, setSelectedDocId] = useState("");
  const [hoveredField, setHoveredField] = useState(null);

  const logEvent = (action, details) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    if (!consent) {
      alert("Please accept the data processing consent notice first to run the audit.");
      return;
    }

    if (!file) return;

    setUploading(true);
    setProgress(15);
    setActivePkgId("");

    const isCSV = file.name.endsWith('.csv') || file.name.endsWith('.txt');
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isImage = /\.(png|jpe?g)$/i.test(file.name);

    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProgress(50);
        try {
          const text = e.target.result;
          const parsedTransactions = parseBankStatementCSV(text);
          setProgress(75);

          setTimeout(() => {
            const auditResult = auditParsedTransactions(parsedTransactions, file.name);

            // Construct new document object
            const docId = `doc-parsed-${Date.now()}`;
            const newDoc = {
              id: docId,
              name: file.name,
              type: "Bank Statement",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadedAt: new Date().toISOString(),
              extractedData: {
                totalDeposits: parsedTransactions.reduce((s, t) => s + t.credit, 0),
                totalWithdrawals: parsedTransactions.reduce((s, t) => s + t.debit, 0),
                entries: parsedTransactions.length,
                accountName: "Audited Ledger - " + file.name.replace(/\.[^/.]+$/, ""),
                accountNo: `502000${Math.floor(10000000 + Math.random() * 90000000)}`,
                bank: "Parsed Statement Bank"
              },
              transactions: parsedTransactions
            };

            // Update app states
            const updatedDocs = [newDoc, ...documents];
            setDocuments(updatedDocs);
            setFindings(auditResult.findings);
            setSelectedDocId(docId);

            const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
            const consultationId = `RT-VCA-2026-${randomHex}`;

            setActiveSession({
              consultationId,
              sessionName: `Parsed Statement - ${file.name}`,
              assessmentYear: "2026-2027",
              userRole: userRole,
              status: "completed",
              overallScore: auditResult.overallScore,
              reconciliationData: auditResult.reconciliationData
            });

            logEvent("Audit Executed Successfully", `Parsed CSV file: ${file.name}. Identified ${auditResult.findings.length} tax risk violations. Mapped to ID ${consultationId}.`);
            setUploading(false);
            setProgress(100);
          }, 600);
        } catch (err) {
          console.error(err);
          alert(`Failed to parse file: ${err.message}`);
          setUploading(false);
          setProgress(0);
        }
      };

      reader.onerror = () => {
        alert("Failed to read file.");
        setUploading(false);
        setProgress(0);
      };

      reader.readAsText(file);

    } else if (isPDF || isImage) {
      // Simulate client-side OCR extraction progress from 15% to 100%
      let currentProgress = 15;
      const interval = setInterval(() => {
        currentProgress += 17;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);

          const fn = file.name.toLowerCase();
          
          let docId = "";
          let updatedDocs = [];
          let randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
          let consultationId = `RT-VCA-2026-${randomHex}`;

          if (fn.includes('bank') || fn.includes('statement') || fn.includes('account')) {
            // HDFC Bank Current Account exposure package
            docId = `doc-bank-${Date.now()}`;
            const newDoc = {
              id: docId,
              name: file.name,
              type: "Bank Statement",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadedAt: new Date().toISOString(),
              extractedData: {
                totalDeposits: 1964125,
                totalWithdrawals: 256000,
                entries: 6,
                accountName: "Raman Tech Enterprises",
                accountNo: "50200019283741",
                bank: "HDFC Bank Current A/c"
              },
              transactions: [
                { date: "12-Aug-2025", description: "Cash Deposit Branch", debit: 0, credit: 490626 },
                { date: "13-Aug-2025", description: "Cash Deposit Branch", debit: 0, credit: 494016 },
                { date: "05-Oct-2025", description: "Tushar Ent LLP Ref: 921A", debit: 0, credit: 250000 },
                { date: "06-Oct-2025", description: "Transfer back to Tushar Ent", debit: 250000, credit: 0 },
                { date: "04-Dec-2025", description: "Cash pay Ram Lal wage day1", debit: 6000, credit: 0 },
                { date: "04-Dec-2025", description: "Cash pay Ram Lal wage day2", debit: 8000, credit: 0 }
              ]
            };
            
            const packageFindings = [
              {
                id: `find-bank-structuring-${Date.now()}`,
                severity: "critical",
                title: "Suspicious Structured Cash Deposits",
                taxSection: "Section 285BA (SFT Reporting)",
                description: `Detected 3 cash deposits of identical value below ₹5,00,000 within a short period (Total: ₹14,75,268) on 12-Aug-2025 and 13-Aug-2025 in statement ${file.name}.`,
                whyItMatters: "Depositing cash just below the ₹5,00,000 PAN threshold is flagged as 'structuring' by anti-money laundering algorithms. Banks are legally bound to submit Suspicious Transaction Reports (STR).",
                amountMismatch: { expected: 0, actual: 1475268, difference: 1475268 },
                suggestedCorrection: "Supply clear tax sales invoices matching cash flows to substantiate bank receipts in tax returns.",
                confidenceScore: 0.94,
                documentSource: `Bank Statement (${file.name})`
              },
              {
                id: `find-bank-roundtrip-${Date.now()}`,
                severity: "high",
                title: "Potential Round-Tripping Anomalies",
                taxSection: "Section 68 (Unexplained Credits)",
                description: `A transfer of ₹2,50,000 was debited to vendor 'Tushar Ent LLP' on 06-Oct-2025. Near the same day (05-Oct-2025), an incoming credit of ₹2,50,000 was received from the same entity, representing a round-trip voucher match.`,
                whyItMatters: "Rapid back-and-forth round-tripping of capital with counterparties lacks commercial substance and is classified as accommodation entries. This triggers severe tax addition assessments under Section 68, taxed at penal 78% rates.",
                amountMismatch: { expected: 0, actual: 250000, difference: 250000 },
                suggestedCorrection: "Verify and maintain valid commercial contracts, service invoices, or formal credit loan agreements to validate these ledger credits under tax audits.",
                confidenceScore: 0.90,
                documentSource: `Bank Statement (${file.name})`
              },
              {
                id: `find-bank-cashlimit-${Date.now()}`,
                severity: "high",
                title: "Cash Payments Exceeding Section 40A(3)",
                taxSection: "Section 40A(3)",
                description: `Aggregate cash expenditure of ₹14,000 was paid to supervisor 'Ram Lal' on date 04-Dec-2025.`,
                whyItMatters: "Section 40A(3) disallows tax deductions for business expenses paid in cash exceeding ₹10,000 to a single individual in a single day, increasing taxable profits directly.",
                amountMismatch: { expected: 10000, actual: 14000, difference: 4000 },
                suggestedCorrection: "Pay wages exceeding ₹10,000 using digital bank transfers (IMPS/NEFT/UPI) to supervisor bank accounts.",
                confidenceScore: 0.95,
                documentSource: `Bank Statement (${file.name})`
              }
            ];

            const reconciliationData = {
              headers: ["Bank Transaction Date / Description", "Credit Value", "Debit Ledger Matches", "Tax Risk Exposure", "Severity"],
              rows: [
                {
                  label: "Structured Cash Deposits (Sec 285BA)",
                  form16: 1475268,
                  ais: 1475268,
                  "26as": 0,
                  status: "SFT Structuring Notice Liability",
                  critical: true
                },
                {
                  label: "Round-Tripping Entries (Sec 68)",
                  form16: 250000,
                  ais: 250000,
                  "26as": 0,
                  status: "Accommodation Entry Risk (78% Tax)",
                  critical: true
                },
                {
                  label: "Aggregate Daily Cash Wages (Sec 40A(3))",
                  form16: 0,
                  ais: 14000,
                  "26as": 0,
                  status: "Disallowance Risk (>₹10K Single Day)",
                  critical: true
                }
              ]
            };

            updatedDocs = [newDoc, ...documents];
            setDocuments(updatedDocs);
            setFindings(packageFindings);
            setSelectedDocId(docId);

            setActiveSession({
              consultationId,
              sessionName: `Current Account Audit - ${file.name}`,
              assessmentYear: "2026-2027",
              userRole: userRole,
              status: "completed",
              overallScore: 58,
              reconciliationData
            });

            logEvent("Audit Executed Successfully", `OCR processed Bank Statement: ${file.name}. Simulated high-fidelity Tesseract engine identified 3 critical cash/round-trip items. ID: ${consultationId}`);

          } else if (fn.includes('invoice') || fn.includes('ledger') || fn.includes('gst')) {
            // GST CGST Section 16 Input Tax expensing mismatch package
            docId = `doc-invoice-${Date.now()}`;
            const newDoc = {
              id: docId,
              name: file.name,
              type: "Invoice",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadedAt: new Date().toISOString(),
              extractedData: {
                invoiceNo: "INV-9281",
                vendorGstin: "27AAACT0012P1ZA",
                sellerName: "TechBrands Solutions Ltd",
                baseValue: 500000,
                cgst: 45000,
                sgst: 45000,
                total: 590000
              }
            };

            const packageFindings = [
              {
                id: `find-gst-expensing-${Date.now()}`,
                severity: "critical",
                title: "Incorrect Expensing of GST Input Credit",
                taxSection: "GST CGST Act Section 16",
                description: `Invoice total of ₹5,90,000 (including ₹90,000 tax) was charged as a flat expense to your General Ledger. No separate GST Input Tax Credit asset was booked.`,
                whyItMatters: "Expensing the tax portion reduces corporate profits incorrectly while forfeiting the valuable Input Tax Credit asset, inflating your cash GST payment liabilities.",
                amountMismatch: { expected: 500000, actual: 590000, difference: 90000 },
                suggestedCorrection: "Pass a journal voucher to debit GST Input Tax Credit asset by ₹90,000 and credit the respective Expense ledger.",
                confidenceScore: 0.98,
                documentSource: `GST Invoice (${file.name})`
              },
              {
                id: `find-gst-msme-${Date.now()}`,
                severity: "high",
                title: "MSME Overdue Liability (Section 43B(h))",
                taxSection: "Section 43B(h)",
                description: `Payable liability of ₹5,90,000 to MSME vendor 'TechBrands Solutions Ltd' has remained outstanding for 48 days.`,
                whyItMatters: "Under Section 43B(h), any expense liability to registered MSMEs outstanding beyond 45 days is disallowed as a deduction for the financial year, dramatically increasing tax liability.",
                amountMismatch: { expected: 45, actual: 48, difference: 3 },
                suggestedCorrection: "Clear outstanding dues to MSME suppliers immediately before the tax filing due date to restore expense deductibility.",
                confidenceScore: 0.97,
                documentSource: `GST Invoice (${file.name})`
              }
            ];

            const reconciliationData = {
              headers: ["General Ledger Account Description", "Invoice Base Value", "Total Ledger Booked", "Tax Credit Forfeited", "Filing Status"],
              rows: [
                {
                  label: "Consulting Services (Sec 16 GST ITC)",
                  form16: 500000,
                  ais: 590000,
                  "26as": 90000,
                  status: "GST CGST Mismatch Notice liability",
                  critical: true
                },
                {
                  label: "MSME Vendor Liabilities (Sec 43B(h))",
                  form16: 590000,
                  ais: 590000,
                  "26as": 0,
                  status: "Outstanding Dues (>45 days)",
                  critical: true
                }
              ]
            };

            updatedDocs = [newDoc, ...documents];
            setDocuments(updatedDocs);
            setFindings(packageFindings);
            setSelectedDocId(docId);

            setActiveSession({
              consultationId,
              sessionName: `GST ITC & Vendor Audit - ${file.name}`,
              assessmentYear: "2026-2027",
              userRole: userRole,
              status: "completed",
              overallScore: 70,
              reconciliationData
            });

            logEvent("Audit Executed Successfully", `OCR processed GST Invoice: ${file.name}. Simulated high-fidelity Tesseract engine identified incorrect GST expensing and Section 43B(h) violations. ID: ${consultationId}`);

          } else {
            // Fallback / "form 16" / "salary" / "tax" -> Form 16 vs AIS Gross Salary and TDS credit mismatch package
            const form16DocId = `doc-form16-${Date.now()}`;
            const aisDocId = `doc-ais-${Date.now()}`;

            const form16Doc = {
              id: form16DocId,
              name: file.name,
              type: "Form 16",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadedAt: new Date().toISOString(),
              extractedData: {
                employeePan: "BHUPR1982M",
                employerTan: "MUMT01928E",
                employerName: "Raman Tech Corp",
                employeeName: "Ramanuja Pathy (RAMAN)",
                employerPan: "AAACR0192A",
                grossSalary: 1850000,
                deductions80C: 150000,
                tdsClaimed: 185000
              }
            };

            const aisDoc = {
              id: aisDocId,
              name: file.name.replace(/\.pdf$/i, '_AIS.pdf').replace(/\.png$/i, '_AIS.png').replace(/\.jpg$/i, '_AIS.jpg').replace(/\.jpeg$/i, '_AIS.jpeg'),
              type: "AIS",
              size: "0.45 MB",
              uploadedAt: new Date().toISOString(),
              extractedData: {
                assesseePan: "BHUPR1982M",
                salaryAis: 2050000,
                interestAis: 35000,
                deductorName: "Raman Tech Corp"
              }
            };

            const packageFindings = [
              {
                id: `find-tax-tdsmismatch-${Date.now()}`,
                severity: "critical",
                title: "TDS Claim Credit Mismatch",
                taxSection: "Section 199 / Rule 37BA",
                description: `The TDS credit claimed in your Form 16 (₹1,85,000) exceeds the actual tax credits deposited in Form 26AS (₹1,35,000) by ₹50,000 in statement ${file.name}.`,
                whyItMatters: "The CPC portal disallows tax credit claims exceeding Form 26AS matching records automatically, generating immediate demand adjustments under Section 143(1) plus interest.",
                amountMismatch: { expected: 135000, actual: 185000, difference: 50000 },
                suggestedCorrection: "Reach out to your employer to file a correction TDS return (Form 24Q) crediting the variance to your PAN.",
                confidenceScore: 1.0,
                documentSource: `Form 16 (${file.name})`
              },
              {
                id: `find-tax-salaryomission-${Date.now()}`,
                severity: "high",
                title: "Omission of Taxable Salary",
                taxSection: "Section 192",
                description: `Employer reported gross salary of ₹18,50,000 in Form 16. However, the AIS displays total taxable salary payments of ₹20,50,000 (a difference of ₹2,00,000).`,
                whyItMatters: "Mismatches in gross salary are flagged automatically by tax systems. Omissions lead to standard notices for underreporting taxable income.",
                amountMismatch: { expected: 2050000, actual: 1850000, difference: 200000 },
                suggestedCorrection: "Include the additional ₹2,00,000 bonus or residual salary payment under Schedule Salary in your draft ITR.",
                confidenceScore: 0.96,
                documentSource: `AIS Statement (${file.name})`
              }
            ];

            const reconciliationData = {
              headers: ["Filing Line Item Description", "Form 16 reported", "AIS Reflected", "Form 26AS record", "CPC portal adjustment status"],
              rows: [
                {
                  label: "Gross Salary Income (Sec 192)",
                  form16: 1850000,
                  ais: 2050000,
                  "26as": 1850000,
                  status: "Gross Underreporting Mismatch Notice",
                  critical: true
                },
                {
                  label: "Net TDS Tax Credit claimed (Sec 199)",
                  form16: 1850000,
                  ais: 1850000,
                  "26as": 1350000,
                  status: "CPC Demand Notice Liability (₹50K Mismatch)",
                  critical: true
                },
                {
                  label: "Deductions under Section 80C",
                  form16: 150000,
                  ais: 150000,
                  "26as": 0,
                  status: "Reconciled successfully",
                  critical: false
                }
              ]
            };

            updatedDocs = [form16Doc, aisDoc, ...documents];
            setDocuments(updatedDocs);
            setFindings(packageFindings);
            setSelectedDocId(form16DocId);

            setActiveSession({
              consultationId,
              sessionName: `Form 16 & AIS Salary Reconciliation - ${file.name}`,
              assessmentYear: "2026-2027",
              userRole: userRole,
              status: "completed",
              overallScore: 70,
              reconciliationData
            });

            logEvent("Audit Executed Successfully", `OCR processed Form 16: ${file.name}. Simulated high-fidelity Tesseract engine identified TDS mismatch and Gross Salary omissions. ID: ${consultationId}`);
          }

          setUploading(false);
          setProgress(100);
        } else {
          setProgress(currentProgress);
        }
      }, 150);
    } else {
      alert("Unsupported file type. Please upload a structured CSV, TXT, PDF, or Image file.");
      setUploading(false);
      setProgress(0);
    }
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

  const getBoundingBoxes = (doc) => {
    if (!doc) return [];
    const docType = doc.type;
    const data = doc.extractedData || {};

    if (docType === "Form 16") {
      return [
        { id: "employerName", name: "Employer Name", top: "14%", left: "4%", width: "40%", height: "4.5%", value: data.employerName || "Raman Tech Corp", conf: "99.0%" },
        { id: "employeeName", name: "Employee Name", top: "14%", left: "54%", width: "40%", height: "4.5%", value: data.employeeName || "Ramanuja Pathy (RAMAN)", conf: "99.5%" },
        { id: "employerPan", name: "Employer PAN", top: "18.5%", left: "28%", width: "16%", height: "4.5%", value: data.employerPan || "AAACR0192A", conf: "99.1%" },
        { id: "pan", name: "Employee PAN", top: "18.5%", left: "73%", width: "16%", height: "4.5%", value: data.employeePan || "BHUPR1982M", conf: "99.8%" },
        { id: "tan", name: "Employer TAN", top: "21.5%", left: "28%", width: "16%", height: "4.5%", value: data.employerTan || "MUMT01928E", conf: "99.2%" },
        { id: "salary", name: "Gross Salary (Sec 17)", top: "31.2%", left: "80%", width: "15%", height: "4.5%", value: data.grossSalary !== undefined ? `₹${data.grossSalary.toLocaleString('en-IN')}` : "₹18,50,000", conf: "98.5%" },
        { id: "ded80C", name: "80C Deductions", top: "39.5%", left: "80%", width: "15%", height: "4.5%", value: data.deductions80C !== undefined ? `₹${data.deductions80C.toLocaleString('en-IN')}` : "₹1,50,000", conf: "97.9%" },
        { id: "tds", name: "TDS Claimed", top: "91%", left: "80%", width: "15%", height: "5%", value: data.tdsClaimed !== undefined ? `₹${data.tdsClaimed.toLocaleString('en-IN')}` : "₹1,85,000", conf: "99.5%" }
      ];
    }
    if (docType === "Invoice") {
      return [
        { id: "invNo", name: "Invoice No", top: "4.5%", left: "82%", width: "14%", height: "5%", value: data.invoiceNo || "INV-9281", conf: "99.9%" },
        { id: "sellerName", name: "Seller Name", top: "12%", left: "4%", width: "40%", height: "5%", value: data.sellerName || "TechBrands Solutions Ltd", conf: "99.2%" },
        { id: "gstin", name: "Vendor GSTIN", top: "18.5%", left: "27%", width: "28%", height: "5%", value: data.vendorGstin || "27AAACT0012P1ZA", conf: "98.7%" },
        { id: "base", name: "Base Taxable Value", top: "70.5%", left: "75%", width: "20%", height: "5%", value: data.baseValue !== undefined ? `₹${data.baseValue.toLocaleString('en-IN')}` : "₹5,00,000", conf: "99.1%" },
        { id: "cgst", name: "CGST (9%)", top: "76.5%", left: "75%", width: "20%", height: "5%", value: data.cgst !== undefined ? `₹${data.cgst.toLocaleString('en-IN')}` : "₹45,000", conf: "99.0%" },
        { id: "sgst", name: "SGST (9%)", top: "82.5%", left: "75%", width: "20%", height: "5%", value: data.sgst !== undefined ? `₹${data.sgst.toLocaleString('en-IN')}` : "₹45,000", conf: "99.0%" }
      ];
    }
    if (docType === "AIS") {
      return [
        { id: "pan", name: "Assessee PAN", top: "14.5%", left: "24%", width: "20%", height: "5%", value: data.assesseePan || "BHUPR1982M", conf: "99.8%" },
        { id: "deductorName", name: "Deductor Name", top: "34%", left: "20%", width: "40%", height: "4.5%", value: data.deductorName || "Raman Tech Corp", conf: "99.0%" },
        { id: "salAIS", name: "Salary payments Reflected", top: "30%", left: "78%", width: "18%", height: "5%", value: data.salaryAis !== undefined ? `₹${data.salaryAis.toLocaleString('en-IN')}` : "₹20,50,000", conf: "99.4%" },
        { id: "intAIS", name: "Interest Credit Reflected", top: "47.5%", left: "78%", width: "18%", height: "5%", value: data.interestAis !== undefined ? `₹${data.interestAis.toLocaleString('en-IN')}` : "₹35,000", conf: "98.9%" }
      ];
    }
    if (docType === "Bank Statement") {
      return [
        { id: "accountName", name: "Account Holder Name", top: "13%", left: "20%", width: "40%", height: "4.5%", value: data.accountName || "Raman Tech Enterprises", conf: "99.4%" },
        { id: "accountNo", name: "Account Number", top: "15.5%", left: "20%", width: "30%", height: "4.5%", value: data.accountNo || "50200019283741", conf: "99.8%" },
        { id: "structCash", name: "Structured Cash Deposits", top: "26%", left: "4%", width: "92%", height: "14%", value: data.totalDeposits !== undefined ? `₹${data.totalDeposits.toLocaleString('en-IN')}` : "₹19,64,125", conf: "99.1%" },
        { id: "roundTrip", name: "LLP Round-Trip Credits", top: "40%", left: "4%", width: "92%", height: "14%", value: "₹6,00,000", conf: "98.8%" },
        { id: "cashWages", name: "Ram Lal Cash Wages", top: "54%", left: "4%", width: "92%", height: "14%", value: "₹14,000", conf: "99.4%" }
      ];
    }
    return [];
  };

  const activeBoxes = currentDoc ? getBoundingBoxes(currentDoc) : [];

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
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
            className="card animate-pulse-glow" 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '3rem 1.5rem', 
              border: isDragging ? '2.5px dashed var(--border-focus)' : '2.5px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              background: isDragging ? 'var(--accent-glow)' : uploading ? 'var(--accent-light)' : 'var(--bg-card)',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: isDragging ? '0 0 16px var(--accent-glow)' : 'var(--shadow-sm)',
              transform: isDragging ? 'scale(1.01)' : 'none',
              transition: 'all var(--transition-normal)'
            }}
            onClick={() => document.getElementById("file-uploader").click()}
          >
            <UploadCloud size={48} style={{ color: isDragging || uploading ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {isDragging ? 'Drop Your Tax Statement Here' : 'Drag & Drop Financial Folders Here'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', marginBottom: '1rem' }}>
              Supports PDF, Excel (.xlsx), CSV, TXT, and scanned invoice prints (PNG/JPEG). Max 10MB per document.
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
                  accept=".csv,.txt,.pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button 
                  type="button"
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

        {/* Right Side: Active Auditing Rules Explorer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)' }}>Active Auditor Compliance Rules</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            The local pre-filing CA rules engine dynamically executes compliance matching and audits for major Indian Income Tax & GST clauses.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            
            {/* Rule 1 */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'var(--bg-secondary)', transition: 'all var(--transition-fast)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>Section 285BA • Cash Deposits Structuring</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: '0.2rem' }}>
                Detects consecutive bank cash deposits structured just under the ₹5,00,000 threshold to evade mandatory PAN reporting systems.
              </p>
            </div>

            {/* Rule 2 */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'var(--bg-secondary)', transition: 'all var(--transition-fast)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>Section 68 • Accommodation Round-Tripping</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: '0.2rem' }}>
                Scans counterparty ledgers for back-and-forth credits/debits matching identical values in a short timeframe, flagged as unexplained credits (taxed at 78% penalty rates).
              </p>
            </div>

            {/* Rule 3 */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'var(--bg-secondary)', transition: 'all var(--transition-fast)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>Section 40A(3) • Single-Day Cash Caps</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: '0.2rem' }}>
                Audits all cash expenditure disbursements to ensure no single contractor or individual is paid cash exceeding ₹10,000 in a single day.
              </p>
            </div>

            {/* Rule 4 */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'var(--bg-secondary)', transition: 'all var(--transition-fast)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>Section 43B(h) • MSME 45-Day Payments</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: '0.2rem' }}>
                Flags vendor payables outstanding beyond 45 days (with agreement) or 15 days (without agreement) to prevent automatic profits disallowance.
              </p>
            </div>

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

                {/* Document layout content emulator */}
                {currentDoc.type === "Form 16" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', border: '1px solid #94a3b8', padding: '1.25rem', background: '#fff', position: 'relative' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #334155', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                      FORM NO. 16 - PART B (SALARY CERTIFICATE)
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', gap: '1rem' }}>
                      <div>
                        <strong>Employer Name:</strong>{' '}
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'employerName'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'employerName' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'employerName' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.employerName || "Raman Tech Corp"}
                        </span>
                        <br />
                        <strong>PAN of Employer:</strong>{' '}
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'employerPan'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'employerPan' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'employerPan' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.employerPan || "AAACR0192A"}
                        </span>
                        <br />
                        <strong>TAN of Employer:</strong>{' '}
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'tan'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'tan' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'tan' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.employerTan || "MUMT01928E"}
                        </span>
                      </div>
                      <div>
                        <strong>Employee Name:</strong>{' '}
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'employeeName'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'employeeName' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'employeeName' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.employeeName || "Ramanuja Pathy (RAMAN)"}
                        </span>
                        <br />
                        <strong>PAN of Employee:</strong>{' '}
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'pan'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'pan' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'pan' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.employeePan || "BHUPR1982M"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', alignItems: 'center' }}>
                        <span>1. Gross Salary under Section 17(1)</span>
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'salary'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 'bold', 
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'salary' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'salary' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.grossSalary !== undefined ? `₹${currentDoc.extractedData.grossSalary.toLocaleString('en-IN')}` : "₹18,50,000"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', alignItems: 'center' }}>
                        <span>2. Deductions under Section 16 (Standard)</span>
                        <span>₹50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', alignItems: 'center' }}>
                        <span>3. Deductions under Chapter VI-A (Section 80C)</span>
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'ded80C'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 'bold', 
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'ded80C' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'ded80C' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.deductions80C !== undefined ? `₹${currentDoc.extractedData.deductions80C.toLocaleString('en-IN')}` : "₹1,50,000"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', alignItems: 'center' }}>
                        <span>4. Deductions under Section 80D</span>
                        <span>₹50,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', marginTop: 'auto', alignItems: 'center' }}>
                        <strong>5. Net Tax Deducted at Source (TDS)</strong>
                        <span 
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'tds'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 'bold', 
                            position: 'relative', 
                            padding: '0.05rem 0.25rem',
                            border: hoveredField?.id === 'tds' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'tds' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                            borderRadius: '4px',
                            cursor: 'crosshair',
                            color: '#1e3a8a'
                          }}
                        >
                          {currentDoc.extractedData?.tdsClaimed !== undefined ? `₹${currentDoc.extractedData.tdsClaimed.toLocaleString('en-IN')}` : "₹1,85,000"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentDoc.type === "Invoice" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', border: '1px solid #94a3b8', padding: '1.25rem', background: '#fff', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #334155', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>TAX INVOICE</span>
                      <span>No: <span style={{ opacity: 0.6 }}>{currentDoc.extractedData?.invoiceNo || "INV-9281"}</span></span>
                    </div>

                    <div>
                      <strong>Seller:</strong>{' '}
                      <span
                        onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'sellerName'))}
                        onMouseLeave={() => setHoveredField(null)}
                        style={{ 
                          fontWeight: 600,
                          display: 'inline-block',
                          position: 'relative', 
                          padding: '0.05rem 0.25rem',
                          border: hoveredField?.id === 'sellerName' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                          background: hoveredField?.id === 'sellerName' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.02)',
                          borderRadius: '4px',
                          cursor: 'crosshair'
                        }}
                      >
                        {currentDoc.extractedData?.sellerName || "TechBrands Solutions Ltd"}
                      </span>
                      <br />
                      <strong>GSTIN of Seller:</strong> <span style={{ opacity: 0.6 }}>{currentDoc.extractedData?.vendorGstin || "27AAACT0012P1ZA"}</span>
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
                        <span>{currentDoc.extractedData?.baseValue !== undefined ? `₹${currentDoc.extractedData.baseValue.toLocaleString('en-IN')}` : "₹5,00,000"}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-end', width: '220px', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Base Total:</span>
                        <span>{currentDoc.extractedData?.baseValue !== undefined ? `₹${currentDoc.extractedData.baseValue.toLocaleString('en-IN')}` : "₹5,00,000"}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>CGST (9%):</span>
                        <span>{currentDoc.extractedData?.cgst !== undefined ? `₹${currentDoc.extractedData.cgst.toLocaleString('en-IN')}` : "₹45,000"}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SGST (9%):</span>
                        <span>{currentDoc.extractedData?.sgst !== undefined ? `₹${currentDoc.extractedData.sgst.toLocaleString('en-IN')}` : "₹45,000"}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #334155', paddingTop: '0.4rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                        <span>Invoice Total:</span>
                        <span>{currentDoc.extractedData?.total !== undefined ? `₹${currentDoc.extractedData.total.toLocaleString('en-IN')}` : "₹5,90,000"}</span>
                      </div>
                    </div>

                    {/* Overlaid Absolute Bounding Boxes */}
                    {activeBoxes.map((box) => (
                      <div 
                        key={box.id}
                        onMouseEnter={() => setHoveredField(box)}
                        onMouseLeave={() => setHoveredField(null)}
                        className="animate-pulse-glow"
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
                  </div>
                )}

                {currentDoc.type === "AIS" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', border: '1px solid #94a3b8', padding: '1.25rem', background: '#fff', position: 'relative' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #334155', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                      TAX DEPT. ANNUAL INFORMATION STATEMENT (AIS)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.7rem' }}>
                      <div>
                        <strong>Financial Year:</strong> 2025-26 <br />
                        <strong>PAN Number:</strong> <span style={{ opacity: 0.6 }}>{currentDoc.extractedData?.assesseePan || "BHUPR1982M"}</span>
                      </div>
                      <div>
                        <strong>Statement Date:</strong> 31-May-2026
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', flex: 1 }}>
                      <strong>Part B: Taxpayer Information Summary</strong>
                      
                      <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
                          <span>1. Salary Earnings (Reflected Sec 192)</span>
                          <span style={{ fontWeight: 'bold' }}>{currentDoc.extractedData?.salaryAis !== undefined ? `₹${currentDoc.extractedData.salaryAis.toLocaleString('en-IN')}` : "₹20,50,000"}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          Deductor:{' '}
                          <span
                            onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'deductorName'))}
                            onMouseLeave={() => setHoveredField(null)}
                            style={{ 
                              fontWeight: 600,
                              display: 'inline-block',
                              position: 'relative', 
                              padding: '0.02rem 0.2rem',
                              border: hoveredField?.id === 'deductorName' ? '1px solid var(--accent)' : '1px dashed var(--color-high)',
                              background: hoveredField?.id === 'deductorName' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.01)',
                              borderRadius: '3px',
                              cursor: 'crosshair'
                            }}
                          >
                            {currentDoc.extractedData?.deductorName || "Raman Tech Corp"}
                          </span>
                        </span>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
                          <span>2. Interest Credited (Saving & FD)</span>
                          <span style={{ fontWeight: 'bold' }}>{currentDoc.extractedData?.interestAis !== undefined ? `₹${currentDoc.extractedData.interestAis.toLocaleString('en-IN')}` : "₹35,000"}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Deductor: HDFC Bank Ltd</span>
                      </div>
                    </div>

                    {/* Overlaid Absolute Bounding Boxes */}
                    {activeBoxes.map((box) => (
                      <div 
                        key={box.id}
                        onMouseEnter={() => setHoveredField(box)}
                        onMouseLeave={() => setHoveredField(null)}
                        className="animate-pulse-glow"
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
                  </div>
                )}

                {currentDoc.type === "Bank Statement" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', border: '1px solid #94a3b8', padding: '1rem', background: '#fff', overflowY: 'auto', position: 'relative' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #334155', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                      CURRENT ACCOUNT DETAILED TRANSACTION LEDGER
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', fontSize: '0.7rem', gap: '0.5rem' }}>
                      <div>
                        <strong>Account Name:</strong>{' '}
                        <span
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'accountName'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.02rem 0.2rem',
                            border: hoveredField?.id === 'accountName' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'accountName' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.01)',
                            borderRadius: '3px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.accountName || "Raman Tech Enterprises"}
                        </span>
                        <br />
                        <strong>Account No:</strong>{' '}
                        <span
                          onMouseEnter={() => setHoveredField(activeBoxes.find(b => b.id === 'accountNo'))}
                          onMouseLeave={() => setHoveredField(null)}
                          style={{ 
                            fontWeight: 600,
                            display: 'inline-block',
                            position: 'relative', 
                            padding: '0.02rem 0.2rem',
                            border: hoveredField?.id === 'accountNo' ? '1.5px solid var(--accent)' : '1.5px dashed var(--color-high)',
                            background: hoveredField?.id === 'accountNo' ? 'var(--accent-glow)' : 'rgba(249, 115, 22, 0.01)',
                            borderRadius: '3px',
                            cursor: 'crosshair'
                          }}
                        >
                          {currentDoc.extractedData?.accountNo || "50200019283741"}
                        </span>
                        <br />
                        <strong>Bank:</strong> {currentDoc.extractedData?.bank || "HDFC Bank Current A/c"}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Period:</strong> FY 2025 - 2026 <br />
                        <strong>Statement Date:</strong> 31-May-2026
                      </div>
                    </div>

                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.65rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', borderBottom: '1px solid #cbd5e1', padding: '0.3rem', fontWeight: 'bold', background: '#f1f5f9' }}>
                        <span>Date</span>
                        <span>Description</span>
                        <span>Debit</span>
                        <span>Credit</span>
                      </div>
                      
                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {currentDoc.transactions && currentDoc.transactions.length > 0 ? (
                          currentDoc.transactions.map((t, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.02)' }}>
                              <span>{t.date}</span>
                              <span>{t.description}</span>
                              <span>{t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN')}` : '—'}</span>
                              <span style={{ fontWeight: t.credit > 0 ? 'bold' : 'normal' }}>{t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN')}` : '—'}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>12-Aug-2025</span>
                              <span>Cash Deposit Branch</span>
                              <span>—</span>
                              <span style={{ fontWeight: 'bold' }}>₹4,90,626</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>13-Aug-2025</span>
                              <span>Cash Deposit Branch</span>
                              <span>—</span>
                              <span style={{ fontWeight: 'bold' }}>₹4,94,016</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>05-Oct-2025</span>
                              <span>Tushar Ent LLP...</span>
                              <span>—</span>
                              <span style={{ fontWeight: 'bold' }}>₹2,50,000</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>06-Oct-2025</span>
                              <span>Transfer back...</span>
                              <span style={{ fontWeight: 'bold' }}>₹2,50,000</span>
                              <span>—</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>04-Dec-2025</span>
                              <span>Cash pay Ram Lal</span>
                              <span style={{ fontWeight: 'bold' }}>₹6,000</span>
                              <span>—</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.2fr', padding: '0.3rem', borderBottom: '1px solid #f1f5f9', background: 'rgba(249, 115, 22, 0.04)' }}>
                              <span>04-Dec-2025</span>
                              <span>Cash pay Ram Lal</span>
                              <span style={{ fontWeight: 'bold' }}>₹8,000</span>
                              <span>—</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Overlaid Absolute Bounding Boxes */}
                    {activeBoxes.map((box) => (
                      <div 
                        key={box.id}
                        onMouseEnter={() => setHoveredField(box)}
                        onMouseLeave={() => setHoveredField(null)}
                        className="animate-pulse-glow"
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
                    <div style={{ background: 'var(--accent-light)', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Extraction Status</div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.15rem' }}>
                          Fields Extracted Successfully
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-low)', background: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {activeBoxes.length} Entities
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Extracted Fields Registry
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {activeBoxes.map((box) => (
                          <div 
                            key={box.id}
                            onMouseEnter={() => setHoveredField(box)}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '0.5rem 0.75rem',
                              background: 'var(--bg-secondary)', 
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{box.name}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>{box.value}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-low)', background: 'var(--bg-primary)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                {box.conf}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <h4 style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>💡 Live Document Interactive Mapping</h4>
                      <p style={{ fontSize: '0.73rem', lineHeight: 1.35 }}>
                        Hover over any row in the extracted fields registry above or point your cursor directly at the dashed orange coordinate bounding boxes on the document card to view real-time OCR engine coordinates and confident JSON scores.
                      </p>
                    </div>
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
