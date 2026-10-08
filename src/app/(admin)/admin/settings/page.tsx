'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useSendTestEmailMutation,
  useGetStorageSettingsQuery,
  useUpdateStorageSettingsMutation,
  useTestStorageConnectionMutation,
  EmailSettings,
  StorageSettings,
} from '@/store/api/adminApi';
import {
  useGetAdminPaymentSettingsQuery,
  useUpdateAdminPaymentSettingsMutation,
  useTestPaymentGatewayMutation,
} from '@/store/api/paymentApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Settings,
  Globe,
  Mail,
  Cloud,
  LifeBuoy,
  Save,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Sliders,
  Share2,
  FileText,
  MessageSquare,
  Zap,
  Server,
  Key,
  ShieldCheck,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info,
  Database,
  UploadCloud,
  Check,
  FolderOpen,
  CreditCard,
  Copy,
  Radio,
  Receipt,
} from 'lucide-react';

const SMTP_PRESETS = [
  {
    name: 'Gmail / Google Workspace',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    note: 'Requires Google App Password with 2FA enabled.',
  },
  {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    user: 'apikey',
    note: 'Username is always "apikey". Password is your SendGrid API key.',
  },
  {
    name: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    note: 'Use your domain SMTP login and password from Mailgun console.',
  },
  {
    name: 'Amazon SES',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    note: 'Use your IAM SMTP credentials and verified domain.',
  },
  {
    name: 'Brevo (Sendinblue)',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    note: 'Use your Brevo account email and SMTP key.',
  },
];

