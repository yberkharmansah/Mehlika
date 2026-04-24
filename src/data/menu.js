export const venue = {
  name: "Mehlika",
  slogan: "Bir Yudum Huzur",
  note: "Zarif sunumlar, sakin bir atmosfer ve gunun ritmine eslik eden tatlar.",
  hours: "08:30 - 23:00",
  logo: `${import.meta.env.BASE_URL}brand/logo.jpg`,
  links: [
    {
      label: "Instagram",
      title: "@mehlikalounge",
      copy: "Guncel sunumlar, mekandan kareler ve yeni lezzet duyurulari.",
      href: "https://www.instagram.com/mehlikalounge/",
      icon: "photo_camera",
    },
    {
      label: "Google Maps",
      title: "Konumu Ac",
      copy: "Rota olustur, ulasimi kolaylastir ve mekani harita uzerinden bul.",
      href: "https://share.google/Vc6iGeJdtN2FrIzjE",
      icon: "location_on",
    },
  ],
};

export const categories = [
  {
    id: "kahveler",
    name: "Sicak Kahveler",
    description:
      "Ozenle secilmis cekirdeklerden, barista ustalikla hazirlanan dumani ustunde kahveler.",
    itemCount: 6,
    accent: "KLASIK LEZZETLER",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "soguklar",
    name: "Soguk Icecekler",
    description:
      "Sicak gunlerin en zarif eslikcisi; buz gibi kahveler ve taze meyve karisimlari.",
    itemCount: 4,
    accent: "FERAHLATICI SECENEKLER",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tatlilar",
    name: "Ozel Tatlilar",
    description:
      "Seflerimizin ozel receteleriyle hazirlanan, gorsel bir solen sunan essiz tatlilar.",
    itemCount: 5,
    accent: "TATLI BIR SON",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "kahvalti",
    name: "Serpme Kahvalti",
    description:
      "Yoresel lezzetlerin en taze haliyle donatilmis, uzun ve keyifli sabahlarin adresi.",
    itemCount: 4,
    accent: "GUNE GUZEL BIR BASLANGIC",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
  },
];

export const products = [
  {
    id: 1,
    category: "kahveler",
    name: "Mehlika Latte",
    description: "Kadifemsi sut dokusu, dengeli espresso ve hafif vanilya izi.",
    price: "155 TL",
    tags: ["Ozel Harman", "En Cok Tercih Edilen"],
    image:
      "https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    category: "kahveler",
    name: "Flat White",
    description: "Yogun kahve karakteri isteyenler icin puruzsuz mikro kopuk.",
    price: "145 TL",
    tags: ["Guclu Icis"],
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    category: "tatlilar",
    name: "San Sebastian",
    description: "Akiskan dokulu, karamelize yuzeyli imza cheesecake.",
    price: "210 TL",
    tags: ["Imza Tatli"],
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    category: "tatlilar",
    name: "Lotus Magnolia",
    description: "Kat kat krema, biskuvi ve lotus dokunusuyla hafif servis.",
    price: "195 TL",
    tags: ["Cam Kasede"],
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    category: "soguklar",
    name: "Lavantali Limonata",
    description: "Narenciye ferahligini floral bir son dokunusla birlestirir.",
    price: "140 TL",
    tags: ["Ev Yapimi", "Serinletici"],
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    category: "soguklar",
    name: "Berry Fizz",
    description: "Orman meyveleri, soda ve hafif nane ile canli bir alternatif.",
    price: "150 TL",
    tags: ["Meyveli"],
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    category: "kahvalti",
    name: "Mehlika Serpme",
    description: "Peynirler, receller, sicaklar ve taze ekmekle uzun kahvalti servisi.",
    price: "620 TL",
    tags: ["2 Kisilik", "Paylasimlik"],
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 8,
    category: "kahvalti",
    name: "Avokadolu Eksi Maya",
    description: "Otlu labne, avokado dilimleri ve narenciye dokunusu.",
    price: "240 TL",
    tags: ["Hafif Baslangic"],
    image:
      "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&w=1200&q=80",
  },
];
