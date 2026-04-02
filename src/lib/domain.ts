export function stripPort(hostname: string): string {
  return hostname.split(":")[0] ?? hostname;
}

export function getSubdomainFromHostname(hostname: string, rootDomain: string): string {
  const withoutPort = stripPort(hostname);
  const rootWithoutPort = stripPort(rootDomain);
  const suffix = `.${rootWithoutPort}`;

  return withoutPort.endsWith(suffix) ? withoutPort.slice(0, -suffix.length) : withoutPort;
}

export function getTenantLookupValues(hostname: string) {
  const domain = stripPort(hostname);
  const slug = domain.split(".")[0] ?? domain;

  return { domain, slug };
}
