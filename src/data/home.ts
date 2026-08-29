export interface HeroSlide {
  id: string;
  imageUrl: string;
  link: string;
}

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  price?: number;
  originalPrice?: number;
}

export interface SummerOfferBanner {
  id: string;
  imageUrl: string;
  title: string;
  link: string;
}

export interface Brand {
  id: string;
  name: string;
  logoText: string;
  logoColor?: string;
  isCustomSvg?: boolean;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-1",
    imageUrl: "/images/banners/Hbanner-1.png",
    link: "/shop?banner=1",
  },
  {
    id: "hero-2",
    imageUrl: "/images/banners/Hbanner-2.png",
    link: "/shop?banner=2",
  },
  {
    id: "hero-3",
    imageUrl: "/images/banners/Hbanner-3.png",
    link: "/shop?banner=3",
  },
  {
    id: "hero-4",
    imageUrl: "/images/banners/Hbanner-4.png",
    link: "/shop?banner=4",
  },
  {
    id: "hero-5",
    imageUrl: "/images/banners/Hbanner-5.png",
    link: "/shop?banner=5",
  },
];

export const BEST_SELLERS: Product[] = [
  {
    id: "prod-1",
    title: "TUQO High Pressure Washer HW2000 / 140 Bar",
    imageUrl: "/images/products/hw2000.jpg",
    rating: 5,
    ratingCount: 241,
    price: 4999,
    originalPrice: 6999,
  },
  {
    id: "prod-2",
    title: "TUQO HG12 High Pressure Washer Trigger Gun / M22-M14",
    imageUrl: "/images/products/trigger_gun.jpg",
    rating: 5,
    ratingCount: 780,
    price: 999,
    originalPrice: 1499,
  },
  {
    id: "prod-3",
    title: "TUQO Cordless High Pressure Washer CDW400",
    imageUrl: "/images/products/cdw400.jpg",
    rating: 4,
    ratingCount: 605,
    price: 6299,
    originalPrice: 8299,
  },
  {
    id: "prod-4",
    title: "TUQO DS102 Premium Pressure Washer 4Pcs Nozzle Tips",
    imageUrl: "/images/products/nozzle_tips.jpg",
    rating: 4,
    ratingCount: 420,
    price: 399,
    originalPrice: 599,
  },
  {
    id: "prod-5",
    title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type",
    imageUrl: "/images/products/compressor.jpg",
    rating: 5,
    ratingCount: 241,
    price: 14500,
    originalPrice: 18500,
  },
];

export const SUMMER_OFFERS: SummerOfferBanner[] = [
  {
    id: "offer-1",
    imageUrl: "/images/offers/offer-1.png",
    title: "Summer Offer 1",
    link: "/shop?offer=1",
  },
  {
    id: "offer-2",
    imageUrl: "/images/offers/offer-2.png",
    title: "Summer Offer 2",
    link: "/shop?offer=2",
  },
  {
    id: "offer-3",
    imageUrl: "/images/offers/offer-3.png",
    title: "Summer Offer 3",
    link: "/shop?offer=3",
  },
  {
    id: "offer-4",
    imageUrl: "/images/offers/offer-4.png",
    title: "Summer Offer 4",
    link: "/shop?offer=4",
  },
  {
    id: "offer-5",
    imageUrl: "/images/offers/offer-5.png",
    title: "Summer Offer 5",
    link: "/shop?offer=5",
  },
  {
    id: "offer-6",
    imageUrl: "/images/offers/offer-6.png",
    title: "Summer Offer 6",
    link: "/shop?offer=6",
  },
];

export const BRANDS: Brand[] = [
  { id: "brand-tuqo", name: "TUQO", logoText: "TUQO" },
  { id: "brand-costec", name: "COSTEC", logoText: "COSTEC" },
  { id: "brand-metso", name: "METSO", logoText: "METSO" },
  { id: "brand-pumpkin", name: "PUMPKIN", logoText: "PUMPKIN" },
  { id: "brand-ultratouch", name: "Ultra TOUCH", logoText: "Ultra TOUCH" },
];

export interface BrandCategory {
  id: string;
  name: string;
  imageUrl: string;
  link: string;
}

