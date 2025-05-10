import React, { useState, useEffect } from 'react';

const ColumnSelectorModal = ({ isOpen, onClose, availableColumns, currentSelectedColumns, onSaveAndExport, exportFormat }) => {
  const [selected, setSelected] = useState(new Set(currentSelectedColumns));

  useEffect(() => {
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
    onSaveAndExport(Array.from(selected));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h4 className="text-lg font-semibold mb-4">
          Pilih Kolom untuk Ekspor {exportFormat ? exportFormat.toUpperCase() : 'Data'}
        </h4>
        <div className="max-h-60 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {availableColumns.map(col => (
            <div key={col.key} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`select-col-${col.key}`}
                checked={selected.has(col.key)}
                onChange={() => handleToggleColumn(col.key)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`select-col-${col.key}`} className="ml-2 text-sm text-gray-700">{col.label}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
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