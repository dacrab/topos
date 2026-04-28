export function parseFormData(formData: FormData) {
  const get = (key: string) => formData.get(key)?.toString().trim() || null;
  const getNum = (key: string) => {
    const val = get(key);
    return val ? Number(val) : null;
  };
  const getBool = (key: string) => formData.get(key) === "on";
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
