import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

function App() {
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedMachine, setScannedMachine] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const scannerRef = useRef(null);

  const fetchMachines = async () => {
    const res = await axios.get("https://0e84bcd063294f11.mokky.dev/sewing-machines");
    setMachines(res.data);
  };

  const fetchLocations = async () => {
    const res = await axios.get("https://0e84bcd063294f11.mokky.dev/filial");
    setLocations(res.data);
  };

  useEffect(() => {
    fetchMachines();
    fetchLocations();
  }, []);

  const startScanner = async () => {
    setMessage("");
    setScannedMachine(null);
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const found = machines.find(
            (m) => m.serialNumber === decodedText && m.location === selectedLocation
          );
          if (found) {
            setScannedMachine(found);
            if (!found.checked) {
              setShowModal(true);
            } else {
              setMessage("✅ Bu mashina allaqachon belgilangan.");
            }
          } else {
            setMessage("⚠ Bu QR kod tanlangan lokatsiyadagi mashinaga tegishli emas.");
          }
        },
        (err) => {}
      )
      .then(() => {
        setScanning(true);
      })
      .catch((err) => {
        console.error(err);
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

  const confirmCheck = async () => {
    const updated = { ...scannedMachine, checked: true };
    await axios.patch(`https://0e84bcd063294f11.mokky.dev/sewing-machines/${scannedMachine.id}`, updated);
    setMachines((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setShowModal(false);
    setMessage("✅ Mashina belgilandi.");
  };

  const resetInventory = async () => {
    const updates = machines.map((m) =>
      axios.patch(`https://0e84bcd063294f11.mokky.dev/sewing-machines/${m.id}`, {
        checked: false,
      })
    );
    await Promise.all(updates);
    fetchMachines();
    setMessage("♻️ Inventarizatsiya boshqatdan boshlandi.");
  };

  const locationMachines = machines.filter((m) => m.location === selectedLocation);
  const checkedCount = locationMachines.filter((m) => m.checked).length;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>📦 Mashinalar Inventarizatsiyasi</h2>

      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px" }}
      >
        <option value="">Lokatsiyani tanlang</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.filial}>
            {loc.name}
          </option>
        ))}
      </select>

      {selectedLocation && (
        <p>
          📊 {checkedCount}/{locationMachines.length} mashina belgilangan
        </p>
      )}

      {selectedLocation && !scanning && (
        <button
          onClick={startScanner}
          style={{ padding: "10px 20px", margin: "10px", background: "#3b82f6", color: "white", borderRadius: "8px" }}
        >
          📷 Skannerni boshlash
        </button>
      )}

      {scanning && (
        <button
          onClick={stopScanner}
          style={{ padding: "10px 20px", margin: "10px", background: "#ef4444", color: "white", borderRadius: "8px" }}
        >
          ✖ Skannerni to‘xtatish
        </button>
      )}

      <div id="reader" style={{ width: "300px", margin: "0 auto", marginTop: "20px" }}></div>

      {scannedMachine && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h4>🔍 Topilgan mashina:</h4>
          <p><strong>Category:</strong> {scannedMachine.category}</p>
          <p><strong>Company:</strong> {scannedMachine.company}</p>
          <p><strong>Model:</strong> {scannedMachine.model}</p>
          <p><strong>Serial Number:</strong> {scannedMachine.serialNumber}</p>
          <p><strong>Inventory Number:</strong> {scannedMachine.inventoryNumber}</p>
        </div>
      )}

      {showModal && (
        <div style={{ background: "#fef3c7", padding: "15px", marginTop: "20px", borderRadius: "8px" }}>
          <p>🟡 Bu mashina hali belgilanmagan. Belgilansinmi?</p>
          <button onClick={confirmCheck} style={{ margin: "5px", backgroundColor: "#10b981", color: "white", padding: "8px", borderRadius: "6px" }}>
            ✅ Ha
          </button>
          <button onClick={() => { setShowModal(false); setMessage("❌ Mashina belgilanmadi.") }} style={{ margin: "5px", backgroundColor: "#ef4444", color: "white", padding: "8px", borderRadius: "6px" }}>
            ❌ Yo‘q
          </button>
        </div>
      )}

      {message && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{message}</p>}

      <button
        onClick={resetInventory}
        style={{ marginTop: "30px", padding: "10px 20px", backgroundColor: "#facc15", border: "none", borderRadius: "8px" }}
      >
        ♻️ Inventarizatsiyani qayta boshlash
      </button>
    </div>
  );
}

export default App;
