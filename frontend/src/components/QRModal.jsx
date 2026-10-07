import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { FaTimes } from "react-icons/fa";

export default function QRModal({ device, onClose }) {
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    if (!device) return;
    const payload = JSON.stringify({
      id: device.id,
      demirbas: device.assetNo,
      ad: device.name,
      kategori: device.category,
      durum: device.status,
      ilce: device.district,
      bina: device.building,
      oda: device.room,
    });
    QRCode.toDataURL(payload, { width: 300, margin: 1 }).then(setQrImage);
  }, [device]);

  if (!device) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-xl font-bold mb-1">{device.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{device.assetNo}</p>
        {qrImage && (
          <img
            src={qrImage}
            alt={`${device.name} QR kodu`}
            className="mx-auto rounded-lg bg-white p-2"
          />
        )}
        <p className="text-xs text-gray-500 mt-4">
          Bu QR kod cihaz demirbaş bilgilerini içerir. Cihazın üzerine
          yapıştırılarak saha personeli tarafından taranabilir.
        </p>
      </div>
    </div>
  );
}
