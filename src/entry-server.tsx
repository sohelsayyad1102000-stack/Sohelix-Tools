import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './components/App';

export function render(url: string) {
  const helmetContext: any = {};
  
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );

  return {
    html: html.trim(),
    helmet: helmetContext.helmet
  };
}
