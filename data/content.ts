export const film = {
  title: "Sueños de una Monarca",
};

export type Screening = {
  festival: string;
  location: string;
  date: string;
  url?: string;
  laurel?: string;
};

export const upcomingScreenings: Screening[] = [];

export const pastScreenings: Screening[] = [
  {
    festival: "Fresh Coast Film Festival",
    location: "Marquette, Michigan",
    date: "October 18, 2025",
    url: "https://freshcoastfilm.com/films/2025/sue%c3%b1os-de-una-monarca-dreams-of-a-monarch",
    laurel: "/images/laurels/fresh-coast.png",
  },
  {
    festival: "Environmental Youth Forum",
    location: "San Rafael, California",
    date: "April 1, 2026",
    url: "https://www.cafilmedu.org/eyf-2026/#toggle-id-2",
    laurel: "/images/laurels/eyf.png",
  },
  {
    festival: "Fresh Coast Film Festival, Traverse City",
    location: "Traverse City, Michigan",
    date: "May 2, 2026",
    url: "https://www.oldmissionculture.org/freshcoastfilmtc/event-three-mz467-9slf2-zjnms-7fcgf-ky6e4-7wxjb-lkzkh",
    laurel: "/images/laurels/fresh-coast-tc.png",
  },
  {
    festival: "Diaspora Film Festival",
    location: "Hyde Park, Illinois",
    date: "May 15, 2026",
    url: "https://fireescapefilms.org/film-festival/",
    laurel: "/images/laurels/diaspora.png",
  },
  {
    festival: "Mountainfilm Festival",
    location: "Telluride, Colorado",
    date: "May 22, 2026",
    url: "https://www.mountainfilm.org/films/suenos-de-una-monarca-dreams-of-a-monarch/",
    laurel: "/images/laurels/mountainfilm.png",
  },
  {
    festival: "Field Museum: International Pollinator Week",
    location: "Chicago, Illinois",
    date: "June 28, 2026",
    url: "https://www.fieldmuseum.org/activity/pollinator-week",
  },
];

// `slug` maps to a key under the "Crew" namespace in messages/en.json and messages/es.json,
// where each member's translated role + bio live.
export type CrewMember = {
  slug: string;
  name: string;
  headshot: string;
  headshotPosition?: string;
};

export const crew: CrewMember[] = [
  {
    slug: "julianTrejoBax",
    name: "Julián Trejo Bax",
    headshot: "/images/crew/julian-trejo-bax.png",
  },
  {
    slug: "nataliaTrejoBax",
    name: "Natalia Trejo Bax",
    headshot: "/images/crew/natalia-trejo-bax.webp",
    headshotPosition: "50% 22%",
  },
  {
    slug: "alonsoVidal",
    name: "Alonso Vidal",
    headshot: "/images/crew/alonso-vidal.webp",
  },
  {
    slug: "dylanMartis",
    name: "Dylan Martis",
    headshot: "/images/crew/dylan-martis.jpg",
  },
  {
    slug: "jackHoac",
    name: "Jack Hoac",
    headshot: "/images/crew/jack-hoac.png",
  },
  {
    slug: "karinaRivero",
    name: "Karina Rivero",
    headshot: "/images/crew/karina-rivero.jpg",
  },
  {
    slug: "zachScheitlin",
    name: "Zach Scheitlin",
    headshot: "/images/crew/zach-scheitlin.png",
  },
  // TODO: bio + headshot pending for this crew member.
  {
    slug: "divSangani",
    name: "Div Sangani",
    headshot: "/images/crew/placeholder.svg",
  },
];

export const stills = [
  "/images/stills/still-1.png",
  "/images/stills/still-2.png",
  "/images/stills/still-3.png",
  "/images/stills/still-4.png",
  "/images/stills/still-5.png",
  "/images/stills/still-6.png",
  "/images/stills/still-7.jpg",
];

export const impact = {
  milkweedCount: 200,
};

export const takeAction = {
  donateUrl: "https://www.workingfamilysolidarity.org/donate",
  donateOrg: "Women for Green Spaces",
};

export const hostAScreeningEmail = "juliantrejo1@gmail.com";
