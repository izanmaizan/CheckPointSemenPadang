import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { Nav } from "../components";

const Laporan = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [role, setRole] = useState(""); // State untuk role pengguna
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchDO, setSearchDO] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]); // State untuk menyimpan data lokasi
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const timeout = setTimeout(() => {
        setErrorMessage("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      const response = await axios.get("https://checkpoint-sig.site:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      clearTimeout(timeout);
      const data = response.data;
      setUsername(data.username);
      setRole(data.role);
      localStorage.setItem("username", data.username);

      if (data.role === "admin") {
        fetchReportData();
        fetchLocations();
      } else if (data.role === "petugas") {
        setMsg("Anda tidak punya akses ke halaman ini. Dikembalikan ke Halaman Utama...");
        setTimeout(() => navigate("/"), 3000);
        // Filter data untuk petugas berdasarkan lokasi dan tanggal yang dipilih
        const storedLocation = localStorage.getItem("selectedLocation");
        const storedStartDate = localStorage.getItem("startDate");
        const storedEndDate = localStorage.getItem("endDate");
        if (storedLocation && storedStartDate && storedEndDate) {
          setSelectedLocation(storedLocation);
          setStartDate(storedStartDate);
          setEndDate(storedEndDate);
          handleSearch();
        }
      }
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setErrorMessage("Terjadi kesalahan, mohon login kembali.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    handleSearch();
  }, [searchDO, selectedLocation, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://checkpoint-sig.site:3000/laporan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setReportData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching report data: " + error);
      setMsg("Gagal untuk menampilkan Data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get("https://checkpoint-sig.site:3000/titiklokasi", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations: " + error);
      setMsg("Gagal memuat Lokasi. Coba lagi.");
    }
  };

  const handleSearch = () => {
    let filtered = reportData;

    if (searchDO) {
      filtered = filtered.filter((item) => item.no_do.includes(searchDO));
    }

    if (selectedLocation) {
      filtered = filtered.filter((item) => item.lokasi === selectedLocation);
    }

    const formatDate = (dateString) => {
      const [day, month, year] = dateString.split("-");
      return `${year}-${month}-${day}`;
    };

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(formatDate(item.tanggal)) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(formatDate(item.tanggal)) <= new Date(endDate)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);

    // Simpan lokasi dan tanggal yang dipilih pada local storage untuk petugas
    if (role === "petugas" && selectedLocation && startDate && endDate) {
      localStorage.setItem("selectedLocation", selectedLocation);
      localStorage.setItem("startDate", startDate);
      localStorage.setItem("endDate", endDate);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, "Laporan_Check_Point.xlsx");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generatePagination = () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = [];

    pagination.push(1);

    if (currentPage > 3) {
      pagination.push("...");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pagination.push(i);
    }

    if (currentPage < totalPages - 2) {
      pagination.push("...");
    }

    if (totalPages > 1) {
      pagination.push(totalPages);
    }

    return pagination;
  };

  return (
    <section className="relative px-5 py-16 h-full w-full md:px-20">
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

      {errorMessage && (
        <div>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <Link
            to="/login"
            className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-2 transition-all">
            Kembali ke Login
          </Link>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">Loading, please wait...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div
            className="absolute inset-0 w-full h-full bg-gray-200 bg-opacity-90 filter blur-lg"
            style={{
              backgroundImage: `url("https://c4.wallpaperflare.com/wallpaper/916/333/789/shooting-star-milky-way-galaxy-night-hd-wallpaper-preview.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white mb-4 lg:mb-0">
            Laporan Check Point
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="bg-[#0e7490] text-white px-4 py-2 rounded hover:bg-[#0c647a]">
              Print
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-[#0e7490] text-white px-4 py-2 rounded hover:bg-[#0c647a]">
              Export to Excel
            </button>
          </div>
        </div>

        {role === "admin" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
            <input
              type="text"
              placeholder="Cari No DO"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={searchDO}
              onChange={(e) => setSearchDO(e.target.value)}
            />
            <select
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">Pilih Lokasi</option>
              {locations.map((location) => (
                <option key={location.id_lokasi} value={location.lokasi}>
                  {location.lokasi}
                </option>
              ))}
            </select>
            <div className="flex space-x-4">
              <input
                type="date"
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-[#0e7490] text-white">
                <th className="py-2 px-4 text-left">No. DO</th>
                <th className="py-2 px-4 text-left">Petugas</th>
                <th className="py-2 px-4 text-left">Lokasi</th>
                <th className="py-2 px-4 text-left">Tanggal</th>
                <th className="py-2 px-4 text-left">Jam</th>
                <th className="py-2 px-4 text-left">Dokumentasi</th>
                {role === "admin" && <th className="py-2 px-4 text-left">Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentData().map((item) => (
                <tr key={item.no_do} className="hover:bg-gray-100 transition-all">
                  <td className="py-2 px-4">{item.no_do}</td>
                  <td className="py-2 px-4">{item.nama_petugas}</td>
                  <td className="py-2 px-4">{item.lokasi}</td>
                  <td className="py-2 px-4">{item.tanggal}</td>
                  <td className="py-2 px-4">{item.jam}</td>
                  <td className="py-2 px-4">
                    <a
                      href={`https://checkpoint-sig.site:3000/uploads/${item.dokumentasi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline">
                      Dokumentasi
                    </a>
                  </td>
                  {role === "admin" && (
                    <td className="py-2 px-4">
                      <Link
                        to={`/detail/${item.no_do}`}
                        className="text-blue-500 hover:underline">
                        Detail
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <ul className="flex gap-2">
              {generatePagination().map((page, index) => (
                <li
                  key={index}
                  className={`px-3 py-1 ${
                    page === currentPage
                      ? "bg-[#0e7490] text-white"
                      : "bg-white text-[#0e7490] hover:bg-[#0c647a] hover:text-white"
                  } rounded-lg cursor-pointer transition-all`}
                  onClick={() => handlePageChange(page)}>
                  {page}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Laporan;
