import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./index.css";
import "@fontsource/public-sans";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { mergedTheme } from "./theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider>
      <CssVarsProvider theme={mergedTheme}>
        {/* must be used under CssVarsProvider */}
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </CssVarsProvider>
    </Provider>
  </React.StrictMode>
);
