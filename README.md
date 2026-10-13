# Kiriman Doa Umrah — setup

Website statik mesra telefon dengan Supabase Auth + Postgres dan Vercel.

## Fail
- `index.html` — halaman borang, log masuk, dashboard
- `style.css` — reka bentuk responsif
- `app.js` — interaksi Supabase (perlu isi URL + publishable/anon key)
- `database.sql` — jadual dan polisi keselamatan RLS

## 1. Cipta projek Supabase
1. Pergi ke https://supabase.com/ dan cipta projek baharu.
2. Buka SQL Editor, tampal seluruh kandungan `database.sql`, kemudian tekan Run.
3. Buka Project Settings / API (atau Connect) dan salin Project URL serta publishable key (projek lama mungkin tunjuk `anon` key).
4. Dalam `app.js`, gantikan:
   - `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
   - `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE`
   Jangan sekali-kali masukkan `service_role` atau `sb_secret_` key ke dalam frontend.

## 2. Cipta empat akaun penerima
1. Dalam Supabase Dashboard, buka Authentication > Users > Add user.
2. Cipta akaun email + password untuk Along, Angah, Alang dan Myra. Gunakan email sebenar yang mereka boleh akses dan kata laluan yang kuat.
3. Jika dashboard menyediakan pilihan, cipta pengguna dengan email disahkan/confirmed untuk penggunaan yang dikawal.
4. Salin UUID setiap pengguna dari Authentication > Users.
5. Kembali ke SQL Editor dan jalankan satu query untuk setiap orang (ganti UUID):
   ```sql
   insert into public.recipient_accounts (recipient_id, user_id)
   select r.id, 'PASTE-AUTH-USER-UUID-HERE'::uuid
   from public.recipients r
   where r.display_name = 'Along';
   ```
   Ulang untuk `Angah`, `Alang`, dan `Myra` dengan UUID masing-masing.
6. Matikan public sign-ups dalam Authentication settings jika hanya empat akaun penerima dibenarkan. Jangan beri akaun admin Supabase kepada penerima.

## 3. Uji di komputer
Buka folder menggunakan editor kod (contohnya VS Code). Untuk module JavaScript, jalankan melalui local static server, bukan buka fail HTML secara terus. Pilihan mudah: install Node.js dan jalankan:
   ```bash
   npx serve .
   ```
Buka URL yang dipaparkan. Uji:
- Borang boleh memuatkan empat nama penerima.
- Hantar satu doa ujian.
- Log masuk sebagai Along: hanya doa untuk Along dipaparkan.
- Log masuk sebagai Myra: hanya doa untuk Myra dipaparkan.
- Log keluar berfungsi.

## 4. Deploy ke Vercel
Cara mudah menggunakan GitHub:
1. Buat repository baharu di https://github.com/ dan upload empat fail projek ini (`index.html`, `style.css`, `app.js`, `database.sql`).
2. Log masuk ke https://vercel.com/ dan pilih Add New > Project.
3. Import repository GitHub itu. Untuk projek statik ini, Framework Preset boleh ditetapkan kepada Other; biarkan build command kosong dan output directory `.` (atau biarkan tetapan statik yang sesuai).
4. Deploy. Vercel akan beri URL `*.vercel.app` yang boleh dikongsi.
5. Selepas deploy, uji sekali lagi dari telefon menggunakan data mudah alih.

## Keselamatan penting
- RLS ialah lapisan keselamatan utama. Jangan buang polisi RLS.
- Publishable/anon key memang digunakan pada frontend; ia bukan kata laluan. Keselamatan bergantung pada RLS.
- Secret/service_role key memintas RLS dan tidak boleh berada dalam frontend.
- Borang awam tanpa CAPTCHA/rate limit boleh disalah guna atau dispam. Untuk penggunaan sebenar, tambah Turnstile/CAPTCHA dan had kadar di server/Edge Function.
- Akaun penerima mesti dipautkan dalam `recipient_accounts`. Jika tidak, login akan berjaya tetapi dashboard tidak dapat mengenal pasti penerima.
- Kod ini ialah asas yang boleh digunakan, tetapi buat ujian keselamatan dan semak Supabase Security Advisor sebelum berkongsi secara meluas.

## Batasan versi pertama
- Tiada fungsi lupa kata laluan khusus dalam UI; akaun dan kata laluan boleh diuruskan oleh pentadbir Supabase buat masa ini.
- Doa dipaparkan mengikut tarikh terbaru dahulu.
- Public form membenarkan pengirim memilih mana-mana penerima; tiada akaun diperlukan untuk menghantar.
