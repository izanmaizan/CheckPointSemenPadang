import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TambahPetugas = ({
  onClose,
  onSuccess,
  isEdit = false,
  petugasToEdit,
}) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [petugasList, setPetugasList] = useState([
    { id_petugas: "", nama_petugas: "", no_hp: "" },
  ]);
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
  }, [isEdit, petugasToEdit, navigate]);

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
        // Fetch lokasi jika user adalah admin
        fetchLocations();

        // Jika sedang dalam mode edit, set data petugas yang akan diedit
        if (isEdit && petugasToEdit) {
          setSelectedLocation(petugasToEdit.id_lokasi);
          setPetugasList([
            {
              id_petugas: petugasToEdit.id_petugas,
              nama_petugas: petugasToEdit.nama_petugas,
              no_hp: petugasToEdit.no_hp,
            },
          ]);
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

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://193.203.162.80:3000/titiklokasi"
      );
      // const response = await axios.get("http://localhost:3000/titiklokasi");
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      alert("Gagal memuat lokasi.");
    }
  };

  const handleAddPetugas = () => {
    setPetugasList([
      ...petugasList,
      { id_petugas: "", nama_petugas: "", no_hp: "" },
    ]);
  };

  const handleRemovePetugas = (index) => {
    const newPetugasList = petugasList.filter((_, i) => i !== index);
    setPetugasList(newPetugasList);
  };

  const handlePetugasChange = (index, e) => {
    const { name, value } = e.target;
    const newPetugasList = petugasList.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    setPetugasList(newPetugasList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setError("Tolong pilih lokasi.");
      return;
    }

    const emptyFields = petugasList.some(
      (item) => !item.id_petugas || !item.nama_petugas || !item.no_hp
    );
    if (emptyFields) {
      setError("Silahkan isi semua kolom petugas.");
      return;
    }

    const petugasData = petugasList.map((petugas) => ({
      ...petugas,
      id_lokasi: selectedLocation,
    }));

    try {
      if (isEdit) {
        // Edit existing petugas
        await axios.put(
          `http://193.203.162.80:3000/petugas/${petugasToEdit.id_petugas}`,
          // `http://localhost:3000/petugas/${petugasToEdit.id_petugas}`,
          petugasData[0]
        );
        alert("Petugas berhasil diperbarui!");
      } else {
        // Add new petugas
        await axios.post(
          "http://193.203.162.80:3000/petugas",
          petugasData
        );
        // await axios.post("http://localhost:3000/petugas", petugasData);
        alert("Petugas berhasil ditambahkan!");
      }

      onSuccess(); // Notify parent component
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? "editing" : "adding"} petugas:`, error);
      alert(`Gagal untuk ${isEdit ? "Ubah" : "Tambahkan"} petugas.`);
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

      <div
        className="bg-white rounded-lg p-6 max-w-lg mx-auto overflow-auto"
        style={{ maxHeight: "80vh" }}>
        <h2 className="text-2xl font-extrabold mb-4 text-[#155E75] font-Roboto">
          {isEdit ? "Edit Petugas" : "Tambah Petugas"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-[#155E75]">Pilih Lokasi</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-[#155E75] px-4 py-2 w-full rounded">
              <option value="">-- Pilih Lokasi --</option>
              {locations.map((loc) => (
                <option key={loc.id_lokasi} value={loc.id_lokasi}>
                  {loc.lokasi}
                </option>
              ))}
            </select>
          </div>

          {petugasList.map((petugas, index) => (
            <div
              key={index}
              className="mb-4 border border-[#155E75] p-4 rounded">
              <div className="mb-2">
                <label className="block mb-1 text-[#155E75]">ID Petugas</label>
                <input
                  type="text"
                  name="id_petugas"
                  value={petugas.id_petugas}
                  onChange={(e) => handlePetugasChange(index, e)}
                  className="border border-[#155E75] px-4 py-2 w-full rounded"
                  disabled={isEdit} // Disable editing ID in edit mode
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1 text-[#155E75]">
                  Nama Petugas
                </label>
                <input
                  type="text"
                  name="nama_petugas"
                  value={petugas.nama_petugas}
                  onChange={(e) => handlePetugasChange(index, e)}
                  className="border border-[#155E75] px-4 py-2 w-full rounded"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1 text-[#155E75]">No HP</label>
                <input
                  type="text"
                  name="no_hp"
                  value={petugas.no_hp}
                  onChange={(e) => handlePetugasChange(index, e)}
                  className="border border-[#155E75] px-4 py-2 w-full rounded"
                />
              </div>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => handleRemovePetugas(index)}
                  className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
                  Hapus
                </button>
              )}
            </div>
          ))}
          {!isEdit && (
            <button
              type="button"
              onClick={handleAddPetugas}
              className="bg-[#0c647a] mb-4 hover:bg-blue-700bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              Tambah lagi Petugas
            </button>
          )}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              {isEdit ? "Simpan Perubahan" : "Simpan Petugas"}
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

export default TambahPetugas;
