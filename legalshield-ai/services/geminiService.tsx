import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. SETUP API KEY (Menggunakan standar Vite)
// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;

// Inisialisasi Google AI
const genAI = new GoogleGenerativeAI(apiKey);

// 2. FUNGSI PEMBANTU: Mengubah File PDF jadi data yang bisa dibaca AI
async function fileToGenerativePart(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Ambil bagian base64-nya saja (setelah tanda koma)
      const base64String = result.split(',')[1];
      resolve({
        inlineData: { data: base64String, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 3. FUNGSI UTAMA: Menganalisa Kontrak
export const analyzeContract = async (file: File) => {
  // Cek Darurat: Apakah API Key ada?
  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      "API Key hilang/rusak. Cek Vercel Environment Variables pastikan namanya VITE_API_KEY"
    );
  }

  try {
    // Gunakan model terbaru (Gemini 2.5 Flash)
    // Pastikan nama model sesuai dengan yang tersedia di akunmu
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      // SYSTEM INSTRUCTION (INSTRUKSI BARU YANG AMAN)
      systemInstruction: `
      PERAN:
      Anda adalah Sistem AI Audit Risiko Kontrak (Contract Risk Engine).
      Tugas Anda adalah memindai dokumen secara objektif.

      ATURAN PENTING (SAFETY):
      1. JANGAN PERNAH mengaku sebagai "Pengacara", "Lawyer", atau Manusia.
      2. Gunakan sudut pandang sistem (Contoh: "Sistem mendeteksi...", "Analisis menunjukkan...").
      3. Jangan gunakan kalimat "Saran saya...", ganti dengan "Rekomendasi perbaikan...".
      4. Gunakan Bahasa Indonesia yang lugas dan profesional.

      FORMAT OUTPUT:
      Berikan laporan audit tegas:
      1. 🛡️ SKOR KEAMANAN (1-10)
      2. 🚩 RED FLAGS (Pasal Berbahaya & Alasannya)
      3. 💰 POTENSI BIAYA TERSEMBUNYI
      4. ⚖️ KESIMPULAN & REKOMENDASI TEKNIS
      `
    });

    // Proses file PDF
    const filePart = await fileToGenerativePart(file);

    // Kirim perintah
    const prompt = "Lakukan audit risiko lengkap pada dokumen yang dilampirkan ini sesuai instruksi sistem.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Penanganan Error yang Ramah
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("Model AI sedang sibuk atau versi model tidak ditemukan. Coba refresh.");
    }
    
    throw new Error("Gagal menganalisa. Pastikan file PDF tidak dikunci password.");
  }
};
