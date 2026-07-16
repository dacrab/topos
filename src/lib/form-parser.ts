export function parseFormData(formData: FormData): {
  get: (key: string) => string | null;
  getNum: (key: string) => number | null;
  getBool: (key: string) => boolean;
  getJson: <T>(key: string, fallback: T) => T;
} {
  const get = (key: string) => formData.get(key)?.toString().trim() || null;
  const getNum = (key: string) => {
    const val = get(key);
    if (!val) return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  };
  const getBool = (key: string) => {
    const val = formData.get(key);
    return val === "on" || val === "true" || val === "1";
  };
  const getJson = <T>(key: string, fallback: T): T => {
    const val = get(key);
    if (!val) return fallback;
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  };

  return { get, getNum, getBool, getJson };
}
