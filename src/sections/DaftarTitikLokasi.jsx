import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahPetugas from "./TambahPetugas";
import TambahLokasi from "./TambahLokasi";
import { Link, useNavigate } from "react-router-dom";
import PetaModal from "./../components/PetaModal.jsx"; // Import modal peta

const DaftarTitikLokasi = () => {
  const [titikLokasi, setTitikLokasi] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddPetugas, setShowAddPetugas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petugasToEdit, setPetugasToEdit] = useState(null);
  const [msg, setMsg] = useState("");
  const [locationToEdit, setLocationToEdit] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMapModal, setShowMapModal] = useState(false); // State untuk kontrol modal peta
  const [selectedCoords, setSelectedCoords] = useState(null); // Koordinat yang dipilih
  const [showOptionModal, setShowOptionModal] = useState(false); // State untuk kontrol modal opsi
  const [geofenceData, setGeofenceData] = useState(null); // Data geofence yang dipilih
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      // Panggil fetchUserData untuk mendapatkan role dari server
      fetchUserData();
    } else {
      // Redirect ke halaman login jika tidak ada token
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      const response = await axios.get("https://localhost:3000/me", {
      // const response = await axios.get("http://193.203.162.80:3000/me", {
        // const response = await axios.get("http://localhost:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      clearTimeout(timeout);
      const data = response.data;
      setUsername(data.username);
      setRole(data.role); // Simpan role yang diterima dari backend
      localStorage.setItem("username", data.username);

      // Pengecekan role setelah data user didapatkan
      if (data.role === "admin") {
        fetchTitikLokasi(); // Panggil data titik lokasi jika user adalah admin
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

  const fetchTitikLokasi = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        // "http://193.203.162.80:3000/lokasi-with-details"
        "https://localhost:3000/lokasi-with-details"
        // "http://localhost:3000/lokasi-with-details"
      );
      console.log(response.data); // Tambahkan log ini untuk memeriksa struktur data
      if (Array.isArray(response.data)) {
        setTitikLokasi(response.data);
      } else {
        console.error("Format data tidak sesuai.");
        setTitikLokasi([]);
      }
    } catch (error) {
      console.error("Gagal mengambil titik lokasi:", error);
      alert("Gagal mengambil titik lokasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchTitikLokasi();
  };

  const handleEditLokasi = (loc) => {
    setLocationToEdit(loc);
    setShowAddLocation(true);
  };

  const handleConfirmDelete = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "lokasi") {
        await axios.delete(
          `https://localhost:3000/titiklokasi/${itemToDelete}`
          // `http://193.203.162.80:3000/titiklokasi/${itemToDelete}`
        );
        // await axios.delete(`http://localhost:3000/titiklokasi/${itemToDelete}`);
      } else if (deleteType === "petugas") {
        await axios.delete(
          `https://localhost:3000/petugas/${itemToDelete}`
          // `http://193.203.162.80:3000/petugas/${itemToDelete}`
        );
        // await axios.delete(`http://localhost:3000/petugas/${itemToDelete}`);
      }
      handleSuccess();
    } catch (error) {
      console.error(`Gagal menghapus ${deleteType}:`, error);
      alert(`Gagal menghapus ${deleteType}.`);
      if (deleteType === "Lokasi") {
        alert(`Gagal menghapus ${deleteType} dikarenakan masih terhubung dengan geofence dan petugas.`)
      } else if (deleteType === "petugas") {
        alert(`Gagal menghapus ${deleteType}.`)
      }
    } finally {
      setShowConfirmDelete(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleEditPetugas = (id_petugas) => {
    const petugas = titikLokasi
      .flatMap((loc) => loc.petugas || [])
      .find((p) => p.id_petugas === id_petugas);
    if (petugas) {
      setPetugasToEdit(petugas);
      setShowAddPetugas(true);
    }
  };

  const handleViewGeofence = (geofence) => {
    setGeofenceData(geofence); // Simpan data geofence
    setShowOptionModal(true); // Tampilkan modal opsi
  };

  const handleOpenInGoogleMaps = () => {
    if (geofenceData && geofenceData.geofence.geofence_data) {
      const coords = geofenceData.geofence.geofence_data
        .split(",")
        .map((coord) => parseFloat(coord));
      if (coords.length === 2) {
        const googleMapsUrl = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        window.open(googleMapsUrl, "_blank");
      }
    }
    setShowOptionModal(false);
  };

  const handleShowModalMap = () => {
    if (geofenceData && geofenceData.geofence.geofence_data) {
      const coords = geofenceData.geofence.geofence_data
        .split(",")
        .map((coord) => parseFloat(coord));
      if (coords.length === 2) {
        setSelectedCoords({ lat: coords[0], lon: coords[1] });
        setShowMapModal(true);
      }
    }
    setShowOptionModal(false);
  };

  const filteredTitikLokasi = titikLokasi.filter(
    (loc) =>
      loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.petugas?.some((p) =>
        p.nama_petugas.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <section className=" bg-gray-100 py-16 px-5 h-full w-full md:py-20 md:px-20">
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

      <h1 className="text-[40px] font-semibold mb-5 text-[#155E75] font-Roboto">
        Master Petugas
      </h1>
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <button
          onClick={() => {
            setLocationToEdit(null);
            setShowAddLocation(true);
          }}
          className="bg-[#0c647a] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#0c647a] transition duration-300">
          Tambah Lokasi
        </button>
        <button
          onClick={() => {
            setPetugasToEdit(null);
            setShowAddPetugas(true);
          }}
          className="bg-[#0c647a] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#0c647a] transition duration-300">
          Tambah Petugas
        </button>
      </div>

      {showAddLocation && (
        <TambahLokasi
          location={locationToEdit}
          onClose={() => setShowAddLocation(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showAddPetugas && (
        <TambahPetugas
          isEdit={Boolean(petugasToEdit)}
          petugasToEdit={petugasToEdit}
          onClose={() => setShowAddPetugas(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Modal untuk pilihan peta */}
      {showOptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Pilih Opsi Peta</h2>
            <div className="mb-4">
              <p>
                <strong>Geofence Data:</strong>{" "}
                {geofenceData?.geofence.geofence_data || "Tidak tersedia"}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleOpenInGoogleMaps}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Buka di Google Maps
              </button>
              <button
                onClick={handleShowModalMap}
                className="bg-green-600 text-white px-4 py-2 rounded-lg">
                Tampilkan Peta
              </button>
            </div>
            <button
              onClick={() => setShowOptionModal(false)}
              className="mt-4 text-red-600 hover:underline">
              Batal
            </button>
          </div>
        </div>
      )}

      {showMapModal && (
        <PetaModal
          isVisible={showMapModal}
          onClose={() => setShowMapModal(false)}
          coords={selectedCoords}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari lokasi atau petugas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 px-4 py-2 w-full rounded"
        />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-[#155E75] text-white border-[#155E75] border-b">
              <tr>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Lokasi
                </th>
                {/* <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Geofence
                </th>{" "}
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Alamat
                </th>{" "} */}
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Nama Petugas
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  No HP
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTitikLokasi.map((loc) => {
                const petugas = loc.petugas || [];
                if (petugas.length > 0) {
                  return (
                    <React.Fragment key={loc.id_lokasi}>
                      <tr className="hover:bg-[#e1f5f9]">
                        <td
                          className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]"
                          rowSpan={petugas.length}>
                          {loc.lokasi}
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleEditLokasi(loc)}
                              className="text-blue-600 hover:underline">
                              Ubah
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmDelete(loc.id_lokasi, "lokasi")
                              }
                              className="text-red-600 hover:underline">
                              Hapus
                            </button>
                          </div>
                        </td>
                        {/* <td
                          className="px-4 md:px-6 py-2 md:py-4 text-center border-b border-[#155E75]"
                          rowSpan={petugas.length}>
                          {loc.geofence && loc.geofence.geofence_data ? (
                            <button
                              onClick={() => handleViewGeofence(loc)}
                              className="text-blue-600 hover:underline">
                              Lihat Peta
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td
                          className="px-4 md:px-6 py-2 md:py-4 text-center border-b border-[#155E75]"
                          rowSpan={petugas.length}>
                          {loc.geofence ? loc.geofence.alamat : "-"}
                        </td> */}
                        <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                          {petugas[0].nama_petugas}
                        </td>
                        <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                          {petugas[0].no_hp}
                        </td>
                        <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleEditPetugas(petugas[0].id_petugas)
                              }
                              className="text-blue-600 hover:underline">
                              Ubah
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmDelete(
                                  petugas[0].id_petugas,
                                  "petugas"
                                )
                              }
                              className="text-red-600 hover:underline">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                      {petugas.slice(1).map((p) => (
                        <tr key={p.id_petugas} className="hover:bg-[#e1f5f9]">
                          <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                            {p.nama_petugas}
                          </td>
                          <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                            {p.no_hp}
                          </td>
                          <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditPetugas(p.id_petugas)}
                                className="text-blue-600 hover:underline">
                                Ubah
                              </button>
                              <button
                                onClick={() =>
                                  handleConfirmDelete(p.id_petugas, "petugas")
                                }
                                className="text-red-600 hover:underline">
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                } else {
                  return (
                    <tr key={loc.id_lokasi} className="hover:bg-[#e1f5f9]">
                      <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                        {loc.lokasi}
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleEditLokasi(loc)}
                            className="text-blue-600 hover:underline">
                            Ubah
                          </button>
                          <button
                            onClick={() =>
                              handleConfirmDelete(loc.id_lokasi, "lokasi")
                            }
                            className="text-red-600 hover:underline">
                            Hapus
                          </button>
                        </div>
                      </td>
                      <td
                        colSpan="5"
                        className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                        Tidak ada petugas
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">
              Konfirmasi Penghapusan
            </h3>
            <p>
              Apakah Anda yakin ingin menghapus {deleteType} ini? Operasi ini
              tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DaftarTitikLokasi;
