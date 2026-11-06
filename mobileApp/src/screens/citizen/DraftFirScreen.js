// screens/citizen/DraftFirScreen.js – OFFICIAL PAKISTAN POLICE FIR FORM 5-24
// Added suspect fields: accusedName, accusedFatherName, accusedCnic, accusedDistrict
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Alert, Platform, Image, Share,
  Dimensions, SafeAreaView, StyleSheet, Modal, TouchableOpacity,
  ActivityIndicator, TextInput, FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Send, Eye, Camera, Download, CheckCircle, AlertCircle,
  Globe, FileText, Shield, ShieldCheck, ChevronDown,
} from 'lucide-react-native';

const BASE_URL = 'http://http://localhost:5000/api/api';
const { width, height } = Dimensions.get('window');

// ─── Colors ────────────────────────────────────────────
const colors = {
  primary: '#1B3A6B',
  accent: '#C8A84B',
  background: '#FFFFFF',
  surface: '#F5F5F0',
  border: '#2C2C2C',
  borderLight: '#999',
  text: '#0D0D0D',
  textSec: '#444',
  error: '#B00020',
  success: '#1B6B3A',
  urduBg: '#FFFEF5',
};

// ─── Police Station Mapping (for auto‑detection) ──────
const POLICE_STATIONS = {
  'g-10': { en: 'G-10 Police Station, Islamabad', ur: 'جی-10 تھانہ، اسلام آباد' },
  'g-11': { en: 'G-11 Police Station, Islamabad', ur: 'جی-11 تھانہ، اسلام آباد' },
  'g-9':  { en: 'G-9 Police Station, Islamabad',  ur: 'جی-9 تھانہ، اسلام آباد' },
  'f-10': { en: 'F-10 Police Station, Islamabad', ur: 'ایف-10 تھانہ، اسلام آباد' },
  'f-11': { en: 'F-11 Police Station, Islamabad', ur: 'ایف-11 تھانہ، اسلام آباد' },
  'i-8':  { en: 'I-8 Police Station, Islamabad',  ur: 'آئی-8 تھانہ، اسلام آباد' },
  'i-10': { en: 'I-10 Police Station, Islamabad', ur: 'آئی-10 تھانہ، اسلام آباد' },
  'blue area': { en: 'Kohsar Police Station, Islamabad', ur: 'کوہسار تھانہ، اسلام آباد' },
  'kohsar': { en: 'Kohsar Police Station, Islamabad', ur: 'کوہسار تھانہ، اسلام آباد' },
  'saddar': { en: 'Saddar Police Station, Islamabad', ur: 'سدر تھانہ، اسلام آباد' },
  'tarnol': { en: 'Tarnol Police Station, Islamabad', ur: 'ترنول تھانہ، اسلام آباد' },
};

const getPoliceStation = (location, lang = 'en') => {
  if (!location) return '';
  const loc = location.toLowerCase();
  for (const [key, val] of Object.entries(POLICE_STATIONS)) {
    if (loc.includes(key)) return val[lang] || val.en;
  }
  return lang === 'ur' ? 'اسلام آباد تھانہ' : 'Islamabad Police Station';
};

// ─── Station List for Dropdown ──────────────────────────
const STATIONS = [
  { name: 'G-10 Police Station', code: 'G-10' },
  { name: 'G-11 Police Station', code: 'G-11' },
  { name: 'F-10 Police Station', code: 'F-10' },
  { name: 'F-11 Police Station', code: 'F-11' },
  { name: 'I-8 Police Station', code: 'I-8' },
  { name: 'I-10 Police Station', code: 'I-10' },
  { name: 'Kohsar Police Station', code: 'Kohsar' },
  { name: 'Saddar Police Station', code: 'Saddar' },
  { name: 'Tarnol Police Station', code: 'Tarnol' },
];

// ─── PPC Sections ───────────────────────────────────────
const PPC_SECTIONS = {
  'Theft':            { code: '379 PPC', ur: 'چوری ۔ دفعہ 379 قانون تعزیرات پاکستان' },
  'Robbery':          { code: '392 PPC', ur: 'ڈکیتی ۔ دفعہ 392 قانون تعزیرات پاکستان' },
  'Assault':          { code: '337 PPC', ur: 'حملہ ۔ دفعہ 337 قانون تعزیرات پاکستان' },
  'Fraud':            { code: '420 PPC', ur: 'دھوکہ دہی ۔ دفعہ 420 قانون تعزیرات پاکستان' },
  'Harassment':       { code: '509 PPC', ur: 'ہراسانی ۔ دفعہ 509 قانون تعزیرات پاکستان' },
  'Traffic Accident': { code: '279 PPC', ur: 'ٹریفک حادثہ ۔ دفعہ 279 قانون تعزیرات پاکستان' },
  'Burglary':         { code: '452 PPC', ur: 'گھر میں داخلہ ۔ دفعہ 452 قانون تعزیرات پاکستان' },
  'Murder':           { code: '302 PPC', ur: 'قتل ۔ دفعہ 302 قانون تعزیرات پاکستان' },
  'Kidnapping':       { code: '365 PPC', ur: 'اغوا ۔ دفعہ 365 قانون تعزیرات پاکستان' },
  'Other':            { code: '154 CrPC', ur: 'دیگر ۔ دفعہ 154 ضابطہ فوجداری' },
};

