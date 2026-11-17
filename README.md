# SALUS (سالوس) — AI-Assisted Medication Safety and Patient–Pharmacist Communication

> **Know Your Medicine. Stay Safer.**  
> **افهم دواءك. خليك في أمان.**  
> *Initial Market: Egypt (جمهورية مصر العربية) | Multi-lingual: Arabic (including Egyptian colloquial) & English*

---

## 1. Product Philosophy & Clinical Safety Guardrails

SALUS is designed as an evidence-based medication safety and symptom-monitoring platform bridging patients and licensed healthcare professionals. It strictly adheres to healthcare safety rules:

- **Evidence-Based Medical Facts Only**: SALUS **never** presents AI guesses as facts. No numerical adverse event percentages, onset times, sample sizes, or citations are fabricated.
- **Unverified Information Disclosure**: When verified clinical trial or regulatory data is absent, the system explicitly displays:
  - Arabic: `"المعلومة دي مش متوفرة بشكل موثوق حاليًا."`
  - English: `"Reliable information is not currently available."`
- **Zero Medical Diagnosis or Prescription Replacement**: SALUS does not diagnose conditions or prescribe medications. It advises patients **never** to stop, start, increase, or decrease prescription medication independently.
- **Deterministic Red-Flag Safety Rules**: Critical symptoms (anaphylaxis, respiratory distress, acute chest pain, syncopal collapse, gastrointestinal hemorrhage, severe hypoglycemia, suspected overdose) bypass AI models and trigger immediate deterministic urgent-care warnings directing the patient to emergency care (**Egyptian Ambulance Service: 123**).
- **Patient Privacy by Design & Explicit Consent**: Health records are owned exclusively by the patient. Pharmacist access is authorized through cryptographic, time-limited invitation codes with instant patient revocation capabilities.

---

## 2. Initial Medication Scope (3 Categories & 9 Active Ingredients)

### Category A: Hypertension (أدوية ضغط الدم)
1. **Amlodipine (أملوديبين)**: Dihydropyridine Calcium Channel Blocker  
   *Egyptian Brands (EDA)*: Norvasc (نورفاسك), Amlor (أملور), Vascalpha (فاسكالفا), Amlocard  
   *Verified Clinical Evidence*: Peripheral edema (1.8% at 2.5mg, 3.0% at 5mg, 10.8% at 10mg in FDA pivotal trials; onset 2-6 weeks; dose-dependent).
2. **Losartan (لوسارتان)**: Angiotensin II Receptor Blocker (ARB)  
   *Egyptian Brands (EDA)*: Cozaar (كوزار), Sortiva (سورتيفا), Losapres (لوسابريس)  
   *Verified Clinical Evidence*: Dizziness (2.4% vs 1.3% placebo in RENAAL study), Hyperkalemia (1.5%).
3. **Bisoprolol (بيسوبرولول)**: Cardioselective Beta-1 Adrenergic Blocker  
   *Egyptian Brands (EDA)*: Concor Cor (كونكور كور 2.5mg), Concor (5mg, 10mg), Bisocard, Lodoz  
   *Verified Clinical Evidence*: Bradycardia (3.2% in CIBIS-II trial), Fatigue (8.2% in clinical trials).

### Category B: Diabetes (أدوية السكري)
4. **Metformin (ميتفورمين)**: Biguanide  
   *Egyptian Brands (EDA)*: Glucophage (جلوكوفاج 500mg, 850mg, 1000mg), Cidophage (سيدوفاج), Glufan  
   *Verified Clinical Evidence*: Diarrhea (53.2% in clinical trials vs 11.7% placebo; onset 1-2 weeks; FDA label), Nausea (25.5%).
5. **Gliclazide (جليكلازيد)**: Second-Generation Sulfonylurea  
   *Egyptian Brands (EDA)*: Diamicron MR (دياميكرون إم آر 30mg, 60mg), Diapride  
   *Verified Clinical Evidence*: Hypoglycemia (4.6% in ADVANCE trial / European SmPC).
6. **Empagliflozin (إمباجليفلوزين)**: SGLT2 Inhibitor  
   *Egyptian Brands (EDA)*: Jardiance (جارديانس 10mg, 25mg), Empacare (إمباكير)  
   *Verified Clinical Evidence*: Genital mycotic infections (5.4% in females vs 1.5% placebo; EMPA-REG OUTCOME trial / NEJM).

### Category C: Pain Relief & NSAIDs (مسكنات الألم ومضادات الالتهاب)
7. **Paracetamol (باراسيتامول)**: Central Analgesic & Antipyretic (**Explicitly Non-NSAID**)  
   *Egyptian Brands (EDA)*: Panadol Advance (بنادول أدفانس), Panadol Extra, Cetal (سيتال), Paramol (بارامول), Abimol  
   *Safety Note*: Strictly segregated from NSAIDs. Max adult dose 4g/day. Dose-dependent hepatotoxicity in overdose.
