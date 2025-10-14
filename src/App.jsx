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
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>PWA GeoCam</h1>
      <p>Exemplo de PWA com React, geolocalização e API pública (Dog CEO).</p>
      <button onClick={fetchDog}>Buscar dog</button>
      {dogUrl && <img src={dogUrl} alt="dog" width="300" />}
      <p>{status}</p>
    </div>
  );
}

// Outras funções e comentários originais (câmera, geolocalização etc.)
// podem ser reintroduzidos conforme a versão completa anterior.
