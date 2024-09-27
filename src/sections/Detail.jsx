import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ReactPlayer from "react-player";
import PetaModal from "./../components/PetaModal.jsx";

const Detail = () => {
  const { no_do } = useParams();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      // Panggil fetchUserData untuk mendapatkan role dari server
      fetchUserData();
    } else {
      // Redirect ke halaman login jika tidak ada token
      navigate("/login");
    }
  }, [no_do, navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      // const response = await axios.get("https://backend-cpsp.vercel.app/me", {
      const response = await axios.get("http://localhost:3000/me", {
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
        fetchDetailData(); // Panggil data detail jika user adalah admin
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

  const fetchDetailData = async () => {
    try {
      const response = await axios.get(
        // `https://backend-cpsp.vercel.app/detail/${no_do}`,
        `http://localhost:3000/detail/${no_do}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );

      const formattedData = {
        ...response.data,
        tanggal: convertDateToInputFormat(response.data.tanggal),
        geofence_data: response.data.geofence_data || "", // Default value if geofence_data is null
      };

      setDetailData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching detail data: " + error);
      setMsg("Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  const convertDateToDisplayFormat = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const convertDateToInputFormat = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // await axios.put(
      //   `https://backend-cpsp.vercel.app/detail/${no_do}`,
      //   detailData,
      //   {
      await axios.put(`http://localhost:3000/detail/${no_do}`, detailData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setIsEditing(false);
      setMsg("Data updated successfully.");
    } catch (error) {
      console.error("Error updating data: ", error);
      setMsg("Failed to update data. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      // await axios.delete(`https://backend-cpsp.vercel.app/detail/${no_do}`, {
      await axios.delete(`http://localhost:3000/detail/${no_do}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      navigate(-1);
    } catch (error) {
      console.error("Error deleting data: ", error);
      setMsg("Failed to delete data. Please try again.");
    }
  };

  const handlePreview = (url) => {
    setPreviewUrl(url);
  };

  const openGoogleMaps = () => {
    const coords = detailData.geofence_data.split(",").map(Number);
    const lat = coords[0];
    const lon = coords[1];
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const geofenceCoords = detailData?.geofence_data.split(",").map(Number);
  const latLon = {
    lat: geofenceCoords ? geofenceCoords[0] : null,
    lon: geofenceCoords ? geofenceCoords[1] : null,
  };

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (!detailData) {
    return <div className="text-center text-lg">{msg}</div>;
  }

  return (
    <section className="container  px-5 py-20 h-full w-full md:px-20">
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

      {/* Peta Modal */}
      <PetaModal
        isVisible={isModalVisible}
        onClose={closeModal}
        coords={latLon}
      />

      <h1 className="text-[40px] font-semibold mb-5 text-[#155E75] font-Roboto">
        Detail Check Point
      </h1>
      <div className="md:grid md:grid-cols-2 shadow-lg rounded-lg p-6 border border-gray-200">
        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700">No. DO:</label>
              <input
                type="text"
                value={detailData.no_do}
                disabled
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Petugas:</label>
              <input
                type="text"
                value={detailData.nama_petugas}
                onChange={(e) =>
                  setDetailData({
                    ...detailData,
                    nama_petugas: e.target.value,
                  })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Lokasi:</label>
              <input
                type="text"
                value={detailData.titik_lokasi}
                onChange={(e) =>
                  setDetailData({ ...detailData, lokasi: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tanggal:</label>
              <input
                type="date"
                value={detailData.tanggal}
                onChange={(e) =>
                  setDetailData({ ...detailData, tanggal: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Jam:</label>
              <input
                type="time"
                value={detailData.jam}
                onChange={(e) =>
                  setDetailData({ ...detailData, jam: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Nama Pengemudi:</label>
              <input
                type="text"
                value={detailData.nama_pengemudi}
                onChange={(e) =>
                  setDetailData({
                    ...detailData,
                    nama_pengemudi: e.target.value,
                  })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">No Truck / Gerbong:</label>
              <input
                type="text"
                value={detailData.no_truck}
                onChange={(e) =>
                  setDetailData({ ...detailData, no_truck: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Distributor:</label>
              <input
                type="text"
                value={detailData.distributor}
                onChange={(e) =>
                  setDetailData({
                    ...detailData,
                    distributor: e.target.value,
                  })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Ekspeditur:</label>
              <input
                type="text"
                value={detailData.ekspeditur}
                onChange={(e) =>
                  setDetailData({ ...detailData, ekspeditur: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 ">Keterangan:</label>
              <input
                type="text"
                value={detailData.keterangan}
                onChange={(e) =>
                  setDetailData({ ...detailData, keterangan: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">No. HP Petugas:</label>
              <input
                type="text"
                value={detailData.no_hp}
                onChange={(e) =>
                  setDetailData({ ...detailData, no_hp: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Geofence Data:</label>
              <input
                type="text"
                value={detailData.geofence_data}
                onChange={(e) =>
                  setDetailData({
                    ...detailData,
                    geofence_data: e.target.value,
                  })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition mr-1">
              Simpan
            </button>
          </>
        ) : (
          <>
            <p className="mb-2">
              <strong>No. DO:</strong> {detailData.no_do}
            </p>
            <p className="mb-2">
              <strong>Petugas:</strong> {detailData.nama_petugas}
            </p>
            <p className="mb-2">
              <strong>Lokasi:</strong> {detailData.titik_lokasi}
            </p>
            <p className="mb-2">
              <strong>Tanggal:</strong>{" "}
              {convertDateToDisplayFormat(detailData.tanggal)}
            </p>
            <p className="mb-2">
              <strong>Jam:</strong> {detailData.jam}
            </p>
            <p className="mb-2">
              <strong>Nama Pengemudi:</strong> {detailData.nama_pengemudi}
            </p>
            <p className="mb-2">
              <strong>No Truck / Gerbong:</strong> {detailData.no_truck}
            </p>
            <p className="mb-2">
              <strong>Distributor:</strong> {detailData.distributor}
            </p>
            <p className="mb-2">
              <strong>Ekspeditur:</strong> {detailData.ekspeditur}
            </p>
            <p className="mb-2">
              <strong>Keterangan:</strong> {detailData.keterangan}
            </p>
            <p className="mb-4">
              <strong>No. HP Petugas:</strong> {detailData.no_hp}
            </p>
            <p className="mb-4">
              <strong>Alamat:</strong> {detailData.alamat}
            </p>
            <p className="mb-2">
              <strong>Geofence Data:</strong>{" "}
              {detailData.geofence_data || "N/A"}
            </p>

            {/* Conditional rendering for map buttons */}
            {detailData.geofence_data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={openGoogleMaps}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                  Lihat di Google Maps
                </button>
                <button
                  onClick={openModal}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Lihat di Peta
                </button>
              </div>
            )}

            {detailData.dokumentasiUrls &&
              detailData.dokumentasiUrls.length > 0 && (
                <div className="mb-4 col-span-2">
                  <strong>Dokumentasi:</strong>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Inside your component where images are displayed */}
                    {detailData.dokumentasiUrls.map((url, index) => (
                      <div key={index} className="mt-2 relative cursor-pointer">
                        {/\.(jpe?g|png|gif)$/i.test(url) ? (
                          <Zoom>
                            <img
                              src={url}
                              alt={`Dokumentasi ${index + 1}`}
                              className="w-auto md:max-w-full h-auto object-cover rounded-md"
                            />
                          </Zoom>
                        ) : (
                          /* Jika file adalah video, gunakan ReactPlayer */
                          <ReactPlayer
                            url={url}
                            controls
                            width="100%"
                            height="auto"
                            className="rounded-md border border-gray-300"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            <button
              onClick={handleEdit}
              className=" bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition mx-1">
              Edit
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          className=" bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition mx-1">
          Hapus
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#0E7490] text-white px-4 py-2 rounded-md hover:bg-[#155E75] col-span-2 mx-1 mt-1">
          Kembali
        </button>
      </div>
      <p className="mt-4 text-red-500">{msg}</p>

      {/* {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto"
          onClick={() => setPreviewUrl(null)}>
          <div className="bg-white p-4 rounded-md">
            {/\.(jpe?g|png|gif)$/i.test(previewUrl) ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-4xl"
              />
            ) : (
              <video
                controls
                className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-4xl">
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )} */}
    </section>
  );
};

export default Detail;
