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
  },
  {
    id: "prod-2",
    title: "TUQO HG12 High Pressure Washer Trigger Gun / M22-M14",
    imageUrl: "/images/products/trigger_gun.jpg",
    rating: 5,
    ratingCount: 780,
  },
  {
    id: "prod-3",
    title: "TUQO Cordless High Pressure Washer CDW400",
    imageUrl: "/images/products/cdw400.jpg",
    rating: 4,
    ratingCount: 605,
  },
  {
    id: "prod-4",
    title: "TUQO DS102 Premium Pressure Washer 4Pcs Nozzle Tips",
    imageUrl: "/images/products/nozzle_tips.jpg",
    rating: 4,
    ratingCount: 420,
  },
  {
    id: "prod-5",
    title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type",
    imageUrl: "/images/products/compressor.jpg",
    rating: 5,
    ratingCount: 241,
  },
];

export const SUMMER_OFFERS: SummerOfferBanner[] = [
  {
    id: "offer-1",
    imageUrl: "/images/offers/summer_offer_1.jpg",
    title: "TUQO High Pressure Car Washer Machine",
    link: "/shop?product=hw2040",
  },
  {
    id: "offer-2",
    imageUrl: "/images/offers/summer_offer_2.jpg",
    title: "Pumpkin Hand-Powered Miter Box",
    link: "/shop?product=miter_box",
  },
  {
    id: "offer-3",
    imageUrl: "/images/offers/summer_offer_3.jpg",
    title: "Professional Power Tools",
    link: "/shop?category=power_tools",
  },
];

export const BRANDS: Brand[] = [
  { id: "brand-tuqo", name: "TUQO", logoText: "TUQO" },
  { id: "brand-costec", name: "COSTEC", logoText: "COSTEC" },
  { id: "brand-metso", name: "METSO", logoText: "METSO" },
  { id: "brand-pumpkin", name: "PUMPKIN", logoText: "PUMPKIN" },
  { id: "brand-ultratouch", name: "Ultra TOUCH", logoText: "Ultra TOUCH" },
];
