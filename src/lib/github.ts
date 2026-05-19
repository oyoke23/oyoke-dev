type RepoMeta = {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string | null;
  htmlUrl: string;
};

type RepoData = {
  meta: RepoMeta | null;
  readmeMd: string | null;
};

const cache = new Map<string, RepoData>();

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "oyoke-dev-portfolio",
};

const token = import.meta.env.GITHUB_TOKEN;
if (token) headers.Authorization = `Bearer ${token}`;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { ...headers, Accept: "application/vnd.github.raw" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function getRepoData(repo: string): Promise<RepoData> {
  if (cache.has(repo)) return cache.get(repo) as RepoData;

  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    const empty: RepoData = { meta: null, readmeMd: null };
    cache.set(repo, empty);
    return empty;
  }

  const meta = await fetchJson<{
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    pushed_at: string | null;
    html_url: string;
  }>(`https://api.github.com/repos/${owner}/${name}`);

  const readme = await fetchText(`https://api.github.com/repos/${owner}/${name}/readme`);

  const data: RepoData = {
    meta: meta
      ? {
          fullName: meta.full_name,
          description: meta.description,
          stars: meta.stargazers_count,
          forks: meta.forks_count,
          language: meta.language,
          pushedAt: meta.pushed_at,
          htmlUrl: meta.html_url,
        }
      : null,
    readmeMd: readme,
  };

  cache.set(repo, data);
  return data;
}

export function rewriteReadmeImages(md: string, repo: string): string {
  const [owner, name] = repo.split("/");
  if (!owner || !name) return md;
  const base = `https://raw.githubusercontent.com/${owner}/${name}/HEAD/`;

  return md
    .replace(/!\[([^\]]*)\]\((?!https?:|\/\/|data:)([^)]+)\)/g, (_, alt, src) => {
      const clean = src.replace(/^\.?\//, "");
      return `![${alt}](${base}${clean})`;
    })
    .replace(/<img([^>]*?)src="(?!https?:|\/\/|data:)([^"]+)"/g, (_, attrs, src) => {
      const clean = src.replace(/^\.?\//, "");
      return `<img${attrs}src="${base}${clean}"`;
    });
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}
