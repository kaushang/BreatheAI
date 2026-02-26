/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes ThemeProvider to enable
 * dark/light mode toggling. Uses the "class" attribute strategy
 * for Tailwind CSS dark mode compatibility.
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
