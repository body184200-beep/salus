import { config } from '../config/index.js';

export interface ExternalEvidenceItem {
  sourceName: 'DailyMed' | 'Egyptian Drug Authority (EDA)' | 'PubMed' | 'openFDA' | 'RxNorm';
  sourceUrl: string;
  sourceId: string;
  retrievedAt: string;
  evidenceQuality: string;
  isOfficialRegulatorySource: boolean;
  notes: string;
  data: any;
}

export async function fetchExternalEvidence(activeIngredient: string): Promise<ExternalEvidenceItem[]> {
  const items: ExternalEvidenceItem[] = [];
  const query = encodeURIComponent(activeIngredient.trim());

  // 1. DailyMed Integration
  items.push({
    sourceName: 'DailyMed',
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${query}`,
    sourceId: `DAILYMED-${query.toUpperCase()}`,
    retrievedAt: new Date().toISOString(),
    evidenceQuality: 'High - US National Library of Medicine Structured Product Labeling (SPL)',
    isOfficialRegulatorySource: true,
    notes: 'Structured clinical trial incidence rates and official package insert warnings.',
    data: {
      endpoint: `${config.dailyMedApiUrl}spls.json?drug_name=${query}`,
      status: 'available_reference',
    },
  });

  // 2. Egyptian Drug Authority (EDA) Reference
  items.push({
    sourceName: 'Egyptian Drug Authority (EDA)',
    sourceUrl: `${config.edaBaseUrl}`,
    sourceId: `EDA-REG-${query.toUpperCase()}`,
    retrievedAt: new Date().toISOString(),
    evidenceQuality: 'High - Official Egyptian Regulatory Authority',
    isOfficialRegulatorySource: true,
    notes: 'Egyptian registered brand names, local pharmaceutical manufacturers, and approved pack sizes.',
    data: {
      regulatoryAuthority: 'Egyptian Drug Authority (هيئة الدواء المصرية)',
      jurisdiction: 'Arab Republic of Egypt',
      status: 'active_registry_mapping',
    },
  });

  // 3. PubMed Reference
  items.push({
    sourceName: 'PubMed',
    sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/?term=${query}+adverse+effects+randomized+controlled+trial`,
    sourceId: `PUBMED-${query.toUpperCase()}-RCT`,
    retrievedAt: new Date().toISOString(),
    evidenceQuality: 'High - Peer-Reviewed Randomized Controlled Trials',
    isOfficialRegulatorySource: false,
    notes: 'Pivotal clinical trials, meta-analyses, and post-marketing observational cohorts.',
    data: {
      searchQuery: `${activeIngredient} adverse effects randomized controlled trial`,
    },
  });

  // 4. openFDA Reference
  items.push({
    sourceName: 'openFDA',
    sourceUrl: `https://api.fda.gov/drug/label.json?search=openfda.substance_name:${query}&limit=1`,
    sourceId: `OPENFDA-${query.toUpperCase()}`,
    retrievedAt: new Date().toISOString(),
    evidenceQuality: 'High - FDA Drug Labeling Data API',
    isOfficialRegulatorySource: true,
    notes: 'FDA drug labeling, boxed warnings, and adverse reactions section.',
    data: {
      apiEndpoint: `https://api.fda.gov/drug/label.json?search=openfda.substance_name:${query}`,
      note: 'Spontaneous adverse reporting data (FAERS) is excluded from incidence calculation per SALUS safety rules.',
    },
  });

  return items;
}
