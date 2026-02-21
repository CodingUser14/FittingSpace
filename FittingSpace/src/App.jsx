import { useRef, useEffect, useState } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [delaySeconds, setDelaySeconds] = useState(5); // 🔥 Change this to control delay

  // --- GET CAMERA ---
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1920, height: 1080 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => console.error(err));
  };

  // --- START COUNTDOWN ---
  const startCountdown = () => {
    setCountdown(delaySeconds);

    let timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- ACTUAL PHOTO CAPTURE ---
  const capturePhoto = async () => {
    const width = 414;
    const height = width * (16 / 9);

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    setHasPhoto(true);

    setIsProcessing(true);

  

    setIsProcessing(false);
    // --- END ---
  };

  useEffect(() => {
    getVideo();
  }, []);

  const closePhoto = () => {
    setHasPhoto(false);
    setDetectionData(null);
  };

  return (
    <div className="App">
      <div className="camera">

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="countdown">
            {countdown}
          </div>
        )}

        <video
          ref={videoRef}
          style={{ display: hasPhoto ? 'none' : 'block' }}
        ></video>

        {!hasPhoto && countdown === null && (
          <button onClick={startCountdown}>
            Capture
          </button>
        )}

        <div className={'result ' + (hasPhoto ? 'hasPhoto' : '')}>
          <canvas ref={photoRef}></canvas>

          {hasPhoto && (
            <div className="controls">
              {isProcessing && <p>Analyzing Body...</p>}

              {detectionData?.valid ? (
                <>
                  <p>✅ This looks good!</p>
                  <button onClick={() => alert("Moving to dressing room!")}>
                    Continue
                  </button>
                </>
              ) : (
                !isProcessing && <p>❌ Body not detected. Try again.</p>
              )}

              <button onClick={closePhoto}>RESTART</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;