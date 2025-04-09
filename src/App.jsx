import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_URL = "https://0e84bcd063294f11.mokky.dev/sewing-machines";

function App() {
  const [machines, setMachines] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setMachines(data);
    setScannedCount(data.filter((m) => m.checked).length);
  };

  const startScanner = async () => {
    if (scanning) return;
    setScanning(true);

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          const match = machines.find(
            (machine) => machine.serialNumber === decodedText
          );

          if (match && !match.checked) {
            await fetch(`${API_URL}/${match.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ checked: true }),
            });
            fetchMachines();
          }
        },
        (errorMessage) => {}
      )
      .catch((err) => {
        console.error("Scanner error:", err);
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

  const resetInventory = async () => {
    for (const machine of machines) {
      if (machine.checked) {
        await fetch(`${API_URL}/${machine.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: false }),
        });
      }
    }
    fetchMachines();
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>📦 Inventarizatsiya QR Skanner</h1>

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={startScanner}
          disabled={scanning}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            marginRight: 10,
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ▶️ Skannerni boshlash
        </button>

        <button
          onClick={stopScanner}
          disabled={!scanning}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            marginRight: 10,
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ⏹ To‘xtatish
        </button>

        <button
          onClick={resetInventory}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div id="reader" style={{ width: 300, margin: "0 auto" }}></div>

      <p style={{ marginTop: 30, fontSize: 18 }}>
        ✅ Belgilangan: {scannedCount} / {machines.length}
      </p>
    </div>
  );
}

export default App;
