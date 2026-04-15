"use client";

import React from "react";
import { toast } from "sonner";
import { Share2, Link2 } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";


const ShareSection = () => {
  const articleUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(articleUrl);
    toast.success("تم نسخ الرابط بنجاح", {
      description: "يمكنك الآن مشاركته مع أصدقائك.",
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
      <span className="text-sm font-bold text-slate-700">شارك المقال:</span>

      <div className="flex gap-2">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            onClick={handleCopy}
            className={`
              ${platform.color} 
              w-9 h-9 rounded-full flex items-center justify-center 
              text-white transition-transform hover:scale-110 active:scale-95
            `}
            aria-label={`Share on ${platform.name}`}
          >
            {platform.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareSection;
