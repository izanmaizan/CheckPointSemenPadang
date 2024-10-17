import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { Nav } from "../components";

const Laporan = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [role, setRole] = useState(""); // Tambahkan state untuk role
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
      // Panggil fetchUserData untuk mendapatkan role dari server
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async () => {
    setLoading(true); // Tambahkan ini
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

      // Fetch lokasi untuk admin dan petugas
      fetchLocations();

      // Jika role adalah petugas, ambil data berdasarkan titik lokasi yang disimpan
      if (data.role === "admin") {
        fetchReportData();
      } else {
        // Jika petugas, ambil data dari localStorage dan filter berdasarkan titik lokasi
        const storedLocation = JSON.parse(localStorage.getItem("selectedLocation"));
        const storedDate = JSON.parse(localStorage.getItem("selectedDate"));
        fetchFilteredReportData(storedLocation, storedDate);
      }
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setErrorMessage("Terjadi kesalahan, mohon login kembali.");
    } finally {
      setLoading(false); // Pastikan ini ada di sini
    }
  };

  // Fungsi untuk mengambil data laporan berdasarkan lokasi dan tanggal
  const fetchFilteredReportData = async (location, date) => {
    setLoading(true);
    try {
      const response = await axios.get("https://checkpoint-sig.site:3000/laporan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      // Filter data berdasarkan lokasi dan tanggal yang disimpan
      const filteredReports = response.data.filter(item => 
        item.lokasi === location && item.tanggal === date
      );

      setReportData(filteredReports);
      setFilteredData(filteredReports);
    } catch (error) {
      console.error("Error fetching report data: " + error);
      setMsg("Gagal untuk menampilkan Data. Coba lagi.");
    }
    setLoading(false);
  };

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
    }
    setLoading(false);
  };

  // Fungsi untuk mengambil data lokasi dari endpoint
  const fetchLocations = async () => {
    try {
      const response = await axios.get("https://checkpoint-sig.site:3000/titiklokasi", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setLocations(response.data); // Menyimpan data lokasi yang diterima ke state
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
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
  };

  const generatePagination = () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = [];

    // Always show the first page
    pagination.push(1);

    // If currentPage is far from the first page, add ellipsis
    if (currentPage > 3) {
      pagination.push("...");
    }

    // Show up to 2 pages before and after the current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pagination.push(i);
    }

    // If currentPage is far from the last page, add ellipsis
    if (currentPage < totalPages - 2) {
      pagination.push("...");
    }

    // Always show the last page
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
            <p className="text-center text-gray-800">Loading...</p>
          </div>
        </div>
      )}

      <Nav username={username} />

      <h2 className="text-3xl font-semibold mb-4">Laporan Cek Poin</h2>

      {/* Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari No DO"
          value={searchDO}
          onChange={(e) => setSearchDO(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 mr-2"
        />
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 mr-2">
          <option value="">Pilih Lokasi</option>
          {locations.map((loc) => (
            <option key={loc.id_lokasi} value={loc.lokasi}>
              {loc.lokasi}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 mr-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
          Cari
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75] ml-2">
          Export ke Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75] ml-2">
          Print
        </button>
      </div>

      <table className="min-w-full border border-gray-300 mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">No DO</th>
            <th className="border border-gray-300 p-2">Petugas</th>
            <th className="border border-gray-300 p-2">Lokasi</th>
            <th className="border border-gray-300 p-2">Tanggal</th>
            <th className="border border-gray-300 p-2">Jam</th>
            <th className="border border-gray-300 p-2">Dokumentasi</th>
            <th className="border border-gray-300 p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentData().map((item) => (
            <tr key={item.no_do}>
              <td className="border border-gray-300 p-2">{item.no_do}</td>
              <td className="border border-gray-300 p-2">{item.petugas}</td>
              <td className="border border-gray-300 p-2">{item.lokasi}</td>
              <td className="border border-gray-300 p-2">{item.tanggal}</td>
              <td className="border border-gray-300 p-2">{item.jam}</td>
              <td className="border border-gray-300 p-2">
                {item.dokumentasi ? (
                  <a
                    href={`data:image/jpeg;base64,${item.dokumentasi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline">
                    Lihat
                  </a>
                ) : (
                  "Tidak ada dokumentasi"
                )}
              </td>
              <td className="border border-gray-300 p-2">
                <Link
                  to={`/details/${item.no_do}`}
                  className="text-blue-600 hover:underline">
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div className="flex justify-between items-center">
        <div>
          <span>Halaman {currentPage} dari {totalPages}</span>
        </div>
        <div className="flex">
          {generatePagination().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded-lg mx-1 ${currentPage === page ? "bg-[#0E7490] text-white" : "text-[#0E7490]"}`}>
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Laporan;
