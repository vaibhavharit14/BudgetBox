export function toXML(budget: Record<string, any>) {
  const entries = Object.entries(budget || {});
  const inner = entries
    .map(([key, val]) => `  <${key}>${String(val ?? "")}</${key}>`)
    .join("\n");

  return `<budget>\n${inner}\n</budget>\n`;
}