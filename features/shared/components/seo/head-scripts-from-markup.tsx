import { parseHeadScriptsMarkup } from "@/lib/seo/parse-head-scripts";

/**
 * Renders each `<script>` from CMS `custom_head_scripts` as its own tag in `<head>`.
 * (Wrapping the whole CMS string in one `<script>` would break GTM and similar snippets.)
 */
export function HeadScriptsFromMarkup({ markup }: { markup: string | null | undefined }) {
  const scripts = parseHeadScriptsMarkup(markup);
  if (!scripts.length) return null;

  return (
    <>
      {scripts.map((script, index) => {
        const key = script.id || script.src || `inline-${index}`;
        if (script.src) {
          return (
            <script
              key={key}
              src={script.src}
              async={script.async || undefined}
              defer={script.defer || undefined}
              id={script.id}
              type={script.type}
            />
          );
        }
        if (!script.content) return null;
        return (
          <script
            key={key}
            id={script.id}
            type={script.type}
            dangerouslySetInnerHTML={{ __html: script.content }}
          />
        );
      })}
    </>
  );
}
