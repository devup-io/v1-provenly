import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  keywords?: string;
  ogType?: "website" | "article";
};

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    document.head.appendChild(meta);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    meta?.setAttribute(key, value);
  });
};

export default function SeoHead({ title, description, keywords, ogType = "website" }: Props) {
  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    }

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: ogType });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  }, [description, keywords, ogType, title]);

  return null;
}
