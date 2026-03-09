/*
  Hardcoded Company Data

  WHY HARDCODED?
  These 7 companies are the initial customer base. Storing them here means:
  - Zero database dependency — instant page loads
  - No Supabase costs or latency
  - Easy to add/edit — just update this file
  - Works offline and in any hosting environment

  HOW TO ADD A COMPANY:
  1. Add an entry to COMPANIES below
  2. Give it a unique slug (used in the URL: /review/your-slug)
  3. Add descriptor categories with phrases customers would actually say
  4. Each descriptor needs a unique id (use the pattern: slug-cat-number)

  DESCRIPTOR WRITING GUIDE:
  - Write how real people talk, not marketing copy
  - Short phrases, not full sentences
  - Mix specific ("saubere Fugen") with general ("top Ergebnis")
  - Avoid words like "exzellent", "hervorragend" — real people say "super", "top", "echt gut"
*/

// ============================================
// COMPANY DATA
// ============================================

const COMPANIES = [
  // ----------------------------------------
  // 1. BRINK TISCHLEREI — Carpentry / Joinery
  // ----------------------------------------
  {
    id: 'brink',
    name: 'Brink Tischlerei',
    slug: 'brink',
    google_review_link: 'https://reviewthis.biz/BrinkTischlerei',
    categories: [
      {
        id: 'brink-handwerk',
        name: 'Handwerk & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'brink-h1', text: 'saubere und präzise Arbeit' },
          { id: 'brink-h2', text: 'hochwertige Verarbeitung' },
          { id: 'brink-h3', text: 'alles passt millimetergenau' },
          { id: 'brink-h4', text: 'super Holzqualität' },
          { id: 'brink-h5', text: 'handwerklich top' },
        ],
      },
      {
        id: 'brink-beratung',
        name: 'Beratung & Planung',
        sort_order: 1,
        descriptors: [
          { id: 'brink-b1', text: 'gute Beratung im Vorfeld' },
          { id: 'brink-b2', text: 'hat sich Zeit genommen für unsere Wünsche' },
          { id: 'brink-b3', text: 'kreative Ideen eingebracht' },
          { id: 'brink-b4', text: 'individuelle Lösung gefunden' },
        ],
      },
      {
        id: 'brink-ablauf',
        name: 'Ablauf & Zuverlässigkeit',
        sort_order: 2,
        descriptors: [
          { id: 'brink-a1', text: 'pünktlich und zuverlässig' },
          { id: 'brink-a2', text: 'Termin wurde eingehalten' },
          { id: 'brink-a3', text: 'Baustelle sauber hinterlassen' },
          { id: 'brink-a4', text: 'schnell und unkompliziert' },
          { id: 'brink-a5', text: 'alles wie abgesprochen' },
        ],
      },
      {
        id: 'brink-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'brink-g1', text: 'fairer Preis für die Qualität' },
          { id: 'brink-g2', text: 'freundliches Team' },
          { id: 'brink-g3', text: 'würde ich weiterempfehlen' },
          { id: 'brink-g4', text: 'bin sehr zufrieden mit dem Ergebnis' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 2. GRUPPENWERK — Construction / Renovation
  // ----------------------------------------
  {
    id: 'gruppenwerk',
    name: 'Gruppenwerk',
    slug: 'gruppenwerk',
    google_review_link: 'https://reviewthis.biz/Gruppenwerk',
    categories: [
      {
        id: 'gw-ausfuehrung',
        name: 'Ausführung & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'gw-a1', text: 'professionelle und saubere Arbeit' },
          { id: 'gw-a2', text: 'Sanierung top umgesetzt' },
          { id: 'gw-a3', text: 'alle Gewerke gut koordiniert' },
          { id: 'gw-a4', text: 'Ergebnis sieht super aus' },
          { id: 'gw-a5', text: 'solide Handwerksarbeit' },
        ],
      },
      {
        id: 'gw-orga',
        name: 'Organisation & Ablauf',
        sort_order: 1,
        descriptors: [
          { id: 'gw-o1', text: 'alles aus einer Hand' },
          { id: 'gw-o2', text: 'Zeitplan wurde eingehalten' },
          { id: 'gw-o3', text: 'reibungsloser Ablauf' },
          { id: 'gw-o4', text: 'regelmäßige Updates zum Baufortschritt' },
          { id: 'gw-o5', text: 'nur ein Ansprechpartner für alles' },
        ],
      },
      {
        id: 'gw-team',
        name: 'Team & Kommunikation',
        sort_order: 2,
        descriptors: [
          { id: 'gw-t1', text: 'kompetente Beratung' },
          { id: 'gw-t2', text: 'freundliche und hilfsbereite Mitarbeiter' },
          { id: 'gw-t3', text: 'immer erreichbar gewesen' },
          { id: 'gw-t4', text: 'transparent kommuniziert' },
        ],
      },
      {
        id: 'gw-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'gw-g1', text: 'Kosten im Rahmen geblieben' },
          { id: 'gw-g2', text: 'faires Preis-Leistungs-Verhältnis' },
          { id: 'gw-g3', text: 'jederzeit wieder' },
          { id: 'gw-g4', text: 'kann ich nur weiterempfehlen' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 3. HANTKE — Painting / Decorating
  // ----------------------------------------
  {
    id: 'hantke',
    name: 'Hantke',
    slug: 'hantke',
    google_review_link: 'https://reviewthis.biz/Hantke',
    categories: [
      {
        id: 'ha-arbeit',
        name: 'Malerarbeit & Ergebnis',
        sort_order: 0,
        descriptors: [
          { id: 'ha-a1', text: 'saubere Malerarbeit' },
          { id: 'ha-a2', text: 'tolles Farbergebnis' },
          { id: 'ha-a3', text: 'gleichmäßig und ordentlich gestrichen' },
          { id: 'ha-a4', text: 'Wände sehen super aus' },
          { id: 'ha-a5', text: 'professionelle Ausführung' },
        ],
      },
      {
        id: 'ha-beratung',
        name: 'Beratung & Farbwahl',
        sort_order: 1,
        descriptors: [
          { id: 'ha-b1', text: 'gute Farbberatung' },
          { id: 'ha-b2', text: 'tolle Vorschläge gemacht' },
          { id: 'ha-b3', text: 'hat sich unsere Wünsche angehört' },
          { id: 'ha-b4', text: 'kompetent bei der Materialwahl' },
        ],
      },
      {
        id: 'ha-ablauf',
        name: 'Ablauf & Sauberkeit',
        sort_order: 2,
        descriptors: [
          { id: 'ha-ab1', text: 'pünktlich angefangen und fertig geworden' },
          { id: 'ha-ab2', text: 'alles sauber abgeklebt' },
          { id: 'ha-ab3', text: 'Wohnung sauber hinterlassen' },
          { id: 'ha-ab4', text: 'zügig und ohne Verzögerung' },
          { id: 'ha-ab5', text: 'Absprachen eingehalten' },
        ],
      },
      {
        id: 'ha-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'ha-g1', text: 'nettes und freundliches Team' },
          { id: 'ha-g2', text: 'fairer Preis' },
          { id: 'ha-g3', text: 'bin echt zufrieden' },
          { id: 'ha-g4', text: 'würde ich sofort weiterempfehlen' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 4. TISCHLEREI MEHLIG — Carpentry / Joinery
  // ----------------------------------------
  {
    id: 'mehlig',
    name: 'Tischlerei Mehlig',
    slug: 'mehlig',
    google_review_link: 'https://reviewthis.biz/TischlereiMehlig',
    categories: [
      {
        id: 'me-handwerk',
        name: 'Handwerk & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'me-h1', text: 'erstklassige Handwerksarbeit' },
          { id: 'me-h2', text: 'perfekte Passgenauigkeit' },
          { id: 'me-h3', text: 'Maßarbeit vom Feinsten' },
          { id: 'me-h4', text: 'hochwertige Materialien verwendet' },
          { id: 'me-h5', text: 'saubere Verarbeitung' },
        ],
      },
      {
        id: 'me-beratung',
        name: 'Beratung & Planung',
        sort_order: 1,
        descriptors: [
          { id: 'me-b1', text: 'hat gut zugehört' },
          { id: 'me-b2', text: 'kompetente Beratung' },
          { id: 'me-b3', text: 'perfekt an unsere Wünsche angepasst' },
          { id: 'me-b4', text: 'tolle Ideen eingebracht' },
        ],
      },
      {
        id: 'me-ablauf',
        name: 'Ablauf & Zuverlässigkeit',
        sort_order: 2,
        descriptors: [
          { id: 'me-a1', text: 'Termin eingehalten' },
          { id: 'me-a2', text: 'zuverlässig und pünktlich' },
          { id: 'me-a3', text: 'alles sauber hinterlassen' },
          { id: 'me-a4', text: 'unkomplizierte Abwicklung' },
        ],
      },
      {
        id: 'me-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'me-g1', text: 'super nettes Team' },
          { id: 'me-g2', text: 'gutes Preis-Leistungs-Verhältnis' },
          { id: 'me-g3', text: 'bin total begeistert' },
          { id: 'me-g4', text: 'jederzeit wieder' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 5. SEEHAFER ELEMENTE — Doors / Windows / Building Elements
  // ----------------------------------------
  {
    id: 'seehafer',
    name: 'Seehafer Elemente',
    slug: 'seehaferelemente',
    google_review_link: 'https://reviewthis.biz/seehaferelemente',
    categories: [
      {
        id: 'se-produkt',
        name: 'Produkte & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'se-p1', text: 'hochwertige Türen und Fenster' },
          { id: 'se-p2', text: 'top Qualität der Bauelemente' },
          { id: 'se-p3', text: 'saubere Montage' },
          { id: 'se-p4', text: 'alles passt perfekt' },
          { id: 'se-p5', text: 'gute Materialauswahl' },
        ],
      },
      {
        id: 'se-beratung',
        name: 'Beratung & Service',
        sort_order: 1,
        descriptors: [
          { id: 'se-b1', text: 'kompetente Fachberatung' },
          { id: 'se-b2', text: 'schnelle Hilfe bei Fragen' },
          { id: 'se-b3', text: 'gute Empfehlungen bekommen' },
          { id: 'se-b4', text: 'auch nach dem Einbau erreichbar' },
        ],
      },
      {
        id: 'se-ablauf',
        name: 'Ablauf & Zuverlässigkeit',
        sort_order: 2,
        descriptors: [
          { id: 'se-a1', text: 'schnelle Lieferung' },
          { id: 'se-a2', text: 'termingerecht montiert' },
          { id: 'se-a3', text: 'unkompliziert und zuverlässig' },
          { id: 'se-a4', text: 'Baustelle ordentlich hinterlassen' },
          { id: 'se-a5', text: 'alles wie besprochen' },
        ],
      },
      {
        id: 'se-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'se-g1', text: 'freundliches Team' },
          { id: 'se-g2', text: 'faire Preise' },
          { id: 'se-g3', text: 'langjährige Erfahrung merkt man' },
          { id: 'se-g4', text: 'kann ich empfehlen' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 6. WERNER BAU — Construction
  // ----------------------------------------
  {
    id: 'werner-bau',
    name: 'Werner Bau',
    slug: 'wernerbau',
    google_review_link: 'https://reviewthis.biz/WernerBau',
    categories: [
      {
        id: 'wb-ausfuehrung',
        name: 'Ausführung & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'wb-a1', text: 'saubere handwerkliche Arbeit' },
          { id: 'wb-a2', text: 'solide gebaut' },
          { id: 'wb-a3', text: 'Ergebnis genau wie gewünscht' },
          { id: 'wb-a4', text: 'professionelle Umsetzung' },
          { id: 'wb-a5', text: 'qualitativ hochwertig' },
        ],
      },
      {
        id: 'wb-orga',
        name: 'Planung & Organisation',
        sort_order: 1,
        descriptors: [
          { id: 'wb-o1', text: 'gute Bauplanung im Vorfeld' },
          { id: 'wb-o2', text: 'Zeitplan wurde eingehalten' },
          { id: 'wb-o3', text: 'Baustelle war immer aufgeräumt' },
          { id: 'wb-o4', text: 'alles gut koordiniert' },
        ],
      },
      {
        id: 'wb-team',
        name: 'Team & Kommunikation',
        sort_order: 2,
        descriptors: [
          { id: 'wb-t1', text: 'nette und fleißige Handwerker' },
          { id: 'wb-t2', text: 'gute Beratung' },
          { id: 'wb-t3', text: 'immer ansprechbar gewesen' },
          { id: 'wb-t4', text: 'Probleme wurden sofort gelöst' },
          { id: 'wb-t5', text: 'man wird auf dem Laufenden gehalten' },
        ],
      },
      {
        id: 'wb-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'wb-g1', text: 'Budget wurde eingehalten' },
          { id: 'wb-g2', text: 'faires Preis-Leistungs-Verhältnis' },
          { id: 'wb-g3', text: 'zuverlässiger Baupartner' },
          { id: 'wb-g4', text: 'würde ich weiterempfehlen' },
        ],
      },
    ],
  },

  // ----------------------------------------
  // 7. WERNER GERÜST — Scaffolding
  // ----------------------------------------
  {
    id: 'werner-geruest',
    name: 'Werner Gerüst',
    slug: 'wernergeruest',
    google_review_link: 'https://reviewthis.biz/WernerGeruest',
    categories: [
      {
        id: 'wg-aufbau',
        name: 'Gerüstbau & Qualität',
        sort_order: 0,
        descriptors: [
          { id: 'wg-a1', text: 'Gerüst stand schnell und sicher' },
          { id: 'wg-a2', text: 'sauberer Aufbau' },
          { id: 'wg-a3', text: 'stabiles und sicheres Gerüst' },
          { id: 'wg-a4', text: 'schneller Abbau nach Fertigstellung' },
          { id: 'wg-a5', text: 'ordentliche Arbeit' },
        ],
      },
      {
        id: 'wg-orga',
        name: 'Organisation & Termin',
        sort_order: 1,
        descriptors: [
          { id: 'wg-o1', text: 'pünktlich zum vereinbarten Termin' },
          { id: 'wg-o2', text: 'schnelle Terminvergabe' },
          { id: 'wg-o3', text: 'flexibel auf unsere Wünsche eingegangen' },
          { id: 'wg-o4', text: 'unkomplizierte Absprache' },
        ],
      },
      {
        id: 'wg-team',
        name: 'Team & Service',
        sort_order: 2,
        descriptors: [
          { id: 'wg-t1', text: 'freundliches und hilfsbereites Team' },
          { id: 'wg-t2', text: 'gut erreichbar' },
          { id: 'wg-t3', text: 'nette Jungs, packen mit an' },
          { id: 'wg-t4', text: 'Sicherheit wird ernst genommen' },
        ],
      },
      {
        id: 'wg-gesamt',
        name: 'Gesamteindruck',
        sort_order: 3,
        descriptors: [
          { id: 'wg-g1', text: 'fairer Preis' },
          { id: 'wg-g2', text: 'alles sauber hinterlassen' },
          { id: 'wg-g3', text: 'zuverlässig und professionell' },
          { id: 'wg-g4', text: 'gerne wieder' },
        ],
      },
    ],
  },
];

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Find a company by its URL slug
 * Used by the review page: /review/[companySlug]
 */
export function getCompanyBySlug(slug) {
  return COMPANIES.find((c) => c.slug === slug) || null;
}

/**
 * Get all companies (for dropdowns, lists, dashboard)
 * Returns a shallow copy to prevent accidental mutation
 */
export function getAllCompanies() {
  return [...COMPANIES];
}

/**
 * Find a company by its ID
 * Used by dashboard pages that reference company by ID
 */
export function getCompanyById(id) {
  return COMPANIES.find((c) => c.id === id) || null;
}

export default COMPANIES;