8. **Ibuprofen (إيبوبروفين)**: Nonsteroidal Anti-inflammatory Drug (**NSAID**)  
   *Egyptian Brands (EDA)*: Brufen (بروفين 400mg, 600mg), Advil (أدفيل), Marcofen  
   *Verified Clinical Evidence*: Dyspepsia/Gastric upset (10% - 16%), GI bleeding/ulceration (~1% chronic use; FDA Black Box Warning).
9. **Diclofenac (ديكلوفيناك)**: Nonsteroidal Anti-inflammatory Drug (**NSAID**)  
   *Egyptian Brands (EDA)*: Voltaren (فولتارين 50mg, 100mg SR), Cataflam (كتافلام 50mg), Dolphin  
   *Verified Clinical Evidence*: Cardiovascular thrombotic risk (MEDAL program / Lancet), Transaminase elevation (2% - 4%).

---

## 3. Technology Stack & System Architecture

```
                      ┌───────────────────────────────────────┐
                      │          SALUS PWA Frontend           │
                      │  React 18 + TypeScript + Tailwind CSS │
                      │  Lucide Icons + Web Speech STT/TTS    │
                      │    Full Arabic Cairo RTL / LTR        │
                      └──────────────────┬────────────────────┘
                                         │ REST API / JSON
                      ┌──────────────────┴────────────────────┐
                      │        Node.js + Express API          │
                      │         TypeScript + Zod DTOs         │
                      │        JWT + Bcrypt Auth Guard        │
                      └─────┬────────────┬─────────────┬──────┘
                            │            │             │
        ┌───────────────────┴──┐   ┌─────┴───────┐   ┌─┴─────────────────────┐
        │  Deterministic Safety│   │   RAG AI    │   │ SQLite (better-sqlite3)│
        │   Triage Engine      │   │  Assistant  │   │ 13 Tables + Indexes   │
        │  (123 Emergency Red) │   │ (No Halluc) │   │ Verified Seed Corpus  │
        └──────────────────────┘   └─────────────┘   └───────────────────────┘
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Web Speech API (Egyptian Arabic & English), Tesseract.js / Canvas OCR, RTL-first typography with Cairo & Inter.
- **Backend**: Node.js, Express, TypeScript, Better-SQLite3, PDFKit (PDF reports), Multer (Image uploads), Zod validation, Rate Limiting, Audit Logging.
- **Database**: SQLite (`salus.db`) with WAL mode, foreign keys, and indexes. Fully compatible with PostgreSQL for production migration.

---

## 4. Demo Accounts (Fast One-Click Login)

The platform provides pre-configured demo users to test all workflows:

| Role | Email | Password | Details |
|---|---|---|---|
| **Patient** | `patient@salus.eg` | `SalusDemo2026!` | Ahmed Hassan (أحمد حسن) — Has active Amlodipine & Glucophage prescriptions + ankle edema symptom log |
| **Verified Pharmacist** | `pharmacist@salus.eg` | `SalusDemo2026!` | Dr. Mariam Farouk (د. مريم فاروق) — Syndicate #SYN-44219, License #EGY-PH-84920 (Verified clinical privileges) |
| **Pending Pharmacist** | `pending.pharmacist@salus.eg` | `SalusDemo2026!` | Dr. Karim Zaki (د. كريم زكي) — Syndicate verification pending (Demonstrates locked clinical access) |
| **Admin** | `admin@salus.eg` | `SalusDemo2026!` | System Administrator |

---

## 5. Setup & Running Instructions

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.14.1)
- **npm**: v9+ (tested on npm v11.11.0)
- **Flutter SDK**: 3.20+ (for mobile/desktop app development)

### A. Web Full-Stack Platform (Node.js + React PWA)

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Run Automated Test Suite**:
   ```bash
   npm test
   ```
   *Runs all 8 test categories: Database Seeds, Authentication, Safety Red Flags, Voice Evidence RAG, OCR Confirmation, Consent Revocation, and Report Generation.*

3. **Build Frontend & Backend**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```
   *The backend will automatically start on `http://localhost:4000` and serve both the API and the compiled frontend.*

5. **Development Mode (Concurrent Hot Reload)**:
   - Terminal 1 (Backend): `cd backend && npm run dev`
   - Terminal 2 (Frontend): `cd frontend && npm run dev`
   - Access web app at `http://localhost:5173`.

### B. Flutter Native Application (`lib/`)

1. **Analyze Code**:
   ```bash
   flutter analyze
   ```

