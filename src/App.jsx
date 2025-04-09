import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function App() {
  const [machines, setMachines] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [code, setCode] = useState("QR kod hali skaner qilinmadi");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const API_URL = "https://0e84bcd063294f11.mokky.dev/sewing-machines";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setMachines(data);
        const checkedCount = data.filter((m) => m.checked).length;
        setScannedCount(checkedCount);
      })
      .catch((err) => console.error("Ma'lumotlarni olishda xatolik:", err));
  }, []);

  const startScanner = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        (errorMessage) => {}
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

  const onScanSuccess = async (decodedText) => {
    const match = machines.find((m) => m.serialNumber === decodedText);

    if (match && !match.checked) {
      try {
        await fetch(`${API_URL}/${match.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: true }),
        });

        const updatedMachines = machines.map((m) =>
          m.id === match.id ? { ...m, checked: true } : m
        );
        setMachines(updatedMachines);
        setScannedCount((prev) => prev + 1);
        setCode(`✅ ${match.serialNumber} belgilandi`);
      } catch (error) {
        setCode("❌ APIga yozishda xatolik yuz berdi");
      }
    } else if (match && match.checked) {
      setCode(`⚠️ ${match.serialNumber} allaqachon belgilangan`);
    } else {
      setCode("❌ QR mos kelmadi!");
    }

    stopScanner();
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📦 Inventarizatsiya skanneri</h1>

      <p>
        Belgilangan mashinalar: <strong>{scannedCount}/{machines.length}</strong>
      </p>

      {!scanning && (
        <button
          onClick={startScanner}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginTop: "20px",
            backgroundColor: "#22c55e",
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
        <strong>QR kod natijasi:</strong><br />
        {code}
      </p>
    </div>
  );
}

export default App;
