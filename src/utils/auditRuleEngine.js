/**
 * Deterministic Audit Rule Engine for Indian Income Tax & GST Compliance
 */

// 1. Section 199: TDS Credit Mismatch Rule
export function auditTdsCredit(form16Tds, Form26AsTds) {
  const diff = form16Tds - Form26AsTds;
  if (diff > 0) {
    return {
      severity: "critical",
      title: "TDS Claim Credit Mismatch",
      taxSection: "Section 199 / Rule 37BA",
      description: `The TDS credit claimed in your Form 16 (₹${form16Tds.toLocaleString('en-IN')}) exceeds the actual tax credits deposited in Form 26AS (₹${Form26AsTds.toLocaleString('en-IN')}) by ₹${diff.toLocaleString('en-IN')}.`,
      whyItMatters: "The CPC portal disallows tax credit claims exceeding Form 26AS matching records automatically, generating immediate demand adjustments under Section 143(1) plus interest.",
      amountMismatch: { expected: Form26AsTds, actual: form16Tds, difference: diff },
      suggestedCorrection: "Reach out to your employer to file a correction TDS return (Form 24Q) crediting the variance to your PAN.",
      confidenceScore: 1.0
    };
  }
  return null;
}

// 2. Section 192: Gross Salary Omission Rule
export function auditGrossSalary(form16Gross, aisGross) {
  const diff = aisGross - form16Gross;
  if (diff > 0) {
    return {
      severity: "high",
      title: "Omission of Taxable Salary",
      taxSection: "Section 192",
      description: `Employer reported gross salary of ₹${form16Gross.toLocaleString('en-IN')} in Form 16. However, the AIS displays total taxable salary payments of ₹${aisGross.toLocaleString('en-IN')} (a difference of ₹${diff.toLocaleString('en-IN')}).`,
      whyItMatters: "Mismatches in gross salary are flagged automatically by tax systems. Omissions lead to standard notices for underreporting taxable income.",
      amountMismatch: { expected: aisGross, actual: form16Gross, difference: diff },
      suggestedCorrection: "Include the additional ₹${diff.toLocaleString('en-IN')} bonus or residual salary payment under Schedule Salary in your active ITR.",
      confidenceScore: 0.96
    };
  }
  return null;
}

// 3. GST Section 16: ITC Expensed in Books Rule
export function auditGstItcExpensing(invoiceBase, invoiceGst, ledgerAmount) {
  const totalInvoice = invoiceBase + invoiceGst;
  const isExpensedFlat = Math.abs(ledgerAmount - totalInvoice) < 10;
  
  if (isExpensedFlat && invoiceGst > 0) {
    return {
      severity: "critical",
      title: "Incorrect Expensing of GST Input Credit",
      taxSection: "GST CGST Act Section 16",
      description: `Invoice total of ₹${totalInvoice.toLocaleString('en-IN')} (including ₹${invoiceGst.toLocaleString('en-IN')} tax) was charged as a flat expense to your General Ledger. No separate GST Input Tax Credit asset was booked.`,
      whyItMatters: "Expensing the tax portion reduces corporate profits incorrectly while forfeiting the valuable Input Tax Credit asset, inflating your cash GST payment liabilities.",
      amountMismatch: { expected: invoiceBase, actual: ledgerAmount, difference: invoiceGst },
      suggestedCorrection: "Pass a journal voucher to debit GST Input Tax Credit asset by ₹${invoiceGst.toLocaleString('en-IN')} and credit the respective Expense ledger.",
      confidenceScore: 0.98
    };
  }
  return null;
}

// 4. Section 40A(3): Daily Cash Expense Limits Rule
export function auditCashPaymentsLimit(payments) {
  // Payments is expected to be an array: { person: string, amount: number, date: string }
  const dailyPersonTotals = {};
  const violations = [];

  payments.forEach(p => {
    const key = `${p.person}_${p.date}`;
    dailyPersonTotals[key] = (dailyPersonTotals[key] || 0) + p.amount;
  });

  Object.keys(dailyPersonTotals).forEach(key => {
    const total = dailyPersonTotals[key];
    const [person, date] = key.split('_');
    if (total > 10000) {
      violations.push({
        severity: "high",
        title: "Cash Payments Exceeding Section 40A(3)",
        taxSection: "Section 40A(3)",
        description: `Aggregate cash expenditure of ₹${total.toLocaleString('en-IN')} was paid to supervisor '${person}' on date ${date}.`,
        whyItMatters: "Section 40A(3) disallows tax deductions for business expenses paid in cash exceeding ₹10,000 to a single individual in a single day, increasing taxable profits directly.",
        amountMismatch: { expected: 10000, actual: total, difference: total - 10000 },
        suggestedCorrection: "Pay wages exceeding ₹10,000 using digital bank transfers (IMPS/NEFT/UPI) to supervisor bank accounts.",
        confidenceScore: 0.95
      });
    }
  });

  return violations;
}

// 5. Section 43B(h): MSME Overdue Liabilities Rule
export function auditMsmePayments(liabilities) {
  // liabilities: { vendor: string, amount: number, daysOutstanding: number }
  const violations = [];
  liabilities.forEach(l => {
    if (l.daysOutstanding > 45) {
      violations.push({
        severity: "high",
        title: "MSME Overdue Liability (Section 43B(h))",
        taxSection: "Section 43B(h)",
        description: `Payable liability of ₹${l.amount.toLocaleString('en-IN')} to MSME vendor '${l.vendor}' has remained outstanding for ${l.daysOutstanding} days.`,
        whyItMatters: "Under Section 43B(h), any expense liability to registered MSMEs outstanding beyond 45 days is disallowed as a deduction for the financial year, dramatically increasing tax liability.",
        amountMismatch: { expected: 45, actual: l.daysOutstanding, difference: l.daysOutstanding - 45 },
        suggestedCorrection: "Clear outstanding dues to MSME suppliers immediately before the tax filing due date to restore expense deductibility.",
        confidenceScore: 0.97
      });
    }
  });
  return violations;
}

// 6. Section 285BA: Cash Structuring in Bank Accounts
export function auditCashStructuring(deposits) {
  // deposits: Array of deposit amounts in a short period
  const total = deposits.reduce((sum, d) => sum + d, 0);
  const isStructured = deposits.length >= 3 && deposits.every(d => d >= 450000 && d < 500000);

  if (isStructured) {
    return {
      severity: "critical",
      title: "Suspicious Structured Cash Deposits",
      taxSection: "Section 285BA (SFT Reporting)",
      description: `Detected ${deposits.length} cash deposits of identical value below ₹5,00,000 within a short period (Total: ₹${total.toLocaleString('en-IN')}).`,
      whyItMatters: "Depositing cash just below the ₹5,00,000 PAN threshold is flagged as 'structuring' by anti-money laundering algorithms. Banks are legally bound to submit Suspicious Transaction Reports (STR).",
      amountMismatch: { expected: 0, actual: total, difference: total },
      suggestedCorrection: "Supply clear tax sales invoices matching cash flows to substantiate bank receipts in tax returns.",
      confidenceScore: 0.94
    };
  }
  return null;
}
