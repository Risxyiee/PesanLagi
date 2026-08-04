import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Kebijakan Privasi</h1>
        </div>
        <p className="text-neutral-500 text-sm mb-8">
          Terakhir diperbarui: Januari 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p>
              Kami mengumpulkan informasi berikut saat Anda menggunakan
              layanan PesanLagi:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-neutral-200">Data Akun:</strong>{' '}
                Nama, email, dan kata sandi yang Anda berikan saat mendaftar.
              </li>
              <li>
                <strong className="text-neutral-200">Data Toko:</strong>{' '}
                Nama warung, alamat, nomor telepon, logo, dan jam operasional.
              </li>
              <li>
                <strong className="text-neutral-200">Data Menu:</strong>{' '}
                Nama menu, harga, deskripsi, kategori, dan gambar menu yang
                Anda unggah.
              </li>
              <li>
                <strong className="text-neutral-200">Data Penggunaan:</strong>{' '}
                Informasi tentang bagaimana Anda berinteraksi dengan layanan
                kami, termasuk log akses dan data perangkat.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              2. Penggunaan Informasi
            </h2>
            <p>Informasi yang dikumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Menyediakan dan meningkatkan layanan QR Menu Digital.</li>
              <li>Mengelola akun dan toko Anda.</li>
              <li>
                Mengirimkan notifikasi terkait layanan (jika diizinkan).
              </li>
              <li>
                Mencegah penyalahgunaan dan menjaga keamanan platform.
              </li>
              <li>Mematuhi kewajiban hukum yang berlaku.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              3. Perlindungan Data
            </h2>
            <p>
              Kami menerapkan langkah-langkah keamanan teknis dan organisasi
              yang wajar untuk melindungi data pribadi Anda dari akses tidak
              sah, pengubahan, pengungkapan, atau penghancuran. Data disimpan
              pada server yang aman dan dienkripsi menggunakan standar industri.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              4. Berbagi Data dengan Pihak Ketiga
            </h2>
            <p>
              Kami tidak menjual, memperdagangkan, atau menyewakan data
              pribadi Anda kepada pihak ketiga. Data hanya dibagikan dalam
              keadaan berikut:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Untuk mematuhi kewajiban hukum atau proses hukum yang sah.
              </li>
              <li>
                Dengan penyedia layanan teknis yang membantu kami menjalankan
                platform (hosting, analytics).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              5. Menu Digital Publik
            </h2>
            <p>
              Menu digital yang Anda buat melalui PesanLagi bersifat publik dan
              dapat diakses oleh siapa saja melalui link QR Code atau URL toko.
              Data yang ditampilkan di menu publik (nama toko, menu, harga)
              dianggap informasi yang Anda setujui untuk dipublikasikan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              6. Hak Anda
            </h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Mengakses, memperbarui, atau menghapus data pribadi Anda.
              </li>
              <li>Menolak pengumpulan data tertentu.</li>
              <li>Meminta salinan data pribadi Anda.</li>
              <li>Menghapus akun dan seluruh data terkait.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              7. Cookie
            </h2>
            <p>
              Kami menggunakan cookie dan teknologi serupa untuk meningkatkan
              pengalaman pengguna. Anda dapat mengatur preferensi cookie
              melalui pengaturan browser Anda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              8. Perubahan Kebijakan
            </h2>
            <p>
              Kami dapat memperbarui kebijakan privasi ini dari waktu ke
              waktu. Perubahan signifikan akan diberitahukan melalui email atau
              notifikasi di platform.
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
