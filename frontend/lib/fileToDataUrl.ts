// O back-end aceita fotoEvidenciaUrl como uma string simples (sem upload
// multipart/S3 — fora do escopo do MVP), então a foto é convertida para uma
// data URL base64 no navegador e enviada como se fosse a "URL" da foto.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
