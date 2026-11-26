import { isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "./mermaid-diagram";

// Shared by article pages (server) and the Studio live preview (client).
// Raw HTML in Markdown is NOT rendered (react-markdown default), so content is safe to display.

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

const components: Components = {
  pre({ children, ...props }) {
    const code = Array.isArray(children) ? children[0] : children;
    if (isValidElement(code)) {
      const el = code as ReactElement<{ className?: string; children?: ReactNode }>;
      if (el.props.className?.includes("language-mermaid")) {
        return <MermaidDiagram chart={textOf(el.props.children).trim()} />;
      }
    }
    return <pre {...props}>{children}</pre>;
  },
  a({ href = "", children, ...props }) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      >
        {children}
      </a>
    );
  },
  img({ alt = "", ...props }) {
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote images by URL
    return <img alt={alt} loading="lazy" decoding="async" {...props} />;
  },
  table({ children, ...props }) {
    return (
      <div className="not-prose my-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium" {...props}>
          {children}
        </table>
      </div>
    );
  },
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-brand prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal",
        "prose-pre:rounded-xl prose-pre:text-[0.85rem] [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "prose-img:rounded-xl prose-img:border",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false, plainText: ["mermaid", "text", "txt"] }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
