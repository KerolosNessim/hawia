/**
 * CMS `custom_body_scripts` sometimes includes `<meta>` or `<link rel="canonical">`.
 * Those must live in `<head>`, not `<body>`.
 */
export function partitionBodyScripts(html: string | null | undefined): {
  headMarkup: string;
  bodyMarkup: string;
} {
  if (!html?.trim()) {
    return { headMarkup: "", bodyMarkup: "" };
  }

  const headParts: string[] = [];
  let body = html;

  const patterns = [
    /<meta\b[\s\S]*?>/gi,
    /<link\b[^>]*\brel=["'](?:canonical|alternate|icon|apple-touch-icon)["'][^>]*>/gi,
    /<title\b[\s\S]*?<\/title>/gi,
  ];

  for (const pattern of patterns) {
    body = body.replace(pattern, (match) => {
      headParts.push(match);
      return "";
    });
  }

  return {
    headMarkup: headParts.join("\n"),
    bodyMarkup: body.trim(),
  };
}
