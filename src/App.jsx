import React, { useState, useRef, useEffect } from 'react'

// PWA GeoCam — exemplo educacional com comentários e anotações
// (mantive estrutura e comentários didáticos)

export default function App() {
  const [status, setStatus] = useState('Pronto');
  const [dogUrl, setDogUrl] = useState(null);

  async function fetchDog() {
    setStatus('Buscando imagem...');
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      setDogUrl(data.message);
      setStatus('Imagem carregada!');
    } catch (err) {
      setStatus('Erro: ' + err.message);
    }
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(err => console.error('SW registration failed:', err));
    }
  }, []);

 return (
  <div className="app-container">
    <header className="header">
      <div className="logo-circle">🐶</div>
      <div>
        <h1>PWA GeoCam</h1>
        <p className="lead">Exemplo de PWA com React, geolocalização e API pública (Dog CEO).</p>
      </div>
    </header>

    <div className="card">
      <div className="controls">
        <button className="button" onClick={fetchDog}>Buscar dog</button>
        <div className="meta small">Dica: toque para buscar uma nova imagem</div>
      </div>

      <div className="brindle-bar" aria-hidden="true"></div>

      {dogUrl && (
        <div className="img-wrap center">
          <img className="dog-photo" src={dogUrl} alt="Foto aleatória de cachorro" />
        </div>
      )}

      <p className="status">{status}</p>
    </div>

    <footer className="footer">App educativo — cores inspiradas em pelagens</footer>
  </div>
);