// ─── Labels (bilingual) ─────────────────────────────────
const LABELS = {
  en: {
    formTitle:         'POLICE FORM NO. (1)5-24',
    formSubtitle:      'First Information Report Form – Code of Criminal Procedure Section 154',
    station:           'Police Station',
    reportDate:        'Date/Time of Report',
    firNo:             'FIR No.',
    row1Title:         '1.  Date/Time of Incident',
    row2Title:         '2.  Complainant / Aggrieved Party Details',
    row3Title:         '3.  Mode of Information / Circumstances',
    row4Title:         '4.  Place of Incident, Distance from Station & Direction',
    row5Title:         '5.  Investigation / Action Taken',
    row6Title:         '6.  Time Report Received',
    name:              'Full Name',
    fatherName:        "Father's / Husband's Name",
    cnic:              'CNIC No.',
    phone:             'Phone',
    email:             'Email',
    address:           'Address',
    incidentType:      'Nature of Offence',
    date:              'Date',
    time:              'Time',
    place:             'Place of Incident',
    accusedName:       'Accused Name',
    accusedFatherName: "Accused's Father Name",
    accusedCnic:       'Accused CNIC',
    accusedDistrict:   'Accused District',
    accusedDesc:       'Physical Description',
    ppc:               'Applicable Sections',
    policeStation:     'Police Station',
    narrative:         'Incident Narrative (Beyan)',
    witnessName:       'Witness Name',
    witnessPhone:      'Witness Phone',
    urgency:           'Urgency Level',
    submitFIR:         'Submit FIR',
    preview:           'Preview Official FIR',
    suspectPhoto:      'Suspect Photo (Optional)',
    addPhoto:          'Add Photo',
    chooseSource:      'Choose Image Source',
    camera:            'Camera',
    gallery:           'Gallery',
    cancel:            'Cancel',
    language:          'عردو',
    required:          'Required',
    invalidCnic:       'Format: XXXXX-XXXXXXX-X',
    invalidPhone:      'Format: 03XX-XXXXXXX',
    submitting:        'Submitting…',
    offline:           'Saved offline',
    siName:            'Station Investigation Officer',
    complainantSig:    'Complainant Signature',
    officerSig:        'S.H.O. / S.I. Signature',
    stamp:             'Official Stamp',
    govtPak:           'GOVERNMENT OF PAKISTAN',
    police:            'POLICE DEPARTMENT',
    crpc:              '(Under Section 154 CrPC)',
    serialNo:          'Serial No.',
    distanceDir:       'Distance from Station / Direction',
    district:          'District',
  },
  ur: {
    formTitle:         'پولیس فارم نمبر (1)5-24',
    formSubtitle:      'ابتدائی اطلاع/رپورٹ فارم قانون ضابطہ فوجداری دفعہ 154 مجموعہ ضابطہ فوجداری',
    station:           'تھانہ',
    reportDate:        'تاریخ وقت رپورٹ',
    firNo:             'آئی ڈی فیر نمبر',
    row1Title:         '۱.  تاریخ وقت واقعہ',
    row2Title:         '۲.  جامع سکونت اطلاع دہندہ / متضرر',
    row3Title:         '۳.  طریقہ اطلاع/صورت حال از کو کیا ہوا',
    row4Title:         '۴.  جائے واقعہ فاصلہ تھانہ سے اور سمت',
    row5Title:         '۵.  کاروائی تحقیق اطلاع کرنے والے بارے میں',
    row6Title:         '۶.  اطلاع رسید وقت',
    name:              'مکمل نام',
    fatherName:        'والد/شوہر کا نام',
    cnic:              'شناختی کارڈ نمبر',
    phone:             'فون نمبر',
    email:             'ای میل',
    address:           'پتہ',
    incidentType:      'نوعیت جرم',
    date:              'تاریخ',
    time:              'وقت',
    place:             'جائے واقعہ',
    accusedName:       'ملزم کا نام',
    accusedFatherName: 'ملزم کے والد کا نام',
    accusedCnic:       'ملزم کا شناختی کارڈ',
    accusedDistrict:   'ملزم کا ضلع',
    accusedDesc:       'جسمانی تفصیل',
    ppc:               'دفعات قابل اطلاق',
    policeStation:     'تھانہ',
    narrative:         'بیان واقعہ',
    witnessName:       'گواہ کا نام',
    witnessPhone:      'گواہ کا فون',
    urgency:           'ہنگامی درجہ',
    submitFIR:         'ایف آئی آر جمع کریں',
    preview:           'سرکاری ایف آئی آر دیکھیں',
    suspectPhoto:      'ملزم کی تصویر (اختیاری)',
    addPhoto:          'تصویر شامل کریں',
    chooseSource:      'تصویر کا ذریعہ منتخب کریں',
    camera:            'کیمرہ',
    gallery:           'گیلری',
    cancel:            'منسوخ',
    language:          'English',
    required:          'لازمی',
    invalidCnic:       'فارمیٹ: XXXXX-XXXXXXX-X',
    invalidPhone:      'فارمیٹ: 03XX-XXXXXXX',
    submitting:        'جمع ہو رہا ہے…',
    offline:           'آف لائن محفوظ',
    siName:            'تفتیشی افسر',
    complainantSig:    'دستخط مدعی',
    officerSig:        'دستخط ایس ایچ او / ایس آئی',
    stamp:             'سرکاری مہر',
    govtPak:           'حکومت پاکستان',
    police:            'محکمہ پولیس',
    crpc:              '(بموجب دفعہ 154 ضابطہ فوجداری)',
    serialNo:          'سیریل نمبر',
    distanceDir:       'فاصلہ تھانہ / سمت',
    district:          'ضلع',
  },
};

