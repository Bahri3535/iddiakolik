// Türkiye Süper Lig takımları için logo URL'lerini döndüren yardımcı fonksiyon
export const teamLogos: Record<string, string> = {
  // 2024-2025 Süper Lig Takımları
  'Galatasaray': '/logos/galatasaray.png',
  'Fenerbahçe': '/logos/fenerbahce.png',
  'Beşiktaş': '/logos/besiktas.png',
  'Trabzonspor': '/logos/trabzonspor.png',
  'Adana Demirspor': '/logos/adanademirspor.png',
  'Antalyaspor': '/logos/antalyaspor.png',
  'Başakşehir': '/logos/basaksehir.png',
  'Konyaspor': '/logos/konyaspor.png',
  'Kayserispor': '/logos/kayserispor.png',
  'Sivasspor': '/logos/sivasspor.png',
  'Kasımpaşa': '/logos/kasimpasa.png',
  'Samsunspor': '/logos/samsunspor.png',
  'Ankaragücü': '/logos/ankaragucu.png',
  'Hatayspor': '/logos/hatayspor.png',
  'Gaziantep FK': '/logos/gaziantepfk.png',
  'Gaziantep': '/logos/gaziantepfk.png',
  'Rizespor': '/logos/caykurrize.png',
  'Çaykur Rizespor': '/logos/caykurrize.png',
  'Eyüpspor': '/logos/eyupspor.png',
  'Bodrumspor': '/logos/bodrumfk.png',
  'Bodrum FK': '/logos/bodrumfk.png',
  'Göztepe': '/logos/goztepe.png',
  'Pendikspor': '/logos/pendikspor.png',
  
  // Diğer popüler takımlar
  'Bursaspor': '/logos/bursaspor.png',
  'Altay': '/logos/altay.png',
  'Eskişehirspor': '/logos/eskisehirspor.png',
  'Karagümrük': '/logos/karagumruk.png',
  'Alanyaspor': '/logos/alanyaspor.png',
  'İstanbulspor': '/logos/istanbulspor.png',
  
  // Varsayılan logo
  'default': '/logos/default-team.png'
};

export const getTeamLogo = (teamName: string): string => {
  // Takım adı varsa o takımın logosunu döndür, yoksa varsayılan logoyu döndür
  return teamLogos[teamName] || '/logos/default-team.png';
};

// Takım adlarını normalize etmek için yardımcı fonksiyon
// Örneğin "Galatasaray SK" girişi "Galatasaray" olarak normalize edilir
export const normalizeTeamName = (teamName: string): string => {
  const normalizations: Record<string, string> = {
    'Galatasaray SK': 'Galatasaray',
    'Fenerbahçe SK': 'Fenerbahçe',
    'Beşiktaş JK': 'Beşiktaş',
    'Trabzonspor AS': 'Trabzonspor',
    'İstanbul Başakşehir': 'Başakşehir',
    'Başakşehir FK': 'Başakşehir',
    'Alanyaspor AS': 'Alanyaspor',
    'Fatih Karagümrük': 'Karagümrük',
    'Çaykur Rizespor': 'Çaykur Rizespor',
    'Rizespor': 'Çaykur Rizespor',
    'MKE Ankaragücü': 'Ankaragücü',
    'Bodrum FK': 'Bodrum FK',
    'Bodrumspor': 'Bodrum FK',
    'Eyüpspor SK': 'Eyüpspor',
    'Göztepe SK': 'Göztepe',
    'Gaziantep FK': 'Gaziantep FK',
    'Gaziantep': 'Gaziantep FK',
    // Diğer normalizasyonlar eklenebilir
  };

  return normalizations[teamName] || teamName;
}; 