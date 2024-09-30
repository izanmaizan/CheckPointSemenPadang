import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex items-center justify-center bg-[#0e7490] text-white">
      <div className="text-center bg-[#1f9ab1] rounded-lg shadow-lg p-10">
        <h1 className="text-[8rem] font-extrabold leading-tight">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          Oops! Halaman Tidak Ditemukan!
        </h2>
        <p className="text-lg mb-6">
          Sepertinya halaman yang Anda cari <br />
          tidak ada atau mungkin telah dihapus.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-[#0e7490] border-white hover:bg-white hover:text-[#0e7490]">
            Kembali
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-white text-[#0e7490] hover:bg-[#dbe5e5] transition duration-200">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
