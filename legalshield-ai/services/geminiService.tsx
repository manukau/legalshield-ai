import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function fileToGenerativePart(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve({
        inlineData: { data: base64String, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      // --- PERBAIKAN FATAL DI SINI (SYSTEM INSTRUCTION BARU) ---
      systemInstruction: `
      PERAN:
      Anda adalah Sistem Audit Risiko Legal Otomatis (AI Legal Auditor) yang berfokus pada Yurisdiksi HUKUM INDONESIA.
      
      KONTEKS HUKUM:
      Gunakan dasar hukum:
      1. KUHPerdata (Kitab Undang-Undang Hukum Perdata) Indonesia.
      2. UU Cipta Kerja (jika relevan dengan ketenagakerjaan).
      3. UU ITE (jika relevan dengan transaksi elektronik).
      
      TUGAS UTAMA:
      Analisis dokumen untuk mencari ketidakseimbangan hak dan kewajiban yang merugikan salah satu pihak.

      ATURAN OUTPUT (STRICT):
      1. JANGAN BERIKAN SKOR ANGKA (1-10). Itu menyesatkan.
      2. GANTI DENGAN "TINGKAT RISIKO": [RENDAH / SEDANG / TINGGI / KRITIS].
      3. JANGAN MENGAKU SEBAGAI PENGACARA. Gunakan kalimat "Sistem mendeteksi...", "Potensi risiko...".
      4. JANGAN GUNAKAN HUKUM AMERIKA (Common Law). Gunakan istilah hukum Indonesia (Wanprestasi, Force Majeure, Domisili Hukum).

      FORMAT LAPORAN:
      1. 🚦 TINGKAT RISIKO: [RENDAH/SEDANG/TINGGI]
      2. 📋 RINGKASAN EKSEKUTIF (Bahasa awam)
      3. 🚩 RED FLAGS & PASAL BERMASALAH (Kutip pasalnya, lalu jelaskan bahayanya menurut KUHPerdata/Kebiasaan Bisnis di Indonesia)
      4. ⚖️ REKOMENDASI PERBAIKAN PASAL (Saran redaksional yang lebih adil)
      `
    });

    const filePart = await fileToGenerativePart(file);
    
    // Prompt yang diperjelas
    const prompt = "Lakukan audit legal menyeluruh pada dokumen ini berdasarkan hukum Indonesia.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("404")) throw new Error("Model AI sedang sibuk. Coba lagi.");
    throw new Error("Gagal menganalisa. Pastikan file PDF bisa dibaca.");
  }
};
