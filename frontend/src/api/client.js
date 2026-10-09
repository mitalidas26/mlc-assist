const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchCases() {
  const res = await fetch(`${API_BASE}/cases`);
  return res.json();
}

export async function fetchCase(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error('Case not found');
  return res.json();
}

export async function createCase(caseData) {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  return res.json();
}

export async function addCaseInjury(caseId, injuryData) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/injuries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(injuryData)
  });
  return res.json();
}

export async function removeCaseInjury(injuryId) {
  const res = await fetch(`${API_BASE}/cases/injuries/${injuryId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function seedDemoCases() {
  const res = await fetch(`${API_BASE}/cases/demo/seed`, {
    method: 'POST'
  });
  return res.json();
}

export async function checkWording(text) {
  const res = await fetch(`${API_BASE}/analyze/wording`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function analyzeCase(caseId) {
  const res = await fetch(`${API_BASE}/analyze/case/${caseId}`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchBNSClauses() {
  const res = await fetch(`${API_BASE}/legal/bns-clauses`);
  return res.json();
}

export async function searchBNS(query) {
  const res = await fetch(`${API_BASE}/legal/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function generateCertificate(caseId, options = {}) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/certificate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  if (!res.ok) throw new Error('Failed to generate certificate');
  return res.json();
}

export async function getExistingCertificate(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/certificate`);
  if (!res.ok) return null;
  return res.json();
}

export async function verifyByHash(sha256_hash) {
  const res = await fetch(`${API_BASE}/verify/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha256_hash })
  });
  return res.json();
}

export async function verifyByUpload(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/verify/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}
