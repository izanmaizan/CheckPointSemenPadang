import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahAkun from "./TambahAkun"; // Komponen untuk menambah akun
import { Link, useNavigate } from "react-router-dom";

const DaftarAkun = () => {
  const [akunList, setAkunList] = useState([]);
  const [showAddAkun, setShowAddAkun] = useState(false);
  const [loading, setLoading] = useState(true);
  const [akunToEdit, setAkunToEdit] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [msg, setMsg] = useState("");
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
      // Redirect ke login jika tidak ada token
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      const response = await axios.get("https://backend-cpsp.vercel.app/me", {
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
        // Fetch daftar akun jika user adalah admin
        fetchAkunList();
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

  const fetchAkunList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-cpsp.vercel.app/users",
        {
          // const response = await axios.get("http://localhost:3000/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      if (Array.isArray(response.data)) {
        setAkunList(response.data);
      } else {
        console.error("Format data tidak sesuai.");
        setAkunList([]);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar akun:", error);
      alert("Gagal mengambil daftar akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchAkunList();
    setShowAddAkun(false); // Menutup form setelah sukses
  };

  const handleEditAkun = (akun) => {
    setAkunToEdit(akun);
    setShowAddAkun(true);
  };

  const handleConfirmDelete = (username) => {
    setItemToDelete(username);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      // Gunakan username sebagai parameter URL
      await axios.delete(
        `https://backend-cpsp.vercel.app/delete-user/${itemToDelete}`,
        {
          // await axios.delete(`http://localhost:3000/delete-user/${itemToDelete}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      handleSuccess();
    } catch (error) {
      console.error("Gagal menghapus akun:", error);
      alert("Gagal menghapus akun.");
    } finally {
      setShowConfirmDelete(false);
      setItemToDelete(null);
    }
  };

  const filteredAkunList = akunList.filter((akun) =>
    akun.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-gray-100 py-16 px-5 h-full w-full md:py-20 md:px-20">
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
        Daftar Akun
      </h1>
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <button
          onClick={() => {
            setAkunToEdit(null);
            setShowAddAkun(true);
          }}
          className="bg-[#0c647a] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#0a5c66] transition duration-300">
          Tambah Akun
        </button>
      </div>

      {showAddAkun && (
        <TambahAkun
          user={akunToEdit} // Kirim data akun yang akan diedit ke TambahAkun
          onClose={() => setShowAddAkun(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari akun..."
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
                  Username
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Name
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Role
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#155E75]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAkunList.length > 0 ? (
                filteredAkunList.map((akun) => (
                  <tr key={akun.id} className="hover:bg-[#e1f5f9]">
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                      {akun.username}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                      {akun.name || "N/A"}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                      {akun.role || "N/A"}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#155E75]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAkun(akun)}
                          className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(akun.username)}
                          className="text-red-600 hover:underline">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-600">
                    Tidak ada akun ditemukan
                  </td>
                </tr>
              )}
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
              Apakah Anda yakin ingin menghapus akun ini? Operasi ini tidak
              dapat dibatalkan.
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

export default DaftarAkun;
