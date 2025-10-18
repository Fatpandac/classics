export function jsonToBase64Url(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToJson(base64Url: string) {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const json = decodeURIComponent(escape(atob(base64)));
  return JSON.parse(json);
}
