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
