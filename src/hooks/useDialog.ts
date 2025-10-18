import { createContext, useContext } from "react";
import type { DialogOptions } from "./DialogProvider";

export const DialogContext = createContext<(options: DialogOptions) => void>(() => { });

export function useDialog() {
  return useContext(DialogContext);
}
