import "@fontsource-variable/fira-code";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React, { Suspense } from "react";
import { Outlet } from "react-router";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  typography: {
    fontFamily: `"Open Sans Variable", "Noto Sans SC Variable", sans-serif`,
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Suspense>
        <Outlet />
      </Suspense>
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;
