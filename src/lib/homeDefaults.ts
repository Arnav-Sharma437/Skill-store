export interface IBrandItem {
  id: string;
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  width?: number;
  height?: number;
  enabled: boolean;
  order?: number;
}

export interface IUspItem {
  id: string;
  text: string;
  enabled: boolean;
  order?: number;
}

export interface ISummerOfferItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  enabled: boolean;
  order?: number;
}

export interface IHomeSettingsConfig {
  id?: string;
  announcement: {
    enabled: boolean;
    text: string;
  };
  brandsSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    brands: IBrandItem[];
  };
  trustMarquee: {
    enabled: boolean;
    items: IUspItem[];
  };
  summerOffer: {
    enabled: boolean;
    title: string;
    offers: ISummerOfferItem[];
  };
}

export const DEFAULT_HOME_SETTINGS: IHomeSettingsConfig = {
  id: "default",
  announcement: {
    enabled: true,
    text: "*2% Discount On Prepaid Orders / Free Shipment & COD Available*",
  },
  brandsSection: {
    enabled: true,
    title: "SHOP BY BRANDS",
    subtitle: "OFFICIAL PARTNERS",
    brands: [
      {
        id: "brand-tuqo",
        slug: "tuqo",
        name: "TUQO",
        logo: "/images/brands/tuqo.png",
        tagline: "High Pressure Washers, Compressors & Cordless Systems",
        width: 110,
        height: 34,
        enabled: true,
        order: 1,
      },
      {
        id: "brand-pumpkin",
        slug: "pumpkin",
        name: "PUMPKIN",
        logo: "/images/brands/pumpkin.png",
        tagline: "Heavy-Duty Power Tools, Spares & Garden Equipment",
        width: 120,
        height: 34,
        enabled: true,
        order: 2,
      },
      {
        id: "brand-mitsuki",
        slug: "mitsuki",
        name: "MITSUKI",
        logo: "/images/brands/mitsuki.png",
        tagline: "Precision Washers, Cutting Tools & Workshop Machines",
        width: 110,
        height: 32,
        enabled: true,
        order: 3,
      },
      {
        id: "brand-metso",
        slug: "metso",
        name: "METSO",
        logo: "/images/brands/metso.png",
        tagline: "Unleash Your Power with Hand Tools & Garage Systems",
        width: 110,
        height: 34,
        enabled: true,
        order: 4,
      },
      {
        id: "brand-costec",
        slug: "costec",
        name: "COSTEC",
        logo: "/images/brands/costec.png",
        tagline: "Smart MagSafe Accessories, Chargers & Workshop Fans",
        width: 110,
        height: 32,
        enabled: true,
        order: 5,
      },
    ],
  },
  trustMarquee: {
    enabled: true,
    items: [
      { id: "usp-1", text: "AUTHORIZED BRAND DISTRIBUTOR", enabled: true, order: 1 },
      { id: "usp-2", text: "100% ORIGINAL SPARE PARTS", enabled: true, order: 2 },
      { id: "usp-3", text: "DIRECT MANUFACTURER WARRANTY", enabled: true, order: 3 },
      { id: "usp-4", text: "PAN-INDIA EXPRESS DELIVERY", enabled: true, order: 4 },
      { id: "usp-5", text: "MORE WAREHOUSE HUB", enabled: true, order: 5 },
      { id: "usp-6", text: "CERTIFIED MACHINERY QUALITY", enabled: true, order: 6 },
    ],
  },
  summerOffer: {
    enabled: true,
    title: "PREMIUM SUMMER OFFER",
    offers: [
      { id: "offer-1", title: "Summer Offer 1", imageUrl: "/images/offers/offer-1.png", link: "/shop?offer=1", enabled: true, order: 1 },
      { id: "offer-2", title: "Summer Offer 2", imageUrl: "/images/offers/offer-2.png", link: "/shop?offer=2", enabled: true, order: 2 },
      { id: "offer-3", title: "Summer Offer 3", imageUrl: "/images/offers/offer-3.png", link: "/shop?offer=3", enabled: true, order: 3 },
      { id: "offer-4", title: "Summer Offer 4", imageUrl: "/images/offers/offer-4.png", link: "/shop?offer=4", enabled: true, order: 4 },
      { id: "offer-5", title: "Summer Offer 5", imageUrl: "/images/offers/offer-5.png", link: "/shop?offer=5", enabled: true, order: 5 },
      { id: "offer-6", title: "Summer Offer 6", imageUrl: "/images/offers/offer-6.png", link: "/shop?offer=6", enabled: true, order: 6 },
    ],
  },
};