export const BRAND_CATEGORIES: Record<string, { name: string; categories: BrandCategory[] }> = {
  tuqo: {
    name: "TUQO",
    categories: [
      { id: "tuqo-1", name: "High Pressure Washer", imageUrl: "/images/products/hw2000.jpg", link: "/shop/tuqo/high-pressure-washer" },
      { id: "tuqo-2", name: "Vaccum Cleaner", imageUrl: "/images/products/cdw400.jpg", link: "/shop/tuqo/vaccum-cleaner" },
      { id: "tuqo-3", name: "Pressure Washer Accessories", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/tuqo/accessories" },
      { id: "tuqo-4", name: "Cordless Tools", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/tuqo/cordless-tools" },
      { id: "tuqo-5", name: "Auto Care Detailing", imageUrl: "/images/products/hw2000.jpg", link: "/shop/tuqo/autocare" },
      { id: "tuqo-6", name: "Air Compressor", imageUrl: "/images/products/compressor.jpg", link: "/shop/tuqo/air-compressor" },
      { id: "tuqo-7", name: "Power Tools", imageUrl: "/images/products/hw2000.jpg", link: "/shop/tuqo/power-tools" },
      { id: "tuqo-8", name: "Power Tools Accessories", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/tuqo/power-tools-accessories" },
      { id: "tuqo-9", name: "Hand Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/tuqo/hand-tools" },
      { id: "tuqo-10", name: "Spares and Accessories", imageUrl: "/images/products/compressor.jpg", link: "/shop/tuqo/spares" },
    ]
  },
  pumpkin: {
    name: "PUMPKIN",
    categories: [
      { id: "pumpkin-1", name: "Cordless Tools", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/pumpkin/cordless-tools" },
      { id: "pumpkin-2", name: "Power Tools", imageUrl: "/images/products/hw2000.jpg", link: "/shop/pumpkin/power-tools" },
      { id: "pumpkin-3", name: "Power Tools Accessories", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/pumpkin/power-tools-accessories" },
      { id: "pumpkin-4", name: "Hand Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/pumpkin/hand-tools" },
      { id: "pumpkin-5", name: "Spares and Accessories", imageUrl: "/images/products/compressor.jpg", link: "/shop/pumpkin/spares" },
      { id: "pumpkin-6", name: "Gardening Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/pumpkin/gardening" },
    ]
  },
  mitsuki: {
    name: "MITSUKI",
    categories: [
      { id: "mitsuki-1", name: "High Pressure Washer", imageUrl: "/images/products/hw2000.jpg", link: "/shop/mitsuki/high-pressure-washer" },
      { id: "mitsuki-2", name: "Cordless Tools", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/mitsuki/cordless-tools" },
      { id: "mitsuki-3", name: "Power Tools", imageUrl: "/images/products/hw2000.jpg", link: "/shop/mitsuki/power-tools" },
      { id: "mitsuki-4", name: "Power Tools Accessories", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/mitsuki/power-tools-accessories" },
      { id: "mitsuki-5", name: "Hand Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/mitsuki/hand-tools" },
      { id: "mitsuki-6", name: "Spares and Accessories", imageUrl: "/images/products/compressor.jpg", link: "/shop/mitsuki/spares" },
    ]
  },
  metso: {
    name: "METSO",
    categories: [
      { id: "metso-1", name: "Hand Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/metso/hand-tools" },
      { id: "metso-2", name: "Garage Tools", imageUrl: "/images/products/cdw400.jpg", link: "/shop/metso/garage" },
      { id: "metso-3", name: "DIY Tools", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/metso/diy" },
      { id: "metso-4", name: "Gardening Tools", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/metso/gardening" },
      { id: "metso-5", name: "Power Tools Accessories Spares", imageUrl: "/images/products/compressor.jpg", link: "/shop/metso/spares" },
    ]
  },
  costec: {
    name: "COSTEC",
    categories: [
      { id: "costec-1", name: "Magsafe Mobile Holder", imageUrl: "/images/products/cdw400.jpg", link: "/shop/costec/magsafe-holder" },
      { id: "costec-2", name: "Magsafe Charger", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/costec/magsafe-charger" },
      { id: "costec-3", name: "Charging Cables", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/costec/cables" },
      { id: "costec-4", name: "Handheld Fan", imageUrl: "/images/products/compressor.jpg", link: "/shop/costec/fan" },
    ]
  },
  ultratouch: {
    name: "Ultra TOUCH",
    categories: [
      { id: "ut-1", name: "Microfiber Towels & Detailing", imageUrl: "/images/products/hw2000.jpg", link: "/shop/ultratouch/detailing" },
      { id: "ut-2", name: "Car Care Accessories", imageUrl: "/images/products/trigger_gun.jpg", link: "/shop/ultratouch/accessories" },
      { id: "ut-3", name: "Foam Applicators & Brushes", imageUrl: "/images/products/nozzle_tips.jpg", link: "/shop/ultratouch/brushes" }
    ]
  }
};
