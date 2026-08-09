// Centro de Maricá - RJ, usado como fallback quando a geolocalização do
// navegador não está disponível ou é negada pelo usuário.
const MARICA_FALLBACK = { latitude: -22.9194, longitude: -42.8186 };

export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(MARICA_FALLBACK);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(MARICA_FALLBACK),
      { timeout: 5000 }
    );
  });
}
