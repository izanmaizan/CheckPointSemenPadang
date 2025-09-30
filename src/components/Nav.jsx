import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { RiShieldUserFill, RiMapPinUserFill } from "react-icons/ri"; // Import icons for user and admin
import "../index.css";
import axios from "axios";

const Nav = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setUsername(response.data.username);
      setName(response.data.name);
      setRole(response.data.role); // Set role dari response
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("selectedLocation"); // Clear selectedLocation
    localStorage.removeItem("tanggal"); // Clear tanggal
    setIsAuthenticated(false);
    setName("");
    setRole("");
    navigate("/login");
  };
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-[rgba(12,100,122,0.7)] p-4 fixed top-0 left-0 w-full z-50 shadow-md backdrop-blur-sm rounded-lg">
      <nav className="max-w-screen-xl mx-auto flex justify-between items-center">
        <img
          src="../assets/Logo_ptsp.png"
          alt="logo"
          className="w-32 h-10 sm:w-32 sm:h-10"
        />

        {isAuthenticated && (
          <>
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
                
                <li>
                <Link
                  to="/laporan"
                  className="text-[#A5F3FC] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#A5F3FC] transition-all duration-300">
                  Laporan
                </Link>
              </li>
              </>
              )}
              <div className="flex flex-row">
                {role === "admin" ? (
                  <RiShieldUserFill size={24} className="text-[#A5F3FC] mr-2" />
                ) : (
                  <RiMapPinUserFill size={24} className="text-[#A5F3FC] mr-2" />
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="text-[#A5F3FC] font-bold flex items-center">
                    {name} <span className="ml-2">▼</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 bg-white text-black rounded-lg shadow-lg mt-2 p-4 transition-all duration-200">
                      <p className="font-semibold">Username: {username}</p>
                      <p className="font-semibold">Role: {role}</p>
                      <div className="border-t border-gray-300 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-800 font-bold w-full text-left">
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ul>
          </>
        )}

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && isAuthenticated && (
        <ul className="lg:hidden bg-[rgba(21,94,117,0.7)] rounded-lg mt-4 flex flex-col items-center gap-10 p-4">
          <li className="text-white text-xl mb-2">Halo, {name}</li>
          <li>
            <Link
              to="/"
              onClick={toggleMenu}
              className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
              Beranda
            </Link>
          </li>
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
            <>
            <li>
              <Link
                to="/check-point"
                onClick={toggleMenu}
                className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                CheckPoint
              </Link>
            </li>
              <li>
                <Link
                  to="/laporan"
                  onClick={toggleMenu}
                  className="text-white hover:text-gray-300 border-b-2 border-transparent hover:border-white transition-all duration-300">
                  Laporan
                </Link>
              </li>
              </>
          )}
          <li>
            <button
              onClick={() => {
                toggleMenu();
                handleLogout();
              }}
              className="bg-red-600 text-white hover:bg-red-700 border border-transparent px-4 py-2 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
              Keluar
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Nav;
