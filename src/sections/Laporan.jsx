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
    try {
      const timeout = setTimeout(() => {
        setErrorMessage("Loading berlangsung lama, mohon login kembali.");
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
      setRole(data.role); // Simpan role yang diterima dari backend
      localStorage.setItem("username", data.username);

      // Pengecekan role setelah data user didapatkan
      if (data.role === "admin") {
        fetchReportData();
        fetchLocations(); // Memanggil fungsi untuk mengambil data lokasi
      } else {
        setMsg(
          "Anda tidak punya akses ke halaman ini. Dikembalikan ke Halaman Utama..."
        );
        setTimeout(() => navigate("/"), 3000); // Redirect setelah 3 detik
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setErrorMessage("Terjadi kesalahan, mohon login kembali.");
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
      const response = await axios.get(
        "http://193.203.162.80:3000/laporan",
        {
          // const response = await axios.get("http://localhost:3000/laporan", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      setReportData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching report data: " + error);
      setMsg("Failed to fetch data. Please try again.");
    }
    setLoading(false);
  };

  // Fungsi untuk mengambil data lokasi dari endpoint
  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://193.203.162.80:3000/titiklokasi",
        {
          // const response = await axios.get("http://localhost:3000/titiklokasi", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      setLocations(response.data); // Menyimpan data lokasi yang diterima ke state
    } catch (error) {
      console.error("Error fetching locations: " + error);
      setMsg("Failed to fetch locations. Please try again.");
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
            <p className="text-center text-gray-800">Loading, please wait...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        {/* Lingkaran Latar Belakang */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute w-[400px] h-[400px] sm:w-[1000px] sm:h-[1000px] rounded-full bg-[#0E7490] top-[-280px] right-[-220px] sm:right-[-350px] sm:-top-[830px]"></div>
        </div>
        <h1 className="text-[40px] font-semibold mb-5 text-[#155E75] font-Roboto">
          <div>Laporan</div>
          <div>Check Point</div>
        </h1>

        <div className="mb-4 flex flex-col md:flex-row justify-between items-center mx-5 gap-2">
          {/* Pencarian berdasarkan No. DO */}
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <input
              type="text"
              placeholder="Cari berdasarkan No. DO"
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
              value={searchDO}
              onChange={(e) => setSearchDO(e.target.value)}
            />
          </div>

          {/* Dropdown filter berdasarkan titik lokasi */}
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <select
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">Semua Lokasi</option>
              {locations.map((location) => (
                <option key={location.id_lokasi} value={location.lokasi}>
                  {location.lokasi}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal */}
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <input
              type="date"
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>&gt;</span>
            <input
              type="date"
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Tombol Cetak dan Ekspor */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
              Cetak ke PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
              Ekspor ke Excel
            </button>
          </div>
        </div>

        {/* Tabel untuk tampilan desktop */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  Petugas
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  No. DO
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  Jam
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData().map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {item.lokasi}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {item.petugas}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {item.no_do}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {item.tanggal}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {item.jam}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    <button
                      onClick={() => navigate(`/detail/${item.no_do}`)} // Menggunakan ID untuk navigasi
                      className="mt-2 bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tampilan mobile */}
        <div className="block md:hidden">
          {currentData().map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                <span className="font-semibold">Lokasi:</span>
                <span>{item.lokasi}</span>
              </div>

              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                <span className="font-semibold">Petugas:</span>
                <span>{item.petugas}</span>
              </div>

              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                <span className="font-semibold">No. DO:</span>
                <span>{item.no_do}</span>
              </div>

              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                <span className="font-semibold">Tanggal:</span>
                <span>{item.tanggal}</span>
              </div>

              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                <span className="font-semibold">Jam:</span>
                <span>{item.jam}</span>
              </div>

              <button
                onClick={() => navigate(`/detail/${item.no_do}`)} // Menggunakan ID untuk navigasi
                className="mt-2 bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
                Detail
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              {"<"}
            </button>

            {/* Page Numbers */}
            {generatePagination().map((page, index) =>
              page === "..." ? (
                <span key={index} className="mx-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${currentPage === page ? "bg-[#0E7490] text-white" : "bg-gray-300 text-gray-700"}`}>
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              {">"}
            </button>
          </div>

          {/* Page Info */}
          <div className="text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Laporan;
