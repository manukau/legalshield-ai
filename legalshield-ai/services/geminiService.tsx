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

const LEGAL_KNOWLEDGE_BASE = `
DASAR HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah): Sepakat, Cakap, Hal Tertentu, Sebab Halal.
2. KUHPerdata Pasal 1338 (Kebebasan Berkontrak) & 1266 (Pembatalan Lewat Pengadilan).
3. UU Cipta Kerja (Ketenagakerjaan) & UU ITE.
4. Asas Proporsionalitas & Itikad Baik.
`;

// PERUBAHAN BESAR DI SINI:
// Fungsi ini sekarang adalah "Generator" (tanda *) yang mengirim data sepotong-sepotong
export async function* analyzeContractStream(file: File) {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Sedikit kreativitas agar bahasa lebih luwes, tapi tetap fakta
        maxOutputTokens: 8192, // Batas output maksimal
      },
      systemInstruction: `
      PERAN: Anda adalah "VerifAI Neural Engine", auditor hukum spesialis Yurisdiksi Indonesia.
      MISI: Audit dokumen ini. Temukan celah risiko.
      
      DATABASE: ${LEGAL_KNOWLEDGE_BASE}

      ATURAN:
      1. Gunakan HANYA info di dokumen.
      2. Jangan halusinasi.
      3. Format CARD LIST untuk Red Flags (Jangan Tabel).
      4. Bahasa tegas & profesional.

      FORMAT OUTPUT (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      2. 📋 RINGKASAN EKSEKUTIF
      3. 🚩 RED FLAGS & TEMUAN KRITIS
         (Format: #### [Judul] ... )
      4. 💰 POTENSI BIAYA TERSEMBUNYI
      5. ⚖️ KESIMPULAN AKHIR
      `
    });

    const filePart = await fileToGenerativePart(file);
    const prompt = "Lakukan audit deep-scan pada dokumen ini. Identifikasi risiko hukum & finansial.";
    
    // MENGGUNAKAN STREAMING
    const result = await model.generateContentStream([prompt, filePart]);

    // Loop untuk menangkap setiap potongan teks (Chunk)
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText; // Kirim potongan teks ke frontend
    }

  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    throw new Error("Koneksi terputus atau file tidak terbaca. Coba lagi.");
  }
}
