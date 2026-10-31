import { createContext, useContext, type ReactNode } from "react";
import { en } from "./en";

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const I18nContext = createContext<Messages>(en);

/** Supplies a message catalog; defaults to English. Swap `messages` to localize. */
export function I18nProvider({
  children,
  messages = en,
}: {
  children: ReactNode;
  messages?: Messages;
}) {
  return (
    <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>
  );
}

/** Returns a translator: `t("nav.login")`, with optional `{name}` interpolation. */
export function useT() {
  const messages = useContext(I18nContext);
  return (key: MessageKey, values: Record<string, string | number> = {}) =>
    messages[key].replace(/\{(\w+)\}/g, (_, name: string) =>
      String(values[name] ?? `{${name}}`),
    );
}
