export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const steps = [
  { number: '01', title: 'Beli Komik', description: 'Dapatkan Komik Pentas Seni Drama Arena 5101' },
  { number: '02', title: 'Scan QR Code', description: 'Scan QR Code yang terdapat pada komik' },
  { number: '03', title: 'Masuk & Aktivasi', description: 'Login dan masukkan Activation Code' },
  { number: '04', title: 'Nikmati Koleksi', description: 'Seluruh Digital Souvenir langsung terbuka' },
];
