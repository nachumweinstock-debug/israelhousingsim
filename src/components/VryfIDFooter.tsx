/**
 * Ported verbatim (structure, copy, links, assets) from vryfid-demo's
 * VryfIDFooter — this product is part of the VryfID family.
 */

const FOUNDERS = [
  {
    name: "Gabe Einhorn",
    title: "Co-Founder, VryfID",
    img: "/gabe.jpeg",
    linkedin: "https://www.linkedin.com/in/gabe-einhorn-55b74822b/",
    instagram: "https://www.instagram.com/gabe_einhorn/",
  },
  {
    name: "Aiden Einhorn",
    title: "Co-Founder, VryfID",
    img: "/aiden.jpeg",
    linkedin: "https://www.linkedin.com/in/aiden-einhorn-370095292/",
    instagram: null as string | null,
  },
];

const LINK_COLUMNS = [
  {
    heading: "Verticals",
    links: [
      ["Real Estate", "https://vryfidinsights.com/real-estate/"],
      ["Insurance", "https://vryfidinsights.com/insurance/"],
      ["Lending", "https://vryfidinsights.com/lending/"],
      ["Brokerage", "https://vryfidinsights.com/brokerage/"],
      ["Gig Economy", "https://vryfidinsights.com/gig-economy/"],
    ],
  },
  {
    heading: "VryfID",
    links: [
      ["Main Site", "https://www.vryfid.com/"],
      ["Verify a Tenant", "https://www.vryfid.com/"],
      ["Verify a Landlord", "https://www.vryfid.com/"],
      ["For Managers", "https://www.vryfid.com/"],
    ],
  },
  {
    heading: "Vibes",
    links: [
      ["Neighborhood Vibes", "https://VryfIDVibes.com"],
      ["Vibe Score", "https://VryfIDVibes.com"],
      ["Share Card", "https://VryfIDVibes.com"],
    ],
  },
];

export function VryfIDFooter() {
  return (
    <footer style={{ background: "linear-gradient(180deg, #0C3C38 0%, #0A2E2B 100%)" }}>
      <div className="mx-auto max-w-5xl px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/vryfid-logo.jpeg" alt="VryfID" className="mb-4 h-10 w-auto rounded-lg" />
            <p className="mb-5 text-sm leading-relaxed text-[#8FA29F]">
              Your verified digital profile, simplified. Protecting every party in
              trust-dependent transactions.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/vryfidllc/"
                target="_blank"
                rel="noreferrer"
                className="text-[#5EEAD4] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/gabe_einhorn/"
                target="_blank"
                rel="noreferrer"
                className="text-[#5EEAD4] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2">
            {LINK_COLUMNS.map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                  {heading}
                </p>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#8FA29F] transition-colors hover:text-[#CFFAF4]"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Founders */}
          <div className="md:col-span-1">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              Meet the Founders
            </p>
            <p className="mb-5 text-xs leading-relaxed text-[#8FA29F]">
              Brothers on a mission to make identity verification simple, secure, and universal.
            </p>
            <div className="flex flex-col gap-5">
              {FOUNDERS.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <img
                    src={f.img}
                    alt={f.name}
                    className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white/10 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold leading-tight text-white">{f.name}</p>
                    <p className="mb-1.5 text-xs text-[#6B7F7C]">{f.title}</p>
                    <div className="flex gap-3">
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#5EEAD4] transition-colors hover:text-white"
                      >
                        LinkedIn ↗
                      </a>
                      {f.instagram && (
                        <a
                          href={f.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#5EEAD4] transition-colors hover:text-white"
                        >
                          Instagram ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row">
          <p className="text-xs text-[#6B7F7C]">© 2026 VryfID LLC. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7F7C]">
              Educational mortgage simulator — not a bank quote.
            </span>
            <a
              href="https://VryfIDVibes.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-[#5EEAD4] transition-colors hover:text-white"
            >
              VryfIDVibes.com →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
