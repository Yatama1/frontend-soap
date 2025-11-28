// ✅ Import
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PropertiSaya() {
  const [propertiList, setPropertiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Ambil semua data properti dari backend
  useEffect(() => {
    const fetchProperti = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rumah");
        if (!response.ok) throw new Error("Gagal memuat data properti");
        const data = await response.json();

        setPropertiList(data.data || []); // sesuai format backend kamu
      } catch (err) {
        console.error(err);
        setError("Tidak dapat memuat data properti. Pastikan server backend berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperti();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-20">Memuat data properti...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-20">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-black">Data Properti</h1>

      {propertiList.length === 0 ? (
        <p className="text-gray-500">Belum ada data properti.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-50 shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-black">
                <th className="p-3 border-b">Nama Properti</th>
                <th className="p-3 border-b">Image</th>
                <th className="p-3 border-b">Tipe Rumah</th>
                <th className="p-3 border-b">Harga</th>
                <th className="p-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {propertiList.map((prop) => (
                <tr key={prop.id_properti} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-black">{prop.nama_properti}</td>
                  <td className="px-4 py-2 text-black">{prop.image ? (
                    <img src={prop.image} alt={prop.nama_properti} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <p className="text-gray-300">Tidak ada gambar</p>
                  )}</td>
                  <td className="px-4 py-2 text-black">{prop.Rumah?.tipe_rumah || "-"}</td>
                  <td className="px-4 py-2 font-semibold text-black">
                    {prop.Rumah?.harga
                      ? `Rp ${Number(prop.Rumah.harga).toLocaleString("id-ID")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-center text-black">
                    <Link
                      to={`/member/properti/${prop.id_properti}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
