"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({ shape: { borderRadius: 12 } });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
