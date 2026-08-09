// Link universal do Google Maps: funciona em desktop e mobile (Android/iOS
// abrem o app do Maps automaticamente quando instalado, sem exigir escolha
// prévia de app específico).
export function buildDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
