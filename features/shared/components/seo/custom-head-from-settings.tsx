import { HeadScriptsFromMarkup } from "@/features/shared/components/seo/head-scripts-from-markup";
import { HeadTagsFromMarkup } from "@/features/shared/components/seo/head-tags-from-markup";

/**
 * Renders all supported tags from Settings → `custom_head_scripts`:
 * `<link>`, `<meta>`, and `<script>` (plain text between tags is ignored).
 */
export function CustomHeadFromSettings({
  markup,
}: {
  markup: string | null | undefined;
}) {
  if (!markup?.trim()) return null;

  return (
    <>
      <HeadTagsFromMarkup markup={markup} />
      <HeadScriptsFromMarkup markup={markup} />
    </>
  );
}