2. **Run Flutter Tests**:
   ```bash
   flutter test test/widget_test.dart
   ```
   *Verifies widget tree, Arabic/English RTL/LTR layouts, Paracetamol non-NSAID classification, and emergency red-flag triage.*

3. **Run on Chrome / Mobile / Desktop**:
   ```bash
   flutter run -d chrome
   # or on connected Android/iOS device:
   flutter run
   ```

---

## 6. Required User Journeys Supported

- **Journey A — Patient Searches Medication**: Patient opens SALUS → Searches *Norvasc* or *Amlodipine* → Confirms medication → Views verified clinical trial incidence (1.8% - 10.8% edema), boxed warnings, and plays Egyptian Arabic spoken explanation.
- **Journey B — Patient Logs Symptoms**: Patient signs in → Records dizziness / ankle swelling → Selects severity → Records **Physiotherapy mobility markers** (impact on walking, balance, exertional fatigue) → Saves entry → Views timeline.
- **Journey C — Patient Shares with Pharmacist**: Patient generates temporary invite token (e.g. `SALUS-XXXX-XXXX`) → Grants permission → Verified pharmacist inputs code → Pharmacist reviews authorized records → Patient can revoke access immediately with one click.
- **Journey D — Medicine Package Scanning (OCR)**: Patient uploads/photographs medicine box → OCR extracts brand, strength, formulation → Displays scored candidate matches → **Mandatory patient safety confirmation step** → Displays clinical monograph.
- **Journey E — Voice Interaction**: Patient asks in Egyptian Arabic: *"أنا باخد أملوديبين وحاسس بدوخة، ده ممكن يكون من الدوا؟"* → System explains dizziness is an established trial-documented effect (1.1% to 3.4%) without asserting definite individual causality → Asks clarifying questions → Warns against stopping medication.
- **Journey F — Pharmacist Review**: Verified pharmacist logs in → Opens patient case → Inspects symptom history and physiotherapy markers → Adds clinical consultation note → Completes follow-up.

---

## 7. Final Acceptance & Implementation Checklist

### ✅ Fully Implemented Features
- [x] Responsive Bilingual Interface (Arabic with Cairo font & true RTL layout; English with Inter font & LTR layout).
- [x] Full REST API Backend (Authentication, Medications, Symptoms, Consent, Pharmacist, Assistant, OCR, Reports, External Evidence).
- [x] 9 Initial Active Ingredients & Egyptian Brand Mappings (Norvasc, Cozaar, Concor, Glucophage, Diamicron, Jardiance, Panadol, Brufen, Voltaren).
- [x] Paracetamol classification as non-NSAID central analgesic.
- [x] Evidence-backed adverse effects with sample sizes, denominators, comparators, onset times, and source labels.
- [x] Deterministic Red-Flag Emergency Triage (Dyspnea, angioedema, chest pain, syncope, GI bleeding, hypoglycemia, overdose with 123 emergency guidance).
- [x] Voice Assistant with Web Speech API STT/TTS, Egyptian Arabic conversational guidance, and text fallback.
- [x] Package Scanner (OCR) with candidate matching, confidence scoring, and mandatory patient confirmation step.
- [x] Physiotherapy & Mobility markers (balance, walking, joint mobility, exertional fatigue tracking).
- [x] Consent-Based Sharing (Cryptographic invite tokens, authorized scope, access audit logging, patient revocation).
- [x] Pharmacist Dashboard with verification status enforcement (pending pharmacists cannot access patient records).
- [x] PDF Report Generation with prominent medical disclaimers.
- [x] Data Privacy controls (Account deletion, GDPR-friendly data export).
- [x] Automated test suite passing 100% of test cases.

### ⚠️ Partially Implemented / External Service Dependent
- [x] **AI RAG Core**: Fully functioning structured clinical trial retrieval and safety guardrails. When third-party LLM API keys (e.g. Gemini API / OpenAI) are added in `.env`, the server can plug into cloud generative reasoning. Without keys, it uses the verified structured corpus fallback.
- [x] **External Live Scraping**: EDA, DailyMed, openFDA, and PubMed endpoints return structured references and direct URLs. Live scraping of EDA portal is simulated via verified mappings due to EDA legal CAPTCHA requirements.

### 🔬 Features Requiring Clinical & Legal Review Before Clinical Deployment
- [ ] Multi-center clinical validation of Egyptian dialect voice recognition.
- [ ] Legal compliance review with the Egyptian Ministry of Health (MoH) and Egyptian Drug Authority (EDA).
- [ ] Formal Data Protection Assessment under Egyptian Personal Data Protection Law (Law No. 151 of 2020).
- [ ] Pharmacogenomics / Biotechnology biomarker risk algorithms (planned for future phases).

---

*SALUS is a developmental prototype engineered for healthcare technology innovation and does not constitute a certified medical device.*
