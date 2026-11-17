export const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('patient', 'pharmacist', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'ar',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_range TEXT,
  privacy_consent INTEGER NOT NULL DEFAULT 0,
  consent_date TEXT,
  emergency_contact TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pharmacist_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  workplace TEXT NOT NULL,
  syndicate_number TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TEXT,
  verified_by TEXT
);

CREATE TABLE IF NOT EXISTS medication_categories (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT
);

CREATE TABLE IF NOT EXISTS active_ingredients (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES medication_categories(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  drug_class_en TEXT NOT NULL,
  drug_class_ar TEXT NOT NULL,
  is_nsaid INTEGER NOT NULL DEFAULT 0,
  general_purpose_en TEXT NOT NULL,
  general_purpose_ar TEXT NOT NULL,
  mechanism_en TEXT,
  mechanism_ar TEXT,
  warnings_en TEXT NOT NULL,
  warnings_ar TEXT NOT NULL,
  interactions_en TEXT NOT NULL,
  interactions_ar TEXT NOT NULL,
  last_reviewed_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medication_products (
  id TEXT PRIMARY KEY,
  active_ingredient_id TEXT NOT NULL REFERENCES active_ingredients(id),
  brand_name_en TEXT NOT NULL,
  brand_name_ar TEXT NOT NULL,
  formulation TEXT NOT NULL,
  strength TEXT NOT NULL,
  manufacturer TEXT,
  eda_registration_no TEXT,
  is_verified_egyptian INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS adverse_effects (
  id TEXT PRIMARY KEY,
  active_ingredient_id TEXT NOT NULL REFERENCES active_ingredients(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  frequency_percentage REAL,
  frequency_display_en TEXT NOT NULL,
  frequency_display_ar TEXT NOT NULL,
  source_study_or_label TEXT NOT NULL,
  study_population TEXT NOT NULL,
  sample_size_denominator TEXT,
  dose_and_formulation TEXT NOT NULL,
  comparator TEXT,
  severity TEXT NOT NULL CHECK(severity IN ('mild', 'moderate', 'severe', 'critical')),
  time_to_onset_en TEXT NOT NULL,
  time_to_onset_ar TEXT NOT NULL,
  duration_en TEXT NOT NULL,
  duration_ar TEXT NOT NULL,
  confidence_evidence_quality TEXT NOT NULL,
  last_verified_date TEXT NOT NULL,
  clinical_reviewer_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_medications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_ingredient_id TEXT REFERENCES active_ingredients(id),
  medication_product_id TEXT REFERENCES medication_products(id),
  custom_name TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS symptom_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_ingredient_id TEXT REFERENCES active_ingredients(id),
  medication_product_id TEXT REFERENCES medication_products(id),
  symptom_name TEXT NOT NULL,
  symptom_name_ar TEXT,
  start_date TEXT NOT NULL,
  start_time TEXT,
  severity TEXT NOT NULL CHECK(severity IN ('mild', 'moderate', 'severe')),
  duration TEXT,
  is_ongoing INTEGER NOT NULL DEFAULT 1,
  impact_daily_activities INTEGER NOT NULL DEFAULT 0,
  impact_balance INTEGER NOT NULL DEFAULT 0,
  impact_walking INTEGER NOT NULL DEFAULT 0,
  impact_mobility INTEGER NOT NULL DEFAULT 0,
  fatigue_during_activities INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  is_shared_with_pharmacist INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consent_grants (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacist_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'all_symptoms' CHECK(scope IN ('all_symptoms', 'selected_symptoms')),
  allowed_symptom_ids TEXT,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  revoked_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS follow_up_requests (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacist_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  consent_grant_id TEXT REFERENCES consent_grants(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_review', 'completed', 'cancelled')),
  patient_notes TEXT,
  pharmacist_notes TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS safety_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symptom_log_id TEXT REFERENCES symptom_logs(id),
  alert_level TEXT NOT NULL CHECK(alert_level IN ('urgent_emergency', 'warning_pharmacist_review', 'info')),
  trigger_reason TEXT NOT NULL,
  recommendation_en TEXT NOT NULL,
  recommendation_ar TEXT NOT NULL,
  dismissed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_active_ingredients_category ON active_ingredients(category_id);
CREATE INDEX IF NOT EXISTS idx_medication_products_ingredient ON medication_products(active_ingredient_id);
CREATE INDEX IF NOT EXISTS idx_adverse_effects_ingredient ON adverse_effects(active_ingredient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_user ON patient_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_grants_patient ON consent_grants(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_grants_code ON consent_grants(invitation_code);
CREATE INDEX IF NOT EXISTS idx_follow_up_requests_pharmacist ON follow_up_requests(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
`;
