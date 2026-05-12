"use client";

import { toast } from "sonner";
import { Share2, Link2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useTranslations } from "next-intl";

type ShareSectionProps = {
  /** Full URL including locale path; falls back to `window.location.href` */
  shareUrl?: string;
  shareLabel?: string;
};

const ShareSection = ({ shareUrl: shareUrlProp, shareLabel }: ShareSectionProps) => {
  const t = useTranslations("blogDetail");
  const articleUrl =
    shareUrlProp ||
    (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = () => {
    if (!articleUrl) return;
    void navigator.clipboard.writeText(articleUrl);
    toast.success(t("copyLinkSuccess"), {
      description: t("copyLinkDescription"),
    });
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366]",
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      name: "Facebook",
      color: "bg-[#3b5998]",
      icon: <FaFacebook className="w-4 h-4" />,
    },
    {
      name: "Twitter",
      color: "bg-[#1DA1F2]",
      icon: <FaTwitter className="w-4 h-4" />,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0077b5]",
      icon: <FaLinkedin className="w-4 h-4" />,
    },
    {
      name: "Pinterest",
      color: "bg-[#bd081c]",
      icon: <Share2 className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="container flex items-center  gap-4 py-6 border-y border-gray-100 "
    >
      <span className="text-sm font-bold text-slate-700">
        {shareLabel ?? t("shareArticle")}
      </span>

      <div className="flex gap-2">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            type="button"
            onClick={handleCopy}
            className={`
              ${platform.color} 
              w-9 h-9 rounded-full flex items-center justify-center 
              text-white transition-transform hover:scale-110 active:scale-95
            `}
            aria-label={t("shareOnAria", { platform: platform.name })}
          >
            {platform.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareSection;
