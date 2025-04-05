import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function App() {
  const [code, setCode] = useState("QR kod hali skaner qilinmadi");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" }, // 📷 Orqa kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // 📦 Ramka o'lchami
        },
        (decodedText) => {
          setCode(decodedText); // ✅ to‘g‘ri funksiya
          stopScanner(); // ✅ to‘g‘ri funksiya nomi
        },
        (errorMessage) => {
          // 👻 Xatoliklarni ko‘rsatmaslik
        }
      )
      .catch((err) => {
        console.error("Skannerni ishga tushirishda xatolik:", err);
        setScanning(false);
      });
  };

  const stopScanner = () => {
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
          onClick={startScanner}
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

      <div
        id="reader"
        style={{
          width: "300px",
          height: "300px",
          margin: "20px auto",
          border: scanning ? "2px dashed #3b82f6" : "none",
          borderRadius: "8px",
        }}
      ></div>

      {scanning && (
        <button
          onClick={stopScanner}
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
