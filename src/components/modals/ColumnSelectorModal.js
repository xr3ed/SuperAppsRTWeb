import React, { useState, useEffect } from 'react';

const ColumnSelectorModal = ({ isOpen, onClose, availableColumns, currentSelectedColumns, onSaveAndExport }) => {
  const [selected, setSelected] = useState(new Set(currentSelectedColumns));

  useEffect(() => {
    // Pastikan state 'selected' di-update ketika modal dibuka atau currentSelectedColumns berubah
    if (isOpen) {
      setSelected(new Set(currentSelectedColumns));
    }
  }, [currentSelectedColumns, isOpen]);

  const handleToggleColumn = (columnKey) => {
    const newSelected = new Set(selected);
    if (newSelected.has(columnKey)) {
      newSelected.delete(columnKey);
    } else {
      newSelected.add(columnKey);
    }
    setSelected(newSelected);
  };

  const handleSaveAndExportClick = () => {
    // Validasi minimal bisa dilakukan di sini atau di Warga.js
    if (selected.size === 0) {
      // Mungkin tampilkan toast atau pesan error dari sini jika diperlukan, atau biarkan Warga.js yg handle
      // alert('Pilih setidaknya satu kolom untuk diekspor.');
      // return;
    }
    onSaveAndExport(Array.from(selected));
    // Penutupan modal sekarang idealnya diatur oleh Warga.js setelah onSaveAndExport dipanggil,
    // terutama jika ada validasi atau proses async. 
    // Namun, jika onSaveAndExport langsung memicu toast dan tidak ada error yang perlu modal tetap terbuka,
    // menutup di sini bisa jadi pilihan.
    // onClose(); // Dipindahkan ke Warga.js untuk kontrol yang lebih baik setelah ekspor
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h4 className="text-lg font-semibold mb-4">Pilih Kolom untuk Ekspor CSV</h4>
        <div className="max-h-60 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {availableColumns.map(col => (
            <div key={col.key} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`csv-col-${col.key}`} // Tambah prefix untuk ID unik jika ada modal lain
                checked={selected.has(col.key)}
                onChange={() => handleToggleColumn(col.key)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`csv-col-${col.key}`} className="ml-2 text-sm text-gray-700">{col.label}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose} // Tombol batal hanya menutup modal
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAndExportClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={selected.size === 0} 
          >
            Ekspor dengan Pilihan Ini
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelectorModal; 