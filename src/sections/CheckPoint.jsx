import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import axios from "axios";

const CheckPoint = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestedPetugas, setSuggestedPetugas] = useState([]);
  const [selectedPetugas, setSelectedPetugas] = useState([]);
  const [noHp, setNoHp] = useState([]);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [noDO, setNoDO] = useState("");
  const [dokumentasi, setDokumentasi] = useState([]);
  const [dokumentasiPreview, setDokumentasiPreview] = useState([]);
  const [keterangan, setKeterangan] = useState("");
  const [namaPengemudi, setNamaPengemudi] = useState("");
  const [noTruck, setNoTruck] = useState("");
  const [distributor, setDistributor] = useState("");
  const [ekspeditur, setEkspeditur] = useState("");
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      fetchLocations();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const latitude = position.coords.latitude.toFixed(8);
          const longitude = position.coords.longitude.toFixed(8);

          // Memperbarui lokasi dengan latitude dan longitude
          setLocation((prevLocation) => ({
            latitude,
            longitude,
            address: prevLocation.address,
          }));

          // Memanggil fungsi untuk mendapatkan alamat
          await fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          setLocation({
            latitude: null,
            longitude: null,
            error: error.message,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by this browser.",
      });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchLocations = async () => {
    try {
      // const response = await axios.get("http://193.203.162.80:3000/titiklokasi", {
      const response = await axios.get("https://checkpoint-sig.site:3000/titiklokasi", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setLocations(
        response.data.map((loc) => ({
          value: loc.id_lokasi,
          label: loc.lokasi,
        }))
      );
    } catch (error) {
      console.error("Error fetching locations: ", error);
    }
  };

  const fetchPetugasByLocation = async (id_lokasi) => {
    try {
      const response = await axios.get(
        // `http://193.203.162.80:3000/petugas/${id_lokasi}`,
        `https://checkpoint-sig.site:3000/petugas/${id_lokasi}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      setSuggestedPetugas(response.data);
    } catch (error) {
      console.error("Error fetching petugas: ", error);
    }
  };

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
    fetchPetugasByLocation(selectedOption.value);
  };

  const handlePetugasChange = (selectedOptions) => {
    setSelectedPetugas(selectedOptions);
    const selectedNoHp = selectedOptions.map((option) => {
      const petugas = suggestedPetugas.find(
        (p) => p.nama_petugas === option.value
      );
      return petugas ? petugas.no_hp : "";
    });
    setNoHp(selectedNoHp);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Menyimpan dokumentasi asli
    setDokumentasi(files);

    // Membuat pratinjau untuk gambar dan video
    const filePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type, // Menyimpan tipe file (image/video)
    }));

    setDokumentasiPreview(filePreviews);
  };

  const handleDeleteFile = (index) => {
    setDokumentasi((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setDokumentasiPreview((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const resetForm = () => {
    setSelectedLocation(null);
    setSuggestedPetugas([]);
    setSelectedPetugas([]);
    setNoHp([]);
    setTanggal("");
    setJam("");
    setNoDO("");
    setDokumentasi([]);
    setDokumentasiPreview([]);
    setKeterangan("");
  };

  // Mengupdate fungsi untuk mendapatkan alamat dan lokasi
  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      // Menjalankan pengambilan alamat bersamaan dengan update lokasi
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      // Memperbarui alamat jika data berhasil diambil
      if (response.data && response.data.display_name) {
        setLocation((prevLocation) => ({
          ...prevLocation,
          address: response.data.display_name,
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setMsg("Gagal mendapatkan alamat, silakan coba lagi.");
    }
  };

  const handleCheckPoint = async (e) => {
    e.preventDefault();

    if (
      !selectedLocation ||
      !selectedPetugas.length ||
      !tanggal ||
      !jam ||
      !noDO ||
      !namaPengemudi ||
      !noTruck ||
      !distributor ||
      !ekspeditur
    ) {
      setMsg("Harap lengkapi semua field yang diperlukan");
      setShowModal(true);
      return;
    }

      // Cek apakah dokumentasi diisi
  if (dokumentasi.length === 0) {
    setMsg("Dokumentasi harus diisi sebelum mengirim data.");
    setShowModal(true);
    return;
  }

    // Cek apakah lokasi sudah aktif
    if (!location.latitude || !location.longitude || !location.address) {
      setMsg("Harap aktifkan izin lokasi di perangkat Anda dan coba lagi.");
      setShowModal(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "nama_petugas",
        selectedPetugas.map((p) => p.value).join(", ")
      );
      formData.append("no_hp", noHp.join(", "));
      formData.append("titik_lokasi", selectedLocation.label);
      formData.append("alamat", location.address);
      formData.append("tanggal", tanggal);
      formData.append("jam", jam);
      formData.append("no_do", noDO);
      formData.append("nama_pengemudi", namaPengemudi);
      formData.append("no_truck", noTruck);
      formData.append("distributor", distributor);
      formData.append("ekspeditur", ekspeditur);
      formData.append("keterangan", keterangan);

      if (dokumentasi.length > 0) {
        dokumentasi.forEach((file) => {
          formData.append("dokumentasi", file);
        });
      }

      const geofenceData = `${location.latitude},${location.longitude}`;
      formData.append("geofence_data", geofenceData);

      const response = await axios.post(
        // "http://193.203.162.80:3000/checkpoints",
        "https://checkpoint-sig.site:3000/checkpoints",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response);
      setMsg("Data berhasil disimpan!");
      resetForm();
    } catch (error) {
      console.error("Error:", error.response || error.message);
      setMsg("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  const handleModalOk = () => {
    setShowModal(false);

    // Periksa kembali lokasi jika sudah diperbarui
    if (location.latitude && location.longitude) {
      fetchAddressFromCoordinates(location.latitude, location.longitude);
    } else {
      // Jika lokasi masih tidak ada, coba lagi untuk mendapatkan lokasi
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude.toFixed(8);
            const longitude = position.coords.longitude.toFixed(8);
            setLocation({
              latitude,
              longitude,
              address: "",
            });
            fetchAddressFromCoordinates(latitude, longitude);
          },
          (error) => {
            setMsg("Tidak dapat mengakses lokasi: " + error.message);
            setShowModal(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    }
  };

  // const closeModal = () => setShowModal(false);

  return (
    <section className="px-5 py-20 h-full w-full">
      {/* Modal Pop-up */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">{msg}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleModalOk} // Ubah ini untuk meminta akses lokasi lagi
                className="bg-[#0E7490] text-white px-4 py-2 rounded hover:bg-[#155E75]">
                OK
              </button>
              {/* <button
                onClick={closeModal}
                className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                Batal
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-800">
              Mengunggah media, mohon ditunggu...
            </p>
          </div>
        </div>
      )}

      <div className="flex text-start gap-10 justify-center">
        {/* Lingkaran Latar Belakang */}
        <div className="absolute inset-0 overflow-hidden -z-1">
          {/* Lingkaran Pertama */}
          <div
            className="absolute w-[600px] h-[600px] 
                  sm:w-[800px] sm:h-[800px] 
                  md:w-[1100px] md:h-[1100px] 
                  lg:w-[1200px] lg:h-[1200px] 
                  rounded-full bg-[#0E7490] 
                  right-[-150px] top-[-370px]  
                  sm:right-[-120px] sm:-top-[610px] 
                  md:right-[-150px] md:-top-[900px] 
                  lg:right-[-180px] lg:-top-[990px]"></div>

          {/* Lingkaran Kedua */}
          <div
            className="absolute w-[600px] h-[600px] 
                  sm:w-[700px] sm:h-[700px] 
                  md:w-[1000px] md:h-[1000px] 
                  lg:w-[1100px] lg:h-[1100px] 
                  rounded-full bg-[#155E75] 
                  left-[-230px] -top-[370px] 
                  sm:left-[-120px] sm:-top-[510px] 
                  md:left-[-150px] md:-top-[800px] 
                  lg:left-[-180px] lg:-top-[890px]"></div>
        </div>
        <div className="w-full flex flex-col gap-5 z-10 justify-center items-start px-2">
          <h1
            className="absolute 
          top-[90px] left-[50px] 
          sm:top-[100px] sm:left-[100px] 
          md:top-[100px] md:left-[150px] 
          lg:top-[100px] lg:left-[200px] 
          flex flex-col sm:flex-row sm:items-center text-4xl font-semibold text-[#A5F3FC] font-Roboto">
            <div className="sm:mr-2 mb-2 sm:mb-0 sm:text-left md:text-center lg:text-right">
              Check
            </div>
            <div className="hidden sm:block">Point</div>
            <div className="block sm:hidden">Point</div>
          </h1>
          <div className="w-full mt-40">
            <form className="max-w-sm mx-auto" onSubmit={handleCheckPoint}>
              {/* Location Selection */}
              <div className="relative mb-6">
                <Select
                  options={locations}
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  className="react-select-container peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? "#737373" : "#737373",
                      boxShadow: "none", // Menghapus shadow default saat fokus
                      "&:hover": {
                        borderColor: "#737373", // Warna border saat hover
                      },
                      minHeight: "40px", // Menyesuaikan tinggi agar sesuai dengan input lain
                    }),
                  }}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Titik Lokasi
                </label>
              </div>

              {/* Petugas Selection */}
              <div className="relative mb-6">
                <Select
                  isMulti
                  options={suggestedPetugas.map((petugas) => ({
                    value: petugas.nama_petugas,
                    label: petugas.nama_petugas,
                  }))}
                  value={selectedPetugas}
                  onChange={handlePetugasChange}
                  className="react-select-container peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? "#737373" : "#737373",
                      boxShadow: "none", // Menghapus shadow default saat fokus
                      "&:hover": {
                        borderColor: "#737373", // Warna border saat hover
                      },
                      minHeight: "40px", // Menyesuaikan tinggi agar sesuai dengan input lain
                    }),
                  }}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Nama Petugas
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="date"
                  id="input-tanggal"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Tanggal
                </label>
              </div>
              {/* Time Input */}
              <div className="relative mb-6">
                <input
                  type="time" // This remains unchanged as 'time' will default to 24-hour format in most cases.
                  id="input-jam"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  required
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Jam
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  id="input-no-do"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  placeholder=" "
                  required
                  value={noDO}
                  onChange={(e) => setNoDO(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  No. DO
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  id="input-no-do"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  placeholder=" "
                  required
                  value={namaPengemudi}
                  onChange={(e) => setNamaPengemudi(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Nama Pengemudi
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  id="input-no-do"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  placeholder=" "
                  required
                  value={noTruck}
                  onChange={(e) => setNoTruck(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  No Truck / Gerbong
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  id="input-no-do"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  placeholder=" "
                  required
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Distributor
                </label>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  id="input-no-do"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-[#737373] focus:border-[#737373]"
                  placeholder=" "
                  required
                  value={ekspeditur}
                  onChange={(e) => setEkspeditur(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Ekspeditur
                </label>
              </div>

              <div className="relative mb-6">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-input"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-input"
                    className="flex justify-between items-center bg-[#0E7490] text-white px-4 py-2 rounded-md border border-[#737373] cursor-pointer">
                    <span>Tambah media</span>
                    <span>{dokumentasiPreview.length} media dipilih</span>
                  </label>
                </div>

                {/* Display file previews */}
                {dokumentasiPreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {dokumentasiPreview.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview.type.startsWith("image/") ? (
                          <img
                            src={preview.url}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover rounded-md border border-[#737373]"
                          />
                        ) : (
                          <video
                            controls
                            className="w-full h-full object-cover rounded-md border border-[#737373]">
                            <source src={preview.url} type={preview.type} />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-[#0E7490] text-white rounded-full p-1"
                          onClick={() => handleDeleteFile(index)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M6.293 9.293a1 1 0 011.414 0L10 10.586l2.293-2.293a1 1 0 111.414 1.414L11.414 12l2.293 2.293a1 1 0 01-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 12 6.293 9.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Keterangan Input */}
              <div className="relative mb-6 mt-6">
                <textarea
                  id="input-keterangan"
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border-2 placeholder-shown:border-[#737373] placeholder-shown:border-t-[#737373] border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px]  resize-none"
                  placeholder=" "
                  rows={2}
                  // required
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-[#737373] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[#737373] transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-[#737373] peer-focus:text-[#737373] before:border-[#737373] peer-focus:before:border-[#737373] after:border-[#737373] peer-focus:after:border-[#737373]">
                  Keterangan
                </label>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <button
                  type="submit"
                  className="inline-block w-[170px] h-[60px] bg-[#155E75] text-white font-sans font-bold uppercase text-sm px-6 py-3 rounded-lg shadow-md hover:bg-[#0E7490] hover:shadow-lg focus:bg-[#0E7490] focus:shadow-lg focus:outline-none focus:ring-0 active:bg-[#0E7490] active:shadow-lg transition duration-150 ease-in-out">
                  Simpan
                </button>

                <Link to="/">
                  <button className="inline-block  w-[170px] h-[60px] bg-[#0E7490] text-white font-sans font-bold uppercase text-sm px-6 py-3 rounded-lg shadow-md hover:bg-[#155E75] hover:shadow-lg focus:bg-[#155E75] focus:shadow-lg focus:outline-none focus:ring-0 active:bg-[#0A5E75] active:shadow-md transition duration-150 ease-in-out">
                    Kembali
                  </button>
                </Link>
              </div>
              {msg && (
                <div className="mt-6">
                  <p className="text-center text-red-500">{msg}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* <div>
        <h1>Real-Time User Location</h1>
        {location.latitude && location.longitude ? (
          <div>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <p>Address: {location.address}</p>
          </div>
        ) : (
          <p>{location.error ? location.error : "Fetching location..."}</p>
        )}
      </div> */}
    </section>
  );
};

export default CheckPoint;
