import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Syarat &amp; Ketentuan</h1>
        </div>
        <p className="text-neutral-500 text-sm mb-8">
          Terakhir diperbarui: Januari 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              1. Penerimaan Syarat
            </h2>
            <p>
              Dengan mengakses atau menggunakan layanan PesanLagi, Anda
              menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda
              tidak menyetujui syarat-syarat ini, harap tidak menggunakan
              layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              2. Layanan
            </h2>
            <p>
              PesanLagi menyediakan platform QR Menu Digital yang memungkinkan
              pemilik usaha kuliner (warung, restoran, kafe, dan sejenisnya)
              untuk membuat dan mengelola menu digital yang dapat diakses
              pelanggan melalui QR Code.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pembuatan dan pengelolaan menu digital.</li>
              <li>Generasi QR Code untuk menu toko.</li>
              <li>Kustomisasi tema dan tampilan menu.</li>
              <li>Statistik sederhana terkait akses menu.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              3. Akun Pengguna
            </h2>
            <p>
              Untuk menggunakan layanan kami, Anda harus mendaftar dan
              membuat akun. Anda bertanggung jawab untuk:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Menjaga kerahasiaan informasi akun, termasuk kata sandi.
              </li>
              <li>
                Semua aktivitas yang terjadi di bawah akun Anda.
              </li>
              <li>
                Segera memberitahu kami jika ada penggunaan akun yang tidak
                sah.
              </li>
              <li>
                Memberikan informasi yang akurat dan terkini saat mendaftar.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              4. Konten Pengguna
            </h2>
            <p>
              Anda bertanggung jawab penuh atas konten yang Anda unggah ke
              platform, termasuk namun tidak terbatas pada gambar menu, nama
              menu, harga, dan deskripsi. Anda menjamin bahwa:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Konten yang Anda unggah tidak melanggar hak cipta, merek
                dagang, atau hak kekayaan intelektual pihak lain.
              </li>
              <li>
                Konten tidak mengandung materi yang ilegal, menyesatkan, atau
                bersifat menipu.
              </li>
              <li>
                Anda memiliki hak atau izin yang diperlukan untuk menggunakan
                semua gambar dan materi yang diunggah.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              5. Pembatasan Tanggung Jawab
            </h2>
            <p>
              PesanLagi menyediakan layanan &quot;sebagaimana adanya&quot; tanpa
              jaminan apapun. Kami tidak bertanggung jawab atas:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Kerugian yang timbul dari penggunaan atau ketidakmampuan
                menggunakan layanan.
              </li>
              <li>
                Ketepatan, kelengkapan, atau keandalan konten yang dibuat oleh
                pengguna.
              </li>
              <li>
                Gangguan layanan, termasuk namun tidak terbatas pada
                downtime, kegagalan server, atau masalah jaringan.
              </li>
              <li>
                Kerugian tidak langsung, insidental, khusus, atau konsekuensial
                yang timbul dari penggunaan layanan.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              6. Paket Berbayar (Pro)
            </h2>
            <p>
              PesanLagi menawarkan paket berbayar (Pro) dengan fitur tambahan.
              Ketentuan paket berbayar:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Pembayaran dilakukan sesuai dengan metode yang tersedia di
                platform.
              </li>
              <li>
                Paket berlaku untuk periode yang ditentukan dan akan
                diperpanjang secara otomatis kecuali dibatalkan.
              </li>
              <li>
                Harga dapat berubah dengan pemberitahuan sebelumnya.
              </li>
              <li>
                Fitur Pro hanya dapat diakses selama paket masih aktif.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              7. Penghentian
            </h2>
            <p>
              Kami berhak untuk menangguhkan atau menghentikan akun Anda jika:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Anda melanggar syarat dan ketentuan ini.
              </li>
              <li>
                Anda menggunakan layanan untuk tujuan ilegal atau tidak sah.
              </li>
              <li>
                Aktivitas akun Anda merugikan platform atau pengguna lain.
              </li>
            </ul>
            <p className="mt-2">
              Anda juga dapat menghapus akun Anda kapan saja melalui
              pengaturan akun.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              8. Hukum yang Berlaku
            </h2>
            <p>
              Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai
              dengan hukum yang berlaku di Republik Indonesia. Segala sengketa
              yang timbul akan diselesaikan melalui musyawarah terlebih dahulu.
              Jika musyawarah tidak mencapai kesepakatan, sengketa akan
              diselesaikan melalui Pengadilan Negeri Kebumen.
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
