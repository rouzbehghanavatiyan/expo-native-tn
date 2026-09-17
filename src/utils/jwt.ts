function base64UrlDecode(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let i = 0;
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");

  while (i < clean.length) {
    const enc1 = chars.indexOf(clean.charAt(i++));
    const enc2 = chars.indexOf(clean.charAt(i++));
    const enc3 = chars.indexOf(clean.charAt(i++));
    const enc4 = chars.indexOf(clean.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }

  return decodeURIComponent(
    output
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

export function decodeJwtPayload<T = Record<string, any>>(
  token: string,
): T | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const json = base64UrlDecode(payloadSegment);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
