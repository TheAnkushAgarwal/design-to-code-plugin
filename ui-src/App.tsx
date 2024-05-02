import { useState, useEffect } from "react";

import "./App.css";


function App() {
  const [generatedHTML, setGeneratedHTML] = useState('html code');
  const [generatedCSS, setGeneratedCSS] = useState('css code');

  useEffect(() => {
    // Listen for messages from the plugin code
    window.onmessage = (event) => {
      const { type, htmlCode, cssCode } = event.data.pluginMessage;
      if (type === 'generatedCode') {
        setGeneratedHTML(htmlCode);
        setGeneratedCSS(cssCode);
      }
    };
  }, []);

  return (
    <div className="parent-div">
      <h1>Design to Code Plugin</h1>
      <h2>index.html Code:</h2>
      <textarea value={generatedHTML} className="textBox"readOnly />
      <h2>styles.css Code:</h2>
      <textarea value={generatedCSS} className="textBox" readOnly />
    </div>
  );
}

export default App;
