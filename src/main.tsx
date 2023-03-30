import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./index.css";
import "@fontsource/public-sans";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const customTheme = extendTheme({
  typography: {
    display1: {
      overflowWrap: "anywhere",
    },
    display2: {
      overflowWrap: "anywhere",
    },
    h1: {
      overflowWrap: "anywhere",
    },
    h2: {
      overflowWrap: "anywhere",
    },
    h3: {
      overflowWrap: "anywhere",
    },
    h4: {
      overflowWrap: "anywhere",
    },
    body1: {
      overflowWrap: "anywhere",
    },
    body2: {
      overflowWrap: "anywhere",
    },
    body3: {
      overflowWrap: "anywhere",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider>
      <CssVarsProvider theme={customTheme}>
        {/* must be used under CssVarsProvider */}
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </CssVarsProvider>
    </Provider>
  </React.StrictMode>
);
