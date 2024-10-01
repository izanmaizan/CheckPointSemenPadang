import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TambahAkun = ({ user, onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      // Panggil fetchUserData untuk mendapatkan role dari server
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      // const response = await axios.get("http://localhost:3000/me", {
        // const response = await axios.get("http://193.203.162.80:3000/me", {
        const response = await axios.get("https://checkpoint-sig.site:3000/me", {
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
        // Jika admin, lanjutkan dengan pengisian data akun
        if (user) {
          setUsername(user.username);
          setName(user.name);
          setRole(user.role);
          setIsEditing(true);
        } else {
          setUsername("");
          setName("");
          setRole("user");
          setIsEditing(false);
        }
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

  const handleUsernameChange = (e) => {
    // Allow only letters and numbers, no spaces or symbols
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setUsername(value);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Update password strength
    const strength = getPasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword || !name) {
      setError("Silahkan isi semua kolom.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak sama.");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          // `http://193.203.162.80:3000/update-akun/${username}`,
          `https://checkpoint-sig.site:3000/update-akun/${username}`,
          {
            // await axios.put(`http://localhost:3000/update-akun/${username}`, {
            username,
            password,
            name,
            role,
          }
        );
        alert("User berhasil diperbarui!");
      } else {
        await axios.post("https://checkpoint-sig.site:3000/register", {
        // await axios.post("http://193.203.162.80:3000/register", {
          // await axios.post("http://localhost:3000/register", {
          username,
          password,
          confirmPassword,
          name,
          role,
        });
        alert("User berhasil ditambahkan!");
      }
      onSuccess(); // Notify parent component
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(`Gagal untuk ${isEditing ? "Perbarui" : "Tambahkan"} user.`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-extrabold mb-4 text-gray-900">
          {isEditing ? "Ubah User" : "Tambah User"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg"
              disabled={isEditing}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg"
            />
          </div>
          <div className="mb-4 relative">
            <label className="block mb-2 text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg pr-10"
            />
            <button
              type="button"
              onMouseDown={() => setPasswordVisible(true)}
              onMouseUp={() => setPasswordVisible(false)}
              className="absolute right-2 top-2">
              👁️
            </button>
          </div>
          {password && (
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">
                Password Strength
              </label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    passwordStrength < 2
                      ? "bg-red-600"
                      : passwordStrength < 4
                        ? "bg-yellow-600"
                        : "bg-green-600"
                  }`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
              </div>
            </div>
          )}
          <div className="mb-4 relative">
            <label
              className="block mb-2 text-gray-700"
              htmlFor="confirmPassword">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg pr-10"
            />
            <button
              type="button"
              onMouseDown={() => setConfirmPasswordVisible(true)}
              onMouseUp={() => setConfirmPasswordVisible(false)}
              className="absolute right-2 top-2">
              👁️
            </button>
          </div>
          {password && confirmPassword && (
            <p
              className={`mb-4 ${
                password === confirmPassword ? "text-green-600" : "text-red-600"
              }`}>
              {password === confirmPassword
                ? "Password sama."
                : "Password tidak sama."}
            </p>
          )}
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="role">
              Peran
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg">
              <option value="petugas">Petugas</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              {isEditing ? "Perbarui" : "Tambah"} User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#0c647a] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f63]">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahAkun;
