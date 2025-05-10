import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaHome } from 'react-icons/fa';
import CreateKKForm from './CreateKKForm';
import AddAnggotaForm from './AddAnggotaForm';

const RegistrasiKeluargaModal = ({ isOpen, onClose, onSuccess, kkId, initialData, mode }) => {
  // Variants untuk animasi
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl overflow-hidden max-w-screen-md w-full max-h-[85vh] flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-primary-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              {mode === 'editKK' && <FaHome className="mr-2 text-primary-500" />}
              {mode === 'add' && kkId && <FaUserPlus className="mr-2 text-primary-500" />}
              {mode === 'add' && !kkId && <FaHome className="mr-2 text-primary-500" />}
              
              {mode === 'editKK' ? 'Edit Kartu Keluarga' : 
               (mode === 'add' && kkId ? 'Tambah Anggota Keluarga' : 'Tambah Kartu Keluarga Baru')}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {(mode === 'add' && !kkId) || mode === 'editKK' ? (
              <CreateKKForm 
                onSuccess={onSuccess} 
                initialData={initialData}
                mode={mode}
              />
            ) : null}

            {mode === 'add' && kkId && (
              <AddAnggotaForm 
                onSuccess={onSuccess} 
                kkId={kkId}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegistrasiKeluargaModal; 