"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteViewerProps {
  content: string;
  onWikilink?: (noteName: string) => void;
}

// Match [[Note]] or [[Note|Alias]] or [[Note#Heading]]
const WIKILINK_INLINE = /\[\[([^\]|#]+)(?:[|#]([^\]]*))?\]\]/g;

/**
 * Render Obsidian-flavoured markdown with [[wikilink]] support.
 * Wikilinks are not handled by remark-wiki-link (adds a large dep tree);
 * instead we pre-process the content to replace [[Note]] with a custom
 * `<wikilink data-target="Note">Note</wikilink>` element, then map that
 * element to a clickable button in ReactMarkdown components.
 */
export function NoteViewer({ content, onWikilink }: NoteViewerProps) {
  // Pre-process: replace [[Note|Alias]] with a sentinel we can parse
  const processed = content.replace(WIKILINK_INLINE, (_match, target: string, alias?: string) => {
    const display = alias?.trim() || target.trim();
    // Escape markdown special chars in display text to prevent XSS via alias
    const sanitizedDisplay = display.replace(/[[\]()]/g, (c) => `\\${c}`);
    return `[${sanitizedDisplay}](wikilink://${encodeURIComponent(target.trim())})`;
  });

  return (
    <div className="prose prose-invert prose-sm max-w-none overflow-y-auto px-6 py-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          a({ href, children, node: _node, ...props }) {
            if (href?.startsWith("wikilink://")) {
              const target = decodeURIComponent(href.replace("wikilink://", ""));
              // Don't spread anchor props onto button — type mismatch
              return (
                <button
                  type="button"
                  className="cursor-pointer text-indigo-400 underline decoration-dashed hover:text-indigo-300"
                  onClick={() => onWikilink?.(target)}
                >
                  {children}
                </button>
              );
            }
            // Reject javascript: and other unsafe hrefs
            if (
              href &&
              !href.startsWith("http://") &&
              !href.startsWith("https://") &&
              !href.startsWith("mailto:") &&
              !href.startsWith("#")
            ) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { ref: _ref, ...safeProps } = props as typeof props & { ref?: unknown };
              return <span {...safeProps}>{children}</span>;
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
          // Style code blocks in Helm dark theme
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          code({ className, children, node: _node, ...props }) {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className={`${className ?? ""} block overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-300`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-300" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
