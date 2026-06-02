import { 
  auditCashPaymentsLimit, 
  auditCashStructuring 
} from './auditRuleEngine';

/**
 * Client-Side CSV Parser & Transaction Auditor
 */

// Helper to parse a line of CSV/TXT, respecting quotes and auto-detecting delimiters (comma or tab)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  // Auto-detect delimiter (e.g. tab for .txt statements, semicolon, or standard comma)
  let delimiter = ',';
  if (!line.includes(',') && line.includes('\t')) delimiter = '\t';
  else if (!line.includes(',') && line.includes(';')) delimiter = ';';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses the raw CSV text from a bank statement
 * @param {string} csvText 
 * @returns {Array<Object>} transactions
 */
export function parseBankStatementCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  let headerIdx = -1;
  let dateIdx = -1;
  let descIdx = -1;
  let headers = [];

  // Robustly scan the first 15 lines for the actual transaction headers
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const parsedLine = parseCSVLine(lines[i]).map(h => h.toLowerCase().replace(/^\ufeff/, '').trim());
    const dIdx = parsedLine.findIndex(h => h.includes('date'));
    const dsIdx = parsedLine.findIndex(h => h.includes('description') || h.includes('particulars') || h.includes('narration') || h.includes('details') || h.includes('memo'));

    if (dIdx !== -1 && (dsIdx !== -1 || parsedLine.includes('debit') || parsedLine.includes('credit') || parsedLine.includes('withdrawal') || parsedLine.includes('deposit'))) {
      headerIdx = i;
      dateIdx = dIdx;
      // If we couldn't find a direct description but found synonyms
      descIdx = dsIdx !== -1 ? dsIdx : parsedLine.findIndex(h => h.includes('narration') || h.includes('particulars') || h.includes('memo') || h.includes('details'));
      if (descIdx === -1) descIdx = 1; // standard fallback to column 2
      headers = parsedLine;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error("Invalid statement format: CSV must contain Date and Description columns.");
  }

  const refIdx = headers.findIndex(h => h.includes('reference') || h.includes('ref') || h.includes('txn') || h.includes('no.'));
  const debitIdx = headers.findIndex(h => h.includes('withdrawal') || h.includes('debit') || h.includes('dr') || h.includes('paid out'));
  const creditIdx = headers.findIndex(h => h.includes('deposit') || h.includes('credit') || h.includes('cr') || h.includes('received in'));
  const balIdx = headers.findIndex(h => h.includes('balance'));

  const transactions = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < Math.max(dateIdx, descIdx) + 1) continue;

    const date = fields[dateIdx] || '';
    const description = fields[descIdx] || '';
    const refNo = refIdx !== -1 && fields[refIdx] ? fields[refIdx] : `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    
    const rawDebit = debitIdx !== -1 ? fields[debitIdx] : '';
    const rawCredit = creditIdx !== -1 ? fields[creditIdx] : '';
    const rawBalance = balIdx !== -1 ? fields[balIdx] : '';

    const debit = rawDebit ? parseFloat(rawDebit.replace(/[^0-9.-]/g, '')) || 0 : 0;
    const credit = rawCredit ? parseFloat(rawCredit.replace(/[^0-9.-]/g, '')) || 0 : 0;
    const balance = rawBalance ? parseFloat(rawBalance.replace(/[^0-9.-]/g, '')) || 0 : 0;

    transactions.push({
      date,
      description,
      refNo,
      debit,
      credit,
      balance
    });
  }

  return transactions;
}

function safeParseDate(dateStr) {
  if (!dateStr) return new Date();
  
  const trimmed = dateStr.trim();
  
  // 1. Try numeric DD-MM-YYYY or DD/MM/YYYY first (common in Indian bank formats)
  const numericMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (numericMatch) {
    const day = parseInt(numericMatch[1], 10);
    const month = parseInt(numericMatch[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(numericMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  // 2. Try DD-MMM-YYYY or DD/MMM/YYYY format (e.g. 12-Aug-2025)
  const alphaMatch = trimmed.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})$/);
  if (alphaMatch) {
    const day = parseInt(alphaMatch[1], 10);
    const monthName = alphaMatch[2].toLowerCase();
    const year = parseInt(alphaMatch[3], 10);
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthName.slice(0, 3)];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  // 3. Fallback to standard Date.parse
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) return new Date(parsed);

  return new Date();
}

/**
 * Custom rule validator for round-tripping
 * Matches incoming (credit) and outgoing (debit) transactions to the same entity within a 5-day window
 */
export function auditRoundTripping(transactions) {
  const roundTrippingViolations = [];
  const creditTrans = transactions.filter(t => t.credit > 0);
  const debitTrans = transactions.filter(t => t.debit > 0);

  // Helper to extract clean entity name
  const extractEntity = (desc) => {
    // Look for names like "Tushar Enterprises LLP" or "Shree Balaji Traders"
    const match = desc.match(/(?:from|to|received from|transfer back to)\s+([^,(\n\-]+)/i);
    if (match) return match[1].trim();

    // Secondary fallback
    const words = desc.split(/\s+/);
    const stopWords = ['funds', 'received', 'transfer', 'back', 'disbursed', 'cash', 'at', 'self', 'branch', 'counter', 'payment', 'invoice'];
    const filtered = words.filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2);
    return filtered.slice(0, 3).join(' ') || 'Unknown Entity';
  };

  // Group by Entity
  const entityCredits = {};
  creditTrans.forEach(t => {
    const ent = extractEntity(t.description);
    if (!entityCredits[ent]) entityCredits[ent] = [];
    entityCredits[ent].push(t);
  });

  const matchedKeys = new Set();

  debitTrans.forEach(dt => {
    const ent = extractEntity(dt.description);
    const credits = entityCredits[ent];
    if (!credits) return;

    // Check if there is an matching credit within e.g. 5 days and close value
    credits.forEach(ct => {
      const key = `${ct.refNo}_${dt.refNo}`;
      if (matchedKeys.has(key)) return;

      const dateDiffDays = Math.abs(safeParseDate(ct.date) - safeParseDate(dt.date)) / (1000 * 60 * 60 * 24);
      const valDiffPercent = Math.abs(ct.credit - dt.debit) / Math.max(ct.credit, dt.debit);

      // Check if dates are within 5 days and values are within 5%
      if (dateDiffDays <= 5 && valDiffPercent <= 0.05) {
        matchedKeys.add(key);
        
        roundTrippingViolations.push({
          severity: "high",
          title: "Potential Round-Tripping Anomalies",
          documentSource: "Bank Statement Ledger Matches",
          taxSection: "Section 68 (Unexplained Credits)",
          description: `A transfer of ₹${dt.debit.toLocaleString('en-IN')} was debited to vendor '${ent}' on ${dt.date}. Near the same day (${ct.date}), an incoming credit of ₹${ct.credit.toLocaleString('en-IN')} was received from the same entity, representing a round-trip voucher match.`,
          whyItMatters: "Rapid back-and-forth round-tripping of capital with counterparties lacks commercial substance and is classified as accommodation entries. This triggers severe tax addition assessments under Section 68, taxed at penal 78% rates.",
          amountMismatch: {
            expected: 0,
            actual: ct.credit,
            difference: ct.credit
          },
          suggestedCorrection: "Verify and maintain valid commercial contracts, service invoices, or formal credit loan agreements to validate these ledger credits under tax audits.",
          confidenceScore: 0.90
        });
      }
    });
  });

  return roundTrippingViolations;
}

/**
 * Audits the parsed transaction array and returns findings and scoring models
 * @param {Array<Object>} transactions 
 * @param {string} fileName 
 * @returns {Object} auditResult
 */
export function auditParsedTransactions(transactions, fileName) {
  const findings = [];
  
  // 1. Audit Section 285BA - Structured Cash Deposits
  const cashDeposits = transactions
    .filter(t => t.credit > 0 && (t.description.toLowerCase().includes('cash deposit') || t.description.toLowerCase().includes('self counter')))
    .map(t => t.credit);
  
  const structuringFinding = auditCashStructuring(cashDeposits);
  if (structuringFinding) {
    findings.push({
      id: "find-parsed-structuring",
      ...structuringFinding,
      documentSource: `Bank Statement (${fileName})`
    });
  }

  // 2. Audit Section 40A(3) - Cash Payments Cap
  // Look for debit transactions with keywords indicating cash paid to people
  const cashPayments = [];
  transactions.filter(t => t.debit > 0 && t.description.toLowerCase().includes('cash')).forEach(t => {
    // Extract person name from descriptions like "Cash disbursed to Ram Lal (Contractor) for site labor"
    const match = t.description.match(/(?:disbursed to|paid to|pay to|payment to|pay|to)\s+(.+?)(?=\s+for|\s*$)/i);
    const person = match ? match[1].trim() : "Supervisor / Laborer";
    cashPayments.push({
      person,
      amount: t.debit,
      date: t.date
    });
  });

  const dailyViolations = auditCashPaymentsLimit(cashPayments);
  dailyViolations.forEach((v, idx) => {
    findings.push({
      id: `find-parsed-cashlimit-${idx}`,
      ...v,
      documentSource: `Cash Ledger (${fileName})`
    });
  });

  // 3. Audit Section 68 - Round Tripping
  const roundTrippingViolations = auditRoundTripping(transactions);
  roundTrippingViolations.forEach((v, idx) => {
    findings.push({
      id: `find-parsed-roundtrip-${idx}`,
      ...v,
      documentSource: `Bank Statement Matches (${fileName})`
    });
  });

  // 4. Calculate overall compliance score based on severity of issues found
  let overallScore = 100;
  findings.forEach(f => {
    if (f.severity === 'critical') overallScore -= 18;
    else if (f.severity === 'high') overallScore -= 12;
    else if (f.severity === 'medium') overallScore -= 6;
    else if (f.severity === 'low') overallScore -= 3;
  });
  overallScore = Math.max(overallScore, 20); // cap at min 20%

  // 5. Compile Reconciliation Data Rows
  const reconciliationRows = [];
  
  // Structured cash deposits row
  if (cashDeposits.length > 0) {
    const totalCash = cashDeposits.reduce((s, c) => s + c, 0);
    const hasStructuring = !!structuringFinding;
    reconciliationRows.push({
      label: "Structured Cash Deposits (Sec 285BA)",
      form16: totalCash,
      ais: totalCash,
      "26as": 0,
      status: hasStructuring ? "SFT Structuring Notice Liability" : "Reconciled within limits",
      critical: hasStructuring
    });
  }

  // Round trip row
  if (roundTrippingViolations.length > 0) {
    const totalRoundTrip = roundTrippingViolations.reduce((s, r) => s + r.amountMismatch.actual, 0);
    reconciliationRows.push({
      label: "Round-Tripping Entries (Sec 68)",
      form16: totalRoundTrip,
      ais: totalRoundTrip,
      "26as": 0,
      status: "Accommodation Entry Risk (78% Tax)",
      critical: true
    });
  }

  // Cash wage caps row
  if (dailyViolations.length > 0) {
    const totalCashViolations = dailyViolations.reduce((s, d) => s + d.amountMismatch.actual, 0);
    reconciliationRows.push({
      label: "Aggregate Daily Cash Wages (Sec 40A(3))",
      form16: 0,
      ais: totalCashViolations,
      "26as": 0,
      status: "Disallowance Risk (>₹10K Single Day)",
      critical: true
    });
  }

  // If no violations found, add standard rows
  if (reconciliationRows.length === 0) {
    reconciliationRows.push({
      label: "Gross Deposits Reviewed",
      form16: transactions.reduce((s, t) => s + t.credit, 0),
      ais: transactions.reduce((s, t) => s + t.credit, 0),
      "26as": 0,
      status: "Reconciled Successfully",
      critical: false
    });
  }

  return {
    overallScore,
    findings,
    reconciliationData: {
      headers: ["Bank Transaction Date / Description", "Credit Value", "Debit Ledger Matches", "Tax Risk Exposure", "Severity"],
      rows: reconciliationRows
    }
  };
}
