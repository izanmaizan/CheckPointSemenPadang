import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Beranda = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // Cek apakah mobile
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      fetchUserData();
    } else {
      navigate("/login");
    }
  
    // Event listener untuk deteksi perubahan ukuran layar
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
  
    window.addEventListener("resize", handleResize, { passive: true }); // Tambahkan passive: true
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [navigate]);
  

  // Teks singkat (sebagian) dan teks lengkap
  const shortText =
    "Check Point adalah proses pemeriksaan yang dilakukan di titik atau lokasi tertentu sebelum barang sampai pada tujuan.";
  const fullText = `Check Point adalah proses pemeriksaan yang dilakukan di titik
  atau lokasi tertentu sebelum barang sampai pada tujuan. Dalam
  melakukan Check Point, petugas memeriksa surat perintah jalan,
  kondisi barang dan truk untuk memastikan keamanan dan
  kelengkapan dalam pengiriman.`;

  // Fungsi untuk toggle teks
  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setErrorMessage("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      // const response = await axios.get("https://backend-cpsp.vercel.app/me", {
      // const response = await axios.get("http://193.203.162.80:3000/me", {
      const response = await axios.get("https://checkpoint-sig.site:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      clearTimeout(timeout);
      const data = response.data;
      setUsername(data.username);
      setRole(data.role); // Simpan role yang diterima dari backend
      localStorage.setItem("username", data.username);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setErrorMessage("Terjadi kesalahan, mohon login kembali.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center">
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div
        className="absolute w-[400px] h-[400px] 
                sm:w-[580px] sm:h-[580px] 
                md:w-[680px] md:h-[680px] 
                lg:w-[700px] lg:h-[700px] 
                rounded-full bg-[#155E75] 
                top-[-200px] right-[-200px] 
                sm:right-[-150px] sm:top-[-350px]
                md:right-[-150px] md:top-[-450px]
                "></div>
    </div>
      <section className="relative w-full max-w-screen-lg px-4 sm:px-6 lg:px-8 py-20 flex flex-col justify-center items-center space-y-8">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading...</p>
            <div className="loader border-t-4 border-[#155E75] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
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
          </div>
        ) : username ? (
          <>
            <div className="w-full text-left">
              <h1 className="w-[40%] text-2xl sm:text-4xl font-bold text-[#155E75] mb-4">
                Selamat Datang di{" "}
                <span className="text-4xl sm:text-5xl">CPSP</span>
              </h1>
              <h3 className="text-base sm:text-base font-bold text-[#155E75] mb-4">
                Layanan Operasional Transportasi
              </h3>

              <p className="w-full text-[#155E75] text-xl sm:text-2xl pt-4 text-justify">
                {/* Tampilkan teks sesuai dengan kondisi */}
                {isMobile ? (isExpanded ? fullText : shortText) : fullText}
              </p>

              {/* Tombol "Lanjutkan" hanya muncul di mobile */}
              {isMobile && (
                <button
                  onClick={toggleText}
                  className="text-[#155E75] font-bold underline mt-2 sm:hidden">
                  {isExpanded ? "Sembunyikan" : "Lanjutkan"}
                </button>
              )}
            </div>

            <div className="w-full max-w-4xl">
              <iframe
                className="w-full h-64 md:h-96"
                src="https://www.youtube.com/embed/hDepAm-sDGA"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video Semen Padang"></iframe>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-center mt-8">
              {role === "admin" ? (
                <>
                  <Link to="/laporan">
                    <button className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-4 transition-all">
                      Laporan
                    </button>
                  </Link>
                  <Link to="/daftarlokasi">
                    <button className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-4 transition-all">
                      Master Petugas
                    </button>
                  </Link>
                  <Link to="/daftarakun">
                    <button className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-4 transition-all">
                      Daftar Akun
                    </button>
                  </Link>
                </>
              ) : role === "petugas" ? (
                <>
                {/* <div className="col-span-3"> */}
                  <Link to="/check-point">
                    <button className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-4 transition-all">
                      Check Point
                    </button>
                  </Link>
                  <Link to="/laporan">
                    <button className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-4 transition-all">
                      Laporan
                    </button>
                  </Link>
                {/* </div> */}
                  </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-red-600 font-bold mb-4">
              Terjadi kesalahan, mohon login kembali.
            </p>
            <Link
              to="/login"
              className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full px-5 py-2 transition-all">
              Kembali ke Login
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default Beranda;
