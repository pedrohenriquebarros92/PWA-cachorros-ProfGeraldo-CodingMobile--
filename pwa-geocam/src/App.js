const { useState, useRef, useEffect } = React;

function App() {
  const [loc, setLoc] = useState(null);
  const [locError, setLocError] = useState(null);
  const [taking, setTaking] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [dogUrl, setDogUrl] = useState(null);
  const [status, setStatus] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  async function fetchDog() {
    setStatus('Buscando imagem de dog...');
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      if (data && data.status === 'success') {
        setDogUrl(data.message);
        setStatus('Imagem de dog carregada.');
      } else setStatus('Resposta inesperada da API.');
    } catch (err) {
      setStatus('Erro ao buscar API: ' + err.message);
    }
  }

  function getLocation() {
    setLoc(null);
    setLocError(null);
    setStatus('Obtendo localização...');

    if (!('geolocation' in navigator)) {
      setLocError('Geolocalização não suportada.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLoc({ latitude, longitude, accuracy });
        setStatus('Localização obtida.');
      },
      err => {
        setLocError(err.message);
        setStatus('Erro ao obter localização.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function startCamera() {
    setStatus('Iniciando câmera...');
    setTaking(true);
    setPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus('Câmera ativa.');
    } catch (err) {
      setTaking(false);
      setStatus('Erro ao acessar câmera: ' + err.message);
    }
  }

  function stopCamera() {
    setTaking(false);
    setStatus('Câmera parada.');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function takePhotoFromVideo() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(dataUrl);
    stopCamera();
    setStatus('Foto capturada.');
  }

  function onFileInputChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
    setStatus('Foto carregada.');
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./public/sw.js').catch(() => {});
    }
  }, []);

  return (
    <div>
      <h1>PWA GeoCam</h1>
      <p>Tire fotos, salve coordenadas e veja uma imagem de dog (API pública).</p>

      <section>
        <h2>Geolocalização</h2>
        <button className="bg-blue-600 px-3 py-1 rounded" onClick={getLocation}>
          Obter localização
        </button>
        {loc && (
          <p>
            Latitude: {loc.latitude} <br />
            Longitude: {loc.longitude} <br />
            Precisão: {loc.accuracy}m
          </p>
        )}
        {locError && <p className="text-red-600">Erro: {locError}</p>}
      </section>

      <section>
        <h2>Câmera</h2>
        {!taking ? (
          <button className="bg-green-600 px-3 py-1 rounded" onClick={startCamera}>
            Abrir câmera
          </button>
        ) : (
          <button className="bg-red-600 px-3 py-1 rounded" onClick={stopCamera}>
            Parar câmera
          </button>
        )}
        <label className="px-3 py-1 rounded bg-gray-200 cursor-pointer">
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onFileInputChange} />
          Carregar foto
        </label>
        {taking && (
          <button className="bg-indigo-600 px-3 py-1 rounded" onClick={takePhotoFromVideo}>
            Tirar foto
          </button>
        )}
        <div className="video-preview">
          {taking && <video ref={videoRef} autoPlay playsInline />}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        {photo && (
          <div>
            <h3>Foto capturada</h3>
            <img src={photo} alt="capturada" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }} />
            <a download={`foto-${Date.now()}.jpg`} href={photo} className="bg-gray-800 px-3 py-1 rounded">
              Baixar
            </a>
          </div>
        )}
      </section>

      <section>
        <h2>Dog aleatório (API pública)</h2>
        <button className="bg-yellow-600 px-3 py-1 rounded" onClick={fetchDog}>
          Buscar dog
        </button>
        {dogUrl && <img src={dogUrl} alt="dog" style={{ width: '100%', maxHeight: '420px' }} />}
      </section>

      <section>
        <h2>Status</h2>
        <p>{status}</p>
      </section>
    </div>
  );
}
