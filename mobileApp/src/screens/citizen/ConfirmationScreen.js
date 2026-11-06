// screens/citizen/ConfirmationScreen.js – OFFICIAL FIR + REAL PDF DOWNLOAD (FIXED)
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, Share, Platform,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { CheckCircle, Download, FileText, Home, RotateCcw, Globe } from 'lucide-react-native';

const BASE_URL = 'http://localhost:5000/api';

const colors = {
  primary:    '#1B3A6B',
  accent:     '#C8A84B',
  background: '#FFFFFF',
  surface:    '#F5F5F0',
  border:     '#2C2C2C',
  borderLight:'#BBBBBB',
  text:       '#0D0D0D',
  textSec:    '#555',
  success:    '#1B6B3A',
  error:      '#B00020',
};

const LABELS = {
  en: {
    formTitle:      'POLICE FORM NO. (1)5-24',
    formSubtitle:   'First Information Report – Code of Criminal Procedure Section 154',
    serialNo:       'Serial No.',
    firNo:          'FIR No.',
    station:        'Police Station',
    reportDate:     'Date/Time of Report',
    row1:           '1.  DATE / TIME OF INCIDENT',
    row2:           '2.  COMPLAINANT / AGGRIEVED PARTY',
    row3:           '3.  CIRCUMSTANCES / INCIDENT DESCRIPTION',
    row4:           '4.  PLACE OF INCIDENT & DISTANCE FROM STATION',
    row5:           '5.  ACCUSED / INVESTIGATION DETAILS',
    ppcRow:         'APPLICABLE SECTIONS',
    name:           'Name',
    fatherName:     'Father/Husband',
    cnic:           'CNIC',
    phone:          'Phone',
    address:        'Address',
    district:       'District',
    date:           'Date',
    time:           'Time',
    incidentType:   'Offence',
    place:          'Place',
    distance:       'Distance / Direction',
    accusedName:    'Accused',
    accusedDesc:    'Description',
    witnessName:    'Witness',
    status:         'Status',
    complainantSig: 'Complainant Signature',
    officerSig:     'S.H.O. / S.I. Signature',
    stamp:          'Official\nStamp',
    successTitle:   'FIR Submitted Successfully',
    successSub:     'Your FIR has been registered with the police department.',
    downloadBtn:    'Download Official FIR (PDF)',
    trackBtn:       'Track FIR Status',
    homeBtn:        'Back to Home',
    newFIR:         'File Another FIR',
    downloading:    'Generating PDF…',
    language:       'عردو',
    siName:         'Investigating Officer',
    pdfError:       'Could not generate PDF. Please try again.',
  },
  ur: {
    formTitle:      'پولیس فارم نمبر (1)5-24',
    formSubtitle:   'ابتدائی اطلاع/رپورٹ فارم — قانون ضابطہ فوجداری دفعہ 154',
    serialNo:       'سیریل نمبر',
    firNo:          'آئی ڈی فیر نمبر',
    station:        'تھانہ',
    reportDate:     'تاریخ وقت رپورٹ',
    row1:           '۱.  تاریخ / وقت واقعہ',
    row2:           '۲.  اطلاع دہندہ / متضرر',
    row3:           '۳.  صورت حال / بیان واقعہ',
    row4:           '۴.  جائے واقعہ اور فاصلہ',
    row5:           '۵.  ملزم / تفتیشی تفصیلات',
    ppcRow:         'دفعات قابل اطلاق',
    name:           'نام',
    fatherName:     'والد/شوہر',
    cnic:           'شناختی کارڈ',
    phone:          'فون',
    address:        'پتہ',
    district:       'ضلع',
    date:           'تاریخ',
    time:           'وقت',
    incidentType:   'نوعیت جرم',
    place:          'جائے واقعہ',
    distance:       'فاصلہ / سمت',
    accusedName:    'ملزم',
    accusedDesc:    'تفصیل',
    witnessName:    'گواہ',
    status:         'حیثیت',
    complainantSig: 'دستخط مدعی',
    officerSig:     'دستخط ایس ایچ او / ایس آئی',
    stamp:          'سرکاری\nمہر',
    successTitle:   'ایف آئی آر کامیابی سے جمع',
    successSub:     'آپ کی ایف آئی آر پولیس کے پاس درج ہو گئی ہے۔',
    downloadBtn:    'سرکاری ایف آئی آر ڈاؤن لوڈ (PDF)',
    trackBtn:       'ایف آئی آر ٹریک کریں',
    homeBtn:        'گھر واپس',
    newFIR:         'نئی ایف آئی آر',
    downloading:    'PDF تیار ہو رہی ہے…',
    language:       'English',
    siName:         'تفتیشی افسر',
    pdfError:       'PDF نہیں بن سکی۔ دوبارہ کوشش کریں۔',
  },
};

