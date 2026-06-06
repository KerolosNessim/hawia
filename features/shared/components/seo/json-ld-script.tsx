/**
 * JSON-LD in `<head>`. Use for structured data (not for meta/canonical — use `generateMetadata`).
 */
export function JsonLdScript({ json }: { json: string }) {
  if (!json.trim()) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
