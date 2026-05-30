
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { optimizeProfile, AIProfileOptimizerOutput } from "@/ai/flows/ai-profile-optimizer";
import { Sparkles, Loader2, Save, User, Church, Briefcase, GraduationCap, Ruler, Heart, Star, UserCircle, Globe, Wallet, MapPin, Camera, Upload, BookOpen, Handshake, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const MAX_PROFILE_IMAGES = 10;

// Full country list for selects (common list)
import { COUNTRIES, DENOMINATIONS } from '@/lib/profileOptions';

// States / provinces for some countries (extendable)
const STATE_MAP: Record<string, string[]> = {
  India: [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
  ],
  "United States": [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
  ],
  USA: [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
  ],
  Canada: [
    'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'
  ],
  Australia: [
    'New South Wales','Queensland','South Australia','Tasmania','Victoria','Western Australia','Australian Capital Territory','Northern Territory'
  ],
  "United Kingdom": [
    'England','Scotland','Wales','Northern Ireland'
  ]
  ,
  "Saudi Arabia": [
    'Riyadh','Makkah','Madinah','Al Qassim','Eastern Province','Asir','Tabuk','Hail','Northern Borders','Jizan','Najran','Al Bahah','Al Jawf'
  ]
};

const MOTHER_TONGUES = [
  'Assamese','Bengali','English','Gujarati','Hindi','Kannada','Konkani','Malayalam','Marathi','Marwari','Odiya','Punjabi','Sindhi','Tamil','Telugu','Urdu',
  'Angika','Arunachali','Awadhi','Badaga','Bhojpuri','Bihari','Brij','Chatisgarhi','Dogri','French','Garhwali','Garo','Haryanvi','Himachali/Pahari','Kanauji','Kashmiri','Khandesi','Khasi','Koshali','Kumoani','Kutchi','Ladacki','Lepcha','Magahi','Maithili','Miji','Mizo','Monpa','Nepali','Nicobarese','Tripuri','Tulu'
];

const EDUCATION_GROUPS = [
  {
    label: 'Doctorates',
    items: [
      { id: '33', label: 'Ph.D.' },
      { id: '116', label: 'DM' },
      { id: '117', label: 'Postdoctoral fellow' },
      { id: '118', label: 'Fellow of National Board (FNB)' },
    ]
  },
  {
    label: 'Service - IAS / IPS / IRS / IES / IFS',
    items: [
      { id: '77', label: 'IAS' },{ id: '78', label: 'IPS' },{ id: '79', label: 'IRS' },{ id: '80', label: 'IES' },{ id: '81', label: 'IFS' },{ id: '92', label: 'Other Degree in Service' }
    ]
  },
  {
    label: 'Any Financial Qualification - ICWAI / CA / CS/ CFA',
    items: [
      { id: '36', label: 'CA' },{ id: '37', label: 'ICWA' },{ id: '48', label: 'CS' },{ id: '75', label: 'CFA (Chartered Financial Analyst)' },{ id: '91', label: 'Other Degree in Finance' }
    ]
  },
  {
    label: 'Any Masters in Arts / Science / Commerce',
    items: [
      { id: '10', label: 'M.Phil.' },{ id: '11', label: 'MCom' },{ id: '12', label: 'M.Sc.' },{ id: '13', label: 'M.A.' },{ id: '38', label: 'M.Ed.' },{ id: '60', label: 'MLIS' },{ id: '63', label: 'MSW' },{ id: '86', label: 'Other Master Degree in Arts / Science / Commerce' },{ id: '98', label: 'MFA' },{ id: '120', label: 'M.Des' }
    ]
  },
  {
    label: 'Any Masters in Engineering / Computers',
    items: [
      { id: '3', label: 'M.S.(Engg.)' },{ id: '7', label: 'M.Arch.' },{ id: '51', label: 'MCA' },{ id: '52', label: 'PGDCA' },{ id: '53', label: 'ME' },{ id: '54', label: 'M.Tech.' },{ id: '55', label: 'M.Sc. IT / Computer Science' },{ id: '84', label: 'Other Masters Degree in Engineering / Computers' }
    ]
  },
  {
    label: 'Any Masters in Legal',
    items: [ { id: '70', label: 'M.L.' },{ id: '71', label: 'LL.M.' },{ id: '89', label: 'Other Master Degree in  Legal' } ]
  },
  {
    label: 'Any Masters in Management',
    items: [ { id: '14', label: 'MHM  (Hotel Management)' },{ id: '61', label: 'MBA' },{ id: '62', label: 'PGDM' },{ id: '64', label: 'MHRM (Human Resource Management)' },{ id: '76', label: 'MFM (Financial Management)' },{ id: '96', label: 'Other Master Degree in Management' },{ id: '112', label: 'MHA / MHM (Hospital Administration)' } ]
  },
  {
    label: 'Any Masters in Medicine - General / Dental / Surgeon',
    items: [ { id: '20', label: 'MD / MS (Medical)' },{ id: '22', label: 'MDS' },{ id: '23', label: 'MVSc' },{ id: '113', label: 'MCh' },{ id: '114', label: 'DNB' } ]
  },
  {
    label: 'Any Bachelors in Arts / Science / Commerce',
    items: [ { id: '15', label: 'B.Phil.' },{ id: '16', label: 'B.Com.' },{ id: '17', label: 'B.Sc.' },{ id: '18', label: 'B.A.' },{ id: '39', label: 'B.Ed.' },{ id: '43', label: 'Aviation Degree' },{ id: '56', label: 'BFA' },{ id: '57', label: 'BLIS' },{ id: '58', label: 'B.S.W' },{ id: '59', label: 'B.M.M.' },{ id: '66', label: 'BFT' },{ id: '85', label: 'Other Bachelor Degree in Arts / Science / Commerce' },{ id: '119', label: 'B.Des' } ]
  },
  {
    label: 'Any Bachelors in Engineering / Computers',
    items: [ { id: '5', label: 'BCA' },{ id: '6', label: 'Aeronautical Engineering' },{ id: '8', label: 'B.Arch' },{ id: '9', label: 'B.Plan' },{ id: '49', label: 'BE' },{ id: '50', label: 'B.Tech.' },{ id: '83', label: 'Other Bachelor Degree in Engineering / Computers' },{ id: '95', label: 'B.Sc IT/ Computer Science' },{ id: '109', label: 'B.S.(Engineering)' } ]
  },
  {
    label: 'Any Bachelors in Legal',
    items: [ { id: '72', label: 'BGL' },{ id: '73', label: 'B.L.' },{ id: '74', label: 'LL.B.' },{ id: '90', label: 'Other Bachelor Degree in Legal' } ]
  },
  {
    label: 'Any Bachelors in Management',
    items: [ { id: '19', label: 'BHM (Hotel Management)' },{ id: '35', label: 'BBA' },{ id: '65', label: 'BFM (Financial Management)' },{ id: '87', label: 'Other Bachelor Degree in Management' },{ id: '110', label: 'BHA / BHM (Hospital Administration)' } ]
  },
  {
    label: 'Any Bachelors in Medicine in General / Dental / Surgeon',
    items: [ { id: '21', label: 'MBBS' },{ id: '25', label: 'BDS' },{ id: '26', label: 'BVSc' },{ id: '28', label: 'BHMS' },{ id: '29', label: 'B.A.M.S.' },{ id: '68', label: 'BSMS' },{ id: '69', label: 'BUMS' } ]
  },
  {
    label: 'Any Diploma',
    items: [ { id: '45', label: 'Trade School' },{ id: '46', label: 'Diploma' },{ id: '82', label: 'Polytechnic' },{ id: '94', label: 'Others in Diploma' } ]
  },
  {
    label: 'Higher Secondary / Secondary',
    items: [ { id: '47', label: 'Higher Secondary School / High School' } ]
  },
  {
    label: 'Any Bachelors in Medicine Others',
    items: [ { id: '27', label: 'BPT' },{ id: '31', label: 'BPharm' },{ id: '88', label: 'Other Bachelor Degree in Medicine' },{ id: '101', label: 'B.Sc. Nursing' } ]
  },
  {
    label: 'Any Masters in Medicine Others',
    items: [ { id: '24', label: 'MPT' },{ id: '30', label: 'M.Pharm' },{ id: '97', label: 'Other Master Degree in Medicine' } ]
  }
];

const OCCUPATION_GROUPS = [
  { label: 'ADMINISTRATION', items: [
    { id: '49', label: 'Manager' },{ id: '48', label: 'Supervisor' },{ id: '47', label: 'Officer' },{ id: '39', label: 'Administrative Professional' },{ id: '50', label: 'Executive' },{ id: '46', label: 'Clerk' },{ id: '63', label: 'Human Resources Professional' },{ id: '78', label: 'Secretary / Front Office' }
  ]},
  { label: 'AGRICULTURE', items: [ { id: '37', label: 'Agriculture & Farming Professional' },{ id: '81', label: 'Horticulturist' } ] },
  { label: 'AIRLINE', items: [ { id: '30', label: 'Pilot' },{ id: '28', label: 'Air Hostess / Flight Attendant' },{ id: '29', label: 'Airline Professional' } ] },
  { label: 'ARCHITECTURE & DESIGN', items: [ { id: '19', label: 'Architect' },{ id: '20', label: 'Interior Designer' } ] },
  { label: 'BANKING & FINANCE', items: [ { id: '7', label: 'Chartered Accountant' },{ id: '10', label: 'Company Secretary' },{ id: '8', label: 'Accounts / Finance Professional' },{ id: '16', label: 'Banking Service Professional' },{ id: '9', label: 'Auditor' },{ id: '69', label: 'Financial Accountant' },{ id: '64', label: 'Financial Analyst / Planning' },{ id: '87', label: 'Investment Professional' } ] },
  { label: 'BEAUTY & FASHION', items: [ { id: '25', label: 'Fashion Designer' },{ id: '33', label: 'Beautician' },{ id: '82', label: 'Hair Stylist' },{ id: '83', label: 'Jewellery designer' },{ id: '84', label: 'Designer (others)' },{ id: '85', label: 'Makeup Artist' } ] },
  { label: 'BPO & CUSTOMER SERVICE', items: [ { id: '86', label: 'BPO / KPO / ITes Professional' },{ id: '40', label: 'Customer Service Professional' } ] },
  { label: 'CIVIL SERVICES', items: [ { id: '52', label: 'Civil Services (IAS / IES / IFS / IPS / IRS)' } ] },
  { label: 'CORPORATE PROFESSIONALS', items: [ { id: '70', label: 'Analyst' },{ id: '45', label: 'Consultant' },{ id: '88', label: 'Corporate Communication' },{ id: '89', label: 'Corporate Planning' },{ id: '42', label: 'Marketing Professional' },{ id: '90', label: 'Operations Management' },{ id: '43', label: 'Sales Professional' },{ id: '91', label: 'Senior Manager / Manager' },{ id: '92', label: 'Subject Matter Expert' },{ id: '93', label: 'Business Development Professional' },{ id: '94', label: 'Content Writer' } ] },
  { label: 'DEFENCE', items: [ { id: '53', label: 'Army' },{ id: '54', label: 'Navy' },{ id: '96', label: 'Defence Services (Others)' },{ id: '55', label: 'Air Force' },{ id: '97', label: 'Paramilitary' } ] },
  { label: 'EDUCATION & TRAINING', items: [ { id: '5', label: 'Professor / Lecturer' },{ id: '4', label: 'Teaching / Academician' },{ id: '6', label: 'Education Professional' },{ id: '111', label: 'Training Professional' },{ id: '112', label: 'Research Assistant' },{ id: '113', label: 'Research Scholar' } ] },
  { label: 'ENGINEERING', items: [ { id: '114', label: 'Civil Engineer' },{ id: '115', label: 'Electronics / Telecom Engineer' },{ id: '116', label: 'Mechanical / Production Engineer' },{ id: '117', label: 'Quality Assurance Engineer - Non IT' },{ id: '3', label: 'Engineer - Non IT' },{ id: '65', label: 'Designer' },{ id: '118', label: 'Product Manager - Non IT' },{ id: '77', label: 'Project Manager - Non IT' } ] },
  { label: 'HOSPITALITY', items: [ { id: '34', label: 'Hotel / Hospitality Professional' },{ id: '129', label: 'Restaurant / Catering Professional' },{ id: '130', label: 'Chef / Cook' } ] },
  { label: 'IT & SOFTWARE', items: [ { id: '1', label: 'Software Professional' },{ id: '2', label: 'Hardware Professional' },{ id: '74', label: 'Product Manager' },{ id: '76', label: 'Project Manager' },{ id: '75', label: 'Program Manager' },{ id: '119', label: 'Animator' },{ id: '120', label: 'Cyber / Network Security' },{ id: '121', label: 'UI / UX Designer' },{ id: '122', label: 'Web / Graphic Designer' },{ id: '123', label: 'Software Consultant' },{ id: '124', label: 'Data Analyst' },{ id: '125', label: 'Data Scientist' },{ id: '126', label: 'Network Engineer' },{ id: '128', label: 'Quality Assurance Engineer' } ] },
  { label: 'LEGAL', items: [ { id: '17', label: 'Lawyer & Legal Professional' },{ id: '131', label: 'Legal Assistant' } ] },
  { label: 'POLICE / LAW ENFORCEMENT', items: [ { id: '18', label: 'Law Enforcement Officer' },{ id: '95', label: 'Police' } ] },
  { label: 'MEDICAL & HEALTHCARE OTHER', items: [ { id: '14', label: 'Healthcare Professional' },{ id: '15', label: 'Paramedical Professional' },{ id: '13', label: 'Nurse' },{ id: '98', label: 'Pharmacist' },{ id: '100', label: 'Physiotherapist' },{ id: '103', label: 'Psychologist' },{ id: '107', label: 'Therapist' },{ id: '108', label: 'Medical Transcriptionist' },{ id: '109', label: 'Dietician / Nutritionist' },{ id: '110', label: 'Lab Technician' },{ id: '150', label: 'Medical Representative' } ] },
  { label: 'MEDIA & ENTERTAINMENT', items: [ { id: '27', label: 'Journalist' },{ id: '22', label: 'Media Professional' },{ id: '24', label: 'Entertainment Professional' },{ id: '26', label: 'Event Management Professional' },{ id: '21', label: 'Advertising / PR Professional' },{ id: '66', label: 'Designer' },{ id: '79', label: 'Actor / Model' },{ id: '80', label: 'Artist' } ] },
  { label: 'MERCHANT NAVY', items: [ { id: '32', label: 'Mariner / Merchant Navy' },{ id: '133', label: 'Sailor' } ] },
  { label: 'SCIENTIST', items: [ { id: '35', label: 'Scientist / Researcher' } ] },
  { label: 'SENIOR MANAGEMENT', items: [ { id: '41', label: 'CXO / President, Director, Chairman' },{ id: '134', label: 'VP / AVP / GM / DGM / AGM' } ] },
  { label: 'DOCTOR', items: [ { id: '12', label: 'Doctor' },{ id: '105', label: 'Dentist' },{ id: '106', label: 'Surgeon' },{ id: '104', label: 'Veterinary Doctor' } ] },
  { label: 'OTHERS', items: [ { id: '44', label: 'Technician' },{ id: '38', label: 'Arts & Craftsman' },{ id: '67', label: 'Student' },{ id: '68', label: 'Librarian' },{ id: '71', label: 'Business Owner / Entrepreneur' },{ id: '72', label: 'Retired' },{ id: '73', label: 'Transportation / Logistics Professional' },{ id: '135', label: 'Agent / Broker / Trader' },{ id: '136', label: 'Contractor' },{ id: '137', label: 'Fitness Professional' },{ id: '138', label: 'Security Professional' },{ id: '36', label: 'Social Worker / Volunteer / NGO' },{ id: '51', label: 'Sportsperson' },{ id: '139', label: 'Travel Professional' },{ id: '140', label: 'Singer' },{ id: '141', label: 'Writer' },{ id: '158', label: 'Politician' },{ id: '142', label: 'Associate' },{ id: '143', label: 'Builder' },{ id: '144', label: 'Chemist' },{ id: '145', label: 'CNC Operator' },{ id: '146', label: 'Distributor' },{ id: '147', label: 'Driver' },{ id: '148', label: 'Freelancer' },{ id: '149', label: 'Mechanic' },{ id: '151', label: 'Musician' },{ id: '152', label: 'Photo / Videographer' },{ id: '153', label: 'Surveyor' },{ id: '154', label: 'Tailor' },{ id: '102', label: 'Not working' },{ id: '9997', label: 'Others' } ] }
];

const RELIGIOUS_VALUES = [
  { id: '0', label: '- Select -' },
  { id: '7', label: 'Very religious' },
  { id: '8', label: 'Believe in Jesus not in religion' },
  { id: '9', label: 'Sunday Church Goer' },
  { id: '10', label: 'Average Christian' },
  { id: '11', label: 'Not religious' },
  { id: '99', label: 'Not given it a thought' }
];

const HEIGHT_OPTIONS = [
  { id: '0', label: '--- Feet/Inches ---' },
  { id: '121.92', label: '4 feet' },{ id: '124.46', label: '4 feet 1 inches' },{ id: '127.00', label: '4 feet 2 inches' },{ id: '129.54', label: '4 feet 3 inches' },{ id: '132.08', label: '4 feet 4 inches' },{ id: '134.62', label: '4 feet 5 inches' },{ id: '137.16', label: '4 feet 6 inches' },{ id: '139.70', label: '4 feet 7 inches' },{ id: '142.24', label: '4 feet 8 inches' },{ id: '144.78', label: '4 feet 9 inches' },{ id: '147.32', label: '4 feet 10 inches' },{ id: '149.86', label: '4 feet 11 inches' },
  { id: '152.40', label: '5 feet' },{ id: '154.94', label: '5 feet 1 inches' },{ id: '157.48', label: '5 feet 2 inches' },{ id: '160.02', label: '5 feet 3 inches' },{ id: '162.56', label: '5 feet 4 inches' },{ id: '165.10', label: '5 feet 5 inches' },{ id: '167.64', label: '5 feet 6 inches' },{ id: '170.18', label: '5 feet 7 inches' },{ id: '172.72', label: '5 feet 8 inches' },{ id: '175.26', label: '5 feet 9 inches' },{ id: '177.80', label: '5 feet 10 inches' },{ id: '180.34', label: '5 feet 11 inches' },
  { id: '182.88', label: '6 feet' },{ id: '185.42', label: '6 feet 1 inches' },{ id: '187.96', label: '6 feet 2 inches' },{ id: '190.50', label: '6 feet 3 inches' },{ id: '193.04', label: '6 feet 4 inches' },{ id: '195.58', label: '6 feet 5 inches' },{ id: '198.12', label: '6 feet 6 inches' },{ id: '200.66', label: '6 feet 7 inches' },{ id: '203.20', label: '6 feet 8 inches' },{ id: '205.74', label: '6 feet 9 inches' },{ id: '208.28', label: '6 feet 10 inches' },{ id: '210.82', label: '6 feet 11 inches' },{ id: '213.36', label: '7 feet' },{ id: '215.90', label: '7 feet 1 inches' },{ id: '218.44', label: '7 feet 2 inches' },{ id: '220.98', label: '7 feet 3 inches' },{ id: '223.52', label: '7 feet 4 inches' },{ id: '226.06', label: '7 feet 5 inches' },{ id: '228.60', label: '7 feet 6 inches' },{ id: '231.14', label: '7 feet 7 inches' },{ id: '233.68', label: '7 feet 8 inches' },{ id: '236.22', label: '7 feet 9 inches' },{ id: '238.76', label: '7 feet 10 inches' },{ id: '241.30', label: '7 feet 11 inches' }
];

// Resolve a country's state list with some loose matching to handle aliases (e.g., USA / United States)
const getStateList = (country: string | undefined) => {
  if (!country) return undefined;
  // exact match
  if (STATE_MAP[country]) return STATE_MAP[country];
  const lc = country.toLowerCase();
  // try common aliases
  for (const key of Object.keys(STATE_MAP)) {
    const keyLc = key.toLowerCase();
    if (keyLc === lc) return STATE_MAP[key];
    if (keyLc.includes(lc) || lc.includes(keyLc)) return STATE_MAP[key];
  }
  return undefined;
};
const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error("Failed to read image file"));
  reader.readAsDataURL(file);
});

