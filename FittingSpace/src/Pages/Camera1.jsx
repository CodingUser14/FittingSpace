import { useRef, useEffect, useState } from 'react'

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [delaySeconds, setDelaySeconds] = useState(3); 
  const [showSettings, setShowSettings] = useState(false); 

  // Brightness and Contrast
  const [brightness, setBrightness] = useState(100); 
  const [contrast, setContrast] = useState(100); 

  // Button Styling 
  const btnStyle = { padding: '5px 12px', cursor: 'pointer' }; 
  
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
  
  setShowSettings(false); 
    if (delaySeconds === 0) { 
      capturePhoto(); 
    return; 
    } 
  
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

    ctx.filter = "brightness(${brightness}%)contrast(${contrast}%)";
    ctx.drawImage(video, 0,0,width,height);

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

  const decreaseTimer = () => setDelaySeconds(prev => Math.max(0, prev - 1));
  const  increaseTimer = () => setDelaySeconds(prev => prev + 1);

  return (
  <div className="App" style={{ position: 'relative' }}>
    <div className="camera">
      
      {/* Settings Icon Button */}
      {!hasPhoto && countdown === null && (
        <button
          class="setting"
          title="Settings"
          onClick={() => setShowSettings(prev => !prev)}>
          ⚙️
        </button>
      )}

      {/* Settings Popup Modal */}
      {showSettings && !hasPhoto && countdown === null && (
        <div class="popup_window">
          <h3 style={{ margin: 0 }}>Settings</h3>

          {/* Delay Control */}
          <div class="delay_control">
            <span style={{ fontWeight: '500' }}>Delay</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>{delaySeconds}s</strong>
              <button
                onClick={decreaseTimer}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                -
              </button>
              <button
                onClick={increaseTimer}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                +
              </button>
            </div>
          </div>

          {/* Brightness Control */}
          <div class="brightness_control">
            <span style={{ fontWeight: '500' }}>Light</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>{brightness}%</strong>
              <button
                onClick={() => setBrightness(prev => Math.max(0, prev - 10))}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                -
              </button>
              <button
                onClick={() => setBrightness(prev => Math.min(200, prev + 10))}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                +
              </button>
            </div>
          </div>

          {/* Contrast Control */}
          <div class="contrast_control">
            <span style={{ fontWeight: '500' }}>Contrast</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>{contrast}%</strong>
              <button
                onClick={() => setContrast(prev => Math.max(0, prev - 10))}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                -
              </button>
              <button
                onClick={() => setContrast(prev => Math.min(200, prev + 10))}
                style={{ ...btnStyle, padding: '4px 10px' }}>
                +
              </button>
            </div>
          </div>

          <button
            class="done_setting"
            onClick={() => setShowSettings(false)}>
            Done
          </button>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div
          className="countdown">
          {countdown}
        </div>
      )}

      <video
        ref={videoRef}
        style={{
          display: hasPhoto ? 'none' : 'block',
          width: '100%',
          filter: `brightness(${brightness}%) contrast(${contrast}%)`
        }}
      ></video>

      {/* Capture Button */}
      {!hasPhoto && countdown === null && (
        <button
          class="capture-btn"
          onClick={startCountdown}>
        </button>
      )}

      <div
        className={'result ' + (hasPhoto ? 'hasPhoto' : '')}
        style={{ display: hasPhoto ? 'block' : 'none' }}>
        <canvas ref={photoRef}></canvas>

        {hasPhoto && (
          <div className="controls">
            {isProcessing && <p>Analyzing Body...</p>}
            {detectionData?.valid ? ( <>
                <p>✅ This looks fantastic!</p>
                <button onClick={() => alert("Moving to dressing room!")}>
                  Continue
                </button>
              </>
            ) : (
              !isProcessing && <p>❌ Body not detected. Try again.</p>
            )}

            <button onClick={closePhoto}>RETAKE</button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
export default App;