export function ConfirmationScreen({ route, navigation }) {
  const { firData, language: initLang = 'en' } = route.params || {};
  const [lang, setLang]               = useState(initLang === 'ur' ? 'ur' : 'en');
  const [downloading, setDownloading] = useState(false);
  const [trackData, setTrackData]     = useState(null);
  const L      = LABELS[lang];
  const isUrdu = lang === 'ur';

  const d = firData || {};
  const firNumber = d.firNumber
    || `FIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  useEffect(() => { fetchFIRStatus(); }, []);

  const fetchFIRStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('@smartfir_token');
      const res   = await fetch(`${BASE_URL}/firs/${firNumber}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTrackData(await res.json());
    } catch {}
  };

  // ─── HTML generation (all CSS uses proper hyphenated property names) ──────
  const generateFIRHTML = () => {
    const Lh  = LABELS[lang];
    const rtl = lang === 'ur';

    const ppcChips = (d.ppcSections || '')
      .split(',')
      .filter(Boolean)
      .map(s => `<span class="ppc-box">${s.trim()}</span>`)
      .join(' ');

    return `<!DOCTYPE html>
<html dir="${rtl ? 'rtl' : 'ltr'}" lang="${rtl ? 'ur' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FIR - ${firNumber}</title>
  <style>
    @page { margin: 0.6in; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${rtl
        ? "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif"
        : "'Times New Roman', serif"};
      font-size: ${rtl ? '14px' : '12px'};
      color: #000;
      line-height: 1.7;
      padding: 24px;
      direction: ${rtl ? 'rtl' : 'ltr'};
    }
    .outer { border: 3px double #000; padding: 16px; }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 13px;
    }
    .gold { background: #C8A84B; height: 4px; margin: 5px 0; }
    .subtitle {
      text-align: center;
      font-size: ${rtl ? '12px' : '11px'};
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 4px 0;
      margin: 4px 0;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #000;
      padding: 6px 0;
      font-size: 12px;
      font-weight: 600;
    }
    table { width: 100%; border-collapse: collapse; }
    td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
    .lbl { background: #F0F0E8; font-weight: bold; width: 28%; }
    .val { width: 72%; }
    .narrow-lbl { background: #F0F0E8; font-weight: bold; width: 18%; }
    .narrow-val { width: 18%; }
    .narrative-cell { min-height: 80px; white-space: pre-wrap; }
    .ppc-row-cell { background: #E8E8E0; font-weight: bold; }
    .ppc-box {
      display: inline-block;
      border: 2px solid #000;
      padding: 2px 8px;
      margin: 2px;
      font-weight: bold;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 14px;
    }
    .sig { text-align: center; }
    .sig-line { border-bottom: 1px solid #000; width: 140px; margin: 28px auto 4px; }
    .sig-lbl { font-size: 11px; font-weight: bold; }
    .sig-name { font-size: 11px; margin-top: 3px; }
    .stamp {
      border: 2px dashed #000;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #888;
      text-align: center;
      padding: 10px;
    }
  </style>
</head>
<body>
<div class="outer">

  <div class="top-row">
    <span>${Lh.formTitle}</span>
    <span>${Lh.serialNo}: ${d.serialNumber || '—'}</span>
  </div>
  <div class="gold"></div>
  <div class="subtitle">${Lh.formSubtitle}</div>
  <div class="meta">
    <span>${Lh.station}: ${d.policeStation || '—'}</span>
    <span>${Lh.reportDate}: ${d.reportDate || d.dateOfIncident || '—'} ${d.reportTime || ''}</span>
    <span>${Lh.firNo}: ${firNumber}</span>
  </div>

  <table>
    <tr>
      <td class="lbl">${Lh.row1}</td>
      <td class="val">
        <strong>${Lh.date}:</strong> ${d.dateOfIncident || '—'}
        &nbsp;&nbsp;
        <strong>${Lh.time}:</strong> ${d.timeOfIncident || '—'}
      </td>
      <td class="narrow-lbl">${Lh.reportDate}</td>
      <td class="narrow-val">${d.reportDate || ''} ${d.reportTime || ''}</td>
    </tr>
    <tr>
      <td class="lbl">${Lh.row2}</td>
      <td class="val" colspan="3">
        <strong>${Lh.name}:</strong> ${d.complainantName || '—'}
        &nbsp;|&nbsp;
        <strong>${Lh.fatherName}:</strong> ${d.fatherName || '—'}<br/>
        <strong>${Lh.cnic}:</strong> ${d.cnic || '—'}
        &nbsp;|&nbsp;
        <strong>${Lh.phone}:</strong> ${d.contactNumber || '—'}<br/>
        <strong>${Lh.address}:</strong> ${d.address || '—'}
        &nbsp;|&nbsp;
        <strong>${Lh.district}:</strong> ${d.district || '—'}
      </td>
    </tr>
    <tr>
      <td class="lbl">${Lh.row3}</td>
      <td class="val narrative-cell" colspan="3">
        <strong>${Lh.incidentType}:</strong> ${d.incidentType || '—'}<br/><br/>
        ${(d.narrative || '').replace(/\n/g, '<br/>')}
      </td>
    </tr>
    <tr>
      <td class="lbl">${Lh.row4}</td>
      <td class="val" colspan="3">
        <strong>${Lh.place}:</strong> ${d.placeOfIncident || '—'}<br/>
        <strong>${Lh.distance}:</strong>
        ${[d.distanceFromStation, d.directionFromStation].filter(Boolean).join(' / ') || '—'}
      </td>
    </tr>
    <tr>
      <td class="lbl">${Lh.row5}</td>
      <td class="val" colspan="3">
        <strong>${Lh.accusedName}:</strong> ${d.accusedName || (rtl ? 'نامعلوم' : 'Unknown')}<br/>
        <strong>${Lh.accusedDesc}:</strong> ${d.accusedDescription || '—'}
        ${d.witnessName
          ? `<br/><strong>${Lh.witnessName}:</strong> ${d.witnessName} — ${d.witnessContact || ''}`
          : ''}
      </td>
    </tr>
    <tr>
      <td class="ppc-row-cell" colspan="4">
        <strong>${Lh.ppcRow}:</strong> &nbsp;${ppcChips}
      </td>
    </tr>
  </table>

  <div class="footer">
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-lbl">${Lh.complainantSig}</div>
      <div class="sig-name">${d.complainantName || ''}</div>
    </div>
    <div class="stamp">${Lh.stamp.replace('\n', '<br/>')}</div>
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-lbl">${Lh.officerSig}</div>
      <div class="sig-name">${d.siName || Lh.siName}</div>
      <div class="sig-name">${d.reportDate || d.dateOfIncident || ''}</div>
    </div>
  </div>

</div>
</body>
</html>`;
  };

  // ─── PDF Download (3 steps: render → copy with name → share) ─────────────
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html = generateFIRHTML();

      // Step 1: expo-print renders HTML to a temporary PDF file
      const { uri: tempUri } = await Print.printToFileAsync({ html, base64: false });

      // Step 2: copy to a human-readable filename (share sheet shows correct name)
      const safeName = firNumber.replace(/[/\\?%*:|"<>]/g, '-');
      const destUri  = `${FileSystem.cacheDirectory}FIR-${safeName}.pdf`;
      await FileSystem.copyAsync({ from: tempUri, to: destUri });

      // Step 3: open share sheet with the real .pdf file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(destUri, {
          mimeType:    'application/pdf',
          dialogTitle: `FIR-${safeName}.pdf`,
          UTI:         'com.adobe.pdf',       // iOS
        });
      } else {
        // Fallback (simulators / web)
        await Share.share({ url: destUri, title: `FIR-${safeName}.pdf` });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert(
        isUrdu ? 'خرابی' : 'Error',
        `${L.pdfError}\n\n${error?.message || ''}`,
      );
    } finally {
      setDownloading(false);
    }
  };

  // ─── UI helpers ───────────────────────────────────────────────────────────
  const F = ({ label, value, full }) => {
    if (!value && value !== 0) return null;
    return (
      <View style={[styles.fieldCell, full && styles.fieldFull]}>
        <Text style={[styles.fLabel, isUrdu && styles.rtl]}>{label}:</Text>
        <Text style={[styles.fValue, isUrdu && styles.rtl]} selectable>{value}</Text>
      </View>
    );
  };

  const SectionRow = ({ title, children }) => (
    <View style={styles.sectionRow}>
      <View style={styles.sectionRowHeader}>
        <Text style={[styles.sectionRowTitle, isUrdu && styles.rtl]}>{title}</Text>
      </View>
      <View style={styles.sectionRowContent}>{children}</View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <CheckCircle size={20} color={colors.accent} />
        <Text style={[styles.topTitle, isUrdu && styles.rtl]}>{L.successTitle}</Text>
        <TouchableOpacity
          onPress={() => setLang(l => l === 'en' ? 'ur' : 'en')}
          style={styles.langBtn}
        >
          <Globe size={14} color={colors.accent} />
          <Text style={styles.langBtnText}>{L.language}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Success banner */}
        <View style={styles.successCard}>
          <Text style={[styles.successSub, isUrdu && styles.rtl]}>{L.successSub}</Text>
          <View style={styles.firNoBox}>
            <Text style={[styles.firNoLabel, isUrdu && styles.rtl]}>{L.firNo}:</Text>
            <Text style={styles.firNoValue} selectable>{firNumber}</Text>
          </View>
          {trackData?.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{L.status}: {trackData.status}</Text>
            </View>
          )}
        </View>

        {/* Official FIR Document (on-screen view) */}
        <View style={styles.firDoc}>

          <View style={styles.docHeader}>
            <View style={styles.docHeaderTopRow}>
              <Text style={[styles.docFormNo, isUrdu && styles.rtl]}>{L.formTitle}</Text>
              <Text style={styles.docSerial}>{L.serialNo}: {d.serialNumber || '—'}</Text>
            </View>
            <View style={styles.goldBar} />
            <Text style={[styles.docSubtitle, isUrdu && styles.rtl]}>{L.formSubtitle}</Text>
          </View>

          <View style={[styles.metaRow, isUrdu && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.metaText, isUrdu && styles.rtl]}>
              {L.station}: {d.policeStation || '—'}
            </Text>
            <Text style={[styles.metaText, isUrdu && styles.rtl]}>
              {L.reportDate}: {d.reportDate || d.dateOfIncident || '—'}
            </Text>
            <Text style={[styles.metaText, isUrdu && styles.rtl]}>
              {L.firNo}: {firNumber}
            </Text>
          </View>

          <SectionRow title={L.row1}>
            <View style={styles.twoCol}>
              <F label={L.date} value={d.dateOfIncident} />
              <F label={L.time} value={d.timeOfIncident} />
            </View>
          </SectionRow>

          <SectionRow title={L.row2}>
            <View style={styles.twoCol}>
              <F label={L.name}       value={d.complainantName} />
              <F label={L.fatherName} value={d.fatherName} />
            </View>
            <View style={styles.twoCol}>
              <F label={L.cnic}  value={d.cnic} />
              <F label={L.phone} value={d.contactNumber} />
            </View>
            <F label={L.address}  value={d.address}  full />
            <F label={L.district} value={d.district} />
          </SectionRow>

          <SectionRow title={L.row3}>
            <F label={L.incidentType} value={d.incidentType} full />
            <Text style={[styles.narrativeText, isUrdu && styles.rtl]}>{d.narrative}</Text>
          </SectionRow>

          <SectionRow title={L.row4}>
            <F label={L.place} value={d.placeOfIncident} full />
            <F label={L.distance} value={
              [d.distanceFromStation, d.directionFromStation].filter(Boolean).join(' / ') || '—'
            } />
          </SectionRow>

          <SectionRow title={L.row5}>
            <View style={styles.twoCol}>
              <F label={L.accusedName} value={d.accusedName || (isUrdu ? 'نامعلوم' : 'Unknown')} />
              <F label={L.accusedDesc} value={d.accusedDescription} />
            </View>
            {d.witnessName && (
              <F label={L.witnessName}
                 value={`${d.witnessName}  ${d.witnessContact || ''}`} />
            )}
          </SectionRow>

          {/* PPC chips */}
          <View style={styles.ppcRow}>
            <Text style={[styles.ppcLabel, isUrdu && styles.rtl]}>{L.ppcRow}:</Text>
            <View style={styles.ppcChips}>
              {(d.ppcSections || '').split(',').filter(Boolean).map((sec, i) => (
                <View key={i} style={styles.ppcChip}>
                  <Text style={styles.ppcChipText}>{sec.trim()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.sigFooter}>
            <View style={styles.sigBlock}>
              <View style={styles.sigLine} />
              <Text style={[styles.sigLabel, isUrdu && styles.rtl]}>{L.complainantSig}</Text>
              <Text style={[styles.sigName,  isUrdu && styles.rtl]}>{d.complainantName}</Text>
            </View>
            <View style={styles.stampCircle}>
              <Text style={styles.stampLabel}>{L.stamp}</Text>
            </View>
            <View style={styles.sigBlock}>
              <View style={styles.sigLine} />
              <Text style={[styles.sigLabel, isUrdu && styles.rtl]}>{L.officerSig}</Text>
              <Text style={[styles.sigName,  isUrdu && styles.rtl]}>{d.siName || L.siName}</Text>
              <Text style={styles.sigDate}>{d.reportDate || d.dateOfIncident}</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnDownload, downloading && styles.btnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading
              ? <ActivityIndicator color="white" size="small" />
              : <Download size={18} color="white" />}
            <Text style={styles.btnText}>
              {downloading ? L.downloading : L.downloadBtn}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnTrack]}
            onPress={() => navigation.navigate('TrackFIR', { firNumber })}
          >
            <FileText size={18} color="white" />
            <Text style={styles.btnText}>{L.trackBtn}</Text>
          </Pressable>

          <View style={styles.rowBtns}>
            <Pressable
              style={[styles.btn, styles.btnHome, { flex: 1 }]}
              onPress={() => navigation.navigate('HomeMain')}
            >
              <Home size={18} color="white" />
              <Text style={styles.btnText}>{L.homeBtn}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnNew, { flex: 1 }]}
              onPress={() => navigation.navigate('DraftFIR')}
            >
              <RotateCcw size={18} color={colors.primary} />
              <Text style={[styles.btnText, { color: colors.primary }]}>{L.newFIR}</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  scroll:           { paddingBottom: 40 },

  topBar:           { flexDirection: 'row', backgroundColor: colors.primary,
                      alignItems: 'center', justifyContent: 'space-between',
                      paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  topTitle:         { flex: 1, color: 'white', fontWeight: '700', fontSize: 15 },
  langBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4,
                      borderWidth: 1, borderColor: colors.accent, borderRadius: 8,
                      paddingHorizontal: 8, paddingVertical: 4 },
  langBtnText:      { color: colors.accent, fontWeight: '700', fontSize: 12 },
  rtl:              { textAlign: 'right', writingDirection: 'rtl' },

  successCard:      { backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#86EFAC',
                      margin: 16, borderRadius: 10, padding: 14 },
  successSub:       { fontSize: 13, color: colors.success, marginBottom: 10 },
  firNoBox:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  firNoLabel:       { fontSize: 13, fontWeight: '700', color: colors.primary },
  firNoValue:       { fontSize: 15, fontWeight: '700', color: colors.text, letterSpacing: 0.5 },
  statusBadge:      { alignSelf: 'flex-start', backgroundColor: colors.accent,
                      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  statusText:       { fontSize: 12, fontWeight: '600', color: '#3D2B00' },

  firDoc:           { borderWidth: 2.5, borderColor: colors.border,
                      margin: 16, backgroundColor: '#FFFEF8' },
  docHeader:        { borderBottomWidth: 1, borderColor: colors.border, padding: 10 },
  docHeaderTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docFormNo:        { fontSize: 13, fontWeight: '800', color: colors.primary },
  docSerial:        { fontSize: 12, fontWeight: '700', color: colors.text },
  goldBar:          { height: 3, backgroundColor: colors.accent, marginVertical: 5 },
  docSubtitle:      { fontSize: 10, color: colors.text, textAlign: 'center',
                      borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderLight,
                      paddingVertical: 3 },

  metaRow:          { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap',
                      borderBottomWidth: 1, borderColor: colors.border,
                      paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surface },
  metaText:         { fontSize: 11, fontWeight: '600', color: colors.text },

  sectionRow:       { borderBottomWidth: 1, borderColor: colors.border },
  sectionRowHeader: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6 },
  sectionRowTitle:  { color: 'white', fontWeight: '700', fontSize: 12 },
  sectionRowContent:{ padding: 10 },

  twoCol:           { flexDirection: 'row', flexWrap: 'wrap' },
  fieldCell:        { width: '50%', marginBottom: 6, paddingRight: 6 },
  fieldFull:        { width: '100%' },
  fLabel:           { fontSize: 11, fontWeight: '700', color: colors.textSec },
  fValue:           { fontSize: 12, color: colors.text, marginTop: 1 },
  narrativeText:    { fontSize: 12, color: colors.text, lineHeight: 20, marginTop: 4 },

  ppcRow:           { backgroundColor: '#E8E8E0', borderBottomWidth: 1,
                      borderColor: colors.border, padding: 10 },
  ppcLabel:         { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  ppcChips:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ppcChip:          { borderWidth: 2, borderColor: colors.border,
                      paddingHorizontal: 10, paddingVertical: 2 },
  ppcChipText:      { fontSize: 12, fontWeight: '700', color: colors.text },

  sigFooter:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
                      padding: 12, borderTopWidth: 2, borderColor: colors.border },
  sigBlock:         { alignItems: 'center', flex: 1 },
  sigLine:          { borderBottomWidth: 1, borderColor: colors.border,
                      width: 80, marginBottom: 4, marginTop: 28 },
  sigLabel:         { fontSize: 10, fontWeight: '700', color: colors.textSec, textAlign: 'center' },
  sigName:          { fontSize: 10, color: colors.text, textAlign: 'center' },
  sigDate:          { fontSize: 10, color: colors.textSec, textAlign: 'center' },
  stampCircle:      { width: 70, height: 70, borderRadius: 35, borderWidth: 2,
                      borderStyle: 'dashed', borderColor: colors.borderLight,
                      alignItems: 'center', justifyContent: 'center' },
  stampLabel:       { fontSize: 9, color: colors.borderLight, textAlign: 'center', lineHeight: 14 },

  actions:          { padding: 16, gap: 10 },
  rowBtns:          { flexDirection: 'row', gap: 10 },
  btn:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8, paddingVertical: 14, gap: 8 },
  btnText:          { color: 'white', fontWeight: '700', fontSize: 15 },
  btnDownload:      { backgroundColor: colors.primary },
  btnTrack:         { backgroundColor: colors.success },
  btnHome:          { backgroundColor: '#6B7280' },
  btnNew:           { backgroundColor: 'white', borderWidth: 1.5, borderColor: colors.primary },
  btnDisabled:      { opacity: 0.65 },
});