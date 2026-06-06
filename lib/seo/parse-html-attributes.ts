/** Parses attribute string from a single HTML tag opening fragment. */
export function parseHtmlAttributes(attrString: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};

  const quoted =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = quoted.exec(attrString)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }

  const booleanNames = [
    "crossorigin",
    "async",
    "defer",
    "disabled",
    "nomodule",
    "hidden",
    "itemscope",
  ];
  for (const name of booleanNames) {
    const re = new RegExp(`\\b${name}\\b(?:\\s*=\\s*["'][^"']*["'])?`, "i");
    if (re.test(attrString)) {
      attrs[name.toLowerCase()] = true;
    }
  }

  return attrs;
}

/** Maps parsed HTML attrs to valid React DOM props (e.g. crossorigin → crossOrigin). */
export function htmlAttrsToReactProps(
  attrs: Record<string, string | boolean>,
): Record<string, string | boolean | undefined> {
  const props: Record<string, string | boolean | undefined> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "crossorigin") {
      if (value === true || value === "" || value === "anonymous") {
        props.crossOrigin = "anonymous";
      } else if (value === "use-credentials") {
        props.crossOrigin = "use-credentials";
      } else if (typeof value === "string") {
        props.crossOrigin = value;
      }
      continue;
    }
    if (key === "class") {
      props.className = String(value);
      continue;
    }
    if (key === "for") {
      props.htmlFor = String(value);
      continue;
    }
    props[key] = value;
  }

  return props;
}
