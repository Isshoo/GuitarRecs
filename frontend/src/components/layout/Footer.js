export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} GuitarRecs. Sistem Rekomendasi Gitar menggunakan Metode Collaborative
              Filtering.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 md:justify-end space-x-6">
            <p className="text-sm text-gray-400">Dibuat untuk Tugas Akhir</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
