export const site = {
  name: "Kevin Llaberia",
  handle: "oyoke",
  title: "Kevin Llaberia",
  description: "Personal site of Kevin Llaberia.",
  url: "https://oyoke.dev",
  locale: "en",
  author: {
    name: "Kevin Llaberia",
    handle: "oyoke",
    email: "",
  },
  social: {
    github: "",
    x: "",
    linkedin: "",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/skills", label: "Skills" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type SiteConfig = typeof site;
