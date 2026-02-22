import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Page1() {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const imageUrl = state?.imageUrl || "";
    const landmarks = state?.landmarks || null; 

    const [wardrobe, setWardrobe] = useState([]);
    const [garmentType, setGarmentType] = useState("tshirt");
    
    // Track one shirt and one pair of pants simultaneously
    const [outfit, setOutfit] = useState({ tshirt: null, pants: null });

    const getPoint = (id) => {
        const pointsArray = landmarks?.poseLandmarks || landmarks;
        if (!pointsArray || !pointsArray[id]) return { x: 50, y: 50 };
        const pt = pointsArray[id];
        let x = pt.x > 1 ? (pt.x / 1920) * 100 : pt.x * 100;
        let y = pt.y > 1 ? (pt.y / 1080) * 100 : pt.y * 100;
        return { x, y };
    };

    // Helper function to calculate styles for any garment type
    const getGarmentStyle = (item, type) => {
        if (!item || !landmarks) return { display: 'none' };

        const lSh = getPoint(11); const rSh = getPoint(12);
        const lHip = getPoint(23); const rHip = getPoint(24);
        
        let centerX, centerY, width, rotation;

        if (type === "tshirt") {
            centerX = (lSh.x + rSh.x) / 2;
            const torsoH = (lHip.y + rHip.y) / 2 - (lSh.y + rSh.y) / 2;
            centerY = ((lSh.y + rSh.y) / 2) + (torsoH * 0.45);
            width = Math.sqrt(Math.pow(rSh.x - lSh.x, 2) + Math.pow(rSh.y - lSh.y, 2)) * 2.2;
            rotation = (Math.atan2(lSh.y - rSh.y, lSh.x - rSh.x) * 180) / Math.PI;
        } else {
            // --- PANTS LOGIC ---
            centerX = (lHip.x + rHip.x) / 2;
            
            const hipY = (lHip.y + rHip.y) / 2;
            const kneeY = (getPoint(25).y + getPoint(26).y) / 2;
            const legLength = kneeY - hipY;

            /**
             * VERTICAL ADJUSTMENT:
             * 0.5 is the midpoint between hips and knees.
             * Increase this (e.g., 0.65 or 0.7) to move the pants DOWN.
             * Decrease this (e.g., 0.4) to move the pants UP.
             */
            centerY = hipY + (legLength * 0.7); 

            // Scale based on hip width
            const hipDist = Math.sqrt(Math.pow(rHip.x - lHip.x, 2) + Math.pow(rHip.y - lHip.y, 2));
            width = hipDist * 2.8; 

            // Rotation based on hip tilt
            rotation = (Math.atan2(lHip.y - rHip.y, lHip.x - rHip.x) * 180) / Math.PI;
        }

        return {
            position: 'absolute',
            left: `${centerX}%`,
            top: `${centerY}%`,
            width: `${width}%`,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            zIndex: type === "tshirt" ? 101 : 100,
            pointerEvents: 'none',
            display: 'block',
            transition: 'all 0.1s ease-out'
        };
    };

    const handleSelect = (item) => {
        setOutfit(prev => ({
            ...prev,
            // If already selected, toggle it off (null), otherwise set it
            [garmentType]: prev[garmentType]?.id === item.id ? null : item
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newItems = files.map((file, index) => ({
            id: Date.now() + index,
            url: URL.createObjectURL(file),
            type: garmentType 
        }));
        setWardrobe((prev) => [...newItems, ...prev]);
        e.target.value = null; 
    };

    return (
        <div className="app-shell">
            <button className="back-button" onClick={() => navigate("/Camera1")}>← Back</button>

            <div className="main-content">
                <section className="person-viewer">
                    <div className="image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={imageUrl} alt="person" className="person-img" style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh' }} />
                        
                        {/* Always try to render both slots */}
                        {outfit.pants && (
                            <img src={outfit.pants.url} style={getGarmentStyle(outfit.pants, "pants")} alt="pants-overlay" />
                        )}
                        {outfit.tshirt && (
                            <img src={outfit.tshirt.url} style={getGarmentStyle(outfit.tshirt, "tshirt")} alt="shirt-overlay" />
                        )}
                    </div>
                </section>

                <aside className="wardrobe-sidebar">
                    <div className="sidebar-header">
                        <h2>Wardrobe</h2>
                        <div className="toggle-group">
                            <button className={garmentType === "tshirt" ? "active" : ""} onClick={() => setGarmentType("tshirt")}>T-Shirts</button>
                            <button className={garmentType === "pants" ? "active" : ""} onClick={() => setGarmentType("pants")}>Pants</button>
                        </div>
                    </div>

                    <div className="wardrobe-box">
                        <div className="garment-grid">
                            {wardrobe.filter(item => item.type === garmentType).map((item) => (
                                <div 
                                    key={item.id} 
                                    className={`garment-item ${outfit[garmentType]?.id === item.id ? 'selected' : ''}`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <img src={item.url} alt="preview" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <label htmlFor="file-upload" className="upload-trigger">Upload {garmentType === "tshirt" ? "Shirt" : "Pants"}</label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} multiple hidden />
                </aside>
            </div>
        </div>
    );
}