export function ProfileOptimizerUI() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AIProfileOptimizerOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const basicSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  const familySectionRef = useRef<HTMLDivElement>(null);
  const hobbiesSectionRef = useRef<HTMLDivElement>(null);
  const partnerSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const emailSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<'basic' | 'education' | 'family' | 'hobbies' | 'partner' | 'location' | 'email' | 'contact' | 'gallery' | null>('basic');
  const isAuthenticated = Boolean(user);

  const userDocRef = useMemo(() => user && db ? doc(db, "users", user.uid) : null, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    galleryPhotos: [] as string[],
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    age: "",
    gender: "Female",
    profileCreatedBy: "Self",
    maritalStatus: "Never Married",
    motherTongue: "",
    height: "",
    physicalStatus: "Normal",
    denomination: "0",
    diocese: "",
    parish: "",
    education: "",
    highestEducation: "",
    college: "",
    educationDetails: "",
    employedIn: "Private",
    occupation: "",
    occupationDetail: "",
    annualIncome: "",
    annualIncomeCurrency: "India - Rs.",
    annualIncomeRange: "9 - 10 Lakhs",
    location: "",
    email: "",
    contactCountryCode: "+91 (India)",
    contactNumber: "",
    countryLivingIn: "",
    residingState: "",
    citizenship: "",
    division: "",
    subcaste: "",
    weightKg: "",
    weightLbs: "",
    familyValue: "Moderate",
    familyType: "Nuclear",
    familyStatus: "Middle Class",
    nativePlace: "",
    religiousValues: "",
    fathersOccupation: "",
    mothersOccupation: "",
    noOfBrothers: "0",
    brothersMarried: "0",
    noOfSisters: "0",
    sistersMarried: "0",
    aboutMyFamily: "",
    hobbies: [] as string[],
    hobbiesOther: "",
    favoriteMusic: [] as string[],
    musicOther: "",
    sports: [] as string[],
    sportsOther: "",
    favoriteFood: [] as string[],
    foodOther: "",
    eatingHabits: "Non-Vegetarian",
    drinkingHabits: "No",
    smokingHabits: "No",
    partnerMaritalStatus: "Any",
    partnerHaveChildren: "Doesn't matter",
    partnerAgeRange: "Any",
    partnerHeight: "Any",
    partnerMotherTongue: "Any",
    partnerPhysicalStatus: "Any",
    partnerEatingHabits: "Doesn't matter",
    partnerDrinkingHabits: "Doesn't matter",
    partnerSmokingHabits: "Doesn't matter",
    partnerDenomination: "Any",
    partnerDivision: "Any",
    partnerEducation: "Any",
    partnerEmployedIn: "Any",
    partnerOccupation: "Any",
    partnerAnnualIncome: "Any",
    partnerCountry: "Any",
    rawBio: "",
    faithDetails: "",
    ministryInvolvement: "",
    favoriteVerse: "",
    personalityTraits: [] as string[],
    languagesKnown: [] as string[],
    targetAudienceDescription: "",
  });

  // clear or normalize residingState when country changes to a country with a state list
  useEffect(() => {
    const states = getStateList(formData.countryLivingIn);
    if (states && states.length > 0) {
      // if current residingState is not in the new list, clear it so user can pick
      if (formData.residingState && !states.includes(formData.residingState)) {
        setFormData(prev => ({ ...prev, residingState: "" }));
      }
    }
  // intentionally only watch countryLivingIn; formData is used inside but we only care when country changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.countryLivingIn]);

  useEffect(() => {
    if (profile) {
      const galleryPhotos = profile.galleryPhotos || profile.images || [];
      const fallbackPrimary = profile.photoURL || user?.photoURL || "";
      const normalizedGallery = galleryPhotos.length > 0 ? galleryPhotos.slice(0, MAX_PROFILE_IMAGES) : (fallbackPrimary ? [fallbackPrimary] : []);

      setFormData({
        displayName: profile.displayName || user?.displayName || "",
        photoURL: normalizedGallery[0] || "",
        galleryPhotos: normalizedGallery,
        age: profile.age?.toString() || "",
        dobDay: profile.dobDay || "",
        dobMonth: profile.dobMonth || "",
        dobYear: profile.dobYear || "",
        gender: profile.gender || "Female",
        profileCreatedBy: profile.profileCreatedBy || "Self",
        maritalStatus: profile.maritalStatus || "Never Married",
        motherTongue: profile.motherTongue || "",
        height: profile.height || "",
        physicalStatus: profile.physicalStatus || "Normal",
        denomination: profile.denomination || "0",
        diocese: profile.diocese || "",
        parish: profile.parish || "",
        education: profile.education || "",
        highestEducation: profile.highestEducation || "",
        college: profile.college || "",
        educationDetails: profile.educationDetails || "",
        employedIn: profile.employedIn || "Private",
        occupation: profile.occupation || "",
        occupationDetail: profile.occupationDetail || "",
        annualIncome: profile.annualIncome || "",
        annualIncomeCurrency: profile.annualIncomeCurrency || "India - Rs.",
        annualIncomeRange: profile.annualIncomeRange || "9 - 10 Lakhs",
        location: profile.location || "",
        email: profile.email || user?.email || "",
        contactCountryCode: profile.contactCountryCode || "+91 (India)",
        contactNumber: profile.contactNumber || "",
        countryLivingIn: profile.countryLivingIn || "",
        residingState: profile.residingState || "",
        citizenship: profile.citizenship || "",
        division: profile.division || "",
        subcaste: profile.subcaste || "",
        weightKg: profile.weightKg || "",
        weightLbs: profile.weightLbs || "",
        familyValue: profile.familyValue || "Moderate",
        familyType: profile.familyType || "Nuclear",
        familyStatus: profile.familyStatus || "Middle Class",
          nativePlace: profile.nativePlace || "",
          religiousValues: profile.religiousValues || "",
          fathersOccupation: profile.fathersOccupation || "",
          mothersOccupation: profile.mothersOccupation || "",
          noOfBrothers: profile.noOfBrothers?.toString() || "0",
          brothersMarried: profile.brothersMarried?.toString() || "0",
          noOfSisters: profile.noOfSisters?.toString() || "0",
          sistersMarried: profile.sistersMarried?.toString() || "0",
          aboutMyFamily: profile.aboutMyFamily || "",
          hobbies: profile.hobbies || [],
          hobbiesOther: profile.hobbiesOther || "",
          favoriteMusic: profile.favoriteMusic || [],
          musicOther: profile.musicOther || "",
          sports: profile.sports || [],
          sportsOther: profile.sportsOther || "",
          favoriteFood: profile.favoriteFood || [],
          foodOther: profile.foodOther || "",
        
        partnerMaritalStatus: profile.partnerMaritalStatus || "Any",
        partnerHaveChildren: profile.partnerHaveChildren || "Doesn't matter",
        partnerAgeRange: profile.partnerAgeRange || "Any",
        partnerHeight: profile.partnerHeight || "Any",
        partnerMotherTongue: profile.partnerMotherTongue || "Any",
        partnerPhysicalStatus: profile.partnerPhysicalStatus || "Any",
        partnerEatingHabits: profile.partnerEatingHabits || "Doesn't matter",
        partnerDrinkingHabits: profile.partnerDrinkingHabits || "Doesn't matter",
        partnerSmokingHabits: profile.partnerSmokingHabits || "Doesn't matter",
        partnerDenomination: profile.partnerDenomination || "Any",
        partnerDivision: profile.partnerDivision || "Any",
        partnerEducation: profile.partnerEducation || "Any",
        partnerEmployedIn: profile.partnerEmployedIn || "Any",
        partnerOccupation: profile.partnerOccupation || "Any",
        partnerAnnualIncome: profile.partnerAnnualIncome || "Any",
        partnerCountry: profile.partnerCountry || "Any",
        eatingHabits: profile.eatingHabits || "Non-Vegetarian",
        drinkingHabits: profile.drinkingHabits || "No",
        smokingHabits: profile.smokingHabits || "No",
        rawBio: profile.bio || "",
        faithDetails: profile.faithDetails || "",
        ministryInvolvement: profile.ministryInvolvement || "",
        favoriteVerse: profile.favoriteVerse || "",
        personalityTraits: profile.personalityTraits || [],
        languagesKnown: profile.languagesKnown || [],
        targetAudienceDescription: profile.targetAudienceDescription || "",
      });
    }
  }, [profile, user]);

  const completion = useMemo(() => {
    const criticalFields = ['displayName', 'age', 'gender', 'location', 'denomination', 'rawBio', 'faithDetails', 'favoriteVerse'];
    const filled = criticalFields.filter(f => formData[f as keyof typeof formData] && formData[f as keyof typeof formData] !== "" && formData[f as keyof typeof formData] !== "any");
    const photoBonus = formData.galleryPhotos.length > 0 ? 1 : 0;
    return Math.round(((filled.length + photoBonus) / (criticalFields.length + 1)) * 100);
  }, [formData]);

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>) => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openSectionAndScroll = (section: 'basic' | 'education' | 'family' | 'hobbies' | 'partner' | 'location' | 'email' | 'contact' | 'gallery', sectionRef: React.RefObject<HTMLDivElement | null>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please log in before editing your profile.",
      });
      return;
    }

    setOpenSection(section);
    // allow layout to update before scrolling
    setTimeout(() => scrollToSection(sectionRef), 80);
  };

  const handleOptimize = async () => {
    if (!formData.rawBio || !formData.faithDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in your bio and faith details to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await optimizeProfile({
        rawBio: formData.rawBio,
        faithDetails: formData.faithDetails,
        personalityTraits: formData.personalityTraits,
        targetAudienceDescription: formData.targetAudienceDescription
      });
      setResult(output);
      toast({
        title: "Profile Optimized!",
        description: "We've generated a spiritually grounded bio for you.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "AI service is temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (bioToSave?: string) => {
    if (!user || !db) {
      toast({ title: "Login required", description: "Please log in before editing your profile.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const updatedData = {
      ...formData,
      photoURL: formData.galleryPhotos[0] || formData.photoURL || "",
      galleryPhotos: formData.galleryPhotos.slice(0, MAX_PROFILE_IMAGES),
      uid: user.uid,
      email: user.email,
      age: parseInt(formData.age) || 0,
      bio: bioToSave || formData.rawBio,
      updatedAt: serverTimestamp(),
    };

    setDoc(doc(db, "users", user.uid), updatedData, { merge: true })
      .then(() => {
        toast({ title: "Profile Saved", description: "Your spiritual identity has been updated." });
        if (bioToSave) {
          setFormData(prev => ({ ...prev, rawBio: bioToSave }));
        }
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please log in before uploading photos.",
      });
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.find(file => file.size > 2 * 1024 * 1024);
    if (oversized) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select images smaller than 2MB each."
      });
      e.target.value = "";
      return;
    }

    const remainingSlots = MAX_PROFILE_IMAGES - formData.galleryPhotos.length;
    if (remainingSlots <= 0) {
      toast({
        variant: "destructive",
        title: "Photo limit reached",
        description: "You can upload up to 10 photos. Remove one to add another."
      });
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const newPhotos = await Promise.all(selectedFiles.map(readFileAsDataUrl));

    setFormData(prev => {
      const nextGallery = [...prev.galleryPhotos, ...newPhotos].slice(0, MAX_PROFILE_IMAGES);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: nextGallery[0] || prev.photoURL,
      };
    });

    toast({ title: "Photos added", description: "Save profile to keep the gallery." });
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => {
      const nextGallery = prev.galleryPhotos.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: nextGallery[0] || "",
      };
    });
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setFormData(prev => {
      const nextGallery = [...prev.galleryPhotos];
      const [selectedPhoto] = nextGallery.splice(index, 1);
      if (!selectedPhoto) return prev;
      nextGallery.unshift(selectedPhoto);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: selectedPhoto,
      };
    });
  };

  const toggleHobby = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.hobbies || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.hobbies = Array.from(set);
      return next;
    });
  };

  const toggleMusic = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.favoriteMusic || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.favoriteMusic = Array.from(set);
      return next;
    });
  };

  const toggleSport = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.sports || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.sports = Array.from(set);
      return next;
    });
  };

  const toggleFood = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.favoriteFood || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.favoriteFood = Array.from(set);
      return next;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Login required</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Your profile editor is locked until you sign in. Once you log in, you can edit your details, photos, and preferences.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-200 px-6">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#f8fafc_28%,#eef2f7_100%)] text-slate-900">
      <div className="mx-auto w-full max-w-[1450px] px-3 py-4 lg:px-4">
        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <div className="p-4">
                  <div className="relative h-48 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                    {formData.galleryPhotos[0] ? (
                      <Image src={formData.galleryPhotos[0]} alt="Primary profile" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <Button type="button" className="mt-3 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => fileInputRef.current?.click()}>
                    Edit Photos
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </div>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Profile Info</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Basic Information</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('basic', basicSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Education & Occupation</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('education', educationSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Family Details</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('family', familySectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Hobbies & Interest</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('hobbies', hobbiesSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Partner Preference</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('partner', partnerSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Location</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('location', locationSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>E-mail</span>
                      <div>
                        <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('email', emailSectionRef)}>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Contact Number</span>
                      <div>
                        <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('contact', contactSectionRef)}>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Enhance Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-4 w-4 text-slate-400" />
                      <span>Photos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-400 text-white px-2 py-0.5 text-xs">{formData.galleryPhotos.length}/{MAX_PROFILE_IMAGES}</Badge>
                      <button type="button" className="text-xs text-slate-400" aria-label="Edit photos" onClick={() => { openSectionAndScroll('gallery', gallerySectionRef); fileInputRef.current?.click(); }}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Trust Badge</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3"><Badge className="rounded-full bg-rose-400 px-2 py-1 text-[10px] font-semibold text-white">ID</Badge><span>Identity Badge</span></div>
                      <button type="button" className="text-xs text-slate-400">add</button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3"><Badge className="rounded-full bg-indigo-400 px-2 py-1 text-[10px] font-semibold text-white">PRO</Badge><span>Professional Badge</span></div>
                      <button type="button" className="text-xs text-slate-400">add</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

          <main className="space-y-4">
            <Card className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-gradient-to-br from-[#fffaf6] via-white to-[#f6f8ff] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <CardContent className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1.4fr_0.6fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    Faith-centered profile editing
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Edit Profile</h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">Fields marked with * are mandatory. Keep your profile clear, warm, and easy to scan.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Profile completion</span>
                      <span className="font-semibold text-slate-900">{completion}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>View</span>
                      <Button asChild variant="ghost" className="h-auto p-0 text-sky-600 hover:bg-transparent hover:text-sky-700">
                        <Link href={user?.uid ? `/matches/${user.uid}` : "/matches"}>Public profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {openSection === 'basic' && (
            <div ref={basicSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Profile created by <span className="text-rose-500">*</span></Label>
                      <Select value={formData.profileCreatedBy} onValueChange={(val) => setFormData((prev) => ({ ...prev, profileCreatedBy: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Self", "Friend", "Parent", "Sibling", "Relative"].map((value) => (
                            <SelectItem key={value} value={value}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Name <span className="text-rose-500">*</span></Label>
                      <Input value={formData.displayName} onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Date of Birth <span className="text-rose-500">*</span></Label>
                      <div className="flex gap-2">
                        <Select value={formData.dobDay} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobDay: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Day" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }).map((_, i) => (
                              <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={formData.dobMonth} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobMonth: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Month" /></SelectTrigger>
                          <SelectContent>
                            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, idx) => (
                              <SelectItem key={m} value={`${idx+1}`}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={formData.dobYear} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobYear: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 80 }).map((_, i) => {
                              const year = new Date().getFullYear() - i - 18;
                              return <SelectItem key={year} value={`${year}`}>{year}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Marital status <span className="text-rose-500">*</span></Label>
                      <div className="flex flex-wrap gap-3">
                        {['Unmarried','Widow / Widower','Divorced','Separated'].map((m) => (
                          <button key={m} type="button" onClick={() => setFormData(p => ({ ...p, maritalStatus: m }))} className={formData.maritalStatus === m ? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{m}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Height <span className="text-rose-500">*</span></Label>
                      <Select value={formData.height} onValueChange={(val) => setFormData((prev) => ({ ...prev, height: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select height" /></SelectTrigger>
                        <SelectContent>
                          {HEIGHT_OPTIONS.map(h => <SelectItem key={h.id} value={h.id} disabled={h.id === '0'}>{h.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Weight</Label>
                      <div className="flex gap-2">
                        <Input placeholder="-- Kgs --" value={formData.weightKg} onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value }))} className="h-10 rounded border-slate-300" />
                        <span className="self-center text-sm text-slate-400">OR</span>
                        <Input placeholder="-- Lbs --" value={formData.weightLbs} onChange={(e) => setFormData(prev => ({ ...prev, weightLbs: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Physical Status <span className="text-rose-500">*</span></Label>
                      <div className="flex gap-3">
                        {['Normal','Physically Challenged'].map(s => (
                          <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, physicalStatus: s }))} className={formData.physicalStatus===s? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Denomination <span className="text-rose-500">*</span></Label>
                      <Select value={formData.denomination} onValueChange={(val) => setFormData((prev) => ({ ...prev, denomination: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" disabled>--- Select ---</SelectItem>
                            {DENOMINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Division</Label>
                      <Select value={formData.division} onValueChange={(val) => setFormData(prev => ({ ...prev, division: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0" disabled>--Select--</SelectItem>
                          <SelectItem value="2">Adi Dravidar</SelectItem>
                          <SelectItem value="1007">Anglo Indian</SelectItem>
                          <SelectItem value="2401">Chettiar</SelectItem>
                          <SelectItem value="1010">Garo</SelectItem>
                          <SelectItem value="58">Goan</SelectItem>
                          <SelectItem value="2404">Gounder</SelectItem>
                          <SelectItem value="2405">Kamma</SelectItem>
                          <SelectItem value="2406">Kapu</SelectItem>
                          <SelectItem value="1011">Khasi</SelectItem>
                          <SelectItem value="506">Knanaya</SelectItem>
                          <SelectItem value="1012">Kuki</SelectItem>
                          <SelectItem value="109">Madiga</SelectItem>
                          <SelectItem value="111">Mahar</SelectItem>
                          <SelectItem value="116">Mala</SelectItem>
                          <SelectItem value="2410">Mangalorean</SelectItem>
                          <SelectItem value="125">Matang</SelectItem>
                          <SelectItem value="1013">Mizo</SelectItem>
                          <SelectItem value="133">Mudaliar</SelectItem>
                          <SelectItem value="1014">Mukkuvar</SelectItem>
                          <SelectItem value="137">Nadar</SelectItem>
                          <SelectItem value="1015">Naga</SelectItem>
                          <SelectItem value="2414">Naidu</SelectItem>
                          <SelectItem value="2415">Oraon / Kurukh</SelectItem>
                          <SelectItem value="2416">Padmashali</SelectItem>
                          <SelectItem value="2417">Pallar / Devendrakula Vellalar</SelectItem>
                          <SelectItem value="1009">Paravar / Bharathar / Fernando</SelectItem>
                          <SelectItem value="2418">Parkavakulam / Udayar</SelectItem>
                          <SelectItem value="2419">Pillai</SelectItem>
                          <SelectItem value="1008">Pulayar / Cherumar</SelectItem>
                          <SelectItem value="2421">Rajaka / Vannar</SelectItem>
                          <SelectItem value="2422">Reddy</SelectItem>
                          <SelectItem value="2423">Sambavar</SelectItem>
                          <SelectItem value="176">SC</SelectItem>
                          <SelectItem value="2425">Setti Balija</SelectItem>
                          <SelectItem value="214">ST</SelectItem>
                          <SelectItem value="2402">Thevar / Mukkulathor</SelectItem>
                          <SelectItem value="2427">Vaniya Chettiar</SelectItem>
                          <SelectItem value="2428">Vanniya Kula Kshatriyar</SelectItem>
                          <SelectItem value="2429">Vellalar</SelectItem>
                          <SelectItem value="2430">Vishwakarma</SelectItem>
                          <SelectItem value="2431">Yadavar</SelectItem>
                          <SelectItem value="63">Intercaste</SelectItem>
                          <SelectItem value="9997">Others</SelectItem>
                          <SelectItem value="9999">Don't know division</SelectItem>
                          <SelectItem value="9998">Don't wish to specify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Subcaste</Label>
                      <Input value={formData.subcaste} onChange={(e) => setFormData(prev => ({ ...prev, subcaste: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Mother tongue</Label>
                      <Select value={formData.motherTongue} onValueChange={(val) => setFormData((prev) => ({ ...prev, motherTongue: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select language" /></SelectTrigger>
                        <SelectContent>
                          {MOTHER_TONGUES.map((lang) => (
                            <SelectItem key={lang} value={lang === 'Select Mother Tongue' ? '0' : lang} disabled={lang === 'Select Mother Tongue'}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Languages Known</Label>
                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <div className="h-36 overflow-auto rounded border border-slate-200 bg-white p-2 text-sm">
                            {['Assamese','Bengali','English','Gujarati','Hindi','Kannada','Malayalam','Marathi','Odia','Punjabi'].map(lang => (
                              <div key={lang} className="flex items-center gap-2 py-1">
                                <input type="checkbox" checked={formData.languagesKnown.includes(lang)} onChange={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    languagesKnown: prev.languagesKnown.includes(lang) ? prev.languagesKnown.filter(l => l !== lang) : [...prev.languagesKnown, lang]
                                  }));
                                }} />
                                <span className="text-sm">{lang}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-1/2">
                          <div className="h-36 overflow-auto rounded border border-slate-200 bg-white p-2 text-sm">
                            {formData.languagesKnown.length === 0 ? <div className="text-slate-400">No languages selected</div> : formData.languagesKnown.map(l => <div key={l} className="flex items-center justify-between py-1"><span>{l}</span><button type="button" onClick={() => setFormData(prev => ({ ...prev, languagesKnown: prev.languagesKnown.filter(x => x !== l) }))} className="text-xs text-rose-500">remove</button></div>)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">Double click on the values to select / deselect (or use the checkboxes)</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Eating Habits</Label>
                      <div className="flex gap-3">
                        {['Vegetarian','Non-vegetarian','Eggetarian','Vegan'].map(e => (
                          <button key={e} type="button" className={formData.eatingHabits===e? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,eatingHabits:e}))}>{e}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Smoking Habits</Label>
                      <div className="flex gap-3">
                        {['Non-smoker','Light / Social smoker','Regular smoker'].map(s => (
                          <button key={s} type="button" className={formData.smokingHabits===s? 'rounded-full bg-slate-900 text-white px-3 py-2 text-sm' : 'rounded-full border border-slate-200 px-3 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,smokingHabits:s}))}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Drinking Habits</Label>
                      <div className="flex gap-3">
                        {['Non-drinker','Light / Social drinker','Regular drinker'].map(d => (
                          <button key={d} type="button" className={formData.drinkingHabits===d? 'rounded-full bg-slate-900 text-white px-3 py-2 text-sm' : 'rounded-full border border-slate-200 px-3 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,drinkingHabits:d}))}>{d}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">About Me <span className="text-rose-500">*</span></Label>
                      <Textarea value={formData.rawBio} onChange={(e)=>setFormData(prev=>({...prev,rawBio:e.target.value}))} className="min-h-[120px] rounded border-slate-300 bg-white resize-none p-3" />
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Min. 50 characters</span>
                        <span>{formData.rawBio.length} Characters typed</span>
                      </div>
                      <div className="pt-2">
                        <Button className="rounded-full bg-rose-500 text-white px-4 py-2" onClick={()=>handleSaveProfile()} disabled={saving}>Save</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'education' && (
            <div ref={educationSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Education & Occupation</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="rounded bg-slate-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Highest Education <span className="text-rose-500">*</span></Label>
                        <Select value={formData.highestEducation} onValueChange={(val) => setFormData(prev => ({ ...prev, highestEducation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {EDUCATION_GROUPS.map(group => (
                                <SelectGroup key={group.label}>
                                  <SelectLabel>{group.label}</SelectLabel>
                                  {group.items.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">College / Institution</Label>
                        <Input placeholder="Search for College / Institution" value={formData.college} onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Education in Detail</Label>
                        <Input value={formData.educationDetails} onChange={(e) => setFormData(prev => ({ ...prev, educationDetails: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Employed In <span className="text-rose-500">*</span></Label>
                        <div className="flex flex-wrap gap-3">
                          {['Government','Defence','Private','Business','Self Employed','Not Working'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, employedIn: opt }))} className={formData.employedIn===opt? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation <span className="text-rose-500">*</span></Label>
                        <Select value={formData.occupation} onValueChange={(val) => setFormData(prev => ({ ...prev, occupation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select occupation" /></SelectTrigger>
                          <SelectContent>
                            {OCCUPATION_GROUPS.map(group => (
                              <SelectGroup key={group.label}>
                                <SelectLabel>{group.label}</SelectLabel>
                                {group.items.map(item => (
                                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation in Detail</Label>
                        <Input value={formData.occupationDetail} onChange={(e) => setFormData(prev => ({ ...prev, occupationDetail: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Annual Income <span className="text-rose-500">*</span></Label>
                        <div className="flex gap-2">
                          <Select value={formData.annualIncomeCurrency} onValueChange={(val) => setFormData(prev => ({ ...prev, annualIncomeCurrency: val }))}>
                            <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="India - Rs.">India - Rs.</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={formData.annualIncomeRange} onValueChange={(val) => setFormData(prev => ({ ...prev, annualIncomeRange: val }))}>
                            <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select range" /></SelectTrigger>
                            <SelectContent>
                              {['Below 1 Lakh','1 - 3 Lakhs','3 - 5 Lakhs','5 - 7 Lakhs','7 - 9 Lakhs','9 - 10 Lakhs','10 - 15 Lakhs','15+ Lakhs'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'family' && (
            <div ref={familySectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Family Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Family Value <span className="text-rose-500">*</span></Label>
                      <div className="flex items-center gap-3">
                        {['Orthodox','Traditional','Moderate','Liberal'].map(opt => (
                          <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyValue: opt }))} className={formData.familyValue===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Family Type <span className="text-rose-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          {['Joint family','Nuclear family'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyType: opt }))} className={formData.familyType===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Family Status <span className="text-rose-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          {['Middle class','Upper middle class','Rich / Affluent'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyStatus: opt }))} className={formData.familyStatus===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Native Place</Label>
                        <Input value={formData.nativePlace} onChange={(e) => setFormData(prev => ({ ...prev, nativePlace: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Religious values</Label>
                        <Select value={formData.religiousValues} onValueChange={(val) => setFormData(prev => ({ ...prev, religiousValues: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {RELIGIOUS_VALUES.map(rv => (
                              <SelectItem key={rv.id} value={rv.id} disabled={rv.id === '0'}>{rv.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Father's Occupation</Label>
                        <Input value={formData.fathersOccupation} onChange={(e) => setFormData(prev => ({ ...prev, fathersOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Mother's Occupation</Label>
                        <Input value={formData.mothersOccupation} onChange={(e) => setFormData(prev => ({ ...prev, mothersOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">No. of Brothers</Label>
                        <Select value={formData.noOfBrothers} onValueChange={(val) => setFormData(prev => ({ ...prev, noOfBrothers: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }).map((_, i) => <SelectItem key={i} value={`${i}`}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Brothers Married</Label>
                        <Select value={formData.brothersMarried} onValueChange={(val) => setFormData(prev => ({ ...prev, brothersMarried: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['None','1','2','3+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">No. of Sisters</Label>
                        <Select value={formData.noOfSisters} onValueChange={(val) => setFormData(prev => ({ ...prev, noOfSisters: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }).map((_, i) => <SelectItem key={i} value={`${i}`}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Sisters Married</Label>
                        <Select value={formData.sistersMarried} onValueChange={(val) => setFormData(prev => ({ ...prev, sistersMarried: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['None','1','2','3+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">About My Family</Label>
                      <Textarea value={formData.aboutMyFamily} onChange={(e) => setFormData(prev => ({ ...prev, aboutMyFamily: e.target.value }))} className="min-h-[100px]" />
                    </div>

                    <div className="pt-2">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'hobbies' && (
            <div ref={hobbiesSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Hobbies & Interest</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">What are your Hobbies and Interest?</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Art / Handicraft','Cooking','Dancing','Gardening / landscaping','Nature','Painting','Pets','Photography','Playing musical instruments','Puzzles','Internet Surfing','Listening to Music','Movies','Travelling'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.hobbies.includes(opt)} onChange={() => toggleHobby(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Hobbies Here. Eg: Adventure, Farming etc..." value={formData.hobbiesOther} onChange={(e) => setFormData(prev => ({ ...prev, hobbiesOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Your favourite music</Label>
                      <div className="mt-3 flex gap-3 flex-wrap">
                        {['Film songs','Indian/ Classical Music','Western Music'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.favoriteMusic.includes(opt)} onChange={() => toggleMusic(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Music Interests. Eg: Fusion, Blues etc..." value={formData.musicOther} onChange={(e) => setFormData(prev => ({ ...prev, musicOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Sports you like</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Badminton','Carrom','Chess','Cricket','Football','Jogging','Swimming'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.sports.includes(opt)} onChange={() => toggleSport(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Other Interested Sports. Eg: Martial arts, Kabaddi etc..." value={formData.sportsOther} onChange={(e) => setFormData(prev => ({ ...prev, sportsOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Your favourite food</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Arabic','Bengali','Chinese','Continental','Fast food','Gujarati','Italian','Konkan','Mexican','Moghlai','Punjabi','Rajasthani','South Indian','Spanish','Sushi'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.favoriteFood.includes(opt)} onChange={() => toggleFood(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Favourite Food Here. Eg: Thai etc..." value={formData.foodOther} onChange={(e) => setFormData(prev => ({ ...prev, foodOther: e.target.value }))} />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'partner' && (
            <div ref={partnerSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Partner Preference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Marital Status</Label>
                        <Select value={formData.partnerMaritalStatus} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerMaritalStatus: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Never Married','Divorced','Widowed'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Have Children</Label>
                        <Select value={formData.partnerHaveChildren} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerHaveChildren: val }))}>
                          <SelectTrigger disabled={formData.partnerMaritalStatus === 'Never Married'} className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Doesn't matter","No","Yes"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Age</Label>
                        <Select value={formData.partnerAgeRange} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerAgeRange: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','18-24','25-30','31-35','36-40','41-45','46+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Height</Label>
                        <Select value={formData.partnerHeight} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerHeight: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            {HEIGHT_OPTIONS.filter(h => h.id !== '0').map(h => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Mother Tongue</Label>
                        <Select value={formData.partnerMotherTongue} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerMotherTongue: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Any" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            {MOTHER_TONGUES.map((lang) => (
                              <SelectItem key={lang} value={lang === 'Select Mother Tongue' ? '0' : lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Physical Status</Label>
                        <Select value={formData.partnerPhysicalStatus} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerPhysicalStatus: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Normal','Physically Challenged'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Eating Habits</Label>
                        <Select value={formData.partnerEatingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEatingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','Vegetarian','Non-Vegetarian','Eggetarian'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Drinking Habits</Label>
                        <Select value={formData.partnerDrinkingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerDrinkingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','No','Yes','Occasionally'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Smoking Habits</Label>
                        <Select value={formData.partnerSmokingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerSmokingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','No','Yes','Occasionally'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Denomination</Label>
                        <Select value={formData.partnerDenomination} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerDenomination: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            <SelectItem value="Adventist">Adventist</SelectItem>
                            <SelectItem value="Anglican / Episcopal">Anglican / Episcopal</SelectItem>
                            <SelectItem value="Apostolic">Apostolic</SelectItem>
                            <SelectItem value="Assyrian">Assyrian</SelectItem>
                            <SelectItem value="Assembly of God (AG)">Assembly of God (AG)</SelectItem>
                            <SelectItem value="Baptist">Baptist</SelectItem>
                            <SelectItem value="Born Again">Born Again</SelectItem>
                            <SelectItem value="Brethren">Brethren</SelectItem>
                            <SelectItem value="Calvinist">Calvinist</SelectItem>
                            <SelectItem value="Catholic">Catholic</SelectItem>
                            <SelectItem value="Church of God">Church of God</SelectItem>
                            <SelectItem value="Church of South India (CSI)">Church of South India (CSI)</SelectItem>
                            <SelectItem value="Church of Christ">Church of Christ</SelectItem>
                            <SelectItem value="Church of North India">Church of North India</SelectItem>
                            <SelectItem value="Congregational">Congregational</SelectItem>
                            <SelectItem value="East Indian Catholic">East Indian Catholic</SelectItem>
                            <SelectItem value="Evangelical">Evangelical</SelectItem>
                            <SelectItem value="Knanaya">Knanaya</SelectItem>
                            <SelectItem value="Knanaya Catholic">Knanaya Catholic</SelectItem>
                            <SelectItem value="Knanaya Jacobite">Knanaya Jacobite</SelectItem>
                            <SelectItem value="Jacobite">Jacobite</SelectItem>
                            <SelectItem value="Jehovah's Witnesses">Jehovah's Witnesses</SelectItem>
                            <SelectItem value="Latin Catholic">Latin Catholic</SelectItem>
                            <SelectItem value="Latter day saints">Latter day saints</SelectItem>
                            <SelectItem value="Lutheran">Lutheran</SelectItem>
                            <SelectItem value="Malankara">Malankara</SelectItem>
                            <SelectItem value="Malabar Independent Syrian Church">Malabar Independent Syrian Church</SelectItem>
                            <SelectItem value="Marthoma">Marthoma</SelectItem>
                            <SelectItem value="Melkite">Melkite</SelectItem>
                            <SelectItem value="Mennonite">Mennonite</SelectItem>
                            <SelectItem value="Methodist">Methodist</SelectItem>
                            <SelectItem value="Moravian">Moravian</SelectItem>
                            <SelectItem value="Orthodox">Orthodox</SelectItem>
                            <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                            <SelectItem value="Protestant">Protestant</SelectItem>
                            <SelectItem value="Presbyterian">Presbyterian</SelectItem>
                            <SelectItem value="Reformed Baptist">Reformed Baptist</SelectItem>
                            <SelectItem value="Reformed Presbyterian">Reformed Presbyterian</SelectItem>
                            <SelectItem value="Seventh-day Adventist">Seventh-day Adventist</SelectItem>
                            <SelectItem value="St. Thomas Evangelical">St. Thomas Evangelical</SelectItem>
                            <SelectItem value="Syro Malabar">Syro Malabar</SelectItem>
                            <SelectItem value="Syrian Catholic">Syrian Catholic</SelectItem>
                            <SelectItem value="Syrian Jacobite">Syrian Jacobite</SelectItem>
                            <SelectItem value="Syrian Orthodox">Syrian Orthodox</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Division</Label>
                        <Select value={formData.partnerDivision} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerDivision: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" disabled>--Select--</SelectItem>
                            <SelectItem value="2">Adi Dravidar</SelectItem>
                            <SelectItem value="1007">Anglo Indian</SelectItem>
                            <SelectItem value="2401">Chettiar</SelectItem>
                            <SelectItem value="1010">Garo</SelectItem>
                            <SelectItem value="58">Goan</SelectItem>
                            <SelectItem value="2404">Gounder</SelectItem>
                            <SelectItem value="2405">Kamma</SelectItem>
                            <SelectItem value="2406">Kapu</SelectItem>
                            <SelectItem value="1011">Khasi</SelectItem>
                            <SelectItem value="506">Knanaya</SelectItem>
                            <SelectItem value="1012">Kuki</SelectItem>
                            <SelectItem value="109">Madiga</SelectItem>
                            <SelectItem value="111">Mahar</SelectItem>
                            <SelectItem value="116">Mala</SelectItem>
                            <SelectItem value="2410">Mangalorean</SelectItem>
                            <SelectItem value="125">Matang</SelectItem>
                            <SelectItem value="1013">Mizo</SelectItem>
                            <SelectItem value="133">Mudaliar</SelectItem>
                            <SelectItem value="1014">Mukkuvar</SelectItem>
                            <SelectItem value="137">Nadar</SelectItem>
                            <SelectItem value="1015">Naga</SelectItem>
                            <SelectItem value="2414">Naidu</SelectItem>
                            <SelectItem value="2415">Oraon / Kurukh</SelectItem>
                            <SelectItem value="2416">Padmashali</SelectItem>
                            <SelectItem value="2417">Pallar / Devendrakula Vellalar</SelectItem>
                            <SelectItem value="1009">Paravar / Bharathar / Fernando</SelectItem>
                            <SelectItem value="2418">Parkavakulam / Udayar</SelectItem>
                            <SelectItem value="2419">Pillai</SelectItem>
                            <SelectItem value="1008">Pulayar / Cherumar</SelectItem>
                            <SelectItem value="2421">Rajaka / Vannar</SelectItem>
                            <SelectItem value="2422">Reddy</SelectItem>
                            <SelectItem value="2423">Sambavar</SelectItem>
                            <SelectItem value="176">SC</SelectItem>
                            <SelectItem value="2425">Setti Balija</SelectItem>
                            <SelectItem value="214">ST</SelectItem>
                            <SelectItem value="2402">Thevar / Mukkulathor</SelectItem>
                            <SelectItem value="2427">Vaniya Chettiar</SelectItem>
                            <SelectItem value="2428">Vanniya Kula Kshatriyar</SelectItem>
                            <SelectItem value="2429">Vellalar</SelectItem>
                            <SelectItem value="2430">Vishwakarma</SelectItem>
                            <SelectItem value="2431">Yadavar</SelectItem>
                            <SelectItem value="63">Intercaste</SelectItem>
                            <SelectItem value="9997">Others</SelectItem>
                            <SelectItem value="9999">Don't know division</SelectItem>
                            <SelectItem value="9998">Don't wish to specify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Education</Label>
                        <Select value={formData.partnerEducation} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEducation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','High School','Bachelor\'s','Master\'s','PhD'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Employed In</Label>
                        <Select value={formData.partnerEmployedIn} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEmployedIn: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Private','Government','Self Employed','Business','Not Working'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation</Label>
                        <Input value={formData.partnerOccupation} onChange={(e) => setFormData(prev => ({ ...prev, partnerOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Annual Income</Label>
                        <Select value={formData.partnerAnnualIncome} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerAnnualIncome: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Below 1 Lakh','1 - 3 Lakhs','3 - 5 Lakhs','5 - 7 Lakhs','7 - 9 Lakhs','9 - 10 Lakhs','10+ Lakhs'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country</Label>
                      <Input value={formData.partnerCountry} onChange={(e) => setFormData(prev => ({ ...prev, partnerCountry: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'location' && (
            <div ref={locationSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country Living In <span className="text-rose-500">*</span></Label>
                      <Select value={formData.countryLivingIn} onValueChange={(val) => setFormData(prev => ({ ...prev, countryLivingIn: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Residing State / Province <span className="text-rose-500">*</span></Label>
                      {getStateList(formData.countryLivingIn) && getStateList(formData.countryLivingIn)!.length > 0 ? (
                        <Select value={formData.residingState} onValueChange={(val) => setFormData(prev => ({ ...prev, residingState: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {getStateList(formData.countryLivingIn)!.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="Enter state / province" value={formData.residingState} onChange={(e) => setFormData(prev => ({ ...prev, residingState: e.target.value }))} className="h-10 rounded border-slate-300" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Citizenship <span className="text-rose-500">*</span></Label>
                      <Select value={formData.citizenship} onValueChange={(val) => setFormData(prev => ({ ...prev, citizenship: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'email' && (
            <div ref={emailSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">E-mail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">E-mail <span className="text-rose-500">*</span></Label>
                      <Input value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'contact' && (
            <div ref={contactSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Mobile Number</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country Code</Label>
                      <Select value={formData.contactCountryCode} onValueChange={(val) => setFormData(prev => ({ ...prev, contactCountryCode: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['+91 (India)','+1 (USA)','+44 (UK)'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Mobile Number <span className="text-rose-500">*</span></Label>
                      <Input value={formData.contactNumber} onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'gallery' && (
            <div ref={gallerySectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Photo Gallery</CardTitle>
                      <CardDescription className="text-sm text-slate-500">Upload up to 10 photos. Put your clearest portrait first.</CardDescription>
                    </div>
                    <Badge className="rounded-none bg-rose-400 px-3 py-1 text-xs font-semibold text-white">{formData.galleryPhotos.length}/10</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {formData.galleryPhotos.map((photo, index) => (
                      <div key={`${photo}-${index}`} className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-slate-200 bg-slate-100" onClick={() => handleSetPrimaryPhoto(index)}>
                        <Image src={photo} alt={`Profile photo ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        {index === 0 && <Badge className="absolute left-2 top-2 rounded-none bg-white px-2 py-1 text-[10px] font-semibold text-slate-900">Primary</Badge>}
                        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button type="button" size="sm" variant="secondary" className="h-8 flex-1 rounded-none text-[10px] font-semibold" onClick={(event) => { event.stopPropagation(); handleSetPrimaryPhoto(index); }}>
                            Set Main
                          </Button>
                          <Button type="button" size="sm" variant="destructive" className="h-8 rounded-none text-[10px] font-semibold" onClick={(event) => { event.stopPropagation(); handleRemovePhoto(index); }}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    {Array.from({ length: Math.max(0, MAX_PROFILE_IMAGES - formData.galleryPhotos.length) }).map((_, index) => (
                      <button
                        key={`empty-${index}`}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-slate-500 hover:text-slate-600"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Add Photo</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            
          </main>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Profile completeness: {completion}%</span>
            <span>{formData.galleryPhotos.length} of {MAX_PROFILE_IMAGES} photos uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
