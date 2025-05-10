-- CreateTable
CREATE TABLE "Warga" (
    "id" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" TEXT,
    "alamat_domisili" TEXT,
    "agama" TEXT,
    "statusPerkawinan" TEXT,
    "pekerjaan" TEXT,
    "pendidikanTerakhir" TEXT,
    "kewarganegaraan" TEXT,
    "nomorTelepon" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KartuKeluarga" (
    "id" SERIAL NOT NULL,
    "nomorKK" TEXT NOT NULL,
    "kepalaKeluarga" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kabupatenKota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KartuKeluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeluargaWarga" (
    "id" SERIAL NOT NULL,
    "wargaId" INTEGER NOT NULL,
    "kartuKeluargaId" INTEGER NOT NULL,
    "statusHubungan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeluargaWarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Iuran" (
    "id" SERIAL NOT NULL,
    "wargaId" INTEGER NOT NULL,
    "jenisIuran" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "bulanTahun" TEXT,
    "keterangan" TEXT,
    "metodePembayaran" TEXT,
    "statusPembayaran" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "prioritas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "lokasi" TEXT,
    "anggaran" DOUBLE PRECISION,
    "statusKegiatan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesertaKegiatan" (
    "id" SERIAL NOT NULL,
    "wargaId" INTEGER NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "statusKehadiran" TEXT,
    "peran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PesertaKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventaris" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "kondisi" TEXT NOT NULL,
    "tanggalPerolehan" TIMESTAMP(3),
    "sumberDana" TEXT,
    "lokasi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventaris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prioritas" TEXT,
    "lokasiMasalah" TEXT,
    "tanggalLaporan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalPenanganan" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warga_nik_key" ON "Warga"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "KartuKeluarga_nomorKK_key" ON "KartuKeluarga"("nomorKK");

-- CreateIndex
CREATE UNIQUE INDEX "KeluargaWarga_wargaId_kartuKeluargaId_key" ON "KeluargaWarga"("wargaId", "kartuKeluargaId");

-- CreateIndex
CREATE UNIQUE INDEX "PesertaKegiatan_wargaId_kegiatanId_key" ON "PesertaKegiatan"("wargaId", "kegiatanId");

-- AddForeignKey
ALTER TABLE "KeluargaWarga" ADD CONSTRAINT "KeluargaWarga_kartuKeluargaId_fkey" FOREIGN KEY ("kartuKeluargaId") REFERENCES "KartuKeluarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeluargaWarga" ADD CONSTRAINT "KeluargaWarga_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "Warga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Iuran" ADD CONSTRAINT "Iuran_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "Warga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaKegiatan" ADD CONSTRAINT "PesertaKegiatan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "Kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaKegiatan" ADD CONSTRAINT "PesertaKegiatan_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "Warga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
