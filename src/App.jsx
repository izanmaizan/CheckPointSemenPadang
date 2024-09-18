import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Nav } from "./components";
import {
  Beranda,
  Daftar,
  Login,
  TitikLokasi,
  CheckPoint,
  Laporan,
  Detail,
  TambahPetugas,
  DaftarTitikLokasi,
  TambahLokasi,
  TambahGeofence,
  TambahAkun,
  DaftarAkun,
  NotFound,
} from "./sections";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-grow">
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Beranda />} />
            <Route path="/check-point" element={<CheckPoint />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Daftar />} />
            <Route path="/lokasi" element={<TitikLokasi />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/detail/:no_do" element={<Detail />} />
            <Route path="/daftarlokasi" element={<DaftarTitikLokasi />} />
            <Route path="/tambahlokasi" element={<TambahLokasi />} />
            <Route path="/tambahpetugas" element={<TambahPetugas />} />
            <Route path="/geofence" element={<TambahGeofence />} />
            <Route path="/tambahakun" element={<TambahAkun />} />
            <Route path="/daftarakun" element={<DaftarAkun />} />
          </Routes>
        </main>
        <footer className="bg-[#155E75] h-12 w-full flex items-center justify-center text-white">
          {/* Konten Footer */}
          <p>© 2024 Aplikasi Cek Poin. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