function AdminSettingsContent() {
  const { user } = useSelector((state: RootState) => state.auth);
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedTab = searchParams.get('tab');
  const [mainTab, setMainTab] = useState<'cms' | 'email' | 'storage' | 'payment'>(
    requestedTab === 'email'
      ? 'email'
      : requestedTab === 'storage'
      ? 'storage'
      : requestedTab === 'payment'
      ? 'payment'
      : 'cms'
  );

  useEffect(() => {
    if (requestedTab === 'email') {
      setMainTab('email');
    } else if (requestedTab === 'storage') {
      setMainTab('storage');
    } else if (requestedTab === 'payment') {
      setMainTab('payment');
    } else if (requestedTab === 'cms') {
      setMainTab('cms');
    }
  }, [requestedTab]);

  const handleTabChange = (tab: 'cms' | 'email' | 'storage' | 'payment') => {
    setMainTab(tab);
    router.push(`/admin/settings?tab=${tab}`, { scroll: false });
  };

  const [cmsTab, setCmsTab] = useState<'hero' | 'announcement' | 'company' | 'social' | 'testimonials' | 'why'>('hero');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);
  const [storageSaveSuccess, setStorageSaveSuccess] = useState(false);

  // Show/Hide password toggles
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showAwsSecret, setShowAwsSecret] = useState(false);
  const [showDoSecret, setShowDoSecret] = useState(false);
  const [showCloudinarySecret, setShowCloudinarySecret] = useState(false);
  const [showPCloudToken, setShowPCloudToken] = useState(false);

  // Test email state
  const [testEmailRecipient, setTestEmailRecipient] = useState(user?.email || 'admin@fin2u.net');
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Test storage state
  const [testStorageResult, setTestStorageResult] = useState<{ success: boolean; message: string; provider?: string } | null>(null);

  // Payment Settings Queries & State
  const {
    data: paymentSettingsData,
    isLoading: isLoadingPaymentSettings,
    refetch: refetchPaymentSettings,
    isFetching: isFetchingPaymentSettings,
  } = useGetAdminPaymentSettingsQuery(undefined, { skip: user?.role !== 'admin' });

  const [updatePaymentSettings, { isLoading: isSavingPaymentSettings }] = useUpdateAdminPaymentSettingsMutation();
  const [testPaymentGateway, { isLoading: isTestingPaymentGateway }] = useTestPaymentGatewayMutation();

  const [paymentActiveGateway, setPaymentActiveGateway] = useState('stripe');
  const [paymentCurrency, setPaymentCurrency] = useState('MYR');
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [stripeDescriptor, setStripeDescriptor] = useState('');
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhookSecret, setShowStripeWebhookSecret] = useState(false);

  const [copiedPaymentWebhook, setCopiedPaymentWebhook] = useState(false);
  const [paymentTestResult, setPaymentTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (paymentSettingsData) {
      setPaymentActiveGateway(paymentSettingsData.activeGateway || 'stripe');
      setPaymentCurrency(paymentSettingsData.currency || 'MYR');

      const stripeConfig = paymentSettingsData.gateways?.find((g) => g.name === 'stripe')?.config || {};
      setStripeMode(stripeConfig.mode || 'test');
      setStripePublishableKey(stripeConfig.publishableKey || '');
      setStripeSecretKey(stripeConfig.secretKey || '');
      setStripeWebhookSecret(stripeConfig.webhookSecret || '');
      setStripeDescriptor(stripeConfig.statementDescriptor || '');
    }
  }, [paymentSettingsData]);

  const handleCopyPaymentWebhook = () => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin.replace(':3000', ':5000');
    const webhookUrl = `${origin}/api/payments/webhook/stripe`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedPaymentWebhook(true);
    setTimeout(() => setCopiedPaymentWebhook(false), 2500);
  };

  const handleTestStripeConnection = async () => {
    setPaymentTestResult(null);
    setPaymentErrorMessage(null);
    try {
      const res = await testPaymentGateway({
        gateway: 'stripe',
        config: {
          publishableKey: stripePublishableKey,
          secretKey: stripeSecretKey,
          webhookSecret: stripeWebhookSecret,
          mode: stripeMode,
        },
      }).unwrap();
      setPaymentTestResult(res);
    } catch (err: any) {
      setPaymentTestResult({
        success: false,
        message: err?.data?.message || 'Stripe connection test failed',
      });
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaveSuccess(false);
    setPaymentErrorMessage(null);
    try {
      await updatePaymentSettings({
        activeGateway: paymentActiveGateway,
        currency: paymentCurrency,
        gateways: {
          stripe: {
            mode: stripeMode,
            publishableKey: stripePublishableKey,
            secretKey: stripeSecretKey,
            webhookSecret: stripeWebhookSecret,
            statementDescriptor: stripeDescriptor,
          },
        },
      }).unwrap();
      setPaymentSaveSuccess(true);
      setTimeout(() => setPaymentSaveSuccess(false), 3000);
      refetchPaymentSettings();
    } catch (err: any) {
      setPaymentErrorMessage(err?.data?.message || 'Failed to save payment gateway settings');
    }
  };

  // CMS Queries
  const {
    data: websiteSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
    isFetching: isFetchingSettings,
  } = useGetWebsiteSettingsQuery(undefined, { skip: user?.role !== 'admin' });

  const [updateWebsiteSettings, { isLoading: isSavingSettings }] = useUpdateWebsiteSettingsMutation();

  // Email Settings Queries
  const {
    data: emailSettingsData,
    isLoading: isLoadingEmailSettings,
    refetch: refetchEmailSettings,
    isFetching: isFetchingEmailSettings,
  } = useGetEmailSettingsQuery(undefined, { skip: user?.role !== 'admin' });

  const [updateEmailSettings, { isLoading: isSavingEmailSettings }] = useUpdateEmailSettingsMutation();
  const [sendTestEmail, { isLoading: isSendingTestEmail }] = useSendTestEmailMutation();

  // Storage Settings Queries
  const {
    data: storageSettingsData,
    isLoading: isLoadingStorageSettings,
    refetch: refetchStorageSettings,
    isFetching: isFetchingStorageSettings,
  } = useGetStorageSettingsQuery(undefined, { skip: user?.role !== 'admin' });

  const [updateStorageSettings, { isLoading: isSavingStorageSettings }] = useUpdateStorageSettingsMutation();
  const [testStorageConnection, { isLoading: isTestingStorage }] = useTestStorageConnectionMutation();

  // CMS Form state
  const [cmsForm, setCmsForm] = useState<any>(null);

  // Email Form state
  const [emailForm, setEmailForm] = useState<EmailSettings>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: '',
    },
    fromName: 'Fin2u Academy',
    fromEmail: 'support@fin2u.net',
    replyTo: 'support@fin2u.net',
    isEnabled: true,
  });

  // Storage Form state
  const [storageForm, setStorageForm] = useState<StorageSettings>({
    activeProvider: 'aws',
    aws: {
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
      region: 'us-east-1',
      endpoint: '',
      customDomain: '',
      isPublic: true,
    },
    digitalocean: {
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
      region: 'nyc3',
      endpoint: '',
      customDomain: '',
      useCdn: true,
      isPublic: true,
    },
    cloudinary: {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      folder: 'fin2u-lms',
    },
    pcloud: {
      accessToken: '',
      location: 'us',
      folderId: '0',
      isPublic: true,
    },
    maxFileSizeMb: 50,
    allowedMimeTypes: [],
  });

  useEffect(() => {
    if (websiteSettings && !cmsForm) {
      setCmsForm(JSON.parse(JSON.stringify(websiteSettings)));
    }
  }, [websiteSettings]);

  useEffect(() => {
    if (emailSettingsData) {
      setEmailForm({
        ...emailSettingsData,
        auth: {
          user: emailSettingsData.auth?.user || '',
          pass: emailSettingsData.auth?.pass || '',
        },
      });
    }
  }, [emailSettingsData]);

  useEffect(() => {
    if (storageSettingsData) {
      setStorageForm({
        ...storageSettingsData,
        activeProvider: storageSettingsData.activeProvider || 'aws',
        aws: {
          ...storageSettingsData.aws,
          accessKeyId: storageSettingsData.aws?.accessKeyId || '',
          secretAccessKey: storageSettingsData.aws?.secretAccessKey || '',
          bucket: storageSettingsData.aws?.bucket || '',
          region: storageSettingsData.aws?.region || 'us-east-1',
          endpoint: storageSettingsData.aws?.endpoint || '',
          customDomain: storageSettingsData.aws?.customDomain || '',
          isPublic: storageSettingsData.aws?.isPublic ?? true,
        },
        digitalocean: {
          ...storageSettingsData.digitalocean,
          accessKeyId: storageSettingsData.digitalocean?.accessKeyId || '',
          secretAccessKey: storageSettingsData.digitalocean?.secretAccessKey || '',
          bucket: storageSettingsData.digitalocean?.bucket || '',
          region: storageSettingsData.digitalocean?.region || 'nyc3',
          endpoint: storageSettingsData.digitalocean?.endpoint || '',
          customDomain: storageSettingsData.digitalocean?.customDomain || '',
          useCdn: storageSettingsData.digitalocean?.useCdn ?? true,
          isPublic: storageSettingsData.digitalocean?.isPublic ?? true,
        },
        cloudinary: {
          ...storageSettingsData.cloudinary,
          cloudName: storageSettingsData.cloudinary?.cloudName || '',
          apiKey: storageSettingsData.cloudinary?.apiKey || '',
          apiSecret: storageSettingsData.cloudinary?.apiSecret || '',
          folder: storageSettingsData.cloudinary?.folder || 'fin2u-lms',
        },
        pcloud: {
          ...storageSettingsData.pcloud,
          accessToken: storageSettingsData.pcloud?.accessToken || '',
          location: storageSettingsData.pcloud?.location || 'us',
          folderId: storageSettingsData.pcloud?.folderId || '0',
          isPublic: storageSettingsData.pcloud?.isPublic ?? true,
        },
      });
    }
  }, [storageSettingsData]);

  useEffect(() => {
    if (user?.email && !testEmailRecipient) {
      setTestEmailRecipient(user.email);
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsForm) return;
    try {
      await updateWebsiteSettings(cmsForm).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refetchSettings();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save website settings');
    }
  };

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmailSettings(emailForm).unwrap();
      setEmailSaveSuccess(true);
      setTimeout(() => setEmailSaveSuccess(false), 3000);
      refetchEmailSettings();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save email settings');
    }
  };

  const handleApplyPreset = (preset: typeof SMTP_PRESETS[0]) => {
    setEmailForm((prev) => ({
      ...prev,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      auth: {
        ...prev.auth,
        user: preset.user || prev.auth.user,
      },
    }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) {
      alert('Please enter a recipient email address for testing.');
      return;
    }
    setTestEmailResult(null);
    try {
      const res = await sendTestEmail({
        email: testEmailRecipient.trim(),
        customConfig: emailForm,
      }).unwrap();

      setTestEmailResult({
        success: true,
        message: res.message || `Test email dispatched successfully to ${testEmailRecipient}! Check your inbox.`,
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err?.data?.message || err?.message || 'Failed to send test email. Please check your SMTP settings.',
      });
    }
  };

  const handleSaveStorageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStorageSettings(storageForm).unwrap();
      setStorageSaveSuccess(true);
      setTimeout(() => setStorageSaveSuccess(false), 3000);
      refetchStorageSettings();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save storage settings');
    }
  };

  const handleTestStorageConnection = async () => {
    setTestStorageResult(null);
    try {
      const activeType = storageForm.activeProvider;
      const customConfig = (storageForm as any)[activeType];
      const res = await testStorageConnection({
        provider: activeType,
        customConfig,
      }).unwrap();

      setTestStorageResult({
        success: true,
        message: res.message || `Successfully connected to ${activeType.toUpperCase()}!`,
        provider: activeType,
      });
    } catch (err: any) {
      setTestStorageResult({
        success: false,
        message:
          err?.data?.message ||
          err?.message ||
          'Connection test failed. Please verify your credentials and network connectivity.',
        provider: storageForm.activeProvider,
      });
    }
  };

  return (
    <>
      <AdminHeader
        title="Platform & System Settings"
        icon={Settings}
        actions={
          <button
            onClick={() => {
              if (mainTab === 'cms') refetchSettings();
              else if (mainTab === 'email') refetchEmailSettings();
              else if (mainTab === 'storage') refetchStorageSettings();
              else if (mainTab === 'payment') refetchPaymentSettings();
            }}
            disabled={isFetchingSettings || isFetchingEmailSettings || isFetchingStorageSettings || isFetchingPaymentSettings}
            className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingPaymentSettings || isFetchingSettings || isFetchingEmailSettings || isFetchingStorageSettings ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              {mainTab === 'cms' ? (
                <Globe className="w-6 h-6" />
              ) : mainTab === 'email' ? (
                <Mail className="w-6 h-6" />
              ) : mainTab === 'storage' ? (
                <Cloud className="w-6 h-6" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">
                {mainTab === 'cms'
                  ? 'Landing Page CMS & Content'
                  : mainTab === 'email'
                  ? 'Email Server & SMTP Configuration'
                  : mainTab === 'storage'
                  ? 'Cloud Storage & File Upload Provider'
                  : 'Payment Gateways & Checkout Engine'}
              </h2>
              <p className="text-xs text-gray-300">
                {mainTab === 'cms'
                  ? 'Customize homepage banners, announcements, testimonials, company info, and branding.'
                  : mainTab === 'email'
                  ? 'Configure outbound email service for user registrations, password resets, and notifications.'
                  : mainTab === 'storage'
                  ? 'Easily switch between AWS S3, DigitalOcean Spaces, Cloudinary, and pCloud for all platform media & files.'
                  : 'Configure Stripe one-time payments, secret credentials, encrypted storage, and webhook dispatching.'}
              </p>
            </div>
          </div>
          {(saveSuccess || emailSaveSuccess || storageSaveSuccess || paymentSaveSuccess) && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved Live!</span>
            </div>
          )}
        </div>

        {/* Top-level Navigation: CMS vs Email vs Storage vs Payment Configuration */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-200/70 rounded-2xl w-fit flex-wrap">
          <button
            onClick={() => handleTabChange('cms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'cms'
                ? 'bg-[#041c53] text-white shadow-md'
                : 'text-gray-600 hover:text-[#041c53] hover:bg-white/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Landing Page CMS</span>
          </button>
          <button
            onClick={() => handleTabChange('email')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'email'
                ? 'bg-[#041c53] text-white shadow-md'
                : 'text-gray-600 hover:text-[#041c53] hover:bg-white/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & SMTP Settings</span>
          </button>
          <button
            onClick={() => handleTabChange('storage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'storage'
                ? 'bg-[#041c53] text-white shadow-md'
                : 'text-gray-600 hover:text-[#041c53] hover:bg-white/50'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Storage & Cloud Uploads</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff447e]/20 text-[#ff447e] font-extrabold uppercase">
              {storageForm.activeProvider}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('payment')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'payment'
                ? 'bg-[#041c53] text-white shadow-md'
                : 'text-gray-600 hover:text-[#041c53] hover:bg-white/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Gateways</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
              {paymentActiveGateway || 'Stripe'}
            </span>
          </button>
          <Link
            href="/admin/support"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#041c53] bg-pink-50 border border-pink-200 hover:bg-pink-100 transition-all ml-auto"
          >
            <LifeBuoy className="w-4 h-4 text-[#ff447e]" />
            <span>Support & Helpdesk Hub</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ff447e] text-white font-black">
              →
            </span>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EMAIL & SMTP SETTINGS TAB CONTENT */}
        {/* ------------------------------------------------------------- */}
        {mainTab === 'email' && (
          <div className="space-y-6">
            {isLoadingEmailSettings ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading Email Server configuration...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Main SMTP Configuration Form */}
                <form
                  onSubmit={handleSaveEmailSettings}
                  className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-5 h-5 text-[#041c53]" />
                      <h3 className="text-base font-black text-[#041c53]">SMTP Mail Server Details</h3>
                    </div>

                    {/* Enable/Disable Master Switch */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <span className="text-xs font-bold text-gray-600">
                        {emailForm.isEnabled ? 'Outbound Active' : 'Email Disabled'}
                      </span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailForm.isEnabled}
                          onChange={(e) => setEmailForm({ ...emailForm, isEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                      </div>
                    </label>
                  </div>

                  {/* Provider Presets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Quick Provider Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SMTP_PRESETS.map((preset) => {
                        const isMatch = emailForm.host === preset.host;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isMatch
                                ? 'bg-[#041c53] text-white border-[#041c53] shadow-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Host and Port */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        SMTP Host Server <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={emailForm.host || ''}
                        onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                        placeholder="smtp.gmail.com or smtp.mailgun.org"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Port <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={emailForm.port || 587}
                        onChange={(e) => setEmailForm({ ...emailForm, port: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                      />
                    </div>
                  </div>

                  {/* Encryption Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Encryption & Security Protocol
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="secureRadio"
                          checked={!emailForm.secure}
                          onChange={() => setEmailForm({ ...emailForm, secure: false })}
                          className="text-[#ff447e] focus:ring-[#ff447e]"
                        />
                        <span>STARTTLS / TLS (Default for Port 587 & 25)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="secureRadio"
                          checked={emailForm.secure}
                          onChange={() => setEmailForm({ ...emailForm, secure: true })}
                          className="text-[#ff447e] focus:ring-[#ff447e]"
                        />
                        <span>SSL / Direct TLS (Port 465)</span>
                      </label>
                    </div>
                  </div>

                  {/* Auth Credentials */}
                  <div className="pt-2 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#041c53]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                        Authentication Credentials
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Username / Account Email
                        </label>
                        <input
                          type="text"
                          value={emailForm.auth?.user || ''}
                          onChange={(e) =>
                            setEmailForm({
                              ...emailForm,
                              auth: { ...emailForm.auth, user: e.target.value },
                            })
                          }
                          placeholder="support@fin2u.net or apikey"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Password / App Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            value={emailForm.auth?.pass || ''}
                            onChange={(e) =>
                              setEmailForm({
                                ...emailForm,
                                auth: { ...emailForm.auth, pass: e.target.value },
                              })
                            }
                            placeholder="••••••••••••••••"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sender Profile */}
                  <div className="pt-2 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#041c53]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                        Sender Identity & Headers
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          From Display Name
                        </label>
                        <input
                          type="text"
                          value={emailForm.fromName || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                          placeholder="Fin2u Academy"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          From Email Address
                        </label>
                        <input
                          type="email"
                          value={emailForm.fromEmail || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                          placeholder="noreply@fin2u.net"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Reply-To Address
                        </label>
                        <input
                          type="email"
                          value={emailForm.replyTo || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, replyTo: e.target.value })}
                          placeholder="support@fin2u.net"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSavingEmailSettings}
                      className="btn btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingEmailSettings ? 'Saving Configuration...' : 'Save Email Configuration'}</span>
                    </button>
                  </div>
                </form>

                {/* Right 1 Col: Test Email Sender Panel & Diagnostic Guide */}
                <div className="space-y-6">
                  {/* Test Email Card */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                      <Send className="w-4 h-4 text-[#ff447e]" />
                      <h3 className="text-sm font-black text-[#041c53]">Send Test Email</h3>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      Verify your SMTP connection and authentication settings by sending a live test email.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={isSendingTestEmail}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSendingTestEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                          <span>Connecting & Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Test Email</span>
                        </>
                      )}
                    </button>

                    {/* Result alert */}
                    {testEmailResult && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                          testEmailResult.success
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {testEmailResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="leading-relaxed">
                          <p className="font-bold">
                            {testEmailResult.success ? 'SMTP Connection Successful' : 'SMTP Error Encountered'}
                          </p>
                          <p className="text-[11px] mt-0.5">{testEmailResult.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Configuration Help Card */}
                  <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#041c53]">
                      <Info className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Troubleshooting Tips</h4>
                    </div>
                    <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>
                        <strong>Gmail:</strong> Use an <em>App Password</em> generated under Google Account &gt; Security &gt; 2-Step Verification &gt; App passwords.
                      </li>
                      <li>
                        <strong>SendGrid:</strong> Username is always literal <code className="bg-white px-1 py-0.5 rounded border border-gray-200">apikey</code> and password is your API token.
                      </li>
                      <li>
                        <strong>Firewalls:</strong> Port 587 is recommended over Port 25, which is frequently blocked by hosting providers.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STORAGE & CLOUD UPLOADS TAB CONTENT */}
        {/* ------------------------------------------------------------- */}
        {mainTab === 'storage' && (
          <div className="space-y-6">
            {isLoadingStorageSettings ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading Storage Provider configuration...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Main Storage Configuration Form */}
                <form
                  onSubmit={handleSaveStorageSettings}
                  className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <Cloud className="w-5 h-5 text-[#041c53]" />
                      <div>
                        <h3 className="text-base font-black text-[#041c53]">Active Storage Provider</h3>
                        <p className="text-[11px] text-gray-400">Select which cloud service handles file uploads across the system.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="uppercase">{storageForm.activeProvider}</span>
                    </div>
                  </div>

                  {/* Provider Selector Cards */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                      Choose Active Engine
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* AWS S3 Card */}
                      <div
                        onClick={() => setStorageForm({ ...storageForm, activeProvider: 'aws' })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                          storageForm.activeProvider === 'aws'
                            ? 'border-[#041c53] bg-[#041c53]/5 shadow-sm ring-1 ring-[#041c53]/15'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  storageForm.activeProvider === 'aws'
                                    ? 'bg-[#041c53] text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}
                              >
                                <Database className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-gray-900 truncate">Amazon AWS S3</h4>
                            </div>
                            {storageForm.activeProvider === 'aws' ? (
                              <span className="shrink-0 text-[10px] bg-[#041c53] text-white px-2 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Scalable object storage for AWS S3, Cloudflare R2, MinIO, Wasabi & custom endpoints.
                          </p>
                        </div>
                      </div>

                      {/* DigitalOcean Spaces Card */}
                      <div
                        onClick={() => setStorageForm({ ...storageForm, activeProvider: 'digitalocean' })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                          storageForm.activeProvider === 'digitalocean'
                            ? 'border-[#0069ff] bg-[#0069ff]/5 shadow-sm ring-1 ring-[#0069ff]/15'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  storageForm.activeProvider === 'digitalocean'
                                    ? 'bg-[#0069ff] text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}
                              >
                                <Server className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-gray-900 truncate">DigitalOcean Spaces</h4>
                            </div>
                            {storageForm.activeProvider === 'digitalocean' ? (
                              <span className="shrink-0 text-[10px] bg-[#0069ff] text-white px-2 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            S3-compatible Spaces object storage with built-in CDN edge acceleration worldwide.
                          </p>
                        </div>
                      </div>

                      {/* Cloudinary Card */}
                      <div
                        onClick={() => setStorageForm({ ...storageForm, activeProvider: 'cloudinary' })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                          storageForm.activeProvider === 'cloudinary'
                            ? 'border-[#ff447e] bg-[#ff447e]/5 shadow-sm ring-1 ring-[#ff447e]/15'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  storageForm.activeProvider === 'cloudinary'
                                    ? 'bg-[#ff447e] text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}
                              >
                                <UploadCloud className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-gray-900 truncate">Cloudinary CDN</h4>
                            </div>
                            {storageForm.activeProvider === 'cloudinary' ? (
                              <span className="shrink-0 text-[10px] bg-[#ff447e] text-white px-2 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Optimized media delivery, dynamic on-the-fly transformations & video streaming.
                          </p>
                        </div>
                      </div>

                      {/* pCloud Card */}
                      <div
                        onClick={() => setStorageForm({ ...storageForm, activeProvider: 'pcloud' })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                          storageForm.activeProvider === 'pcloud'
                            ? 'border-indigo-600 bg-indigo-600/5 shadow-sm ring-1 ring-indigo-600/15'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  storageForm.activeProvider === 'pcloud'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}
                              >
                                <FolderOpen className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-gray-900 truncate">pCloud Storage</h4>
                            </div>
                            {storageForm.activeProvider === 'pcloud' ? (
                              <span className="shrink-0 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Direct cloud drive storage with public links across US and EU data centers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------- */}
                  {/* AWS S3 FORM */}
                  {/* ------------------------------------------- */}
                  {storageForm.activeProvider === 'aws' && (
                    <div className="pt-3 border-t border-gray-100 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#041c53]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                          AWS S3 Credentials & Bucket Details
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Access Key ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'aws'}
                            value={storageForm.aws.accessKeyId || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                aws: { ...storageForm.aws, accessKeyId: e.target.value },
                              })
                            }
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Secret Access Key <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showAwsSecret ? 'text' : 'password'}
                              required={storageForm.activeProvider === 'aws'}
                              value={storageForm.aws.secretAccessKey || ''}
                              onChange={(e) =>
                                setStorageForm({
                                  ...storageForm,
                                  aws: { ...storageForm.aws, secretAccessKey: e.target.value },
                                })
                              }
                              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                              className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAwsSecret(!showAwsSecret)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showAwsSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Bucket Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'aws'}
                            value={storageForm.aws.bucket || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                aws: { ...storageForm.aws, bucket: e.target.value },
                              })
                            }
                            placeholder="fin2u-lms-media"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Region <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'aws'}
                            value={storageForm.aws.region || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                aws: { ...storageForm.aws, region: e.target.value },
                              })
                            }
                            placeholder="us-east-1 or ap-southeast-1"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Custom Endpoint (Optional)
                          </label>
                          <input
                            type="text"
                            value={storageForm.aws.endpoint || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                aws: { ...storageForm.aws, endpoint: e.target.value },
                              })
                            }
                            placeholder="https://<account-id>.r2.cloudflarestorage.com"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Leave empty for official AWS S3. Use for Cloudflare R2, MinIO, or Wasabi.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Custom CDN / Domain URL Prefix (Optional)
                          </label>
                          <input
                            type="text"
                            value={storageForm.aws.customDomain || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                aws: { ...storageForm.aws, customDomain: e.target.value },
                              })
                            }
                            placeholder="https://cdn.fin2u.net"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------- */}
                  {/* DIGITALOCEAN SPACES FORM */}
                  {/* ------------------------------------------- */}
                  {storageForm.activeProvider === 'digitalocean' && (
                    <div className="pt-3 border-t border-gray-100 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#0069ff]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0069ff]">
                          DigitalOcean Spaces Credentials & Configuration
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Spaces Endpoint URL <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'digitalocean'}
                            value={storageForm.digitalocean.endpoint || ''}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              let detectedRegion = storageForm.digitalocean.region || 'sgp1';
                              const match = val.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)?([a-z0-9]+)\.digitaloceanspaces\.com/i);
                              if (match && match[1]) {
                                detectedRegion = match[1].toLowerCase();
                              }

                              setStorageForm({
                                ...storageForm,
                                digitalocean: {
                                  ...storageForm.digitalocean,
                                  endpoint: val,
                                  region: detectedRegion,
                                },
                              });
                            }}
                            placeholder="https://inleadsit.sgp1.digitaloceanspaces.com"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 focus:border-[#0069ff]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            Direct Origin URL from your DigitalOcean Spaces dashboard (e.g. <code className="text-slate-600 font-mono">https://inleadsit.sgp1.digitaloceanspaces.com</code>).
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Bucket / Folder Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={storageForm.digitalocean.bucket || ''}
                            onChange={(e) => {
                              const cleanBucket = e.target.value.replace(/_/g, '-').trim();
                              setStorageForm({
                                ...storageForm,
                                digitalocean: { ...storageForm.digitalocean, bucket: cleanBucket },
                              });
                            }}
                            placeholder="fin2u-academy"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 focus:border-[#0069ff]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            The folder inside your Space (e.g. <code className="text-slate-600 font-mono">fin2u-academy</code>). Leave blank to store at root.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Custom CDN Domain (Optional)
                          </label>
                          <input
                            type="text"
                            value={storageForm.digitalocean.customDomain || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                digitalocean: { ...storageForm.digitalocean, customDomain: e.target.value },
                              })
                            }
                            placeholder="https://cdn.fin2u.net"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 focus:border-[#0069ff]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            Custom SSL domain pointing to your Space/CDN (e.g. <code className="text-slate-600 font-mono">https://cdn.fin2u.net</code>).
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Spaces Access Key <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'digitalocean'}
                            value={storageForm.digitalocean.accessKeyId || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                digitalocean: { ...storageForm.digitalocean, accessKeyId: e.target.value },
                              })
                            }
                            placeholder="DO00EXAMPLEKEY"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 focus:border-[#0069ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Spaces Secret Key <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showDoSecret ? 'text' : 'password'}
                              required={storageForm.activeProvider === 'digitalocean'}
                              value={storageForm.digitalocean.secretAccessKey || ''}
                              onChange={(e) =>
                                setStorageForm({
                                  ...storageForm,
                                  digitalocean: { ...storageForm.digitalocean, secretAccessKey: e.target.value },
                                })
                              }
                              placeholder="••••••••••••••••••••••••••••••••"
                              className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 focus:border-[#0069ff]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowDoSecret(!showDoSecret)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showDoSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex items-center pt-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={storageForm.digitalocean.useCdn}
                              onChange={(e) =>
                                setStorageForm({
                                  ...storageForm,
                                  digitalocean: { ...storageForm.digitalocean, useCdn: e.target.checked },
                                })
                              }
                              className="w-4 h-4 rounded text-[#0069ff] focus:ring-[#0069ff]"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-800">Use Built-in Spaces CDN</span>
                              <p className="text-[10px] text-gray-400">Uses <code className="text-slate-600 font-mono">.cdn.digitaloceanspaces.com</code> for faster global loading.</p>
                            </div>
                          </label>
                        </div>

                        {/* Live Resolution Preview */}
                        <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-blue-800">
                            <Globe className="w-3.5 h-3.5 text-[#0069ff]" />
                            <span>Live Storage URL Preview</span>
                          </div>
                          {(() => {
                            const endpoint = storageForm.digitalocean.endpoint || 'https://inleadsit.sgp1.digitaloceanspaces.com';
                            let spaceName = 'inleadsit';
                            let region = 'sgp1';
                            let rootFolder = storageForm.digitalocean.bucket || '';

                            try {
                              const hostname = new URL(endpoint.startsWith('http') ? endpoint : `https://${endpoint}`).hostname;
                              const parts = hostname.replace('.digitaloceanspaces.com', '').split('.');
                              if (parts.length > 1 && parts[0]) {
                                spaceName = parts[0];
                              }
                              const match = hostname.match(/(?:^|.*\.)([a-z0-9]+)\.digitaloceanspaces\.com$/);
                              if (match && match[1]) region = match[1];
                            } catch {}

                            const pathSuffix = rootFolder ? `${rootFolder}/<folder>/<file>` : '<folder>/<file>';

                            return (
                              <>
                                <div className="text-[11px] font-mono text-blue-700 break-all">
                                  Space Name:{' '}
                                  <span className="font-bold text-blue-950">{spaceName}</span>
                                  {rootFolder && (
                                    <span className="ml-2 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                                      Folder Prefix: {rootFolder}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-blue-700 break-all">
                                  Public File / CDN URL:{' '}
                                  <span className="font-bold text-blue-950">
                                    {storageForm.digitalocean.customDomain
                                      ? `${storageForm.digitalocean.customDomain.replace(/\/+$/, '')}/${pathSuffix}`
                                      : storageForm.digitalocean.useCdn
                                      ? `https://${spaceName}.${region}.cdn.digitaloceanspaces.com/${pathSuffix}`
                                      : `https://${spaceName}.${region}.digitaloceanspaces.com/${pathSuffix}`}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------- */}
                  {/* CLOUDINARY FORM */}
                  {/* ------------------------------------------- */}
                  {storageForm.activeProvider === 'cloudinary' && (
                    <div className="pt-3 border-t border-gray-100 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#041c53]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                          Cloudinary API Configuration
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Cloud Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'cloudinary'}
                            value={storageForm.cloudinary.cloudName || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                cloudinary: { ...storageForm.cloudinary, cloudName: e.target.value },
                              })
                            }
                            placeholder="my-company-cloud"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            API Key <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={storageForm.activeProvider === 'cloudinary'}
                            value={storageForm.cloudinary.apiKey || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                cloudinary: { ...storageForm.cloudinary, apiKey: e.target.value },
                              })
                            }
                            placeholder="123456789012345"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            API Secret <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showCloudinarySecret ? 'text' : 'password'}
                              required={storageForm.activeProvider === 'cloudinary'}
                              value={storageForm.cloudinary.apiSecret || ''}
                              onChange={(e) =>
                                setStorageForm({
                                  ...storageForm,
                                  cloudinary: { ...storageForm.cloudinary, apiSecret: e.target.value },
                                })
                              }
                              placeholder="••••••••••••••••"
                              className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCloudinarySecret(!showCloudinarySecret)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showCloudinarySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Upload Folder
                          </label>
                          <input
                            type="text"
                            value={storageForm.cloudinary.folder || ''}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                cloudinary: { ...storageForm.cloudinary, folder: e.target.value },
                              })
                            }
                            placeholder="fin2u-lms"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------- */}
                  {/* PCLOUD FORM */}
                  {/* ------------------------------------------- */}
                  {storageForm.activeProvider === 'pcloud' && (
                    <div className="pt-3 border-t border-gray-100 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#041c53]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                          pCloud API & Access Token Details
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            pCloud OAuth / Access Token <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPCloudToken ? 'text' : 'password'}
                              required={storageForm.activeProvider === 'pcloud'}
                              value={storageForm.pcloud.accessToken || ''}
                              onChange={(e) =>
                                setStorageForm({
                                  ...storageForm,
                                  pcloud: { ...storageForm.pcloud, accessToken: e.target.value },
                                })
                              }
                              placeholder="Enter your pCloud OAuth access token..."
                              className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPCloudToken(!showPCloudToken)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPCloudToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Data Center Location <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={storageForm.pcloud.location || 'us'}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                pcloud: { ...storageForm.pcloud, location: e.target.value as any },
                              })
                            }
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          >
                            <option value="us">United States (api.pcloud.com)</option>
                            <option value="eu">European Union (eapi.pcloud.com)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Target Folder ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={storageForm.pcloud.folderId || '0'}
                            onChange={(e) =>
                              setStorageForm({
                                ...storageForm,
                                pcloud: { ...storageForm.pcloud, folderId: e.target.value },
                              })
                            }
                            placeholder="0 (Root folder)"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Global Upload Limit Settings */}
                  <div className="pt-3 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#041c53]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                        File Size & Security Limits
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Maximum File Upload Size (MB)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={storageForm.maxFileSizeMb || 50}
                          onChange={(e) =>
                            setStorageForm({
                              ...storageForm,
                              maxFileSizeMb: Number(e.target.value),
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSavingStorageSettings}
                      className="btn btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingStorageSettings ? 'Saving Configuration...' : 'Save Storage Configuration'}</span>
                    </button>
                  </div>
                </form>

                {/* Right 1 Col: Test Storage Connection Diagnostic Panel */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                      <Zap className="w-4 h-4 text-[#ff447e]" />
                      <h3 className="text-sm font-black text-[#041c53]">Test Connection Diagnostic</h3>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      Ping your active storage provider (<strong>{storageForm.activeProvider.toUpperCase()}</strong>) to verify API keys, write permissions, and connectivity.
                    </p>

                    <button
                      type="button"
                      onClick={handleTestStorageConnection}
                      disabled={isTestingStorage}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isTestingStorage ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                          <span>Pinging & Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Test {storageForm.activeProvider.toUpperCase()} Connection</span>
                        </>
                      )}
                    </button>

                    {/* Result alert */}
                    {testStorageResult && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                          testStorageResult.success
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {testStorageResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="leading-relaxed">
                          <p className="font-bold">
                            {testStorageResult.success ? 'Storage Connection Verified' : 'Connection Error'}
                          </p>
                          <p className="text-[11px] mt-0.5">{testStorageResult.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Provider Setup Quick Guide */}
                  <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#041c53]">
                      <Info className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Provider Setup Guide</h4>
                    </div>
                    <ul className="text-[11px] text-gray-600 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>
                        <strong>AWS S3:</strong> Create an IAM User with <code className="bg-white px-1 py-0.5 rounded border border-gray-200">AmazonS3FullAccess</code> policy and generate an Access Key.
                      </li>
                      <li>
                        <strong>DigitalOcean Spaces:</strong> Generate Spaces API Keys in your DO Control Panel and configure region & CDN endpoints.
                      </li>
                      <li>
                        <strong>Cloudinary:</strong> Go to Cloudinary Dashboard &gt; Settings &gt; Access Keys to copy Cloud Name, API Key, and API Secret.
                      </li>
                      <li>
                        <strong>pCloud:</strong> Visit pCloud My Apps / OAuth &gt; Create App and obtain an Access Token.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PAYMENT GATEWAY SETTINGS TAB CONTENT */}
        {/* ------------------------------------------------------------- */}
        {mainTab === 'payment' && (
          <div className="space-y-6">
            {isLoadingPaymentSettings ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading Payment Gateway configuration...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Main Payment Gateway Configuration Form */}
                <form
                  onSubmit={handleSavePaymentSettings}
                  className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#041c53]" />
                      <div>
                        <h3 className="text-base font-black text-[#041c53]">Payment Engine & Currency</h3>
                        <p className="text-[11px] text-gray-400">Configure checkout currency, default gateway provider, and API secrets.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="uppercase">{paymentActiveGateway} ({stripeMode.toUpperCase()})</span>
                    </div>
                  </div>

                  {paymentSaveSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Payment gateway settings saved & cryptographic keys updated live!</span>
                    </div>
                  )}

                  {paymentErrorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{paymentErrorMessage}</span>
                    </div>
                  )}

                  {/* General Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Active Gateway Engine
                      </label>
                      <select
                        value={paymentActiveGateway}
                        onChange={(e) => setPaymentActiveGateway(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                      >
                        <option value="stripe">Stripe (PaymentIntents / Elements)</option>
                      </select>
                      <p className="text-[11px] text-gray-400 mt-1">Primary payment provider used for one-time course checkout.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Default Currency (ISO)
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={paymentCurrency}
                        onChange={(e) => setPaymentCurrency(e.target.value.toUpperCase())}
                        placeholder="MYR"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Standard 3-letter currency code (e.g. MYR, USD, SGD).</p>
                    </div>
                  </div>

                  {/* Stripe Configuration Block */}
                  <div className="pt-3 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#041c53]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#041c53]">
                          Stripe Gateway Credentials
                        </h4>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setStripeMode('test')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            stripeMode === 'test'
                              ? 'bg-amber-400 text-slate-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          Test Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => setStripeMode('live')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            stripeMode === 'live'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          Live Mode
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Publishable Key <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={stripePublishableKey}
                            onChange={(e) => setStripePublishableKey(e.target.value)}
                            placeholder="pk_test_51..."
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Secret Key <span className="text-rose-500">*</span> (Encrypted at Rest)
                        </label>
                        <div className="relative">
                          <input
                            type={showStripeSecret ? 'text' : 'password'}
                            required
                            value={stripeSecretKey}
                            onChange={(e) => setStripeSecretKey(e.target.value)}
                            placeholder="sk_test_51..."
                            className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStripeSecret(!showStripeSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Webhook Signing Secret (Encrypted at Rest)
                        </label>
                        <div className="relative">
                          <input
                            type={showStripeWebhookSecret ? 'text' : 'password'}
                            value={stripeWebhookSecret}
                            onChange={(e) => setStripeWebhookSecret(e.target.value)}
                            placeholder="whsec_..."
                            className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStripeWebhookSecret(!showStripeWebhookSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showStripeWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Statement Descriptor Suffix (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={22}
                          value={stripeDescriptor}
                          onChange={(e) => setStripeDescriptor(e.target.value)}
                          placeholder="FIN2U ACADEMY"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Appears on customer bank & credit card statements.</p>
                      </div>
                    </div>
                  </div>

                  {/* Webhook Endpoint Instructions Card */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#041c53] flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-[#ff447e]" />
                        <span>Stripe Webhook Listener URL</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPaymentWebhook}
                        className="text-[11px] font-bold text-[#ff447e] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPaymentWebhook ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-gray-500 leading-relaxed text-[11px]">
                      Register this URL in Stripe Dashboard &rarr; Developers &rarr; Webhooks. Events:{' '}
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono text-[10px]">
                        payment_intent.succeeded
                      </code>
                      ,{' '}
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono text-[10px]">
                        payment_intent.payment_failed
                      </code>
                      ,{' '}
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono text-[10px]">
                        charge.refunded
                      </code>
                      .
                    </p>
                  </div>

                  {/* Test Connection Output */}
                  {paymentTestResult && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        paymentTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {paymentTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{paymentTestResult.message}</span>
                      </div>
                      {paymentTestResult.details && (
                        <div className="pl-6 text-[11px] space-y-0.5">
                          <p>Mode: <span className="font-mono font-bold capitalize">{paymentTestResult.details.mode}</span></p>
                          <p>Webhook Configured: <span className="font-bold">{paymentTestResult.details.webhookConfigured ? 'Yes' : 'No'}</span></p>
                          {paymentTestResult.details.currencies && (
                            <p>Supported Balance Currencies: <span className="font-mono">{paymentTestResult.details.currencies.join(', ')}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleTestStripeConnection}
                      disabled={isTestingPaymentGateway || !stripePublishableKey || !stripeSecretKey}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isTestingPaymentGateway ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#041c53]" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-500" />
                      )}
                      <span>Test Stripe Connection</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingPaymentSettings}
                      className="btn btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingPaymentSettings ? 'Saving Settings...' : 'Save Payment Configuration'}</span>
                    </button>
                  </div>
                </form>

                {/* Right 1 Col: Quick Tips & Info Card */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-[#041c53]">
                      <Info className="w-5 h-5 text-[#ff447e]" />
                      <h4 className="text-sm font-black">Payment Integration Tips</h4>
                    </div>

                    <div className="space-y-3 text-xs text-gray-500 leading-relaxed">
                      <p>
                        <strong className="text-gray-700">Test Mode vs Live Mode:</strong> In Test Mode, use standard Stripe test card numbers (e.g. <code>4242 4242 4242 4242</code>) to verify the checkout flow safely.
                      </p>
                      <p>
                        <strong className="text-gray-700">AES-256 Encryption:</strong> Secret keys and webhook signing secrets are cryptographically encrypted using your backend <code>PAYMENT_ENCRYPTION_KEY</code> before storage.
                      </p>
                      <p>
                        <strong className="text-gray-700">Instant Enrollment:</strong> Upon payment completion, Stripe webhooks trigger automatic learner course enrollment with zero delay.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <Link
                        href="/admin/orders"
                        className="btn btn-outline text-xs py-2.5 w-full flex items-center justify-center gap-2 border-gray-200"
                      >
                        <Receipt className="w-4 h-4 text-[#ff447e]" />
                        <span>View Orders & Revenue</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LANDING PAGE CMS TAB CONTENT */}
        {/* ------------------------------------------------------------- */}
        {mainTab === 'cms' && (
          <div className="space-y-6">
            {/* Sub tab switcher */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar">
              {[
                { id: 'hero', label: 'Hero Banner' },
                { id: 'announcement', label: 'Announcement Bar' },
                { id: 'company', label: 'Company Info' },
                { id: 'social', label: 'Social Channels' },
                { id: 'why', label: 'Why Fin2u' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCmsTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    cmsTab === tab.id ? 'bg-white text-[#041c53] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Container */}
            {isLoadingSettings || !cmsForm ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading CMS configuration...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                {/* TAB: HERO */}
                {cmsTab === 'hero' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider pb-2 border-b border-gray-100">
                      Homepage Hero Banner Configuration
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Badge Tagline</label>
                      <input
                        type="text"
                        value={cmsForm.hero?.badge || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, hero: { ...cmsForm.hero, badge: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Main Headline</label>
                      <textarea
                        rows={2}
                        value={cmsForm.hero?.title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, hero: { ...cmsForm.hero, title: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle</label>
                      <textarea
                        rows={3}
                        value={cmsForm.hero?.subtitle || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, hero: { ...cmsForm.hero, subtitle: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary CTA Button</label>
                        <input
                          type="text"
                          value={cmsForm.hero?.primaryCtaText || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, hero: { ...cmsForm.hero, primaryCtaText: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary CTA Link</label>
                        <input
                          type="text"
                          value={cmsForm.hero?.primaryCtaLink || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, hero: { ...cmsForm.hero, primaryCtaLink: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: ANNOUNCEMENT */}
                {cmsTab === 'announcement' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider pb-2 border-b border-gray-100">
                      Announcement Bar Settings
                    </h3>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmsForm.announcement?.isEnabled || false}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            announcement: { ...cmsForm.announcement, isEnabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-[#ff447e] rounded"
                      />
                      <span className="text-xs font-bold text-gray-800">Display Announcement Bar at top of website</span>
                    </label>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Announcement Message</label>
                      <input
                        type="text"
                        value={cmsForm.announcement?.text || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, announcement: { ...cmsForm.announcement, text: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={cmsForm.announcement?.linkUrl || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, announcement: { ...cmsForm.announcement, linkUrl: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB: COMPANY */}
                {cmsTab === 'company' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider pb-2 border-b border-gray-100">
                      Legal & Official Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Entity Name</label>
                        <input
                          type="text"
                          value={cmsForm.company?.name || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, name: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SSM Registration No.</label>
                        <input
                          type="text"
                          value={cmsForm.company?.regNo || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, regNo: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Physical Address</label>
                      <textarea
                        rows={2}
                        value={cmsForm.company?.address || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, address: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Email</label>
                        <input
                          type="email"
                          value={cmsForm.company?.supportEmail || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, supportEmail: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Phone</label>
                        <input
                          type="text"
                          value={cmsForm.company?.supportPhone || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, supportPhone: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp Hotline</label>
                        <input
                          type="text"
                          value={cmsForm.company?.whatsapp || ''}
                          onChange={(e) => setCmsForm({ ...cmsForm, company: { ...cmsForm.company, whatsapp: e.target.value } })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: SOCIAL */}
                {cmsTab === 'social' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider pb-2 border-b border-gray-100">
                      Social Media Links & Communities
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Facebook</label>
                        <input
                          type="text"
                          value={cmsForm.socialLinks?.facebook || ''}
                          onChange={(e) =>
                            setCmsForm({
                              ...cmsForm,
                              socialLinks: { ...cmsForm.socialLinks, facebook: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instagram</label>
                        <input
                          type="text"
                          value={cmsForm.socialLinks?.instagram || ''}
                          onChange={(e) =>
                            setCmsForm({
                              ...cmsForm,
                              socialLinks: { ...cmsForm.socialLinks, instagram: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={cmsForm.socialLinks?.linkedin || ''}
                          onChange={(e) =>
                            setCmsForm({
                              ...cmsForm,
                              socialLinks: { ...cmsForm.socialLinks, linkedin: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">YouTube</label>
                        <input
                          type="text"
                          value={cmsForm.socialLinks?.youtube || ''}
                          onChange={(e) =>
                            setCmsForm({
                              ...cmsForm,
                              socialLinks: { ...cmsForm.socialLinks, youtube: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: WHY FIN2U */}
                {cmsTab === 'why' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider pb-2 border-b border-gray-100">
                      Value Proposition & Key Highlights
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
                      <input
                        type="text"
                        value={cmsForm.why?.title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, why: { ...cmsForm.why, title: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Description</label>
                      <textarea
                        rows={3}
                        value={cmsForm.why?.description || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, why: { ...cmsForm.why, description: e.target.value } })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="btn btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? 'Publishing Changes...' : 'Save & Publish CMS'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center bg-[#f8fafc] min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mb-3" />
          <p className="text-xs text-gray-500 font-bold">Loading System Settings...</p>
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}
