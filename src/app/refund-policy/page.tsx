import { RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0705] text-neutral-200">
      {/* Header */}
      <header className="border-b border-orange-500/10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Kebijakan Pengembalian Dana</h1>
        </div>
        <p className="text-neutral-500 text-sm mb-8">
          Terakhir diperbarui: Januari 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              1. Kebijakan Umum
            </h2>
            <p>
              PesanLagi berkomitmen untuk memberikan kepuasan kepada pengguna
              kami. Kebijakan ini menjelaskan ketentuan pengembalian dana
              (refund) untuk layanan yang kami sediakan. Kami menangani setiap
              permintaan refund secara adil dan transparan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              2. Paket Gratis
            </h2>
            <p>
              Paket gratis PesanLagi tidak memerlukan pembayaran, sehingga
              tidak berlaku kebijakan pengembalian dana. Anda dapat menggunakan
              paket gratis tanpa biaya dan tanpa batas waktu, atau memutakhirkan
              ke paket Pro kapan saja.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              3. Paket Pro
            </h2>
            <p>
              Untuk paket berbayar (Pro), berikut ketentuan pengembalian dana
              yang berlaku:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-neutral-200">7 Hari Pertama:</strong>{' '}
                Pengembalian dana penuh dapat diminta dalam 7 hari setelah
                pembayaran jika Anda tidak puas dengan layanan.
              </li>
              <li>
                <strong className="text-neutral-200">Setelah 7 Hari:</strong>{' '}
                Pengembalian dana tidak tersedia untuk periode yang sudah
                berjalan. Anda tetap dapat menggunakan fitur Pro hingga akhir
                periode berlangganan.
              </li>
              <li>
                <strong className="text-neutral-200">Pembatalan Otomatis:</strong>{' '}
                Anda dapat membatalkan langganan kapan saja. Pembatalan
                berlaku di akhir periode berlangganan saat ini.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              4. Proses Pengembalian
            </h2>
            <p>
              Untuk mengajukan permintaan pengembalian dana:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Hubungi tim dukungan kami melalui email atau Telegram dengan
                menyertakan informasi akun dan alasan pengembalian.
              </li>
              <li>
                Permintaan akan diproses dalam waktu maksimal 5 hari kerja.
              </li>
              <li>
                Dana akan dikembalikan melalui metode pembayaran yang sama
                dengan yang digunakan saat transaksi.
              </li>
              <li>
                Waktu pengembalian dana ke rekening Anda tergantung pada
                prosesor pembayaran masing-masing (biasanya 5-14 hari kerja).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              5. Pengecualian
            </h2>
            <p>Pengembalian dana tidak berlaku dalam kondisi berikut:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Pelanggaran syarat dan ketentuan yang mengakibatkan
                penghentian akun.
              </li>
              <li>
                Penggunaan layanan yang sudah melewati periode refund 7 hari.
              </li>
              <li>
                Kerugian yang timbul akibat kesalahan pengguna, termasuk
                penghapusan data yang tidak disengaja.
              </li>
              <li>
                Gangguan layanan yang bersifat sementara dan sudah
                diperbaiki dalam waktu wajar.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              6. Perubahan Kebijakan
            </h2>
            <p>
              Kami dapat memperbarui kebijakan pengembalian dana ini dari waktu
              ke waktu. Perubahan akan berlaku efektif segera setelah
              dipublikasikan di halaman ini. Pengguna yang memiliki langganan
              aktif akan diberitahukan melalui email atau notifikasi di
              platform.
            </p>
          </section>
        </div>

        {/* Contact Footer */}
        <div className="mt-12 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
          <p className="text-neutral-400 text-sm leading-relaxed">
            Jika ada pertanyaan, hubungi kami via email:{' '}
            <a
              href="mailto:suportpesanlagi@gmail.com"
              className="text-orange-400 hover:text-orange-300"
            >
              suportpesanlagi@gmail.com
            </a>{' '}
            atau Komunitas Telegram:{' '}
            <a
              href="https://t.me/+1N-IWILgR7tmODM1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300"
            >
              https://t.me/+1N-IWILgR7tmODM1
            </a>{' '}
            (Operasional: Kebumen, Jawa Tengah).
          </p>
        </div>
      </main>
    </div>
  )
}
