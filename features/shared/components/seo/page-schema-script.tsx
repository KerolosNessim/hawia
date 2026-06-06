import { JsonLdScript } from "./json-ld-script";

/** Page-specific JSON-LD graph (second script alongside global schema in layout). */
export function PageSchemaScript({ json }: { json: string }) {
  return <JsonLdScript json={json} />;
}
