import { track } from "@vercel/analytics";
import { useLang } from "../i18n";

const APP_URL = "https://israelhousingsim.vercel.app/";

function shareText(lang: string) {
  return lang === "he"
    ? "בדקו אם המשכנתא שלכם מוכנה לבנק עם VryfID"
    : "Check if your mortgage is bank-ready with VryfID";
}

export function ShareLinks({ placement, className = "" }: { placement: string; className?: string }) {
  const { t, lang } = useLang();
  const message = shareText(lang);
  const encodedUrl = encodeURIComponent(APP_URL);
  const encodedText = encodeURIComponent(`${message}: ${APP_URL}`);
  const links = [
    {
      id: "whatsapp",
      label: t.share.whatsapp,
      href: `https://wa.me/?text=${encodedText}`,
      className: "border-[#25D366]/40 bg-[#25D366]/10 text-[#0F6B37] hover:border-[#25D366]",
    },
    {
      id: "linkedin",
      label: t.share.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className: "border-[#0A66C2]/35 bg-[#0A66C2]/10 text-[#0A4D93] hover:border-[#0A66C2]",
    },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/40">{t.share.label}</span>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("share_clicked", { channel: link.id, placement })}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${link.className}`}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
