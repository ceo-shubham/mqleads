export interface UaInfo {
  device: string;
  browser: string;
  os: string;
}

/** Minimal UA string parser — good enough for MVP dashboards. */
export function parseUa(ua: string): UaInfo {
  const u = ua || "";

  let device = "desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(u)) device = /iPad|Tablet/i.test(u) ? "tablet" : "mobile";

  let browser = "unknown";
  if (/Edg\//.test(u)) browser = "Edge";
  else if (/OPR\//.test(u) || /Opera/.test(u)) browser = "Opera";
  else if (/Chrome\//.test(u)) browser = "Chrome";
  else if (/Safari\//.test(u)) browser = "Safari";
  else if (/Firefox\//.test(u)) browser = "Firefox";
  else if (/MSIE|Trident/.test(u)) browser = "IE";

  let os = "unknown";
  if (/Windows NT/.test(u)) os = "Windows";
  else if (/Android/.test(u)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(u)) os = "iOS";
  else if (/Mac OS X/.test(u)) os = "macOS";
  else if (/Linux/.test(u)) os = "Linux";
  else if (/CrOS/.test(u)) os = "ChromeOS";

  return { device, browser, os };
}
