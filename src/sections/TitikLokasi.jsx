import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TitikLokasi = () => {
  const navigate = useNavigate();
  const [idLokasi, setIdLokasi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [petugas, setPetugas] = useState("");
  const [noHp, setNoHp] = useState("");
  const [titikLokasiList, setTitikLokasiList] = useState([]);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [petugasList, setPetugasList] = useState([{ nama: "", noHp: "" }]);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      fetchUsername();
      fetchTitikLokasi();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsername = async () => {
    try {
      // const response = await axios.get("http://localhost:3000/me", {
        // const response = await axios.get("http://193.203.162.80:3000/me", {
        const response = await axios.get("https://checkpoint-sig.site:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      const data = response.data;
      setUsername(data.username);
      localStorage.setItem("username", data.username);
    } catch (error) {
      console.error("Error fetching username: " + error);
    }
  };

  const fetchTitikLokasi = async () => {
    try {
      const response = await axios.get(
        // "http://193.203.162.80:3000/titiklokasi"
        "https://checkpoint-sig.site:3000/titiklokasi"
      );
      // const response = await axios.get("http://localhost:3000/titiklokasi");
      setTitikLokasiList(response.data);
    } catch (error) {
      console.error("Error fetching titik lokasi: " + error);
    }
  };

  const handlePetugasChange = (index, field, value) => {
    const updatedList = [...petugasList];
    updatedList[index][field] = value;
    setPetugasList(updatedList);
  };

  const addPetugas = () => {
    setPetugasList([...petugasList, { nama: "", noHp: "" }]);
  };

  const removePetugas = (index) => {
    const updatedList = [...petugasList];
    updatedList.splice(index, 1);
    setPetugasList(updatedList);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `https://checkpoint-sig.site:3000/titiklokasi/${editId}`
        // ? `http://193.203.162.80:3000/titiklokasi/${editId}`
        : // ? `http://localhost:3000/titiklokasi/${editId}`
          "https://checkpoint-sig.site:3000/titiklokasi";
          // "http://193.203.162.80:3000/titiklokasi";
      // : "http://localhost:3000/titiklokasi";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_lokasi: idLokasi,
          lokasi: lokasi,
          petugas: petugas,
          no_hp: noHp,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Success:", result);
      fetchTitikLokasi(); // Refresh list after save
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (item) => {
    setIdLokasi(item.id_lokasi);
    setLokasi(item.lokasi);
    setPetugas(item.petugas);
    setNoHp(item.no_hp);
    setEditId(item.id_lokasi);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://checkpoint-sig.site:3000/titiklokasi/${deleteId}`
        // `http://193.203.162.80:3000/titiklokasi/${deleteId}`
      );
      // await axios.delete(`http://localhost:3000/titiklokasi/${deleteId}`);
      setMsg("Titik Lokasi deleted successfully!");
      setShowModal(true);
      fetchTitikLokasi();
    } catch (error) {
      setMsg("Failed to delete data. Please try again.");
      setShowModal(true);
    }
    setLoading(false);
    setShowConfirmModal(false);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };

  const resetForm = () => {
    setIdLokasi("");
    setLokasi("");
    setPetugas("");
    setNoHp("");
    setIsEditing(false);
    setEditId("");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Fungsi untuk memeriksa keberadaan ID lokasi
  const checkIdLokasiExistence = async (id) => {
    try {
      const response = await axios.get(
        `https://checkpoint-sig.site:3000/titiklokasi/${id}`
        // `http://193.203.162.80:3000/titiklokasi/${id}`
        // `http://localhost:3000/titiklokasi/${id}`
      );
      if (response.data) {
        setMsg("ID Lokasi sudah ada!");
        setShowModal(true);
      }
    } catch (error) {
      // ID tidak ditemukan, tidak perlu melakukan tindakan tambahan
    }
  };

  // Tangani event onBlur untuk input ID Lokasi
  const handleIdLokasiBlur = (e) => {
    const id = e.target.value;
    if (id) {
      checkIdLokasiExistence(id);
    }
  };

  return (
    <section className="bg-white px-5 py-28 h-screen w-screen">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">{msg}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={closeModal}
                className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">
              Are you sure you want to delete this item?
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">Loading, please wait...</p>
          </div>
        </div>
      )}

      <div className="grid items-center gap-10 grid-cols-1 justify-center">
        <div
          className="absolute inset-x-0 -top-44 -z-9 transform-gpu overflow-hidden sm:-top-80"
          aria-hidden="true">
          <div
            className="relative left-[calc(60%-11rem)] aspect-[1/1] w-[458px] -translate-x-1/2 rotate-[30deg] bg-[#155E75] opacity-100 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] rounded-full"
            style={{
              clipPath: "circle(50%)",
            }}
          />
        </div>
        <div
          className="absolute inset-x-0 -top-44 -z-9 transform-gpu overflow-hidden sm:-top-80"
          aria-hidden="true">
          <div
            className="relative left-[calc(155%-11rem)] aspect-[1/1] w-[458px] -translate-x-1/2 rotate-[30deg] bg-[#0E7490] opacity-100 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] rounded-full"
            style={{
              clipPath: "circle(50%)",
            }}
          />
        </div>{" "}
        <div className="order-1 lg:order-2 flex flex-col z-10 justify-center items-start px-10">
          <h1 className="relative text-4xl font-semibold text-[#A5F3FC] font-Roboto -top-10">
            <div>Titik</div>
            <div>Lokasi</div>
          </h1>
          <div className="mt-10 w-full">
            <form className="max-w-sm mx-auto mt-7" onSubmit={handleSave}>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder=" "
                  value={idLokasi}
                  onChange={(e) => setIdLokasi(e.target.value)}
                  onBlur={handleIdLokasiBlur} // Menambahkan onBlur
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  ID Lokasi
                </label>
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder=" "
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Lokasi
                </label>
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder=" "
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Petugas
                </label>
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder=" "
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  No HP
                </label>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-[#0E7490] text-white font-bold text-sm rounded-lg transition duration-200 ease-in-out hover:bg-[#155E75] focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:ring-opacity-50">
                  {isEditing ? "UPDATE" : "SIMPAN"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-3 px-6 bg-gray-400 text-white font-medium text-sm rounded-lg transition duration-200 ease-in-out hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:ring-opacity-50">
                    BATAL
                  </button>
                )}
                <Link to="/">
                  <button className="inline-block w-full bg-[#0E7490] text-white font-sans font-bold uppercase text-sm px-6 py-3 rounded-lg shadow-md hover:bg-[#155E75] hover:shadow-lg focus:bg-[#155E75] focus:shadow-lg focus:outline-none focus:ring-0 active:bg-[#0A5E75] active:shadow-md transition duration-150 ease-in-out">
                    KEMBALI
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
        <div className="w-full relative order-2 lg:order-1">
          <h2 className="text-2xl font-semibold text-gray-800">
            Daftar Titik Lokasi
          </h2>
          <table className="min-w-full bg-white text-center">
            <thead>
              <tr className="w-full bg-[#0E7490] text-white font-semibold">
                <th className="py-3 px-4">ID Lokasi</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4">No HP</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {titikLokasiList.map((item) => (
                <tr key={item.id_lokasi} className="border-b border-[#737373]">
                  <td className="py-2 px-4">{item.id_lokasi}</td>
                  <td className="py-2 px-4">{item.lokasi}</td>
                  <td className="py-2 px-4">{item.petugas}</td>
                  <td className="py-2 px-4">{item.no_hp}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full bg-[#0E7490] text-white px-2 py-1 rounded mr-2 hover:bg-[#155E75]">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id_lokasi)}
                        className="w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TitikLokasi;
