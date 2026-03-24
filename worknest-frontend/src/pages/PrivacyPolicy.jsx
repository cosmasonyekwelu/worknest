import React from 'react';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Cookie,
  RefreshCw,
  FileText,
  Globe,
} from 'lucide-react';
// Optional: if you have a meta hook for SEO
// import useMetaArgs from '@/hooks/UseMeta';

export default function PrivacyPolicy() {
  // Optional: set meta tags for SEO
  // useMetaArgs({
  //   title: 'Privacy Policy - Worknest',
  //   description: 'Learn how Worknest collects, uses, and protects your personal information.',
  //   keywords: 'privacy policy, data protection, Worknest',
  // });

  const sections = [
    {
      icon: <Eye className="w-6 h-6 text-[#F86021]" />,
      title: 'Information We Collect',
      content:
        'We collect personal information you provide directly, such as name, email, phone number, resume details, and professional history. We also automatically collect usage data like IP address, browser type, and interactions with our platform to improve your experience.',
    },
    {
      icon: <Database className="w-6 h-6 text-[#F86021]" />,
      title: 'How We Use Your Information',
      content:
        'Your data helps us personalize job recommendations, process applications, communicate with you, and enhance our services. We may also use anonymized data for analytics and platform improvements.',
    },
    {
      icon: <Lock className="w-6 h-6 text-[#F86021]" />,
      title: 'Data Security',
      content:
        'We implement industry-standard security measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.',
    },
    {
      icon: <Shield className="w-6 h-6 text-[#F86021]" />,
      title: 'Sharing Your Information',
      content:
        'We share your information with employers when you apply for jobs. We do not sell your personal data to third parties. Service providers who assist us may access your data under strict confidentiality agreements.',
    },
    {
      icon: <Cookie className="w-6 h-6 text-[#F86021]" />,
      title: 'Cookies & Tracking',
      content:
        'We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-[#F86021]" />,
      title: 'Your Rights',
      content:
        'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing. Contact us at privacy@worknest.com to exercise your rights.',
    },
    {
      icon: <Globe className="w-6 h-6 text-[#F86021]" />,
      title: 'International Transfers',
      content:
        'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.',
    },
    {
      icon: <FileText className="w-6 h-6 text-[#F86021]" />,
      title: 'Changes to This Policy',
      content:
        'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-medium">
            Last updated: February 17, 2026
          </p>
          <div className="w-20 h-1 bg-[#F86021] mt-4 mx-auto md:mx-0"></div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100">
          <p className="text-gray-600 leading-relaxed text-lg">
            At Worknest, we take your privacy seriously. This policy describes how we collect,
            use, and protect your personal information when you use our platform to find your
            next career opportunity. By using Worknest, you agree to the practices described
            here.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 bg-[#FEEEEA] p-3 rounded-xl group-hover:bg-[#FFDACF] transition-colors">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#F86021] transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lower Note */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>
            For any privacy-related concerns, please contact us at{' '}
            <a
              href="mailto:privacy@worknest.com"
              className="text-[#F86021] hover:underline font-medium"
            >
              privacy@worknest.com
            </a>
          </p>
        
        
        </div>
      </div>
    </div>
  );
}