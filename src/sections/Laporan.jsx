import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { Nav } from "../components";

const Laporan = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [role, setRole] = useState(""); // State untuk role
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
      fetchUserData(); // Panggil fungsi untuk mengambil data pengguna
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

      // Mengambil data laporan dan lokasi untuk admin dan petugas
      fetchReportData();
      fetchLocations();

    } catch (error) {
      console.error("Error fetching user data: " + error);
      setErrorMessage("Terjadi kesalahan, mohon login kembali.");
    } finally {
      setLoading(false); // Pastikan loading selesai
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

    // Jika role adalah petugas, filter berdasarkan lokasi dan tanggal yang disimpan di localStorage
    if (role === "petugas") {
      const storedLocation = localStorage.getItem("selectedLocation");
      const storedDate = localStorage.getItem("selectedDate");
      if (storedLocation) {
        filtered = filtered.filter((item) => item.lokasi === storedLocation);
      }
      if (storedDate) {
        filtered = filtered.filter((item) => item.tanggal === storedDate);
      }
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
            <p className="text-center text-gray-800">Loading, please wait...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        {/* Lingkaran Latar Belakang */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div
            className="absolute w-[400px] h-[400px] 
                  sm:w-[500px] sm:h-[500px] 
                  md:w-[700px] md:h-[700px] 
                  lg:w-[1000px] lg:h-[1000px] 
                  rounded-full bg-gradient-to-br from-[#4B9CD3] to-[#0E7490] animate-spin-slow">
          </div>
        </div>

        <Nav />

        <h1 className="text-center font-bold text-3xl text-[#0e7490] mb-10">
          Laporan Check Point
        </h1>

        <div className="flex justify-between items-center mb-4">
          <div>
            <input
              type="text"
              placeholder="Cari No. DO"
              value={searchDO}
              onChange={(e) => setSearchDO(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border rounded px-2 py-1 ml-2">
              <option value="">Semua Lokasi</option>
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
              className="border rounded px-2 py-1 ml-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 ml-2"
            />
          </div>

          <div>
            <button
              onClick={handlePrint}
              className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75] mr-2">
              Print
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
              Export Excel
            </button>
          </div>
        </div>

        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#0E7490] text-white">
              <th className="border border-gray-300 px-4 py-2">Petugas</th>
              <th className="border border-gray-300 px-4 py-2">Lokasi</th>
              <th className="border border-gray-300 px-4 py-2">No. DO</th>
              <th className="border border-gray-300 px-4 py-2">Tanggal</th>
              <th className="border border-gray-300 px-4 py-2">Jam</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData().map((item) => (
              <tr key={item.id_cp} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2">{item.nama_petugas}</td>
                <td className="border border-gray-300 px-4 py-2">{item.lokasi}</td>
                <td className="border border-gray-300 px-4 py-2">{item.no_do}</td>
                <td className="border border-gray-300 px-4 py-2">{item.tanggal}</td>
                <td className="border border-gray-300 px-4 py-2">{item.jam}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link to={`/details/${item.id_cp}`} className="text-blue-500 hover:underline">Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-gray-700">
              Menampilkan {itemsPerPage * (currentPage - 1) + 1} hingga{" "}
              {Math.min(itemsPerPage * currentPage, filteredData.length)} dari{" "}
              {filteredData.length} hasil
            </p>
          </div>

          <div className="flex">
            {generatePagination().map((page, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                className={`border rounded px-3 py-1 mx-1 ${page === currentPage ? "bg-[#0E7490] text-white" : "bg-white text-[#0E7490] hover:bg-[#e1e1e1]"}`}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Laporan;