// ─── Main Component ──────────────────────────────────────
export function DraftFirScreen({ route, navigation }) {
  const { mode, transcript, extractedData, language: initLang = 'en' } = route.params || {};
  const [lang, setLang] = useState(initLang === 'urdu' ? 'ur' : 'en');
  const L = LABELS[lang];
  const isUrdu = lang === 'ur';

  const [formData, setFormData] = useState({
    firNumber:        `FIR-${Date.now().toString().slice(-6)}`,
    serialNumber:     `${Math.floor(Math.random() * 90000000 + 10000000)}`,
    complainantName:  '',
    fatherName:       '',
    cnic:             '',
    contactNumber:    '',
    email:            '',
    address:          '',
    district:         'Islamabad',
    incidentType:     '',
    dateOfIncident:   new Date().toISOString().split('T')[0],
    timeOfIncident:   '',
    placeOfIncident:  '',
    distanceFromStation: '',
    directionFromStation: '',
    policeStation:    '',
    narrative:        transcript || '',
    accusedName:      '',
    accusedFatherName: '',
    accusedCnic:      '',
    accusedDistrict:  '',
    accusedDescription: '',
    ppcSections:      '',
    urgency:          'Normal',
    witnessName:      '',
    witnessContact:   '',
    witnessStatement: '',
    siName:           '',
    reportTime:       new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    reportDate:       new Date().toLocaleDateString('en-PK'),
  });

  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [suspectImage, setSuspectImage] = useState(null);
  const [showPreview, setShowPreview]   = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [isStationManuallySet, setIsStationManuallySet] = useState(false);

  // ── AI auto-fill ─────────────────────────────────────
  useEffect(() => {
    if (extractedData) {
      const place = extractedData.placeOfIncident || '';
      const autoStation = getPoliceStation(place, lang);
      const ppcEntry = PPC_SECTIONS[extractedData.incidentType];
      const ppc = isUrdu
        ? (ppcEntry?.ur || '154 ضابطہ فوجداری')
        : (ppcEntry?.code || '154 CrPC');

      setFormData(prev => ({
        ...prev,
        complainantName:     extractedData.complainantName  || prev.complainantName,
        fatherName:          extractedData.fatherName       || prev.fatherName,
        cnic:                extractedData.cnic             || prev.cnic,
        contactNumber:       extractedData.contactNumber    || prev.contactNumber,
        address:             extractedData.address          || prev.address,
        incidentType:        extractedData.incidentType     || prev.incidentType,
        placeOfIncident:     place,
        policeStation:       !isStationManuallySet ? (extractedData.policeStation || autoStation) : prev.policeStation,
        ppcSections:         extractedData.ppcSections      || ppc,
        narrative:           transcript                     || prev.narrative,
        urgency:             extractedData.urgencyLevel     || prev.urgency,
        accusedName:         extractedData.accusedName      || prev.accusedName,
        accusedFatherName:   extractedData.accusedFatherName || prev.accusedFatherName,
        accusedCnic:         extractedData.accusedCnic      || prev.accusedCnic,
        accusedDistrict:     extractedData.accusedDistrict  || prev.accusedDistrict,
        accusedDescription:  extractedData.accusedDescription || '',
        dateOfIncident:      extractedData.dateOfIncident   || prev.dateOfIncident,
        timeOfIncident:      extractedData.timeOfIncident   || prev.timeOfIncident,
        witnessName:         extractedData.witnesses?.[0]?.name  || prev.witnessName,
        witnessContact:      extractedData.witnesses?.[0]?.phone || prev.witnessContact,
      }));
    }
  }, [extractedData, lang, isStationManuallySet]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Validation ────────────────────────────────────────
  const requiredFields = [
    'complainantName', 'fatherName', 'cnic', 'contactNumber',
    'incidentType', 'dateOfIncident', 'placeOfIncident',
    'narrative', 'ppcSections', 'policeStation',
  ];

  const validate = () => {
    const errs = {};
    requiredFields.forEach(f => {
      if (!formData[f]?.trim()) errs[f] = L.required;
    });
    if (formData.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic))
      errs.cnic = L.invalidCnic;
    if (formData.contactNumber && !/^03\d{2}-?\d{7}$/.test(formData.contactNumber))
      errs.contactNumber = L.invalidPhone;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save Draft ────────────────────────────────────────
  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem(`draft_${formData.firNumber}`, JSON.stringify(formData));
      Alert.alert(isUrdu ? 'مسودہ محفوظ' : 'Draft Saved', formData.firNumber);
    } catch (e) {}
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('@smartfir_token');
      const body  = { ...formData, language: lang, suspectImage: suspectImage || null };
      const res   = await fetch(`${BASE_URL}/firs`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.removeItem(`draft_${formData.firNumber}`);
        navigation.navigate('Confirmation', {
          firData: { ...formData, ...(data.fir || {}), language: lang },
          language: lang,
        });
      } else {
        Alert.alert(isUrdu ? 'خرابی' : 'Error', data.message || 'Submission failed');
      }
    } catch (err) {
      navigation.navigate('Confirmation', {
        firData: { ...formData, status: 'pending_offline', language: lang },
        language: lang,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Official FIR HTML ──────────────────────────────
  const generateFIRHTML = () => {
    const d  = formData;
    const Lh = LABELS[lang];
    const rtl = lang === 'ur';
    return `<!DOCTYPE html>
<html dir="${rtl ? 'rtl' : 'ltr'}" lang="${rtl ? 'ur' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>FIR - ${d.firNumber}</title>
  <style>
    @page { margin: 0.6in; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${rtl ? "'Noto Nastaliq Urdu','Jameel Noori Nastaleeq',serif" : "'Times New Roman',serif"};
      font-size: ${rtl ? '14px' : '12px'};
      color: #000;
      line-height: 1.6;
      padding: 24px;
      direction: ${rtl ? 'rtl' : 'ltr'};
    }
    .outer-border { border: 3px double #000; padding: 16px; }
    .form-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 0; }
    .form-number-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .form-number { font-size: 13px; font-weight: bold; }
    .serial-number { font-size: 13px; font-weight: bold; }
    .form-subtitle {
      font-size: ${rtl ? '13px' : '11px'}; text-align: center; margin-top: 4px;
      border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0;
    }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding: 6px 0; font-size: 12px; }
    .meta-item { display: flex; gap: 6px; }
    .meta-label { font-weight: bold; white-space: nowrap; }
    .fir-table { width: 100%; border-collapse: collapse; margin-top: 0; }
    .fir-table td, .fir-table th { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
    .row-label { font-weight: bold; font-size: ${rtl ? '13px' : '12px'}; white-space: nowrap; width: 30%; background: #f0f0e8; }
    .row-value { font-size: ${rtl ? '13px' : '12px'}; width: 70%; }
    .row-value.narrative { min-height: 80px; }
    .col-header { background: #1B3A6B; color: white; font-weight: bold; text-align: center; font-size: 12px; padding: 6px; }
    .ppc-box { border: 2px solid #000; text-align: center; padding: 4px; font-weight: bold; margin: 4px 2px; display: inline-block; min-width: 80px; }
    .stamp-area { border: 2px dashed #000; width: 120px; height: 90px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; color: #888; border-radius: 50%; margin: 10px; }
    .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; border-top: 2px solid #000; padding-top: 16px; }
    .sig-block { text-align: center; }
    .sig-line { border-bottom: 1px solid #000; width: 160px; margin: 30px auto 4px; }
    .sig-label { font-size: 11px; font-weight: bold; }
    .gold-bar { background: #C8A84B; height: 4px; margin: 4px 0; }
    .section-row td { background: #e8e8e0; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
<div class="outer-border">
  <div class="form-header">
    <div class="form-number-row">
      <span class="form-number">${Lh.formTitle}</span>
      <span class="serial-number">${Lh.serialNo}: ${d.serialNumber}</span>
    </div>
    <div class="gold-bar"></div>
    <div class="form-subtitle">${Lh.formSubtitle}</div>
  </div>
  <div class="meta-row">
    <div class="meta-item"><span class="meta-label">${Lh.station}:</span><span>${d.policeStation}</span></div>
    <div class="meta-item"><span class="meta-label">${Lh.reportDate}:</span><span>${d.reportDate} ${d.reportTime}</span></div>
    <div class="meta-item"><span class="meta-label">${Lh.firNo}:</span><span>${d.firNumber}</span></div>
  </div>
  <table class="fir-table">
    <tr><td class="row-label">${Lh.row1Title}</td><td class="row-value"><strong>${Lh.date}:</strong> ${d.dateOfIncident} &nbsp;&nbsp; <strong>${Lh.time}:</strong> ${d.timeOfIncident || '—'}</td><td class="row-label" style="width:20%">${Lh.row6Title}</td><td class="row-value" style="width:20%">${d.reportDate} ${d.reportTime}</td></tr>
    <tr><td class="row-label">${Lh.row2Title}</td><td class="row-value" colspan="3"><strong>${Lh.name}:</strong> ${d.complainantName} &nbsp;|&nbsp; <strong>${Lh.fatherName}:</strong> ${d.fatherName}<br/><strong>${Lh.cnic}:</strong> ${d.cnic} &nbsp;|&nbsp; <strong>${Lh.phone}:</strong> ${d.contactNumber}<br/><strong>${Lh.address}:</strong> ${d.address || '—'} &nbsp;|&nbsp; <strong>${Lh.district}:</strong> ${d.district}</td></tr>
    <tr><td class="row-label">${Lh.row3Title}</td><td class="row-value narrative" colspan="3">${d.narrative}</td></tr>
    <tr><td class="row-label">${Lh.row4Title}</td><td class="row-value" colspan="3"><strong>${Lh.place}:</strong> ${d.placeOfIncident}<br/><strong>${Lh.distanceDir}:</strong> ${d.distanceFromStation || '—'} / ${d.directionFromStation || '—'}</td></tr>
    <tr><td class="row-label">${Lh.row5Title}</td><td class="row-value" colspan="3"><strong>${Lh.accusedName}:</strong> ${d.accusedName || (rtl ? 'نامعلوم' : 'Unknown')}<br/><strong>${Lh.accusedFatherName}:</strong> ${d.accusedFatherName || '—'}<br/><strong>${Lh.accusedCnic}:</strong> ${d.accusedCnic || '—'}<br/><strong>${Lh.accusedDistrict}:</strong> ${d.accusedDistrict || '—'}<br/><strong>${Lh.accusedDesc}:</strong> ${d.accusedDescription || '—'}<br/>${d.witnessName ? `<strong>${Lh.witnessName}:</strong> ${d.witnessName} &nbsp; ${d.witnessContact}` : ''}</td></tr>
    <tr class="section-row"><td colspan="4" style="text-align:${rtl ? 'right' : 'left'}; padding: 8px 10px;"><strong>${Lh.ppc}:</strong> &nbsp; ${d.ppcSections.split(',').map(s => `<span class="ppc-box">${s.trim()}</span>`).join(' ')} &nbsp;|&nbsp; <strong>${Lh.incidentType}:</strong> ${d.incidentType}</td></tr>
  </table>
  <div class="footer-row">
    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">${Lh.complainantSig}</div><div style="font-size:11px; margin-top:4px">${d.complainantName}</div></div>
    <div style="text-align:center"><div class="stamp-area">${Lh.stamp}</div></div>
    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">${Lh.officerSig}</div><div style="font-size:11px; margin-top:4px">${d.siName || Lh.siName}</div><div style="font-size:11px">${d.reportDate}</div></div>
  </div>
</div>
</body>
</html>`;
  };

  // ── Suspect photo ─────────────────────────────────────
  const pickImage = async (type) => {
    const perm = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(isUrdu ? 'اجازت درکار ہے' : 'Permission required');
      return;
    }
    const method = type === 'camera'
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await method({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [3, 4], quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const opt = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setSuspectImage(opt.uri);
    }
  };

  // ── Field Component ───────────────────────────────────
  const FIRField = ({ label, field, placeholder, multiline, keyboardType, maxLength, required: req }) => (
    <View style={[styles.fieldRow, isUrdu && styles.fieldRowRtl]}>
      <Text style={[styles.fieldLabel, isUrdu && styles.rtlText]}>
        {label}{req && <Text style={styles.asterisk}> *</Text>}
      </Text>
      <View style={[styles.fieldInputWrap, errors[field] && styles.inputErr]}>
        <TextInput
          style={[styles.fieldInput, isUrdu && styles.rtlInput, multiline && styles.multilineInput]}
          value={formData[field]}
          onChangeText={v => handleChange(field, v)}
          placeholder={placeholder}
          placeholderTextColor="#AAA"
          multiline={multiline}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          textAlign={isUrdu ? 'right' : 'left'}
        />
      </View>
      {errors[field] && (
        <Text style={[styles.errText, isUrdu && styles.rtlText]}>{errors[field]}</Text>
      )}
    </View>
  );

  // ── Row Header ────────────────────────────────────────
  const RowHeader = ({ label }) => (
    <View style={styles.rowHeader}>
      <Text style={[styles.rowHeaderText, isUrdu && styles.rtlText]}>{label}</Text>
    </View>
  );

  // ── Station Picker ────────────────────────────────────
  const StationPicker = () => (
    <>
      <TouchableOpacity
        style={styles.stationPickerTrigger}
        onPress={() => setShowStationPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.stationPickerText, isUrdu && styles.rtlText]}>
          {formData.policeStation || (isUrdu ? 'تھانہ منتخب کریں' : 'Select Police Station')}
        </Text>
        <ChevronDown size={20} color={colors.textSec} />
      </TouchableOpacity>

      <Modal visible={showStationPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.stationPickerModal}>
            <View style={styles.stationPickerHeader}>
              <Text style={styles.stationPickerTitle}>
                {isUrdu ? 'تھانہ منتخب کریں' : 'Select Police Station'}
              </Text>
              <TouchableOpacity onPress={() => setShowStationPicker(false)}>
                <Text style={styles.stationPickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={STATIONS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stationItem}
                  onPress={() => {
                    handleChange('policeStation', item.name);
                    setIsStationManuallySet(true);
                    setShowStationPicker(false);
                  }}
                >
                  <Text style={[styles.stationItemText, isUrdu && styles.rtlText]}>
                    {item.name}
                  </Text>
                  {formData.policeStation === item.name && (
                    <CheckCircle size={18} color={colors.success} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.stationList}
            />
          </View>
        </View>
      </Modal>
    </>
  );

  // ── Render ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Shield size={20} color="white" />
          <Text style={styles.topBarTitle}>{L.formTitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang(l => l === 'en' ? 'ur' : 'en')}
        >
          <Globe size={16} color={colors.accent} />
          <Text style={styles.langBtnText}>{L.language}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Form subtitle */}
        <View style={styles.subtitleBar}>
          <Text style={[styles.subtitleText, isUrdu && styles.rtlText]}>{L.formSubtitle}</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{L.serialNo}:</Text>
            <Text style={styles.metaValue}>{formData.serialNumber}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{L.firNo}:</Text>
            <Text style={styles.metaValue}>{formData.firNumber}</Text>
          </View>
        </View>

        {/* ROW 1 – Date/Time */}
        <RowHeader label={L.row1Title} />
        <View style={styles.card}>
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FIRField label={L.date} field="dateOfIncident" placeholder="YYYY-MM-DD" required />
            </View>
            <View style={styles.colHalf}>
              <FIRField label={L.time} field="timeOfIncident" placeholder="HH:MM" />
            </View>
          </View>
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FIRField label={L.reportDate} field="reportDate" placeholder="" />
            </View>
            <View style={styles.colHalf}>
              <FIRField label={L.row6Title} field="reportTime" placeholder="" />
            </View>
          </View>
        </View>

        {/* ROW 2 – Complainant */}
        <RowHeader label={L.row2Title} />
        <View style={styles.card}>
          <FIRField label={L.name} field="complainantName" placeholder="" required />
          <FIRField label={L.fatherName} field="fatherName" placeholder="" required />
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FIRField label={L.cnic} field="cnic" placeholder="XXXXX-XXXXXXX-X" keyboardType="numbers-and-punctuation" maxLength={15} required />
            </View>
            <View style={styles.colHalf}>
              <FIRField label={L.phone} field="contactNumber" placeholder="03XX-XXXXXXX" keyboardType="phone-pad" maxLength={12} required />
            </View>
          </View>
          <FIRField label={L.address} field="address" placeholder="" multiline />
          <FIRField label={L.district} field="district" placeholder="" />
          <FIRField label={L.email} field="email" placeholder="" keyboardType="email-address" />
        </View>

        {/* ROW 3 – Narrative */}
        <RowHeader label={L.row3Title} />
        <View style={styles.card}>
          <FIRField label={L.incidentType} field="incidentType" placeholder="" required />
          <FIRField label={L.narrative} field="narrative" placeholder="" required multiline />
        </View>

        {/* ROW 4 – Place */}
        <RowHeader label={L.row4Title} />
        <View style={styles.card}>
          <FIRField label={L.place} field="placeOfIncident" placeholder="" required multiline />
          <Text style={[styles.fieldLabel, isUrdu && styles.rtlText]}>{L.policeStation}</Text>
          <View style={styles.stationPickerWrapper}>
            <StationPicker />
          </View>
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FIRField label={L.distanceDir} field="distanceFromStation" placeholder="" />
            </View>
            <View style={styles.colHalf}>
              <FIRField label="" field="directionFromStation" placeholder={isUrdu ? 'سمت' : 'Direction'} />
            </View>
          </View>
        </View>

        {/* ROW 5 – Accused + Investigation (NEW SUSPECT FIELDS) */}
        <RowHeader label={L.row5Title} />
        <View style={styles.card}>
          <FIRField label={L.accusedName} field="accusedName" placeholder="" />
          <FIRField label={L.accusedFatherName} field="accusedFatherName" placeholder="" />
          <FIRField label={L.accusedCnic} field="accusedCnic" placeholder="XXXXX-XXXXXXX-X" keyboardType="numbers-and-punctuation" />
          <FIRField label={L.accusedDistrict} field="accusedDistrict" placeholder="" />
          <FIRField label={L.accusedDesc} field="accusedDescription" placeholder="" multiline />
          <FIRField label={L.witnessName} field="witnessName" placeholder="" />
          <FIRField label={L.witnessPhone} field="witnessContact" placeholder="" keyboardType="phone-pad" />
          <FIRField label={L.siName} field="siName" placeholder="" />
        </View>

        {/* PPC Sections */}
        <View style={styles.ppcBar}>
          <Text style={[styles.ppcLabel, isUrdu && styles.rtlText]}>{L.ppc}</Text>
          <TextInput
            style={[styles.ppcInput, isUrdu && styles.rtlInput, errors.ppcSections && styles.inputErr]}
            value={formData.ppcSections}
            onChangeText={v => handleChange('ppcSections', v)}
            placeholder={isUrdu ? 'مثلاً 379 قانون تعزیرات' : 'e.g. 379 PPC, 392 PPC'}
            placeholderTextColor="#AAA"
            textAlign={isUrdu ? 'right' : 'left'}
          />
          {errors.ppcSections && <Text style={styles.errText}>{errors.ppcSections}</Text>}
        </View>

        {/* Suspect Photo */}
        <RowHeader label={L.suspectPhoto} />
        <View style={styles.card}>
          <TouchableOpacity
            style={suspectImage ? styles.photoBox : styles.uploadBox}
            onPress={() => {
              if (suspectImage) {
                setSuspectImage(null);
              } else {
                Alert.alert(L.chooseSource, '', [
                  { text: L.camera, onPress: () => pickImage('camera') },
                  { text: L.gallery, onPress: () => pickImage('gallery') },
                  { text: L.cancel, style: 'cancel' },
                ]);
              }
            }}
          >
            {suspectImage ? (
              <>
                <Image source={{ uri: suspectImage }} style={styles.photoPreview} />
                <View style={styles.photoOverlay}>
                  <Text style={{ color: 'white', fontSize: 12 }}>✕ {isUrdu ? 'ہٹائیں' : 'Remove'}</Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadInner}>
                <Camera size={28} color={colors.primary} />
                <Text style={[styles.uploadText, isUrdu && styles.rtlText]}>{L.addPhoto}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="white" /> : <Send size={18} color="white" />}
            <Text style={styles.btnSubmitText}>{submitting ? L.submitting : L.submitFIR}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPreview} onPress={() => setShowPreview(true)}>
            <Eye size={18} color={colors.primary} />
            <Text style={styles.btnPreviewText}>{L.preview}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDraft} onPress={saveDraft}>
            <FileText size={18} color={colors.textSec} />
            <Text style={styles.btnDraftText}>{isUrdu ? 'مسودہ محفوظ کریں' : 'Save Draft'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Preview Modal (unchanged) */}
      <Modal visible={showPreview} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isUrdu && styles.rtlText]}>
                {isUrdu ? 'سرکاری ایف آئی آر فارم' : 'Official FIR Preview'}
              </Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: height * 0.65 }}>
              <View style={styles.previewDoc}>
                <View style={styles.previewHeader}>
                  <Text style={[styles.previewFormNo, isUrdu && styles.rtlText]}>{L.formTitle}</Text>
                  <Text style={[styles.previewSerial, isUrdu && styles.rtlText]}>
                    {L.serialNo}: {formData.serialNumber}
                  </Text>
                </View>
                <View style={styles.goldBar} />
                <Text style={[styles.previewSubtitle, isUrdu && styles.rtlText]}>{L.formSubtitle}</Text>

                <View style={styles.previewMetaRow}>
                  <Text style={[styles.previewMeta, isUrdu && styles.rtlText]}>
                    {L.station}: {formData.policeStation}
                  </Text>
                  <Text style={[styles.previewMeta, isUrdu && styles.rtlText]}>
                    {L.firNo}: {formData.firNumber}
                  </Text>
                </View>

                {[
                  {
                    title: L.row1Title,
                    content: `${L.date}: ${formData.dateOfIncident}  ${L.time}: ${formData.timeOfIncident || '—'}`
                  },
                  {
                    title: L.row2Title,
                    content: `${L.name}: ${formData.complainantName}\n${L.fatherName}: ${formData.fatherName}\n${L.cnic}: ${formData.cnic}  ${L.phone}: ${formData.contactNumber}`
                  },
                  {
                    title: L.row3Title,
                    content: `${L.incidentType}: ${formData.incidentType}\n\n${formData.narrative}`
                  },
                  {
                    title: L.row4Title,
                    content: `${L.place}: ${formData.placeOfIncident}`
                  },
                  {
                    title: L.row5Title,
                    content: `${L.accusedName}: ${formData.accusedName || '—'}\n${L.accusedFatherName}: ${formData.accusedFatherName || '—'}\n${L.accusedCnic}: ${formData.accusedCnic || '—'}\n${L.accusedDistrict}: ${formData.accusedDistrict || '—'}\n${L.accusedDesc}: ${formData.accusedDescription || '—'}`
                  },
                ].map((sec, i) => (
                  <View key={i} style={styles.previewSection}>
                    <Text style={[styles.previewSecTitle, isUrdu && styles.rtlText]}>{sec.title}</Text>
                    <Text style={[styles.previewSecContent, isUrdu && styles.rtlText]}>{sec.content}</Text>
                  </View>
                ))}

                <View style={styles.previewPpcRow}>
                  <Text style={[styles.previewPpc, isUrdu && styles.rtlText]}>
                    {L.ppc}: {formData.ppcSections}
                  </Text>
                </View>

                {suspectImage && (
                  <Image source={{ uri: suspectImage }} style={styles.previewImg} />
                )}

                <View style={styles.previewSigRow}>
                  <View style={styles.previewSigBlock}>
                    <View style={styles.sigLine} />
                    <Text style={[styles.sigLabel, isUrdu && styles.rtlText]}>{L.complainantSig}</Text>
                  </View>
                  <View style={styles.stampCircle}>
                    <Text style={styles.stampText}>{L.stamp}</Text>
                  </View>
                  <View style={styles.previewSigBlock}>
                    <View style={styles.sigLine} />
                    <Text style={[styles.sigLabel, isUrdu && styles.rtlText]}>{L.officerSig}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnSubmit, { flex: 1, marginRight: 8 }]}
                onPress={() => { setShowPreview(false); handleSubmit(); }}
              >
                <Send size={16} color="white" />
                <Text style={styles.btnSubmitText}>{L.submitFIR}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPreview, { flex: 1 }]}
                onPress={() => {
                  setShowPreview(false);
                  const html = generateFIRHTML();
                  Share.share({ message: html, title: `FIR-${formData.firNumber}.html` });
                }}
              >
                <Download size={16} color={colors.primary} />
                <Text style={styles.btnPreviewText}>{isUrdu ? 'ڈاؤن لوڈ' : 'Download'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  scroll:          { paddingBottom: 40 },

  // Top bar
  topBar:          { flexDirection: 'row', backgroundColor: colors.primary, alignItems: 'center',
                     justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarTitle:     { color: 'white', fontWeight: '700', fontSize: 14 },
  langBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4,
                     borderWidth: 1, borderColor: colors.accent, borderRadius: 8,
                     paddingHorizontal: 10, paddingVertical: 4 },
  langBtnText:     { color: colors.accent, fontWeight: '700', fontSize: 13 },

  // Subtitle
  subtitleBar:     { backgroundColor: '#F5F0E0', borderBottomWidth: 1, borderBottomColor: colors.border,
                     padding: 10 },
  subtitleText:    { fontSize: 11, color: colors.text, textAlign: 'center', fontStyle: 'italic' },

  // Meta row
  metaRow:         { flexDirection: 'row', justifyContent: 'space-between',
                     borderBottomWidth: 1, borderBottomColor: colors.borderLight,
                     paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface },
  metaItem:        { flexDirection: 'row', gap: 4 },
  metaLabel:       { fontWeight: '700', fontSize: 12, color: colors.primary },
  metaValue:       { fontSize: 12, color: colors.text },

  // Row header
  rowHeader:       { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8,
                     marginTop: 2 },
  rowHeaderText:   { color: 'white', fontWeight: '700', fontSize: 13 },

  // Card
  card:            { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
                     paddingHorizontal: 16, paddingVertical: 12 },

  // Field
  fieldRow:        { marginBottom: 12 },
  fieldRowRtl:     { alignItems: 'flex-end' },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 },
  fieldInputWrap:  { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 6,
                     backgroundColor: colors.background, paddingHorizontal: 10 },
  fieldInput:      { fontSize: 14, color: colors.text, paddingVertical: 8 },
  multilineInput:  { minHeight: 80, textAlignVertical: 'top' },
  inputErr:        { borderColor: colors.error },
  errText:         { fontSize: 11, color: colors.error, marginTop: 2 },
  asterisk:        { color: colors.error },
  rtlText:         { textAlign: 'right', writingDirection: 'rtl' },
  rtlInput:        { textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'GeezaPro' : undefined },

  // Two column
  twoCol:          { flexDirection: 'row', gap: 10 },
  colHalf:         { flex: 1 },

  // PPC bar
  ppcBar:          { backgroundColor: '#E8E8E0', borderTopWidth: 2, borderBottomWidth: 2,
                     borderColor: colors.border, padding: 12 },
  ppcLabel:        { fontWeight: '700', fontSize: 13, color: colors.primary, marginBottom: 6 },
  ppcInput:        { borderWidth: 1, borderColor: colors.border, borderRadius: 6,
                     backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8,
                     fontSize: 14, color: colors.text },

  // Photo
  uploadBox:       { borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
                     borderRadius: 10, padding: 20, alignItems: 'center', backgroundColor: colors.background },
  uploadInner:     { alignItems: 'center', gap: 8 },
  uploadText:      { color: colors.primary, fontWeight: '600' },
  photoBox:        { borderRadius: 10, overflow: 'hidden' },
  photoPreview:    { width: '100%', height: 180 },
  photoOverlay:    { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)',
                     paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  // Buttons
  btnGroup:        { padding: 16, gap: 10 },
  btnSubmit:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                     backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, gap: 8 },
  btnSubmitText:   { color: 'white', fontWeight: '700', fontSize: 15 },
  btnPreview:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                     borderWidth: 1.5, borderColor: colors.primary, borderRadius: 8, paddingVertical: 12, gap: 8 },
  btnPreviewText:  { color: colors.primary, fontWeight: '600', fontSize: 15 },
  btnDraft:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                     borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, paddingVertical: 12, gap: 8 },
  btnDraftText:    { color: colors.textSec, fontWeight: '600', fontSize: 15 },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox:        { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20,
                     padding: 20, maxHeight: height * 0.9 },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                     marginBottom: 12 },
  modalTitle:      { fontSize: 18, fontWeight: '700', color: colors.primary },
  modalClose:      { fontSize: 22, color: colors.textSec },
  modalActions:    { flexDirection: 'row', marginTop: 16, gap: 8 },

  // Station Picker Styles
  stationPickerWrapper: { marginBottom: 12 },
  stationPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  stationPickerText: {
    fontSize: 14,
    color: colors.text,
  },
  stationPickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  stationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stationPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  stationPickerClose: {
    fontSize: 22,
    color: colors.textSec,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stationItemText: {
    fontSize: 15,
    color: colors.text,
  },
  stationList: {
    paddingBottom: 20,
  },

  // Preview doc (unchanged)
  previewDoc:      { borderWidth: 2, borderColor: colors.border, padding: 12, backgroundColor: '#FFFEF8' },
  previewHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewFormNo:   { fontWeight: '700', fontSize: 12, color: colors.primary },
  previewSerial:   { fontSize: 11, color: colors.text },
  goldBar:         { height: 3, backgroundColor: colors.accent, marginVertical: 4 },
  previewSubtitle: { fontSize: 10, color: colors.text, textAlign: 'center', marginBottom: 6,
                     borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 3 },
  previewMetaRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
                     borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 4 },
  previewMeta:     { fontSize: 11, color: colors.text },
  previewSection:  { borderBottomWidth: 1, borderColor: colors.borderLight, paddingVertical: 8 },
  previewSecTitle: { fontWeight: '700', fontSize: 11, color: colors.primary, marginBottom: 4 },
  previewSecContent: { fontSize: 12, color: colors.text, lineHeight: 18 },
  previewPpcRow:   { backgroundColor: '#E8E8E0', padding: 8, marginTop: 8 },
  previewPpc:      { fontWeight: '700', fontSize: 12, color: colors.primary },
  previewSigRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
                     marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border },
  previewSigBlock: { alignItems: 'center', flex: 1 },
  sigLine:         { borderBottomWidth: 1, borderColor: colors.border, width: 80, marginBottom: 4 },
  sigLabel:        { fontSize: 9, color: colors.textSec, textAlign: 'center' },
  stampCircle:     { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderStyle: 'dashed',
                     borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  stampText:       { fontSize: 9, color: colors.borderLight, textAlign: 'center' },
});