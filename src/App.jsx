import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

function App() {
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [scanning, setScanning] = useState(false);
  const [currentMachine, setCurrentMachine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(null);
  const scannerRef = useRef(null);

  const apiBase = "https://0e84bcd063294f11.mokky.dev";

  useEffect(() => {
    fetch(`${apiBase}/sewing-machines`)
      .then((res) => res.json())
      .then(setMachines)
      .catch(console.error);

    fetch(`${apiBase}/filial`)
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch(console.error);
  }, []);

  const startScanner = () => {
    if (scanning) return;
    setScanning(true);
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const machine = machines.find(
            (m) => m.serialNumber === decodedText && m.location === selectedLocation
          );

          if (machine) {
            setCurrentMachine(machine);
            if (machine.checked) {
              setStatus("success");
              stopScanner();
            } else {
              setShowModal(true);
              stopScanner();
            }
          }
        }
      )
      .catch((err) => {
        console.error("Scanner xatosi:", err);
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

  const handleConfirm = async () => {
    if (currentMachine) {
      await fetch(`${apiBase}/sewing-machines/${currentMachine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: true }),
      });

      setMachines((prev) =>
        prev.map((m) =>
          m.id === currentMachine.id ? { ...m, checked: true } : m
        )
      );
      setStatus("success");
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setStatus("cancel");
    setShowModal(false);
  };

  const handleReset = async () => {
    const resetRequests = machines.map((m) =>
      fetch(`${apiBase}/sewing-machines/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: false }),
      })
    );

    await Promise.all(resetRequests);
    setMachines((prev) => prev.map((m) => ({ ...m, checked: false })));
    setCurrentMachine(null);
    setStatus(null);
  };

  const scannedCount = machines.filter((m) => m.checked && m.location === selectedLocation).length;
  const totalCount = machines.filter((m) => m.location === selectedLocation).length;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>\uD83D\uDCCB Inventarizatsiya</h1>

      <select
        value={selectedLocation}
        onChange={(e) => {
          setSelectedLocation(e.target.value);
          setCurrentMachine(null);
          setStatus(null);
        }}
        style={{ padding: "10px", marginBottom: "20px" }}
      >
        <option value="">Lokatsiyani tanlang</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.name.toLowerCase()}>
            {loc.name}
          </option>
        ))}
      </select>

      <div style={{ marginBottom: 10 }}>
        <strong>
          Belgilangan: {scannedCount}/{totalCount}
        </strong>
      </div>

      {!scanning && selectedLocation && (
        <button onClick={startScanner} style={btnStyle("#3b82f6")}>
          \uD83D\uDCF7 Skanerlashni boshlash
        </button>
      )}

      {scanning && (
        <button onClick={stopScanner} style={btnStyle("#ef4444")}>
          ⛔ Skanerni to‘xtatish
        </button>
      )}

      <button onClick={handleReset} style={btnStyle("#f59e0b")}>
        ♻ Reset
      </button>

      <div
        id="reader"
        style={{
          width: "300px",
          margin: "20px auto",
          border: "2px dashed #ccc",
          padding: "10px",
          borderRadius: "12px",
        }}
      />

      {currentMachine && (
        <div style={{ marginTop: 20, border: "1px solid #ccc", borderRadius: 10, padding: 15 }}>
          <h3>\uD83D\uDD0D Topilgan mashina:</h3>
          <p><strong>Kategoriya:</strong> {currentMachine.category}</p>
          <p><strong>Kompaniya:</strong> {currentMachine.company}</p>
          <p><strong>Model:</strong> {currentMachine.model}</p>
          <p><strong>Inv. raqami:</strong> {currentMachine.inventoryNumber}</p>
          <p><strong>Seriya raqami:</strong> {currentMachine.serialNumber}</p>
          {status === "success" && <p style={{ color: "green" }}>✅ Belgilangan</p>}
          {status === "cancel" && <p style={{ color: "red" }}>❌ Belgilanmadi</p>}
        </div>
      )}

      {showModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <p>Bu mashina hali belgilanmagan. Belgilansinmi?</p>
            <button onClick={handleConfirm} style={btnStyle("green")}>Ha</button>
            <button onClick={handleCancel} style={btnStyle("gray")}>Yo‘q</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: "10px 20px",
  backgroundColor: bg,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  margin: "5px",
  fontSize: "16px",
});

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 10,
  textAlign: "center",
};

export default App;
