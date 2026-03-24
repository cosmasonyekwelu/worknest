import React from 'react';
import {
  FileCheck,
  UserCircle,
  Briefcase,
  Ban,
  Copyright,
  XCircle,
  ShieldAlert,
  RefreshCcw,
} from 'lucide-react';
// Optional: useMetaArgs for SEO
// import useMetaArgs from '@/hooks/UseMeta';

export default function TermsOfService() {
  // Optional: set meta tags for SEO
  // useMetaArgs({
  //   title: 'Terms of Service - Worknest',
  //   description: 'Read the terms and conditions governing your use of the Worknest platform.',
  //   keywords: 'terms of service, terms and conditions, Worknest',
  // });

  const sections = [
    {
      icon: <FileCheck className="w-6 h-6 text-[#F86021]" />,
      title: 'Acceptance of Terms',
      content:
        'By accessing or using Worknest, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our platform. These terms apply to all users, including job seekers and employers.',
    },
    {
      icon: <UserCircle className="w-6 h-6 text-[#F86021]" />,
      title: 'User Accounts',
      content:
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information and promptly update it as needed.',
    },
    {
      icon: <Briefcase className="w-6 h-6 text-[#F86021]" />,
      title: 'Job Applications',
      content:
        'Job seekers may apply to listings at their own discretion. Employers are responsible for the accuracy of job postings and for responding to applicants. Worknest is not a party to any employment agreement between users.',
    },
    {
      icon: <Ban className="w-6 h-6 text-[#F86021]" />,
      title: 'Prohibited Conduct',
      content:
        'You agree not to: (a) use the platform for any illegal purpose; (b) post false, misleading, or discriminatory content; (c) harass, abuse, or harm others; (d) interfere with the platform’s operation; or (e) scrape or copy data without permission.',
    },
    {
      icon: <Copyright className="w-6 h-6 text-[#F86021]" />,
      title: 'Intellectual Property',
      content:
        'All content on Worknest, including logos, text, graphics, and software, is the property of Worknest or its licensors and is protected by copyright and other laws. You may not reproduce, distribute, or create derivative works without express consent.',
    },
    {
      icon: <XCircle className="w-6 h-6 text-[#F86021]" />,
      title: 'Termination',
      content:
        'We reserve the right to suspend or terminate your access to Worknest at any time, without notice, for conduct that violates these terms or is harmful to other users or the platform.',
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#F86021]" />,
      title: 'Limitation of Liability',
      content:
        'Worknest is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we disclaim all liability for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.',
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-[#F86021]" />,
      title: 'Changes to Terms',
      content:
        'We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on this page with an updated effective date. Your continued use after changes constitutes acceptance.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-500 font-medium">
            Last updated: February 17, 2026
          </p>
          <div className="w-20 h-1 bg-[#F86021] mt-4 mx-auto md:mx-0"></div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100">
          <p className="text-gray-600 leading-relaxed text-lg">
            Welcome to Worknest. These Terms of Service ("Terms") govern your use of our website
            and services. By accessing or using Worknest, you agree to be bound by these Terms.
            If you are using Worknest on behalf of an organization, you represent that you have
            authority to bind that organization. Please read these Terms carefully before using
            our platform.
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
            For any legal inquiries, please contact us at{' '}
            <a
              href="mailto:legal@worknest.com"
              className="text-[#F86021] hover:underline font-medium"
            >
              legal@worknest.com
            </a>
          </p>
        
        </div>
      </div>
    </div>
  );
}