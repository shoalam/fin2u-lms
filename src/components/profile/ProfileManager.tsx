'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { updateUser as updateUserAuth, User } from '@/store/authSlice';
import { useUpdateUserMutation, useGetUserQuery } from '@/store/api/userApi';
import ProfileCompletionCard, { CompletionSection } from './ProfileCompletionCard';
import ImageUploader from '@/components/common/ImageUploader';
import { StorageFolders } from '@/constants/storage-folders';
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Camera,
  Image as ImageIcon,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  Layers,
  Shuffle,
  Eye,
  Check,
  X,
  Upload,
  Link2,
  Share2,
  FileText,
  UserCheck,
} from 'lucide-react';

// Curated Cover Photos & Avatars
const PRESET_COVERS = [
  {
    name: 'Finance & Banking Dark',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Modern Architecture Minimal',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Stock Market Analytics',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'FinTech Neon Gradient',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Executive Workspace',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  },
];

const PRESET_AVATARS = [
  {
    name: 'Professional Mentor 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Senior Advisor 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Executive Leader 3',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Finance Specialist 4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Student Learner 5',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
];

// Sample Random Realistic Data by Role
const SAMPLE_ROLE_DATA = {
  mentor: {
    firstName: 'Dr. Michael',
    lastName: 'Sterling',
    nickname: 'Mike',
    name: 'Dr. Michael Sterling, CFA',
    headline: 'Senior Investment Strategist & Fin2u Lead Finance Mentor',
    bio: 'Dedicated finance educator with over 14 years of capital markets experience. Specializing in portfolio optimization, risk mitigation, and algorithmic wealth management for ambitious professionals.',
    phone: '+61 412 890 321',
    gender: 'Male',
    dob: '1984-06-18',
    country: 'Australia',
    city: 'Sydney',
    address: 'Level 38, Tower 1, International Towers, Barangaroo',
    state: 'New South Wales',
    postalCode: '2000',
    nationality: 'Australian',
    nationalId: 'AUS-TX-994821',
    hrdcAccredited: true,
    hrdcTrainerId: 'HRDC-MY-TR-88412',
    hourlyRate: 150,
    courseCategories: ['Corporate Finance', 'Algorithmic Trading', 'Wealth Management', 'Risk Analytics'],
    education: {
      highestDegree: 'Ph.D. in Computational Finance',
      institution: 'London School of Economics & Political Science',
      fieldOfStudy: 'Quantitative Portfolio Theory & Asset Pricing',
      graduationYear: '2012',
    },
    experience: {
      currentRole: 'Principal Portfolio Manager & Lead Mentor',
      company: 'Aegis Capital & Fin2u Academy',
      industry: 'Wealth Management & FinTech Education',
      yearsOfExperience: '14+ Years',
      skills: 'Portfolio Analysis, DCF Modeling, Python for Algorithmic Trading, ESG Investing, Risk Management',
    },
    social: {
      linkedin: 'https://linkedin.com/in/michael-sterling-cfa',
      twitter: 'https://twitter.com/msterling_fin',
      facebook: 'https://facebook.com/sterlingfinancial',
      instagram: 'https://instagram.com/sterling_wealth',
      github: 'https://github.com/msterling-quant',
    },
    website: 'https://michaelsterling.finance',
    preferredLanguage: 'English (Fluent), French (Professional)',
    timeZone: 'Australia/Sydney (AEST, UTC+10)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
  },
  student: {
    firstName: 'Sakinah',
    lastName: 'Al-Mansoor',
    nickname: 'Saki',
    name: 'Sakinah Al-Mansoor',
    headline: 'Aspiring Financial Analyst & Applied Economics Major',
    bio: 'Third-year finance student passionate about corporate valuations, sustainable ESG investments, and personal wealth growth. Eager to master advanced financial modeling.',
    phone: '+60 12-345 6789',
    gender: 'Female',
    dob: '2002-04-14',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    address: 'Block B-12, Residensi Universiti, Jalan Pantai Baru',
    state: 'Wilayah Persekutuan',
    postalCode: '59200',
    nationality: 'Malaysian',
    nationalId: 'MY-IC-020414-14-5582',
    learningGoals: 'Master Discounted Cash Flow (DCF), pass CFA Level 1, and join a premier investment fund.',
    interests: ['Equity Valuation', 'Corporate Finance', 'Algorithmic Trading', 'Wealth Management'],
    education: {
      highestDegree: 'Bachelor of Science in Finance (Honors)',
      institution: 'University of Malaya (UM)',
      fieldOfStudy: 'Corporate Finance & Investment Analysis',
      graduationYear: '2025',
    },
    experience: {
      currentRole: 'Undergraduate Student / Junior Finance Intern',
      company: 'Maybank Investment Banking Group',
      industry: 'Commercial & Investment Banking',
      yearsOfExperience: '1 Year (Internship)',
      skills: 'Financial Modeling, Excel (VBA/PowerQuery), Corporate Valuation, Accounting Standards',
    },
    social: {
      linkedin: 'https://linkedin.com/in/sakinah-almansoor',
      twitter: 'https://twitter.com/sakinah_finance',
      facebook: '',
      instagram: 'https://instagram.com/sakinah.studies',
      github: 'https://github.com/sakinah-fin',
    },
    website: 'https://sakinah-portfolio.dev',
    preferredLanguage: 'English (Fluent), Malay (Native)',
    timeZone: 'Asia/Kuala_Lumpur (MYT, UTC+8)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
  },
  admin: {
    firstName: 'Marcus',
    lastName: 'Vance',
    nickname: 'Marc',
    name: 'Marcus Vance, CISSP',
    headline: 'Chief Technology Officer & Head of Platform Governance',
    bio: 'Lead System Administrator and LMS Operations Director at Fin2u. Responsible for high-availability cloud architecture, faculty verification, and platform integrity.',
    phone: '+1 (415) 890-7721',
    gender: 'Male',
    dob: '1981-11-23',
    country: 'United States',
    city: 'San Francisco',
    address: '555 Mission Street, Suite 2400, Financial District',
    state: 'California',
    postalCode: '94105',
    nationality: 'American',
    nationalId: 'US-SSN-XXX-XX-8491',
    staffId: 'FIN2U-ADM-0042',
    department: 'Platform Governance & Infrastructure',
    permissions: ['SUPER_ADMIN', 'MANAGE_USERS', 'VERIFY_MENTORS', 'AUDIT_LOGS', 'MANAGE_COURSES'],
    education: {
      highestDegree: 'M.S. in Cybersecurity & Cloud Infrastructure',
      institution: 'Stanford University',
      fieldOfStudy: 'Distributed Systems & Network Security',
      graduationYear: '2007',
    },
    experience: {
      currentRole: 'Super Administrator & Infrastructure Lead',
      company: 'Fin2u Global Learning Systems',
      industry: 'EdTech & Enterprise Cloud Operations',
      yearsOfExperience: '18+ Years',
      skills: 'Cloud Infrastructure, Kubernetes, SOC2 Compliance, Identity Governance, System Security',
    },
    social: {
      linkedin: 'https://linkedin.com/in/marcus-vance-admin',
      twitter: 'https://twitter.com/mvance_ops',
      facebook: '',
      instagram: '',
      github: 'https://github.com/mvance-fin2u',
    },
    website: 'https://fin2u.net/internal/ops',
    preferredLanguage: 'English (Native)',
    timeZone: 'America/Los_Angeles (PST, UTC-8)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  },
};

const POPULAR_STUDENT_INTERESTS = [
  'Corporate Finance',
  'Equity Valuation',
  'Wealth Management',
  'Algorithmic Trading',
  'Financial Modeling & Excel',
  'Risk Analytics',
  'ESG & Sustainable Investing',
  'Investment Banking',
  'Personal Financial Planning',
  'Taxation & Accounting',
];

const POPULAR_COURSE_CATEGORIES = [
  'Corporate Finance',
  'Wealth Management',
  'Algorithmic Trading',
  'Equity Valuation',
  'Financial Modeling',
  'Personal Finance',
  'Risk Management',
  'Real Estate Finance',
  'FinTech & Cryptoeconomics',
];

interface ProfileManagerProps {
  forcedRole?: 'mentor' | 'student' | 'admin';
}

export default function ProfileManager({ forcedRole }: ProfileManagerProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const targetUserId = user?._id || user?.id || '';
  const { data: dbUser } = useGetUserQuery(targetUserId, {
    skip: !targetUserId,
    refetchOnMountOrArgChange: true,
  });
  const [updateUserMutation, { isLoading }] = useUpdateUserMutation();

  const role: 'mentor' | 'student' | 'admin' = forcedRole || (user?.role as any) || 'student';

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('biography');

  // Common Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [website, setWebsite] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [timeZone, setTimeZone] = useState('');

  // Role-specific Form states:
  // Student
  const [learningGoals, setLearningGoals] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // Mentor
  const [hrdcAccredited, setHrdcAccredited] = useState(false);
  const [hrdcTrainerId, setHrdcTrainerId] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | string>(0);
  const [courseCategories, setCourseCategories] = useState<string[]>([]);

  // Admin
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  // Sub-objects
  const [highestDegree, setHighestDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [skills, setSkills] = useState('');

  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [github, setGithub] = useState('');

  // UI state
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Profile updated successfully!');
  const initialLoadedRef = useRef(false);

  // Sync state from User / DB on load
  useEffect(() => {
    const activeUser = dbUser || user;
    if (activeUser && (!initialLoadedRef.current || dbUser)) {
      initialLoadedRef.current = true;
      const initialFirst = activeUser.firstName || (activeUser.name ? activeUser.name.split(' ')[0] : '');
      const initialLast = activeUser.lastName || (activeUser.name ? activeUser.name.split(' ').slice(1).join(' ') : '');
      setFirstName(initialFirst);
      setLastName(initialLast);
      setNickname(activeUser.nickname || '');
      setName(activeUser.name || [initialFirst, initialLast].filter(Boolean).join(' '));
      setEmail(activeUser.email || '');
      setHeadline(activeUser.headline || '');
      setBio(activeUser.bio || '');
      setPhone(activeUser.phone || '');
      setGender(activeUser.gender || '');
      setDob(activeUser.dob || '');
      setCountry(activeUser.country || '');
      setCity(activeUser.city || '');
      setAddress(activeUser.address || '');
      setState(activeUser.state || '');
      setPostalCode(activeUser.postalCode || '');
      setNationality(activeUser.nationality || '');
      setNationalId(activeUser.nationalId || '');
      setWebsite(activeUser.website || '');
      setAvatar(activeUser.avatar || '');
      setCoverPhoto(activeUser.coverPhoto || '');
      setPreferredLanguage(activeUser.preferredLanguage || '');
      setTimeZone(activeUser.timeZone || '');

      // Student sub-schema
      const stud = activeUser.studentProfile || {};
      setLearningGoals(activeUser.learningGoals || stud.learningGoals || '');
      setInterests(stud.interests || []);

      // Mentor sub-schema
      const ment = activeUser.mentorProfile || {};
      setHrdcAccredited(ment.hrdcAccredited || false);
      setHrdcTrainerId(ment.hrdcTrainerId || '');
      setHourlyRate(ment.hourlyRate ?? 0);
      setCourseCategories(ment.courseCategories || []);

      // Admin sub-schema
      const adm = activeUser.adminProfile || {};
      setStaffId(activeUser.staffId || adm.staffId || '');
      setDepartment(activeUser.department || adm.department || '');
      setPermissions(activeUser.permissions || adm.permissions || ['SUPER_ADMIN']);

      if (activeUser.education) {
        setHighestDegree(activeUser.education.highestDegree || '');
        setInstitution(activeUser.education.institution || '');
        setFieldOfStudy(activeUser.education.fieldOfStudy || '');
        setGraduationYear(activeUser.education.graduationYear || '');
      }

      if (activeUser.experience) {
        setCurrentRole(activeUser.experience.currentRole || '');
        setCompany(activeUser.experience.company || '');
        setIndustry(activeUser.experience.industry || '');
        setYearsOfExperience(activeUser.experience.yearsOfExperience || '');
        setSkills(activeUser.experience.skills || '');
      }

      if (activeUser.social) {
        setLinkedin(activeUser.social.linkedin || '');
        setTwitter(activeUser.social.twitter || '');
        setFacebook(activeUser.social.facebook || '');
        setInstagram(activeUser.social.instagram || '');
        setGithub(activeUser.social.github || '');
      }
    }
  }, [dbUser, user?._id]);

  // Handle Fill Random Data for current role
  const handleFillRandomData = () => {
    const sample = SAMPLE_ROLE_DATA[role] || SAMPLE_ROLE_DATA.mentor;
    setFirstName(sample.firstName || '');
    setLastName(sample.lastName || '');
    setNickname(sample.nickname || '');
    setName(sample.name || `${sample.firstName} ${sample.lastName}`.trim());
    setHeadline(sample.headline);
    setBio(sample.bio);
    setPhone(sample.phone);
    setGender(sample.gender);
    setDob(sample.dob);
    setCountry(sample.country);
    setCity(sample.city);
    setAddress(sample.address);
    setState(sample.state);
    setPostalCode(sample.postalCode);
    setNationality(sample.nationality);
    setNationalId(sample.nationalId);
    setWebsite(sample.website);
    setAvatar(sample.avatar);
    setCoverPhoto(sample.coverPhoto);
    setPreferredLanguage(sample.preferredLanguage);
    setTimeZone(sample.timeZone);

    if (role === 'student' && 'learningGoals' in sample) {
      setLearningGoals(sample.learningGoals || '');
      setInterests((sample as any).interests || []);
    } else if (role === 'mentor' && 'hrdcTrainerId' in sample) {
      setHrdcAccredited((sample as any).hrdcAccredited || false);
      setHrdcTrainerId((sample as any).hrdcTrainerId || '');
      setHourlyRate((sample as any).hourlyRate || 0);
      setCourseCategories((sample as any).courseCategories || []);
    } else if (role === 'admin' && 'staffId' in sample) {
      setStaffId((sample as any).staffId || '');
      setDepartment((sample as any).department || '');
      setPermissions((sample as any).permissions || ['SUPER_ADMIN']);
    }

    setHighestDegree(sample.education.highestDegree);
    setInstitution(sample.education.institution);
    setFieldOfStudy(sample.education.fieldOfStudy);
    setGraduationYear(sample.education.graduationYear);

    setCurrentRole(sample.experience.currentRole);
    setCompany(sample.experience.company);
    setIndustry(sample.experience.industry);
    setYearsOfExperience(sample.experience.yearsOfExperience);
    setSkills(sample.experience.skills);

    setLinkedin(sample.social.linkedin);
    setTwitter(sample.social.twitter);
    setFacebook(sample.social.facebook);
    setInstagram(sample.social.instagram);
    setGithub(sample.social.github);

    setSaveMessage(`Loaded realistic sample credentials for ${role.toUpperCase()}!`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const toggleCategory = (cat: string) => {
    setCourseCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  // Compute Completion Counts dynamically based on current role:
  // Biography (0/1)
  const bioCount = bio.trim() ? 1 : 0;

  // Details (Role-specific fields: First Name, Last Name, Headline, Email, Phone)
  const detailFields =
    role === 'student'
      ? [firstName || name, lastName || name, headline || learningGoals, email, phone]
      : role === 'mentor'
      ? [firstName || name, lastName || name, headline, email, phone]
      : [firstName || name, lastName || name, headline || staffId, email, phone];
  const detailCount = detailFields.filter((f) => f && f.trim().length > 0).length;

  // Personal Information (0/8) -> DOB, Gender, Address, City, State, PostalCode, Country, Nationality/TimeZone
  const personalFields = [dob, gender, address, city, state, postalCode, country, nationality || timeZone];
  const personalCount = personalFields.filter((f) => f && f.trim().length > 0).length;

  // Education Level (0/3) -> Degree, Institution, FieldOfStudy/GraduationYear
  const educationFields = [highestDegree, institution, fieldOfStudy || graduationYear];
  const educationCount = educationFields.filter((f) => f && f.trim().length > 0).length;

  // Working Experience (0/5) -> Role, Company, Industry, Years, Skills
  const experienceFields = [currentRole, company, industry, yearsOfExperience, skills];
  const experienceCount = experienceFields.filter((f) => f && f.trim().length > 0).length;

  // Profile Photo (0/1)
  const avatarCount = avatar.trim() ? 1 : 0;

  // Cover Photo (0/1)
  const coverCount = coverPhoto.trim() ? 1 : 0;

  // Social Link Count (at least 1 profile link)
  const socialFields = [linkedin, twitter, facebook, instagram, github];
  const socialCount = socialFields.filter((f) => f && f.trim().length > 0).length > 0 ? 1 : 0;

  // Total completed vs total fields (1 + 5 + 8 + 3 + 5 + 2 + 1 = 25 total)
  const totalCompleted =
    bioCount + detailCount + personalCount + educationCount + experienceCount + avatarCount + coverCount + socialCount;
  const totalFields = 1 + 5 + 8 + 3 + 5 + 2 + 1; // 25
  const overallPercentage = Math.round((totalCompleted / totalFields) * 100);

  // Sections definition for completion card (all IDs are completely unique)
  const sections: CompletionSection[] = [
    {
      id: 'biography',
      label: 'Biography',
      completed: bioCount,
      total: 1,
      icon: FileText,
      color: '#ff447e',
    },
    {
      id: 'details',
      label: 'Details',
      completed: detailCount,
      total: 5,
      icon: UserCheck,
      color: '#3b82f6',
    },
    {
      id: 'personal',
      label: 'Personal Information',
      completed: personalCount,
      total: 8,
      icon: MapPin,
      color: '#10b981',
    },
    {
      id: 'education',
      label: 'Education Level',
      completed: educationCount,
      total: 3,
      icon: GraduationCap,
      color: '#8b5cf6',
    },
    {
      id: 'experience',
      label: role === 'student' ? 'Career & Goals' : role === 'admin' ? 'Responsibilities' : 'Working Experience',
      completed: experienceCount,
      total: 5,
      icon: Briefcase,
      color: '#f59e0b',
    },
    {
      id: 'photos',
      label: 'Profile & Cover Photos',
      completed: avatarCount + coverCount,
      total: 2,
      icon: Camera,
      color: '#06b6d4',
    },
    {
      id: 'social',
      label: 'Social Profiles',
      completed: socialCount,
      total: 1,
      icon: Globe,
      color: '#ec4899',
    },
  ];

  // Submit Handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const idToUpdate = user?._id || user?.id || targetUserId;
    if (!idToUpdate) return;

    const finalFullName = (
      name.trim() ||
      [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') ||
      nickname.trim()
    );

    const updatedData: Partial<User> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim(),
      name: finalFullName,
      headline,
      bio,
      phone,
      gender,
      dob,
      country,
      city,
      address,
      state,
      postalCode,
      nationality,
      nationalId,
      website,
      avatar,
      coverPhoto,
      preferredLanguage,
      timeZone,
      ...(role === 'student'
        ? {
            learningGoals,
            studentProfile: {
              learningGoals,
              preferredLanguage,
              timeZone,
              interests,
            },
          }
        : {}),
      ...(role === 'mentor'
        ? {
            mentorProfile: {
              headline,
              bio,
              website,
              hrdcAccredited,
              hrdcTrainerId,
              courseCategories,
              yearsOfExperience,
              hourlyRate: Number(hourlyRate) || 0,
              skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
            },
          }
        : {}),
      ...(role === 'admin'
        ? {
            staffId,
            department,
            permissions,
            adminProfile: {
              staffId,
              department,
              permissions,
            },
          }
        : {}),
      education: {
        highestDegree,
        institution,
        fieldOfStudy,
        graduationYear,
      },
      experience: {
        currentRole,
        company,
        industry,
        yearsOfExperience,
        skills,
      },
      social: {
        linkedin,
        twitter,
        facebook,
        instagram,
        github,
      },
    };

    try {
      const res = await updateUserMutation({
        id: idToUpdate,
        ...updatedData,
      }).unwrap();

      const savedUser = (res as any)?.data || (res as any)?._id ? res : { ...user, ...updatedData };
      dispatch(updateUserAuth(savedUser));
      setSaveMessage('Profile information saved successfully to database!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Save profile error:', err);
      // Fallback local update
      dispatch(updateUserAuth(updatedData));
      setSaveMessage('Profile updated locally!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || user?.name || 'User'
  )}&background=ff447e&color=fff&size=256`;

  const activeCover =
    coverPhoto ||
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="space-y-8 pb-16">
      {/* SUCCESS BANNER */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold">{saveMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER COVER & PROFILE IDENTITY CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Photo Area */}
        <div className="relative h-40 sm:h-56 md:h-64 lg:h-72 w-full bg-slate-900 overflow-hidden group">
          <img
            src={activeCover}
            alt="Cover Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Change Cover Button */}
          <button
            type="button"
            onClick={() => setShowCoverModal(true)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/85 hover:bg-white text-[#041c53] backdrop-blur-md text-[11px] sm:text-xs font-extrabold shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff447e]" />
            <span>Change Cover</span>
          </button>
        </div>

        {/* Identity & Quick Actions Bar */}
        <div className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 -mt-12 sm:-mt-16 md:-mt-20">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 text-center sm:text-left">
              <div className="relative group shrink-0">
                <img
                  src={avatar || defaultAvatar}
                  alt={name || 'User'}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white shadow-2xl bg-slate-100 ring-2 ring-slate-200/60"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#041c53] hover:bg-[#ff447e] text-white flex items-center justify-center shadow-lg border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#041c53] truncate">
                    {name || (firstName && lastName ? `${firstName} ${lastName}` : 'Your Name')}
                  </h1>
                  {nickname && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      &ldquo;{nickname}&rdquo;
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#ff447e]/10 text-[#ff447e] border border-[#ff447e]/20">
                    {role.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-snug">
                  {headline || 'Professional Headline / Specialization'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{email || user?.email}</span>
                  </span>
                  {city && country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{city}, {country}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Fill Random Sample Data & Save */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-end gap-2.5 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0">
              <button
                type="button"
                onClick={handleFillRandomData}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                title="Fill with realistic sample data for this role"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Fill Realistic Data</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isLoading}
                className="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold shadow-lg shadow-[#ff447e]/25 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETE YOUR PROFILE PROGRESS CARD */}
      <ProfileCompletionCard
        sections={sections}
        overallPercentage={overallPercentage}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        role={role}
      />

      {/* TAB NAVIGATION */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto custom-scrollbar flex items-center gap-1 sm:gap-1.5">
        {[
          { id: 'biography', label: 'Biography', icon: FileText, count: `${bioCount}/1` },
          { id: 'details', label: 'Details', icon: UserCheck, count: `${detailCount}/4` },
          { id: 'personal', label: 'Personal Information', icon: MapPin, count: `${personalCount}/8` },
          { id: 'education', label: 'Education Level', icon: GraduationCap, count: `${educationCount}/3` },
          {
            id: 'experience',
            label: role === 'student' ? 'Career & Goals' : role === 'admin' ? 'Responsibilities' : 'Working Experience',
            icon: Briefcase,
            count: `${experienceCount}/5`,
          },
          { id: 'photos', label: 'Profile & Cover Photos', icon: Camera, count: `${avatarCount + coverCount}/2` },
          { id: 'social', label: 'Social & Public Profiles', icon: Globe, count: 'Social' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#041c53] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#041c53] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#ff447e]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FORM CONTENT ACCORDING TO ACTIVE TAB */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 space-y-5 sm:space-y-6">
        {/* TAB 1: BIOGRAPHY */}
        {activeTab === 'biography' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">
                  {role === 'mentor'
                    ? 'Faculty Biography & Mentorship Approach'
                    : role === 'student'
                    ? 'Student Bio & Academic Profile'
                    : 'Administrative Profile & Platform Governance'}
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'mentor'
                    ? 'Introduce your teaching philosophy, corporate finance credentials, and mentorship methodology.'
                    : role === 'student'
                    ? 'Describe your academic background, target finance domains, and professional learning ambitions.'
                    : 'Detail your administrative leadership, LMS platform supervision, and operational focus.'}
                </p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  bioCount === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {bioCount}/1 Completed
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Detailed Biography & Summary <span className="text-[#ff447e]">*</span>
              </label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  role === 'mentor'
                    ? 'e.g. Certified Financial Planner with 14+ years specializing in capital markets, algorithmic risk management, and portfolio strategy. Mentored over 4,000+ learners across corporate finance and equity analysis modules...'
                    : role === 'student'
                    ? 'e.g. Final year Finance & Applied Economics student passionate about corporate valuation, financial modeling, and wealth management. Targeting entry into high-impact investment banking and portfolio research...'
                    : 'e.g. Lead Platform Administrator supervising system integrity, role-based access governance, course verification pipelines, and cloud high-availability infrastructure...'
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10 leading-relaxed text-slate-800 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>Minimum recommended length: 50 words</span>
                <span>{bio.trim().split(/\s+/).filter(Boolean).length} words</span>
              </p>
            </div>

            {/* Role-Specific Additional Biography Sections */}
            {role === 'student' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Primary Learning Goals & Target Milestone
                  </label>
                  <input
                    type="text"
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    placeholder="e.g. Master Discounted Cash Flow (DCF), pass CFA Level 1, and build algorithmic trading models."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">This helps our course engine recommend relevant certificates and mentor sessions.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Topics & Domains of Interest
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_STUDENT_INTERESTS.map((interest) => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#ff447e] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {role === 'mentor' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-[#041c53] block">HRDC Accreditation</span>
                        <span className="text-[11px] text-slate-500 block">Are you a certified HRDC Certified Trainer?</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hrdcAccredited}
                          onChange={(e) => setHrdcAccredited(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff447e]"></div>
                      </label>
                    </div>

                    {hrdcAccredited && (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          HRDC Trainer ID
                        </label>
                        <input
                          type="text"
                          value={hrdcTrainerId}
                          onChange={(e) => setHrdcTrainerId(e.target.value)}
                          placeholder="e.g. HRDC-MY-TR-88412"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <span className="text-xs font-black text-[#041c53] block">1-on-1 Consultation Rate</span>
                    <span className="text-[11px] text-slate-500 block">Hourly rate for private student advisory sessions ($ USD / MYR)</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="150"
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold text-[#041c53] focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Instruction & Course Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_COURSE_CATEGORIES.map((cat) => {
                      const isSelected = courseCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#041c53] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 space-y-2.5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-950">Administrative Access Privileges</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    High Security Clearance
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-900 shadow-2xs"
                    >
                      🛡️ {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">
                  {role === 'student'
                    ? 'Student Identification & Contact'
                    : role === 'mentor'
                    ? 'Faculty Identification & Contact'
                    : 'Administrative Designation & Access'}
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'student'
                    ? 'Essential learner contact information used for official certification issuance.'
                    : role === 'mentor'
                    ? 'Verified instructor contact coordinates and public faculty title.'
                    : 'System operator credentials and organizational department.'}
                </p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  detailCount === 4 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {detailCount}/4 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  First Name <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFirstName(val);
                    if (!name || name === `${firstName} ${lastName}`.trim()) {
                      setName(`${val} ${lastName}`.trim());
                    }
                  }}
                  placeholder="e.g. Rachel"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Last Name <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLastName(val);
                    if (!name || name === `${firstName} ${lastName}`.trim()) {
                      setName(`${firstName} ${val}`.trim());
                    }
                  }}
                  placeholder="e.g. Tan"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nickname <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Ray / Rach"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Display / Legal Name <span className="text-slate-400 font-normal lowercase">(used for certificates)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Michael Sterling, CFA"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {role === 'admin'
                    ? 'Administrative Designation'
                    : role === 'student'
                    ? 'Learner Headline / Degree Focus'
                    : 'Professional Faculty Headline'} <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Senior Wealth Advisor & Quantitative Finance Mentor'
                      : role === 'student'
                      ? 'e.g. Aspiring Financial Analyst & Applied Economics Major'
                      : 'e.g. Chief Systems Administrator & Operations Lead'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Email Address <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Contact system administrator to change your primary account email</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Phone / WhatsApp <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +60 12-345 6789"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/10"
                />
              </div>

              {/* Mentor specific fields */}
              {role === 'mentor' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      HRDC Registered Trainer ID
                    </label>
                    <input
                      type="text"
                      value={hrdcTrainerId}
                      onChange={(e) => setHrdcTrainerId(e.target.value)}
                      placeholder="e.g. HRDC-MY-TR-88412"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Hourly Consultation Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="150"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                    />
                  </div>
                </>
              )}

              {/* Admin specific fields */}
              {role === 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Internal Staff ID
                    </label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. FIN2U-ADM-0042"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Administrative Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Platform Governance & Infrastructure"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">Personal Information</h3>
                <p className="text-xs text-slate-500">Demographic, location, and regional identity records</p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  personalCount === 8 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {personalCount}/8 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date of Birth <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender <span className="text-[#ff447e]">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e] bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Country of Residence <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Malaysia"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  City <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kuala Lumpur"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Street Address <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Block B-12, Residensi Universiti, Jalan Pantai Baru"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  State / Province <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Wilayah Persekutuan"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Postal / ZIP Code <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 59200"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nationality <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Malaysian"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  National ID / Tax Number
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. MY-IC-020414-14-5582"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Timezone
                </label>
                <input
                  type="text"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  placeholder="e.g. Asia/Kuala_Lumpur (UTC+8)"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  placeholder="e.g. English, Malay, Mandarin"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATION LEVEL */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">
                  {role === 'student'
                    ? 'Current Studies & Academic Qualifications'
                    : role === 'mentor'
                    ? 'Faculty Academic Credentials & Degrees'
                    : 'Academic Background & Qualifications'}
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'student'
                    ? 'Your university degrees, certificates, and current academic majors.'
                    : role === 'mentor'
                    ? 'Postgraduate qualifications, doctoral degrees, and recognized faculty credentials.'
                    : 'Academic credentials and technical certification history.'}
                </p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  educationCount === 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {educationCount}/3 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Highest Degree / Diploma Attained <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={highestDegree}
                  onChange={(e) => setHighestDegree(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Ph.D. in Computational Finance'
                      : role === 'student'
                      ? 'e.g. Bachelor of Science in Finance (Honors)'
                      : 'e.g. M.S. in Cybersecurity & Cloud Infrastructure'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institution / University <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. London School of Economics & Political Science'
                      : role === 'student'
                      ? 'e.g. University of Malaya (UM)'
                      : 'e.g. Stanford University'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Field of Study / Major <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Quantitative Portfolio Theory & Asset Pricing'
                      : role === 'student'
                      ? 'e.g. Corporate Finance & Investment Analysis'
                      : 'e.g. Distributed Systems & Network Security'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {role === 'student' ? 'Graduation / Expected Year' : 'Graduation Year'}
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. 2025' : 'e.g. 2012'}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WORKING EXPERIENCE / EXPERTISE */}
        {activeTab === 'experience' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">
                  {role === 'student'
                    ? 'Career Aspirations & Internships'
                    : role === 'mentor'
                    ? 'Working Experience & Advisory Track Record'
                    : 'Platform Governance & Systems Experience'}
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'mentor'
                    ? 'Highlight your corporate track record, advisory positions, and core domains of expertise.'
                    : role === 'student'
                    ? 'Outline your target career roles, internship experience, and key skill interests.'
                    : 'Detail your administrative leadership, cloud domain focus, and operational systems.'}
                </p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  experienceCount === 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {experienceCount}/5 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {role === 'student' ? 'Target Role / Current Internship' : 'Current Job Title / Role'}{' '}
                  <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Principal Portfolio Manager & Lead Mentor'
                      : role === 'student'
                      ? 'e.g. Undergraduate Student / Junior Finance Intern'
                      : 'e.g. Super Administrator & Infrastructure Lead'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {role === 'student' ? 'Target Company / Current Org' : 'Company / Organization'}{' '}
                  <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Aegis Capital & Fin2u Academy'
                      : role === 'student'
                      ? 'e.g. Maybank Investment Banking Group'
                      : 'e.g. Fin2u Global Learning Systems'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Industry / Sector <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Wealth Management & FinTech Education'
                      : role === 'student'
                      ? 'e.g. Commercial & Investment Banking'
                      : 'e.g. EdTech & Enterprise Cloud Operations'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Years of Experience <span className="text-[#ff447e]">*</span>
                </label>
                <input
                  type="text"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. 14+ Years'
                      : role === 'student'
                      ? 'e.g. 1 Year (Internship)'
                      : 'e.g. 18+ Years'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {role === 'student'
                    ? 'Target Skills, Modeling Proficiencies & Software'
                    : role === 'mentor'
                    ? 'Specializations, Badges & Certifications'
                    : 'System Architecture & Infrastructure Skills'}{' '}
                  <span className="text-[#ff447e]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder={
                    role === 'mentor'
                      ? 'e.g. Portfolio Analysis, DCF Modeling, Python for Algorithmic Trading, ESG Investing, Risk Management'
                      : role === 'student'
                      ? 'e.g. Financial Modeling, Excel (VBA/PowerQuery), Corporate Valuation, Accounting Standards'
                      : 'e.g. Cloud Infrastructure, Kubernetes, SOC2 Compliance, Identity Governance, System Security'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate skills with commas</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PHOTOS & MEDIA */}
        {activeTab === 'photos' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">Profile & Cover Photos</h3>
                <p className="text-xs text-slate-500">
                  Select curated photography or enter custom URLs for your profile avatar and banner.
                </p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  avatarCount + coverCount === 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {avatarCount + coverCount}/2 Completed
              </span>
            </div>

            {/* Profile Photo Section */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#ff447e]" />
                <h4 className="text-sm font-extrabold text-[#041c53]">1. Profile Photo (Avatar)</h4>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    avatarCount ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {avatarCount ? '1/1 Uploaded' : '0/1 Required'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={avatar || defaultAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-xl ring-2 ring-slate-200"
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <p className="text-xs text-slate-600 font-medium">
                    Pick a curated avatar from our library or supply an image link:
                  </p>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          avatar === p.url ? 'border-[#ff447e] ring-2 ring-[#ff447e]/30 scale-105' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#041c53] shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      Custom Image URL
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Photo Section */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#ff447e]" />
                <h4 className="text-sm font-extrabold text-[#041c53]">2. Cover Banner Photo</h4>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    coverCount ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {coverCount ? '1/1 Uploaded' : '0/1 Required'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-32 w-full rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                  <img src={activeCover} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>

                <p className="text-xs text-slate-600 font-medium">Choose a theme banner:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PRESET_COVERS.map((cov, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverPhoto(cov.url)}
                      className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        coverPhoto === cov.url
                          ? 'border-[#ff447e] ring-2 ring-[#ff447e]/30 scale-105 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={cov.url} alt={cov.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-bold text-white leading-tight drop-shadow-md">
                          {cov.name}
                        </span>
                      </div>
                      {coverPhoto === cov.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff447e] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowCoverModal(true)}
                    className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#041c53] shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    Enter Custom Banner Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SOCIAL & PUBLIC LINKS */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#041c53]">Social Profiles & Portfolio Links</h3>
                <p className="text-xs text-slate-500">Connect your public online presence and academic links</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">in</span>
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-black text-white flex items-center justify-center font-bold text-[10px]">𝕏</span>
                  <span>Twitter / X</span>
                </label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Personal Website / Portfolio</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://mywebsite.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">git</span>
                  <span>GitHub / Research Repo</span>
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SAVE BAR */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-medium">
            Progress status: <span className="font-bold text-[#041c53]">{overallPercentage}% Completed</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleFillRandomData}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold transition-all text-center cursor-pointer"
            >
              Fill Sample Data
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isLoading}
              className="flex-1 sm:flex-none btn btn-primary flex items-center justify-center gap-2 px-8 py-2.5 text-xs font-extrabold shadow-lg shadow-[#ff447e]/25 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* COVER IMAGE MODAL */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-[#041c53]">Update Cover Photo</h4>
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <ImageUploader
                label="Upload Cover Image"
                value={customCoverUrl}
                onChange={setCustomCoverUrl}
                folder={StorageFolders.USERS_COVERS}
                aspectRatio="banner"
                helperText="Upload any high resolution landscape cover image (PNG, JPG, WEBP)."
              />

              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Or select from high-res presets:</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COVERS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomCoverUrl(c.url)}
                      className="text-left p-2 rounded-xl border border-slate-200 hover:border-[#ff447e] text-xs font-bold text-slate-700 truncate"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="btn btn-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customCoverUrl) setCoverPhoto(customCoverUrl);
                  setShowCoverModal(false);
                }}
                className="btn btn-primary text-xs py-2 px-5 font-bold"
              >
                Apply Cover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVATAR MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-[#041c53]">Update Profile Avatar</h4>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <ImageUploader
                label="Upload Avatar Portrait"
                value={customAvatarUrl}
                onChange={setCustomAvatarUrl}
                folder={StorageFolders.USERS_AVATARS}
                aspectRatio="square"
                helperText="Square 1:1 ratio portrait recommended (400x400px)."
              />

              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Or select from curated portraits:</p>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_AVATARS.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomAvatarUrl(a.url)}
                      className={`w-12 h-12 rounded-2xl overflow-hidden border-2 ${
                        customAvatarUrl === a.url ? 'border-[#ff447e] ring-2 ring-[#ff447e]/30' : 'border-slate-200'
                      }`}
                    >
                      <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="btn btn-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customAvatarUrl) setAvatar(customAvatarUrl);
                  setShowAvatarModal(false);
                }}
                className="btn btn-primary text-xs py-2 px-5 font-bold"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
