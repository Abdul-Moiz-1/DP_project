import React from "react";
import { Card, Divider, Button, Link } from "@heroui/react";
import { ArrowUpIcon } from "lucide-react";
import { Logo } from "../Icons";
import ShareButtons from "../ui/ShareButtons";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-default-100 text-default-700 mt-12">
      <Card
        shadow="none"
        radius="none"
        className="max-w-7xl mx-auto py-12 px-6 lg:px-8 bg-transparent"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Section */}
          <div>
            <span className="text-xl font-bold text-primary mb-3"><Logo className="inline"/>EVENTIDE</span>
            <p className="text-sm text-default-500 leading-relaxed">
              Discover and explore the best local events, concerts, and
              experiences near you — powered by smart search and curated content.
            </p>
            <ShareButtons />
          </div>

          {/* Middle Section: Site Map */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-default-800">
              Site Map
            </h3>
            <ul className="space-y-2 text-sm">
              {["Home", "Events", "Organizers", "About", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      color="foreground"
                      className="hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Right Section: Legal */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-default-800">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    color="foreground"
                    className="hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-default-500 gap-2">
          <p>© {year} SiteSeeker. All rights reserved.</p>
          <p className="text-default-400">
            Designed with ❤️ using HeroUI & Next.js
          </p>
        </div>
      </Card>
    </footer>
  );
};

export default Footer;
