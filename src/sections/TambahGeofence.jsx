import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TambahGeofence = () => {
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [selectedLokasi, setSelectedLokasi] = useState("");
  const [geofenceData, setGeofenceData] = useState(""); // Geofence input field
  const [alamat, setAlamat] = useState(""); // Address field
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cek dan ambil refresh token dari localStorage
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      // Fetch locations jika refresh token ada
      const fetchLokasi = async () => {
        try {
          const response = await axios.get(
            // "http://localhost:3000/titiklokasi",
            // "http://193.203.162.80:3000/titiklokasi",
            "https://checkpoint-sig.site:3000/titiklokasi",
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`, // Mengirimkan token di header
              },
            }
          );
          setLokasiOptions(response.data);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      };

      fetchLokasi();
    } else {
      // Redirect ke login jika tidak ada token
      navigate("/login");
    }
  }, [navigate]);

  const isValidGeofence = (input) => {
    const coords = input.split(",");
    if (coords.length !== 2) return false;
    const [lat, lon] = coords.map((coord) => parseFloat(coord.trim()));
    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  };

  const handleGeofenceChange = async (e) => {
    const input = e.target.value;
    setGeofenceData(input);

    if (isValidGeofence(input)) {
      const [lat, lon] = input
        .split(",")
        .map((coord) => parseFloat(coord.trim()));

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const result = response.data;
        if (result && result.address) {
          setAlamat(result.display_name);
        } else {
          setAlamat("Alamat tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setAlamat("Alamat tidak ditemukan");
      }
    } else {
      setAlamat("Format geofence tidak valid");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [lat, lon] = geofenceData
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    try {
      // await axios.post("http://localhost:3000/geofence", {
        // await axios.post("http://193.203.162.80:3000/geofence", {
        await axios.post("https://checkpoint-sig.site:3000/geofence", {
        id_lokasi: selectedLokasi,
        geofence_data: geofenceData,
        alamat,
        latitude: lat,
        longitude: lon,
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding geofence:", error);
      alert("Gagal untuk menambahkan Geofence.");
    }
  };

  return (
    <section className="px-5 py-16 md:px-20 min-h-screen">
      {/* Lingkaran Latar Belakang */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute w-[400px] h-[400px] sm:w-[1000px] sm:h-[1000px] rounded-full bg-[#0E7490] top-[-280px] right-[-220px] sm:right-[-350px] sm:-top-[850px]"></div>
        <div className="absolute w-[350px] h-[350px] sm:w-[900px] sm:h-[900px] rounded-full bg-[#0E7490] bottom-[-200px] right-[-150px] sm:right-[-350px] sm:-bottom-[700px]"></div>
      </div>
      <h1 className="text-[40px] font-semibold mb-5 text-[#155E75] font-Roboto">
        <div>Tambah</div>
        <div>Geofence</div>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Pilih Lokasi:</label>
          <select
            value={selectedLokasi}
            onChange={(e) => setSelectedLokasi(e.target.value)}
            className="border border-gray-300 px-4 py-2 w-full rounded"
            required>
            <option value="" disabled>
              Pilih lokasi
            </option>
            {lokasiOptions.map((lokasi) => (
              <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                {lokasi.lokasi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700">
            Geofence Data (Latitude, Longitude):
          </label>
          <input
            type="text"
            value={geofenceData}
            onChange={handleGeofenceChange}
            className="border border-gray-300 px-4 py-2 w-full rounded"
            placeholder="-0.954250689645196, 100.47478512416309"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Alamat:</label>
          <input
            type="text"
            value={alamat}
            readOnly
            className="border border-gray-300 px-4 py-2 w-full rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-[#0c647a] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#0c647a] transition duration-300">
          Simpan
        </button>
      </form>
    </section>
  );
};

export default TambahGeofence;
