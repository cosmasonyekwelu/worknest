import { User, FileText, Bookmark, LockKeyhole, Settings } from "lucide-react";

export const navLink = [
  { name: "Home", path: "/" },
  { name: "Find Job", path: "/jobs" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

export const navAuthLink = [
  { name: "Login", path: "/auth/login", variant: "outline" },
  { name: "Join now", path: "/auth/signup", variant: "primary" },
];

export const profileLinks = [
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Applications", path: "/my-applications", icon: FileText },
  { name: "Saved Jobs", path: "/saved-jobs", icon: Bookmark },
  { name: "Change Password", path: "/auth/change-password", icon: LockKeyhole },
];

export const footerJobs = [
  { name: "Browse Jobs", path: "/jobs" },
  { name: "Job Applications", path: "/my-applications" },
  { name: "Upload Resume", path: null, disabled: true, note: "Coming soon" },
  { name: "Job Alerts", path: "/jobs" },
];

export const footerCompany = [
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Terms of Service", path: "/terms-of-service" },
  { name: "Privacy Policy", path: "/privacy-policy" },
];

export const footerSocialLinks = [
  { name: "Facebook", href: "https://facebook.com/worknest", icon: "facebook" },
  { name: "Instagram", href: "https://instagram.com/worknest", icon: "instagram" },
  { name: "Twitter", href: "https://twitter.com/worknest", icon: "twitter" },
  { name: "YouTube", href: "https://youtube.com/@worknest", icon: "youtube" },
];
