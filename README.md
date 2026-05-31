# Intelligent AI-Powered Virtual CA Auditor (Raman Tech)

A production-grade, privacy-first, 100% serverless financial pre-audit and tax validation web application. The platform behaves like a senior Chartered Accountant (CA), deeply auditing Indian tax returns (ITR), invoices, ledger entries, bank exports, and GST summaries to identify compliance gaps, income omissions, arithmetic errors, and notice liabilities.

---

## 🔒 Privacy-First Security Architecture (Zero Database)

Unlike standard fintech platforms that retain private accounting records on centralized servers, **Virtual CA is built with a zero-database, serverless-first layout**:
* **On-Device Encrypted Workspace:** Documents, parsed structures, and findings are stored strictly within the **browser's local cache** (`localStorage` / `IndexedDB`). Sensitive financial data never leaves your machine.
* **Consultation ID Lock & Purge:** Clicking "Close & Lock Session" serializes the active state, encrypts the values into your local browser cache index, and **forces a hard purge of active React memory**.
* **One-Click Session Restoration:** You are issued a unique, secure Consultation ID (e.g., `RT-VCA-2026-[SHORT_HEX]`). Entering this ID on the landing page instantly decrypts and reloads your entire workspace.
* **Auto-Shredding Controls:** Built-in settings for automatic 24-hour cache shredding and binary file wipes to guarantee enterprise-level compliance.

---

## ⚖️ Indian Tax & Compliance Audit Coverage

The local deterministic rule engine coupled with AI reasoning models audits specific compliance points under the **Indian Income Tax Act** and **GST Framework**:
* **Form 16 vs AIS Omission Scanner:** Detects gross salary differences, undisclosed ex-gratia bonuses, and interest income omissions.
* **TDS Tax Credit Reconciler (Section 199 / Rule 37BA):** Matches claimed tax credits in Form 16 against deposits reflected in **Form 26AS** to prevent automated CPC adjustment notices under **Section 143(1)**.
* **GST ITC Expensing Audit (Section 16):** Identifies purchases where CGST/SGST input credit was expensed flat instead of booked as ledger assets, preventing immediate cash flow leakage.
* **Structured Cash Deposits (Section 285BA / SFT):** Spotlights consecutive cash deposits structured just under the ₹5,00,000 PAN reporting threshold.
* **Anomalous Round-Tripping (Section 68 Unexplained Credits):** Flags quick-succession back-and-forth bank transfers with vendors lacking credit agreements (taxed at 78% penalty rates).
* **MSME Disallowance Check (Section 43B(h)):** Flags outstanding liabilities to micro & small enterprises exceeding 45-day statutory limits.
* **Cash Expense Disallowance (Section 40A(3)):** Highlights cash wage or material postings exceeding ₹10,000 per person per day.

---

## 🎨 High-End Visual UX & Core Modules

The web app is styled using a premium, responsive **Vanilla CSS HSL System** featuring a seamless light/dark mode switch and high-performance **Premium Micro-Animations**:
* **Landing Page Elements (`animate-fade-in-up`):** Cascades landing brand banners, core modules, action controls, and session registries smoothly from the bottom on render.
* **Springy Modal Entrances (`animate-scale-up`):** Welcomes users with springy modal entrances on the onboarding consent gate, Clerk credentials simulator, and lock-sharing popup.
* **Audit Findings Copilot Drawer (`animate-slide-in-right`):** Slides the chatbot panel cleanly from the right margin when opening the audit review workspace.
* **OCR Scanned Coords (`animate-pulse-glow`):** Adds a subtle, recurring orange pulse to bounding coordinates on loaded tax sheets to highlight scanned fields.

### Core Modules:
1. **Interactive Dashboard:** Offers a radial compliance score dial and high-level alert rings.
2. **Finance dropzone:** Multi-file drag-and-drop simulator with data consent gates and one-click demo audit loaders.
3. **Audit Findings Inspector:** Expanding detailed drawers for observation, CA regulatory explanation, numerical variance grids, and actionable corrections.
4. **CA AI Chatbot Panel:** Collateral panel equipped with pre-built tax queries and a persistent legal disclaimer system.
5. **Cross-Document Reconciliation Sheet:** Spreadsheets comparing AIS vs Form 16 vs Form 26AS, highlighting discrepancies in red.
6. **2D Interactive Risk Heatmap:** Coordinates grid plotting tax liability exposure versus notice probability.
7. **Compliance Checklist:** Dynamic pre-filing checklist adapted to your persona (Individual Taxpayer, SME, Accountant, CA).
8. **Report Exporter:** Print-ready letterhead preview optimized for clean A4 PDF rendering.

---

## 🚀 Setup & Installation

Follow these steps to run the application locally:

### 1. Prerequisite
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd "Virtual CA"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Boot Local Development Server
Starts the dev environment with Hot Module Replacement (HMR) on port 3000:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Compile Production Bundle
Validates code integrity and compiles static assets under the `dist` directory:
```bash
npm run build
```

---

## ⚖️ Legal Disclaimer
This software is an automated compliance review checklist. Under regulatory standards, all synthesized corrections, calculations, and tax positions must be verified and authorized by a licensed **Chartered Accountant (CA)** before official submission to the Income Tax Department or GST Portal.
