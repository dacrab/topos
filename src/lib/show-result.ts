import { toast } from "sonner";

export function showResult(result: { success: boolean; message: string }) {
  toast[result.success ? "success" : "error"](result.message);
}
