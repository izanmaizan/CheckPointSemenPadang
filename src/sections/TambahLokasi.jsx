import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TambahLokasi = ({ location, onClose, onSuccess }) => {
  const [idLokasi, setIdLokasi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      // Panggil fetchUserData untuk mendapatkan role dari server
      fetchUserData();
    } else {
      // Redirect ke login jika tidak ada token
      navigate("/login");
    }
  }, [location, navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      const response = await axios.get("http://193.203.162.80:3000/me", {
        // const response = await axios.get("http://localhost:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      clearTimeout(timeout);
      const data = response.data;
      setUsername(data.username);
      setRole(data.role); // Simpan role dari backend
      localStorage.setItem("username", data.username);

      // Cek apakah role adalah admin
      if (data.role === "admin") {
        // Logika untuk mengatur form jika sedang mengedit lokasi
        if (location) {
          setIdLokasi(location.id_lokasi);
          setLokasi(location.lokasi);
          setIsEditing(true);
        } else {
          setIdLokasi("");
          setLokasi("");
          setIsEditing(false);
        }
      } else {
        setMsg(
          "Anda tidak punya akses ke halaman ini. Dikembalikan ke Halaman Utama..."
        );
        setTimeout(() => navigate("/"), 3000); // Redirect setelah 3 detik
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setMsg("Terjadi kesalahan, mohon login kembali.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idLokasi || !lokasi) {
      setError("Silahkan isi semua kolom.");
      return;
    }

    try {
      if (isEditing) {
        // Update existing location
        await axios.put(
          `http://193.203.162.80:3000/titiklokasi/${idLokasi}`,
          {
            // await axios.put(`http://localhost:3000/titiklokasi/${idLokasi}`, {
            lokasi,
          }
        );
        alert("Lokasi berhasil di Perbarui!");
      } else {
        // Add new location
        await axios.post("http://193.203.162.80:3000/titiklokasi", {
          // await axios.post("http://localhost:3000/titiklokasi", {
          id_lokasi: idLokasi,
          lokasi: lokasi,
        });
        alert("Lokasi berhasil ditambahkan!");
      }
      onSuccess(); // Notify parent component
      onClose();
    } catch (error) {
      console.error("Error saving lokasi:", error);
      alert(`Failed to ${isEditing ? "update" : "add"} lokasi.`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {msg && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">{msg}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setMsg("")}
                className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-extrabold mb-4 text-[#155E75] font-Roboto">
          {isEditing ? "Edit Lokasi" : "Tambah Lokasi"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="idLokasi">
              ID Lokasi
            </label>
            <input
              id="idLokasi"
              type="text"
              value={idLokasi}
              onChange={(e) => setIdLokasi(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg"
              disabled={isEditing} // Disable editing of ID if updating
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="lokasi">
              Lokasi
            </label>
            <input
              id="lokasi"
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              {isEditing ? "Perbarui" : "Tambah"} Lokasi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahLokasi;
