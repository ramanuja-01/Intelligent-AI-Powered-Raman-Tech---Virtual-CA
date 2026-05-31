export const mockAuditPackages = [
  {
    id: "pkg-salary-mismatch",
    name: "Salary Tax & TDS Mismatch Package",
    description: "Audits Form 16 (Salary Certificate) against AIS (Annual Information Statement) and Form 26AS (Tax Credit Statement) to spot omissions and TDS claims mismatches.",
    overallScore: 68,
    documents: [
      {
        id: "doc-f16",
        name: "Form_16_Part_B_Raman.pdf",
        type: "Form 16",
        size: "1.8 MB",
        uploadedAt: "2026-05-31T14:15:00Z",
        extractedData: {
          pan: "BHUPR1982M",
          employerTan: "MUMT01928E",
          grossSalary: 1850000,
          deductions80C: 150000,
          deductions80D: 50000,
          tdsClaimed: 185000
        }
      },
      {
        id: "doc-ais",
        name: "AIS_Annual_Information_Statement.pdf",
        type: "AIS",
        size: "3.2 MB",
        uploadedAt: "2026-05-31T14:15:20Z",
        extractedData: {
          pan: "BHUPR1982M",
          salaryReported: 2050000,
          interestIncome: 35000,
          mutualFundSales: 120000
        }
      },
      {
        id: "doc-26as",
        name: "Form_26AS_Tax_Credits.pdf",
        type: "Form 26AS",
        size: "1.4 MB",
        uploadedAt: "2026-05-31T14:15:40Z",
        extractedData: {
          pan: "BHUPR1982M",
          totalTdsDeposited: 165000
        }
      }
    ],
    findings: [
      {
        id: "find-sal-1",
        title: "TDS Claim Credit Mismatch",
        documentSource: "Form 16 vs Form 26AS",
        taxSection: "Section 199 / Rule 37BA",
        severity: "critical",
        description: "The TDS credit claimed in your Form 16 (₹1,85,000) exceeds the actual tax deposited by your employer in Form 26AS (₹1,65,000) by ₹20,000.",
        whyItMatters: "The Centralized Processing Center (CPC) will disallow this excess claim of ₹20,000 automatically, resulting in an immediate tax demand notice under Section 143(1) plus interest.",
        amountMismatch: {
          expected: 165000,
          actual: 185000,
          difference: 20000
        },
        suggestedCorrection: "Reach out to your employer's HR or payroll team. Request them to file a correction TDS return (Form 24Q) to credit the remaining ₹20,000 under your PAN.",
        confidenceScore: 0.99
      },
      {
        id: "find-sal-2",
        title: "Omission of Taxable Salary",
        documentSource: "Form 16 vs AIS (Annual Information Statement)",
        taxSection: "Section 192",
        severity: "high",
        description: "Your employer reported Gross Salary of ₹18,50,000 in your Form 16. However, the AIS displays total taxable salary payments of ₹20,50,000 (a difference of ₹2,00,000).",
        whyItMatters: "This suggests a Q4 bonus, ex-gratia, or previous employer payment was omitted in your Form 16 Part B but reported by the deductor. Filing with Form 16 numbers will flag a red alert for income underreporting.",
        amountMismatch: {
          expected: 2050000,
          actual: 185000, // gross salary reported
          difference: 200000
        },
        suggestedCorrection: "Verify if the ₹2,00,000 represents a sign-on/performance bonus or salary from a previous employer. You must include this additional ₹2,00,000 in your ITR taxable salary to avoid an underreporting notice.",
        confidenceScore: 0.95
      },
      {
        id: "find-sal-3",
        title: "Unreported Mutual Fund Redemption",
        documentSource: "AIS",
        taxSection: "Section 111A / 112A",
        severity: "medium",
        description: "The AIS reports a sale transaction of Mutual Funds valued at ₹1,20,000, which has not been declared in your draft tax filing documents.",
        whyItMatters: "All mutual fund redemptions are reported to the IT department via Statement of Financial Transactions (SFT). Omission of Capital Gains will trigger automated income-tax compliance notices.",
        amountMismatch: {
          expected: 120000,
          actual: 0,
          difference: 120000
        },
        suggestedCorrection: "Obtain the Capital Gains statement from CAMS/KFintech or your broker, compute short-term (STCG) or long-term (LTCG) capital gains, and file Schedule CG in your ITR-2.",
        confidenceScore: 0.92
      },
      {
        id: "find-sal-4",
        title: "Excess Section 80D Claim Check",
        documentSource: "Form 16",
        taxSection: "Section 80D",
        severity: "low",
        description: "A claim under Section 80D for medical insurance premium is entered as ₹50,000. Under current rules, the limit is ₹25,000 for self/spouse/children unless senior citizen criteria apply.",
        whyItMatters: "Claiming deductions above statutory limits without designating senior citizen status triggers mathematical corrections and raises the overall filing audit score risk.",
        amountMismatch: {
          expected: 25000,
          actual: 50000,
          difference: 25000
        },
        suggestedCorrection: "Ensure the extra ₹25,000 premium is for parents or senior citizens. If it is entirely for self/spouse/children, reduce the claim limit to ₹25,000.",
        confidenceScore: 0.88
      }
    ],
    reconciliationData: {
      headers: ["Income Head / Credit", "Form 16 Reported", "AIS Reported", "26AS Reflecting", "Variance / Action"],
      rows: [
        { label: "Gross Salary (Sec 17)", form16: 1850000, ais: 2050000, "26as": 1850000, status: "Mismatch: -₹2,00,000", critical: true },
        { label: "TDS Credit claimed", form16: 185000, ais: 165000, "26as": 165000, status: "Mismatch: +₹20,000", critical: true },
        { label: "Interest Income", form16: 0, ais: 35000, "26as": 0, status: "Omission: -₹35,000", critical: false },
        { label: "Sec 80C Deductions", form16: 150000, ais: 150000, "26as": 0, status: "Reconciled", critical: false },
        { label: "Sec 80D Deductions", form16: 50000, ais: 0, "26as": 0, status: "Verify Limit (₹25K)", critical: false }
      ]
    },
    checklist: {
      panAadhaarLinked: true,
      deductionsVerified: false,
      interestIncomeDeclared: false,
      capitalGainsAdded: false,
      tdsVerified26AS: false
    }
  },
  {
    id: "pkg-gst-ledger",
    name: "GST Invoices vs Ledger Audit Package",
    description: "Compares GSTR-2B Input Tax Credit (ITC) data against General Ledgers and Sales/Purchase Invoices to identify unclaimed tax assets and incorrect expensing.",
    overallScore: 74,
    documents: [
      {
        id: "doc-gstr2b",
        name: "GSTR_2B_Auto_Drafted_ITC.csv",
        type: "GSTR-2B",
        size: "820 KB",
        uploadedAt: "2026-05-31T14:16:00Z",
        extractedData: {
          gstin: "27AAACT0012P1ZA",
          availableItcCGST: 45000,
          availableItcSGST: 45000,
          unmatchedCount: 2
        }
      },
      {
        id: "doc-purchase-ledger",
        name: "Purchase_General_Ledger.xlsx",
        type: "Ledger",
        size: "2.1 MB",
        uploadedAt: "2026-05-31T14:16:15Z",
        extractedData: {
          totalDebits: 1450000,
          totalCredits: 0,
          entries: 120
        }
      },
      {
        id: "doc-invoice-vendor",
        name: "Invoice_9281_TechBrands.json",
        type: "Invoice",
        size: "45 KB",
        uploadedAt: "2026-05-31T14:16:30Z",
        extractedData: {
          invoiceNo: "INV-9281",
          vendorGstin: "27AAACT0012P1ZA",
          baseValue: 500000,
          cgst9: 45000,
          sgst9: 45000,
          grandTotal: 590000
        }
      }
    ],
    findings: [
      {
        id: "find-gst-1",
        title: "Incorrect Expensing of GST Input Credit",
        documentSource: "Invoice INV-9281 vs Purchase Ledger",
        taxSection: "GST CGST Act Section 16",
        severity: "critical",
        description: "Invoice INV-9281 was entered in the Purchase Ledger as a flat expense of ₹5,90,000. The GST split (CGST ₹45,000 + SGST ₹45,000) was not extracted to the GST Input Tax Credit ledger.",
        whyItMatters: "By recording the tax component as a direct expense, you failed to claim input tax credit (ITC) of ₹90,000, inflating your operational expenses and paying ₹90,000 extra GST cash liability.",
        amountMismatch: {
          expected: 500000, // base value should be expensed
          actual: 590000, // total was expensed
          difference: 90000
        },
        suggestedCorrection: "Pass a journal voucher to debit GST Input Tax Credit (CGST ₹45,000, SGST ₹45,000) and credit Purchase Expense Ledger by ₹90,000. Reconcile in GSTR-3B.",
        confidenceScore: 0.97
      },
      {
        id: "find-gst-2",
        title: "Duplicate Expense Entry Detected",
        documentSource: "Purchase Ledger",
        taxSection: "Accounting Standards / AS 1",
        severity: "high",
        description: "Two identical ledger transactions of ₹2,95,000 each were posted to 'Office Maintenance' on 12th May and 14th May, referencing the same voucher ID (V-8289).",
        whyItMatters: "Posting the same expense twice artificially reduces your taxable profits, which represents an compliance risk under regular corporate income tax assessments.",
        amountMismatch: {
          expected: 295000,
          actual: 590000,
          difference: 295000
        },
        suggestedCorrection: "Inspect the secondary transaction on 14th May. If verified as a duplicate system posting, reverse the double debit entry to reflect accurate ledger integrity.",
        confidenceScore: 0.94
      },
      {
        id: "find-gst-3",
        title: "Active GSTIN Status Mismatch",
        documentSource: "Invoice vs GST Portal Query",
        taxSection: "GST Rules Section 31",
        severity: "medium",
        description: "The supplier GSTIN (27AAACT0012P1ZA) on Invoice INV-9281 is listed as 'Suspended/Cancelled' in the active GST registration indices prior to the invoice date.",
        whyItMatters: "Claiming Input Tax Credit (ITC) from invoices issued by cancelled or non-filing suppliers is disallowed under Section 16(2)(c) of the GST Act. This will result in an automated demand notice (GSTR-88C).",
        amountMismatch: {
          expected: 0,
          actual: 90000,
          difference: 90000
        },
        suggestedCorrection: "Withhold payment of the tax portion (₹90,000) or reverse the ITC in GSTR-3B Table 4(B)(2) until the supplier regularizes their GST registration status.",
        confidenceScore: 0.91
      }
    ],
    reconciliationData: {
      headers: ["Transaction Description", "GSTR-2B ITC Auto-Reflected", "Books of Accounts Claim", "Variance / Action", "Status"],
      rows: [
        { label: "Invoice INV-9281 (TechBrands)", form16: 90000, ais: 0, "26as": 0, status: "Books under-claimed: -₹90,000", critical: true },
        { label: "Office Maintenance Double-debit", form16: 0, ais: 295000, "26as": 0, status: "Books over-claimed: +₹2,95,000", critical: true },
        { label: "Supplier Status Check", form16: 90000, ais: 90000, "26as": 0, status: "Suspended GSTIN - Block ITC", critical: false }
      ]
    },
    checklist: {
      panAadhaarLinked: true,
      deductionsVerified: true,
      interestIncomeDeclared: true,
      capitalGainsAdded: true,
      tdsVerified26AS: false
    }
  },
  {
    id: "pkg-suspicious-bank",
    name: "Suspicious Bank Ledger Audit Package",
    description: "Analyzes bank cash transactions and journal ledger entries to detect tax evasion hazards, PAN reporting thresholds, and anomalous round-tripping.",
    overallScore: 52,
    documents: [
      {
        id: "doc-bank",
        name: "HDFC_Current_Account_Export.csv",
        type: "Bank Statement",
        size: "3.4 MB",
        uploadedAt: "2026-05-31T14:17:00Z",
        extractedData: {
          accountNo: "50200019283741",
          totalDeposits: 4250000,
          totalWithdrawals: 3800000
        }
      },
      {
        id: "doc-cash-ledger",
        name: "Cash_Book_Ledger.xlsx",
        type: "Ledger",
        size: "1.5 MB",
        uploadedAt: "2026-05-31T14:17:15Z",
        extractedData: {
          balanceOnHand: 185000,
          negativeDays: 0
        }
      }
    ],
    findings: [
      {
        id: "find-susp-1",
        title: "Suspicious Structured Cash Deposits",
        documentSource: "Bank Statement Transactions",
        taxSection: "Section 285BA (SFT Reporting)",
        severity: "critical",
        description: "Four consecutive cash deposits of ₹4,90,000 each were made into your current account within a span of 5 days (Total: ₹19,60,000).",
        whyItMatters: "Depositing cash just below the statutory reporting threshold of ₹5,00,000 is classified as 'structuring' (smurfing) by financial intelligence. Banks are mandated to submit a Suspicious Transaction Report (STR). This will trigger automatic scrutiny notices.",
        amountMismatch: {
          expected: 0,
          actual: 1960000,
          difference: 1960000
        },
        suggestedCorrection: "Verify the legal source of cash receipts. Ensure all deposits match corresponding cash sales invoices and are declared fully in your Income Tax Return business earnings.",
        confidenceScore: 0.96
      },
      {
        id: "find-susp-2",
        title: "Potential Round-Tripping Anomalies",
        documentSource: "Bank Statement Ledger Matches",
        taxSection: "Section 68 (Unexplained Credits)",
        severity: "high",
        description: "A transfer of ₹2,50,000 was debited to vendor 'Shree Balaji Traders' on 18th May. On the same day, an incoming payment of ₹2,48,000 was received from the same entity, marked as 'Short-term Loan Refund'. No loan agreements were located.",
        whyItMatters: "Quick back-and-forth round-tripping of funds without clear commercial justification is treated as accommodation entries (money laundering) by tax assessors, leading to additions under Section 68 taxed at 78% (including surcharge/penalty).",
        amountMismatch: {
          expected: 0,
          actual: 248000,
          difference: 248000
        },
        suggestedCorrection: "Supply valid credit loan contracts, interest payment receipts, or formal invoices showing business services. Unsubstantiated entries should be corrected to avoid extreme penalty tax brackets.",
        confidenceScore: 0.90
      },
      {
        id: "find-susp-3",
        title: "Cash Payments Exceeding Section 40A(3)",
        documentSource: "Cash Ledger",
        taxSection: "Section 40A(3)",
        severity: "high",
        description: "Three cash expenditure entries for 'Site Wages' of ₹28,000, ₹32,000, and ₹15,000 were paid in cash to a single supervisor in a single day.",
        whyItMatters: "Section 40A(3) disallows any business expense deduction paid in cash exceeding ₹10,000 per person per day. These wage expenses will be disallowed in tax computations, increasing tax liability.",
        amountMismatch: {
          expected: 10000,
          actual: 75000,
          difference: 65000
        },
        suggestedCorrection: "Wages exceeding ₹10,000 should be paid via bank transfer (IMPS/NEFT/UPI) to supervisor bank accounts to remain deductible under tax regulations.",
        confidenceScore: 0.95
      }
    ],
    reconciliationData: {
      headers: ["Bank Transaction Date & Memo", "Bank Debit/Credit", "Ledger Matches", "Tax Risk Exposure", "Severity"],
      rows: [
        { label: "Cash Deposits 12-16 May (Structured)", form16: 1960000, ais: 1960000, "26as": 0, status: "SFT Reporting Structuring Hazard", critical: true },
        { label: "Balaji Traders Round-trip", form16: 250000, ais: 248000, "26as": 0, status: "Section 68 Unexplained Credit (78% Tax)", critical: true },
        { label: "Supervisor Wages in Cash", form16: 0, ais: 75000, "26as": 0, status: "Section 40A(3) Expense Disallowance (>₹10K)", critical: false }
      ]
    },
    checklist: {
      panAadhaarLinked: true,
      deductionsVerified: false,
      interestIncomeDeclared: false,
      capitalGainsAdded: false,
      tdsVerified26AS: false
    }
  }
];
