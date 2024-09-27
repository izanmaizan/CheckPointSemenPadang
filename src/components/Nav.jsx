import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "../index.css";
import axios from "axios";

const Nav = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // Tambahkan state untuk role
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      // const response = await axios.get("https://backend-cpsp.vercel.app/me", {
      const response = await axios.get("http://193.203.162.80:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setName(response.data.name);
      setRole(response.data.role); // Set role dari response
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setName("");
    setRole("");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[rgba(12,100,122,0.7)] p-4 fixed top-0 left-0 w-full z-50 shadow-md backdrop-blur-sm rounded-lg">
      <nav className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <img
          src="../assets/Logo_ptsp.png"
          alt="logo"
          className="w-32 h-10 sm:w-32 sm:h-10"
        />

        {/* Hanya tampil jika isAuthenticated */}
        {isAuthenticated && (
          <>
            {/* Menu untuk Desktop */}
            <ul className="hidden lg:flex gap-8 items-center text-white">
              <li>
                <Link
                  to="/"
                  className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                  Beranda
                </Link>
              </li>
              {role === "admin" ? (
                <>
                  <li>
                    <Link
                      to="/laporan"
                      className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                      Laporan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/daftarlokasi"
                      className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                      Master Petugas
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/daftarakun"
                      className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                      Daftar Akun
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/check-point"
                      className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                      CheckPoint
                    </Link>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                  Keluar
                </button>
              </li>
            </ul>
          </>
        )}

        {/* Hamburger Menu untuk Mobile */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && isAuthenticated && (
        <ul className="lg:hidden bg-[rgba(21,94,117,0.7)] rounded-lg mt-4 flex flex-col items-center gap-4 p-4">
          <li className="text-white text-xl mb-2">Halo, {name}</li>{" "}
          <li>
            <Link
              to="/"
              onClick={toggleMenu}
              className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
              Beranda
            </Link>
          </li>
          {/* Tambahkan salam di dalam mobile menu */}
          {role === "admin" ? (
            <>
              <li>
                <Link
                  to="/laporan"
                  onClick={toggleMenu}
                  className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                  Laporan
                </Link>
              </li>
              <li>
                <Link
                  to="/daftarlokasi"
                  onClick={toggleMenu}
                  className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                  Master Petugas
                </Link>
              </li>
              <li>
                <Link
                  to="/daftarakun"
                  onClick={toggleMenu}
                  className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                  Daftar Akun
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/check-point"
                onClick={toggleMenu}
                className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                CheckPoint
              </Link>
            </li>
          )}
          <li>
            <button
              onClick={() => {
                toggleMenu();
                handleLogout();
              }}
              className="text-white bg-[#0c647a] hover:bg-[#0e7490] px-4 py-2 rounded">
              Keluar
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Nav;
