export const api = {
  getHeaders: () => {
    const token = localStorage.getItem('salus_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Auth
  register: async (payload: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', { headers: api.getHeaders() });
    return res.json();
  },

  deleteAccount: async () => {
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: api.getHeaders(),
    });
    return res.json();
  },

  exportData: async () => {
    const res = await fetch('/api/auth/export-data', { headers: api.getHeaders() });
    return res.json();
  },

  // Medications
  getCategories: async () => {
    const res = await fetch('/api/medications/categories');
    return res.json();
  },

  searchMedications: async (query?: string, categoryId?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (categoryId) params.append('category', categoryId);
    const res = await fetch(`/api/medications/search?${params.toString()}`);
    return res.json();
  },

  getMedicationDetails: async (id: string) => {
    const res = await fetch(`/api/medications/${id}`);
    return res.json();
  },

  // Symptoms
  getSymptoms: async (filters?: { medicationId?: string; severity?: string }) => {
    const params = new URLSearchParams();
    if (filters?.medicationId) params.append('medicationId', filters.medicationId);
    if (filters?.severity) params.append('severity', filters.severity);
    const res = await fetch(`/api/symptoms?${params.toString()}`, { headers: api.getHeaders() });
    return res.json();
  },

  createSymptom: async (payload: any) => {
    const res = await fetch('/api/symptoms', {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  deleteSymptom: async (id: string) => {
    const res = await fetch(`/api/symptoms/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    return res.json();
  },

  getActiveMedications: async () => {
    const res = await fetch('/api/symptoms/active-medications', { headers: api.getHeaders() });
    return res.json();
  },

  addActiveMedication: async (payload: any) => {
    const res = await fetch('/api/symptoms/active-medications', {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  removeActiveMedication: async (id: string) => {
    const res = await fetch(`/api/symptoms/active-medications/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    return res.json();
  },

  // Consent & Sharing
  createConsentInvite: async (payload: { scope?: string; allowedSymptomIds?: string[]; notes?: string }) => {
    const res = await fetch('/api/consent/invite', {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getMyGrants: async () => {
    const res = await fetch('/api/consent/my-grants', { headers: api.getHeaders() });
    return res.json();
  },

  revokeConsent: async (id: string) => {
    const res = await fetch(`/api/consent/revoke/${id}`, {
      method: 'POST',
      headers: api.getHeaders(),
    });
    return res.json();
  },

  // Pharmacist Professional
  acceptPatientInvite: async (invitationCode: string) => {
    const res = await fetch('/api/pharmacist/accept-invite', {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ invitationCode }),
    });
    return res.json();
  },

  getPharmacistCases: async () => {
    const res = await fetch('/api/pharmacist/patients', { headers: api.getHeaders() });
    return res.json();
  },

  getPatientRecords: async (patientId: string) => {
    const res = await fetch(`/api/pharmacist/patient/${patientId}/records`, { headers: api.getHeaders() });
    return res.json();
  },

  saveClinicalNote: async (requestId: string, clinicalNote: string, status: string = 'completed') => {
    const res = await fetch(`/api/pharmacist/follow-up/${requestId}/note`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ clinicalNote, status }),
    });
    return res.json();
  },

  // Assistant & Voice
  queryAssistant: async (query: string, language: 'ar' | 'en' = 'ar') => {
    const res = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    return res.json();
  },

  // OCR
  scanPackageOcr: async (rawText: string) => {
    const res = await fetch('/api/ocr/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    return res.json();
  },

  // Reports
  getReportSummary: async () => {
    const res = await fetch('/api/reports/summary', { headers: api.getHeaders() });
    return res.json();
  },

  downloadReportPdfUrl: () => {
    const token = localStorage.getItem('salus_token') || '';
    return `/api/reports/download-pdf?token=${encodeURIComponent(token)}`;
  },

  // External Evidence
  getExternalEvidence: async (ingredient: string) => {
    const res = await fetch(`/api/external/evidence/${encodeURIComponent(ingredient)}`);
    return res.json();
  },
};
