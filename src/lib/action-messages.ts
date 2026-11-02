import { getTranslations } from "next-intl/server";

/**
 * Server actions return user-facing result messages. Resolve them in the
 * request locale so toasts match the rest of the interface.
 */
export function actionMessages() {
  return getTranslations("Actions");
}
