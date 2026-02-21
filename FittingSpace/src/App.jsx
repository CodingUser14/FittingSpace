import { useRef, useEffect, useState } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [delaySeconds, setDelaySeconds] = useState(5); 

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
    const width = 1920;
    const height = 1080;

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    setHasPhoto(true);

    setIsProcessing(true);

    //converting canvas into a img file
    photo.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'capture.png');

      try {
          //send it to python server
          const response = await fetch('http://127.0.0.1:5050/checking', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          // save the coordinates python found
          setDetectionData(result);

          //TESTING PURPOSES DELETE AFTERWARDS
          if (result.valid && result.landmarks) {
            const ctx = photo.getContext('2d');
            ctx.fillStyle = "red"; // Color for the dots
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;

            // result.landmarks is the filtered_points dictionary from Python
            Object.values(result.landmarks).forEach(point => {
              if (point.visible) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI); // Draw a circle
                ctx.fill();
                ctx.stroke();
              }
            });
          }
          //******************** */

      } catch (err) {
        console.error("Couldn't reach Python server: ", err);
      } finally {
        setIsProcessing(false);
      }
    }, 'image/png');
    }

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

        {countdown !== null && (
          <div className="countdown">
            {countdown}
          </div>
        )}

        <video
          ref={videoRef}
          onPause={(e) => e.target.play()} // if it pauses force it to continue
          style={{ display: hasPhoto ? 'none' : 'block' }}
          playsInline // prevents browser from opening the vid in its own native player
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