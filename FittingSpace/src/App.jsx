import { useRef, useEffect, useState } from 'react'
import { Pose } from '@mediapipe/pose' 
import './App.css'

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const poseRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /*Initiazliing mediapipe*/  
  useEffect(() => {
    getVideo();

    const pose = newPose({
      locateFile: (file) => 'h'

    });

  })

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1920, height: 1080 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => console.error(err));
  }

  const takePhoto = async () => {
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
    
  }

  

  useEffect(() => {
    getVideo();
  }, []); 

  const closePhoto = () => {
    setHasPhoto(false);
    setDetectionData(null);
  }

  return (
    <div className="App">
      <div className="camera">
        <video ref={videoRef} style={{ display: hasPhoto ? 'none' : 'block' }}></video>
        {!hasPhoto && <button onClick={takePhoto}>Capture</button>}

        <div className={'result ' + (hasPhoto ? 'hasPhoto' : '')}>
          <canvas ref={photoRef}></canvas>
          
          {hasPhoto && (
            <div className="controls">
              {isProcessing && <p>Analyzing Body...</p>}
              
              {detectionData?.valid ? (
                <>
                  <p>✅ This looks good!</p>
                  <button onClick={() => alert("Moving to dressing room!")}>Continue</button>
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