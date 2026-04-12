import { useState } from "react";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { Share2, Link2, Check } from "lucide-react";

interface ShareButtonProps {
  eventName: string;
  eventUrl: string;
}

const ShareButton = ({ eventName, eventUrl }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${window.location.origin}${eventUrl}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(`Check out "${eventName}" on Eventide!`);

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      label: "Twitter / X",
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button variant="flat" startContent={<Share2 size={16} />} size="sm">
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-52">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground mb-1">Share Event</p>
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-default-600 hover:text-primary transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <Button
            size="sm"
            variant="flat"
            startContent={copied ? <Check size={14} /> : <Link2 size={14} />}
            onPress={copyLink}
            className="mt-1"
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
