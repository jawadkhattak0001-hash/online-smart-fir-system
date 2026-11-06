// backend/services/nlpFirService.js
// Uses Gemini gemini-flash-latest (working) with fallback

const extractFirData = async (transcript, language = 'english') => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (GEMINI_API_KEY) {
    try {
      const sanitized = transcript.replace(/"/g, '\\"').replace(/\n/g, ' ');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Extract FIR fields from this Pakistani complaint. Return ONLY valid JSON with these fields:
{
  "incidentType": "Theft/Robbery/Assault/Fraud/Harassment/Traffic Accident/Other",
  "dateOfIncident": "YYYY-MM-DD",
  "timeOfIncident": "HH:MM",
  "placeOfIncident": "",
  "complainantName": "",
  "fatherName": "",
  "cnic": "",
  "contactNumber": "",
  "address": "",
  "policeStation": "",
  "district": "",
  "city": "",
  "narrative": "formal third-person narrative",
  "accusedName": "",
  "accusedDescription": "",
  "ppcSections": "",
  "urgencyLevel": "Normal/Medium/High",
  "severity": "Low/Medium/High/Critical",
  "weaponsInvolved": false,
  "injuries": false,
  "witnessesPresent": "Yes/No"
}
Be concise. Transcript: ${sanitized}`
              }]
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4000 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Fix truncated JSON
        if (!text.endsWith('}')) {
          const lastComma = text.lastIndexOf(',');
          if (lastComma !== -1) text = text.substring(0, lastComma);
          text = text + '}';
        }
        text = text.replace(/,\s*}/g, '}');

        try {
          const parsed = JSON.parse(text);
          console.log('✅ Gemini: FIR extraction successful');
          return { success: true, data: parsed, source: 'gemini' };
        } catch (parseError) {
          console.error('Gemini JSON parse error:', parseError.message);
          throw parseError;
        }
      } else {
        console.error('Gemini non‑OK response:', response.status);
      }
    } catch (err) {
      console.warn('Gemini error, using rule‑based:', err.message);
    }
  }

  // ── Improved Rule‑Based Fallback ──────────────────
  const text = transcript.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  let offenseType = 'Other', ppc = '154 CrPC', severity = 'Medium';
  if (/theft|stolen|چوری/i.test(text)) { offenseType = 'Theft'; ppc = '379 PPC'; }
  else if (/robbery|snatch|ڈاکہ|loot/i.test(text)) { offenseType = 'Robbery'; ppc = '392 PPC'; severity = 'High'; }
  else if (/kill|murder|قتل|dead/i.test(text)) { offenseType = 'Murder'; ppc = '302 PPC'; severity = 'Critical'; }
  else if (/assault|beat|attack|مار/i.test(text)) { offenseType = 'Assault'; ppc = '337 PPC'; severity = 'High'; }
  else if (/harass|stalk|follow|ہراس/i.test(text)) { offenseType = 'Harassment'; ppc = '509 PPC'; severity = 'High'; }
  else if (/fraud|cheat|scam|دھوکہ/i.test(text)) { offenseType = 'Fraud'; ppc = '420 PPC'; }
  else if (/accident|collision|crash|hit and run/i.test(text)) { offenseType = 'Traffic Accident'; ppc = '279/337 PPC'; }

  const locMatch = transcript.match(/(?:at|in|near|market|road|street|sector|colony|chowk)[^,.]+/i);
  const place = locMatch ? locMatch[0].trim() : 'Not specified';
  const cnicMatch = transcript.match(/\d{5}-\d{7}-\d{1}/);
  const phoneMatch = transcript.match(/03\d{2}-?\d{7}/);

  let complainantName = '', fatherName = '';
  const nameMatch = transcript.match(/(?:my name is|i am|this is) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  if (nameMatch) complainantName = nameMatch[1];
  const fatherMatch = transcript.match(/(?:father|son of|s\/o) (?:is |name is |of )?([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  if (fatherMatch) fatherName = fatherMatch[1];

  return {
    success: true,
    data: {
      incidentType: offenseType,
      dateOfIncident: today,
      timeOfIncident: '',
      placeOfIncident: place,
      complainantName,
      fatherName,
      cnic: cnicMatch ? cnicMatch[0] : '',
      contactNumber: phoneMatch ? phoneMatch[0] : '',
      address: '',
      policeStation: 'Islamabad Police Station',
      district: 'Islamabad',
      city: 'Islamabad',
      narrative: `The complainant reported a case of ${offenseType.toLowerCase()} at ${place}. According to the statement: "${transcript}". Legal action requested under ${ppc}.`,
      accusedName: 'Unknown',
      accusedDescription: '',
      ppcSections: ppc,
      urgencyLevel: 'Normal',
      severity,
      weaponsInvolved: false,
      injuries: false,
      witnessesPresent: 'No',
    },
    source: 'rule-based',
  };
};

module.exports = { extractFirData };