import React, { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScannerApp() {
  const [scannedCode, setScannedCode] = useState(null);
  const [mode, setMode] = useState(null); // "save" yoki "find"

  // Kamerani ishga tushurish funksiyasi
  const startScanner = async () => {
    const html5QrCode = new Html5Qrcode("reader");
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          html5QrCode.stop(); // Skan qilingandan keyin kamerani to'xtatamiz
          setScannedCode(decodedText);

          if (mode === "save") {
            // Foydalanuvchidan nom so'raymiz
            const name = prompt("Bu QR-kodga qanday nom beramiz?");
            if (name) {
              // Mokky.dev API'ga yuborish
              await fetch("https://api.mokky.dev/api/qr-codes", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": import.meta.env.VITE_MOKKY_API_KEY,
                },
                body: JSON.stringify({ name, code: decodedText }),
              });
              alert("Muvaffaqiyatli saqlandi!");
            }
          } else if (mode === "find") {
            // Mokky.dev dan qidirish
            const response = await fetch(
              `https://api.mokky.dev/api/qr-codes?code=${decodedText}`,
              {
                headers: {
                  "x-api-key": import.meta.env.VITE_MOKKY_API_KEY,
                },
              }
            );
            const data = await response.json();
            const found = data.items?.[0];
            alert(`Topildi: ${found?.name || "Hech nima topilmadi"}`);
          }
        },
        (errorMessage) => {
          console.warn("Skan xatoligi:", errorMessage);
        }
      );
    } catch (error) {
      console.error("Kamera ishga tushmadi:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* QR scanner joyi */}
      <div id="reader" className="w-full h-60 border rounded" />

      {/* Tugmalar */}
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setMode("save");
            startScanner();
          }}
        >
          QR saqlash
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setMode("find");
            startScanner();
          }}
        >
          QR qidirish
        </button>
      </div>
    </div>
  );
}
