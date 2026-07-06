const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'intro.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Update Texts
// Hero Section
html = html.replace('<h1>DRAMA ARENA <span>5101</span></h1>', '<h1>DIGITAL <span>SOUVENIR</span></h1>');
html = html.replace('<p>Ini bukan tentang satu orang, ini tentang bagaimana lima elemen menjadi satu kesatuan yang tak terhentikan.</p>', '<p>Selamat datang di Digital Souvenir Drama Arena 5101. Jelajahi setiap karya, momen, dan memori yang terekam dalam satu kaset memori.</p>');

// Steps
html = html.replace('<h2>Bukan Sekadar Emblem</h2>', '<h2>Di Balik Layar</h2>');
html = html.replace('<p>Lambang ini dirakit dari lima bagian yang berdiri sendiri', '<p>Setiap momen, keringat, dan tawa di balik panggung kini terekam selamanya');

html = html.replace('<h2>Yang Menjaga Bentuk</h2>', '<h2>Galeri Kenangan</h2>');
html = html.replace('<p>Bingkai luar yang menahan segala tekanan.', '<p>Telusuri kembali foto-foto eksklusif dari persiapan hingga penampilan memukau kami.');

html = html.replace('<h2>Yang Menyala di Tengah</h2>', '<h2>Video Penampilan</h2>');
html = html.replace('<p>Inti energi. Tanpa bagian ini, keseluruhan lambang kehilangan rohnya.', '<p>Saksikan kembali rekaman penuh dari Opening hingga Closing Ceremony dengan kualitas terbaik.');

html = html.replace('<h2>Yang Bergerak Serentak</h2>', '<h2>Karya & Soundtrack</h2>');
html = html.replace('<p>Empat sudut yang saling menyeimbangkan.', '<p>Nikmati komik digital interaktif dan soundtrack resmi yang menemani perjalanan kami.');

html = html.replace('<h2>Bukan Nomor Kamar Biasa</h2>', '<h2>Mari Mulai Perjalanan</h2>');
html = html.replace('<p>5101 adalah kode barisan kami di Pentas Seni Darussalam', '<p>Akses semua konten eksklusif ini sekarang. Memori ini adalah milik Anda selamanya.');


// 2. Add Button at the end of the last section
const btnHTML = `
        <div style="margin-top: 3rem; text-align: center;">
            <button id="enter-guidebook-btn" style="
                background: var(--accent);
                color: var(--ink);
                border: none;
                padding: 1rem 2rem;
                font-size: 1.25rem;
                font-family: var(--disp);
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(255, 58, 18, 0.4);
                transition: transform 0.3s, box-shadow 0.3s;
                pointer-events: auto;
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 25px rgba(255, 58, 18, 0.6)';"
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(255, 58, 18, 0.4)';">
                Jelajahi Digital Guidebook
            </button>
        </div>
`;

html = html.replace('</div>\n    </section>\n\n    <footer>', btnHTML + '\n      </div>\n    </section>\n\n    <footer>');

// 3. Add Script to handle button click
const scriptHTML = `
    <script>
      document.getElementById('enter-guidebook-btn')?.addEventListener('click', () => {
          // Play click sound if possible
          if (typeof Synth !== 'undefined' && Synth.ctx) Synth.playClick();
          
          // Animate out
          document.body.style.transition = 'opacity 1s ease';
          document.body.style.opacity = '0';
          
          setTimeout(() => {
              window.parent.postMessage('FINISH_INTRO', '*');
          }, 1000);
      });
    </script>
`;
html = html.replace('</body>', scriptHTML + '\n</body>');

fs.writeFileSync(filePath, html);
console.log('intro.html updated successfully.');
