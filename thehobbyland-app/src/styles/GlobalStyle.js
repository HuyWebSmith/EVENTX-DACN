import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%; /* 1rem = 10px */
    
  }
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: auto;
}

  body {
    margin: 0;
    padding: 0;
    background: #fff;
    font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Use a monospace for code elements */
  code, kbd, pre, samp {
    font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace;
  }
`;

export default GlobalStyle;
