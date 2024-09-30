import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import icons

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State untuk menampilkan loading
  const [msg, setMsg] = useState(""); // State untuk pesan error atau sukses
  const [showPassword, setShowPassword] = useState(false); // State untuk mengontrol visibilitas password

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Menandakan bahwa proses login sedang berlangsung

    if (!username || !password) {
      setMsg("Please fill in all fields"); // Menampilkan pesan jika ada field yang kosong
      setIsLoading(false);
      return;
    } else {
      try {
        // server public
        const response = await axios.post(
          // "http://193.203.162.80:3000/login", 
          "https://checkpoint-sig.site:3000/login", 
          {
            // server local
            // const response = await axios.post("http://localhost:3000/login", {
            username: username,
            password: password,
          },
          //  { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem("refresh_token", accessToken);

        navigate("/"); // Navigasi setelah login berhasil
        window.location.reload();
      } catch (error) {
        if (error.response.status === 401) {
          setMsg("Password salah"); // Menampilkan pesan jika password salah
        } else if (error.response.status === 404) {
          setMsg("Username belum terdaftar"); // Menampilkan pesan jika username belum terdaftar
        } else {
          setMsg("Gagal untuk Login");
        }
      } finally {
        setIsLoading(false); // Mengakhiri proses loading setelah selesai
      }
    }
  };

  return (
    <section className="bg-white px-5 py-20 md:py-28 md:px-20 h-full w-full flex flex-col justify-between">
      <div className="grid items-center gap-10 justify-center w-full">
        
        {/* Lingkaran Latar Belakang */}
        <div className="absolute inset-0 overflow-hidden -z-1">
          {/* Lingkaran Pertama */}
          <div
            className="absolute w-[500px] h-[500px] 
                  sm:w-[800px] sm:h-[800px] 
                  md:w-[1100px] md:h-[1100px] 
                  lg:w-[1000px] lg:h-[1000px] 
                  rounded-full bg-[#0E7490] 
                  top-[-220px] right-[-150px] 
                  sm:right-[-300px] sm:top-[-500px] 
                  md:right-[-280px] md:top-[-810px] 
                  lg:right-[-150px] lg:top-[-710px]"></div>

          {/* Lingkaran Kedua */}
          <div
            className="absolute w-[500px] h-[500px] 
                  sm:w-[700px] sm:h-[700px] 
                  md:w-[1000px] md:h-[1000px] 
                  lg:w-[1000px] lg:h-[1000px] 
                  rounded-full bg-[#155E75] 
                  top-[-220px] left-[-130px] 
                  sm:left-[-250px] sm:top-[-410px] 
                  md:left-[-280px] md:top-[-720px] 
                  lg:left-[-150px] lg:top-[-730px]"></div>
        </div>

        {/* Selamat Datang */}
        <div className="relative flex flex-col z-10 justify-center items-center text-center -left-[0px] sm:-left-[120px] md:-left-[180px] lg:-left-[290px] w-10 md:w-full px-10">
          <h1 className="text-4xl font-semibold text-[#A5F3FC] font-Roboto mb-8">
            Selamat Datang
          </h1>
        </div>

        <div className="relative flex flex-col z-10 justify-center text-left">
          <div className="mt-10">
            {msg && <p className="text-red-500 mb-4">{msg}</p>}{" "}
            {/* Menampilkan pesan error */}
            <form className="max-w-sm mx-auto mt-6" onSubmit={handleLogin}>
              <div className="relative z-0 w-full mb-5 group">
                <input
                  name="floating_username"
                  type="text"
                  id="username-input"
                  className="block py-2.5 px-0 w-full font-bold text-lg text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <label
                  htmlFor="floating_username"
                  className="peer-focus:font-medium absolute font-bold text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Username
                </label>
              </div>

              <div className="relative z-0 w-full mb-4 group">
                <input
                  name="floating_password"
                  type={showPassword ? "text" : "password"} // Toggle antara "text" dan "password"
                  id="password-input"
                  className="block py-2.5 px-0 w-full font-bold text-lg text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off" 
                  required
                />
                <label
                  htmlFor="floating_password"
                  className="peer-focus:font-medium absolute font-bold text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Password
                </label>

                {/* Tombol untuk mengontrol visibilitas password */}
                <div
                  className="absolute right-0 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <AiFillEyeInvisible size={20} />
                  ) : (
                    <AiFillEye size={20} />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="text-white bg-[#0e7490] hover:bg-[#0c647a] focus:ring-4 focus:outline-none focus:ring-[#0c647a] font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-[#0e7490] dark:hover:bg-[#0c647a] dark:focus:ring-[#0c647a] mt-3"
                disabled={isLoading} // Tombol tidak bisa diklik saat proses loading
              >
                {isLoading ? "Pending sebentar..." : "MASUK"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
