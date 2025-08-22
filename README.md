ticketing-system/
├── app.js
├── package.json
├── .env
├── views/
│   ├── index.ejs
│   └── ticket-list.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
└── data/
    └── tickets.json


Cara Menjalankan:
Pastikan Node.js dan XAMPP sudah terinstall
Simpan semua file di folder ticketing-system di dalam htdocs XAMPP
Buka terminal/command prompt dan navigasi ke folder tersebut
Jalankan npm install untuk menginstall dependencies
Buat file .env dan isi dengan konfigurasi email
Jalankan npm start atau node app.js
Buka browser dan akses http://localhost:3000

Catatan:
Untuk mengirim email, Anda perlu mengkonfigurasi email di file .env
Gmail membutuhkan "App Password" bukan password biasa
Data tiket disimpan di file data/tickets.json
Sistem ini sudah mendukung pembuatan tiket, notifikasi email, dan manajemen tiket
