import React from 'react';
import ReactDOM from 'react-dom/client'
import tailwindCSS from '@/assets/styles/rawtailwind.css?raw';
import AutoCompleteCommand from '@/pages/content/AutoCompleteCommand';

setTimeout(() => {
  const shadowHost = document.createElement('div');
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const reactContainer = document.createElement('div');
  shadowRoot.appendChild(reactContainer);
  reactContainer.id = '__application-auto-complete_root';

  // Inject tailwindcss manually to shadowRoot to prevent it leaking styles to every page
  const style = document.createElement('style');
  style.textContent = tailwindCSS;
  shadowRoot.appendChild(style);

  ReactDOM.createRoot(reactContainer).render(
    <React.StrictMode>
      <div className="__application-auto-complete_root">
        <div id="__application-auto-complete_portal" />
        <AutoCompleteCommand />
      </div>
    </React.StrictMode>,
  )
}, 1500)
