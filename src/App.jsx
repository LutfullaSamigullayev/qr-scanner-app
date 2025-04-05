import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function App() {
  const [code, setCode] = useState("QR kod hali skaner qilinmadi");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScan = async () => {
    setScanning(true);

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          }, // bu ramka joyi
        },
        (decodedText) => {
          setCode(decodedText);
          stopScan();
        },
        (errorMessage) => {
          // xatolarni ko‘rsatmaymiz
        }
      );
    }
  };

  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setScanning(false);
      });
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📷 QR Kod Skanner</h1>

      {!scanning && (
        <button
          onClick={startScan}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginTop: "20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📤 Skannerni boshlash
        </button>
      )}

      <div id="reader" style={{ width: "300px", margin: "20px auto" }}></div>

      {scanning && (
        <button
          onClick={stopScan}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          ✖ Skannerni to‘xtatish
        </button>
      )}

      <p style={{ fontSize: "18px", marginTop: "20px", wordWrap: "break-word" }}>
        <strong>QR kod matni:</strong><br />
        {code}
      </p>
      
    </div>
  );
}

export default App;
