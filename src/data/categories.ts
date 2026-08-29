export interface CategoryProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  subType?: "domestic" | "commercial" | "accessory" | "general";
  brand?: string;
  inStock?: boolean;
}

export interface CategoryDetail {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  bannerImage?: string;
  iconName?: string;
  subCategories?: { name: string; slug: string }[];
  products: CategoryProduct[];
}

export const CATEGORIES_DATA: Record<string, CategoryDetail> = {
  "high-pressure-washer": {
    slug: "high-pressure-washer",
    name: "High Pressure Washer",
    subtitle: "POWERFUL CLEANING SOLUTIONS",
    description: "Explore our industry-leading range of high pressure washers for cars, industrial cleaning, and domestic patios.",
    subCategories: [
      { name: "Domestic Pressure Washer", slug: "domestic-pressure-washer" },
      { name: "Professional Pressure Washer", slug: "professional-pressure-washer" },
      { name: "Accessories & Spares", slug: "accessories-spares" }
    ],
    products: [
      {
        id: "hpw-1",
        title: "TUQO Cordless High Pressure Washer CDW400 / 24V Lithium",
        price: 6299,
        originalPrice: 8299,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 320,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-2",
        title: "TUQO High Pressure Washer HW2000 / 140 Bar Induction Motor",
        price: 4999,
        originalPrice: 6999,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 450,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-3",
        title: "TUQO HW1200 Compact Portable Pressure Washer 1200W",
        price: 3999,
        originalPrice: 5499,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 4,
        ratingCount: 180,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-4",
        title: "TUQO Commercial Heavy Duty Pressure Washer 2800 PSI / 150 Bar",
        price: 14500,
        originalPrice: 18500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 210,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-5",
        title: "TUQO Industrial High Flow Pressure Washer 3500 PSI / Brass Pump",
        price: 22000,
        originalPrice: 28000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 95,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-6",
        title: "TUQO HG12 High Pressure Washer Short Trigger Gun / M22-M14",
        price: 999,
        originalPrice: 1499,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 680,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-7",
        title: "TUQO DS102 Premium Pressure Washer 4-Piece Quick Nozzle Tips",
        price: 399,
        originalPrice: 599,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 4,
        ratingCount: 420,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "hpw-8",
        title: "TUQO Heavy Duty Steel-Braided Hydraulic Washer Hose 10M",
        price: 1699,
        originalPrice: 2299,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 154,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "domestic-pressure-washer": {
    slug: "domestic-pressure-washer",
    name: "Domestic Pressure Washer",
    subtitle: "COMPACT & EFFORTLESS HOME CLEANING",
    description: "Engineered for vehicle washing, driveway cleaning, gardening, and residential outdoor maintenance.",
    subCategories: [
      { name: "All Pressure Washers", slug: "high-pressure-washer" },
      { name: "Professional Pressure Washer", slug: "professional-pressure-washer" },
      { name: "Accessories & Spares", slug: "accessories-spares" }
    ],
    products: [
      {
        id: "dom-1",
        title: "TUQO Cordless High Pressure Washer CDW400",
        price: 6299,
        originalPrice: 7999,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "dom-2",
        title: "TUQO High Pressure Washer HW1200 Portable 1200W",
        price: 3999,
        originalPrice: 5299,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 780,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "dom-3",
        title: "TUQO High Pressure Washer HW2000 / 140 Bar Induction",
        price: 4999,
        originalPrice: 6999,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 4,
        ratingCount: 605,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "dom-4",
        title: "TUQO Heavy Duty High Pressure Washer 2200W Auto-Stop",
        price: 5999,
        originalPrice: 7999,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 4,
        ratingCount: 420,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "dom-5",
        title: "TUQO High Pressure Washer 1500W Self-Priming Portable",
        price: 6100,
        originalPrice: 8400,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "dom-6",
        title: "TUQO Cordless Pressure Washer 24V Dual Battery Combo",
        price: 7499,
        originalPrice: 9999,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 160,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "professional-pressure-washer": {
    slug: "professional-pressure-washer",
    name: "Professional Pressure Washer",
    subtitle: "HEAVY-DUTY COMMERCIAL & INDUSTRIAL WASHERS",
    description: "Designed for commercial car washes, construction equipment cleaning, and continuous rigorous duty.",
    subCategories: [
      { name: "All Pressure Washers", slug: "high-pressure-washer" },
      { name: "Domestic Pressure Washer", slug: "domestic-pressure-washer" },
      { name: "Accessories & Spares", slug: "accessories-spares" }
    ],
    products: [
      {
        id: "pro-1",
        title: "TUQO Commercial Pressure Washer 2800 PSI / Triplex Ceramic Plunger",
        price: 14500,
        originalPrice: 18999,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pro-2",
        title: "TUQO Industrial Pressure Washer 3000 PSI Induction Motor",
        price: 18999,
        originalPrice: 24500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 780,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pro-3",
        title: "TUQO Heavy Duty Commercial Washer 180 Bar High Flow",
        price: 24500,
        originalPrice: 31000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 4,
        ratingCount: 605,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pro-4",
        title: "TUQO Mobile Petrol-Powered Commercial Pressure Cleaner 15HP",
        price: 32000,
        originalPrice: 42000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 142,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "vaccum-cleaner": {
    slug: "vaccum-cleaner",
    name: "Vacuum Cleaner",
    subtitle: "WET & DRY HIGH SUCTION CLEANERS",
    description: "Industrial strength dust collectors and dual-mode wet & dry vacuum cleaners for workshop and car interior detailing.",
    subCategories: [
      { name: "Autocare Detailing", slug: "autocare-detailing" },
      { name: "Cordless Tools", slug: "cordless-tools" }
    ],
    products: [
      {
        id: "vac-1",
        title: "TUQO Heavy Duty Wet & Dry Vacuum Cleaner 15L / 1200W",
        price: 4499,
        originalPrice: 6299,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 210,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "vac-2",
        title: "TUQO Industrial Stainless Steel Vacuum Cleaner 30L / Blower Function",
        price: 7999,
        originalPrice: 10500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 180,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "vac-3",
        title: "TUQO Cordless Portable Handheld Car Vacuum Cleaner 120W High Power",
        price: 1899,
        originalPrice: 2799,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 4,
        ratingCount: 390,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "vac-4",
        title: "TUQO Commercial Dual Motor High Capacity Vacuum Cleaner 60L",
        price: 14500,
        originalPrice: 19500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 88,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "autocare-detailing": {
    slug: "autocare-detailing",
    name: "Autocare Detailing",
    subtitle: "PROFESSIONAL VEHICLE DETAILING GEAR",
    description: "Snow foam cannons, rotary polishers, undercarriage cleaners, and microfibers for flawless automobile finishes.",
    subCategories: [
      { name: "High Pressure Washer", slug: "high-pressure-washer" },
      { name: "Accessories & Spares", slug: "accessories-spares" }
    ],
    products: [
      {
        id: "auto-1",
        title: "TUQO Heavy Duty Snow Foam Lance with 1/4\" Brass Quick Release",
        price: 1499,
        originalPrice: 2199,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 540,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "auto-2",
        title: "TUQO Professional Variable Speed Rotary Car Polisher 1200W",
        price: 4299,
        originalPrice: 5999,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 310,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "auto-3",
        title: "TUQO High Pressure Undercarriage Chassis Cleaner with 4 Nozzles",
        price: 2499,
        originalPrice: 3499,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 4,
        ratingCount: 195,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "auto-4",
        title: "TUQO 360-Degree Flexible Pivot Spray Lance Extension",
        price: 1199,
        originalPrice: 1799,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 220,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "accessories-spares": {
    slug: "accessories-spares",
    name: "Accessories & Spares",
    subtitle: "GENUINE SPARES, ADAPTERS & ACCESSORIES",
    description: "Keep your machines running at peak performance with precision brass couplers, trigger guns, nozzles, and replacement hoses.",
    subCategories: [
      { name: "High Pressure Washer", slug: "high-pressure-washer" },
      { name: "Air Compressor", slug: "air-compressor" }
    ],
    products: [
      {
        id: "acc-1",
        title: "TUQO DS102 Premium Pressure Washer 4Pcs Nozzle Tips",
        price: 399,
        originalPrice: 599,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 420,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "acc-2",
        title: "TUQO HG12 High Pressure Washer Trigger Gun / M22-M14",
        price: 999,
        originalPrice: 1499,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 780,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "acc-3",
        title: "Brass Coupler Connector Fitting Quick Join M22 Male/Female",
        price: 499,
        originalPrice: 799,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "acc-4",
        title: "Heavy Duty High Pressure Turbo Rotary Nozzle 040",
        price: 799,
        originalPrice: 1199,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 4,
        ratingCount: 310,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "acc-5",
        title: "High Pressure Steel-Braided Washer Water Hose 10 Meters",
        price: 1699,
        originalPrice: 2399,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 190,
        subType: "accessory",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "air-compressor": {
    slug: "air-compressor",
    name: "Air Compressor",
    subtitle: "HIGH PRESSURE AIR POWER",
    description: "Silent oil-free and heavy-duty direct drive air compressors for garage tools, spray painting, and industrial manufacturing.",
    subCategories: [
      { name: "Oil Free Compressor", slug: "oil-free-compressor" },
      { name: "Oil Type Compressor", slug: "oil-type-compressor" }
    ],
    products: [
      {
        id: "air-1",
        title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type Heavy Duty",
        price: 14500,
        originalPrice: 18500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "air-2",
        title: "TUQO Ultra-Silent Oil-Free Air Compressor 30L / 1.5HP Copper Motor",
        price: 11999,
        originalPrice: 15499,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 380,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "air-3",
        title: "TUQO Industrial Belt-Driven Twin Cylinder Air Compressor 50L",
        price: 24999,
        originalPrice: 32000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 110,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "air-4",
        title: "TUQO Compact Portable Dental & Laboratory Oil-Free Compressor 10L",
        price: 8499,
        originalPrice: 11500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 4,
        ratingCount: 95,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "oil-free-compressor": {
    slug: "oil-free-compressor",
    name: "Oil Free Air Compressor",
    subtitle: "CLEAN, MAINTENANCE-FREE & SILENT",
    description: "Quiet operation and 100% clean air output without oil contamination, perfect for medical, painting, and precision crafts.",
    subCategories: [
      { name: "All Air Compressors", slug: "air-compressor" },
      { name: "Oil Type Compressor", slug: "oil-type-compressor" }
    ],
    products: [
      {
        id: "ofc-1",
        title: "TUQO Ultra-Silent Oil-Free Air Compressor 30L / 1.5HP",
        price: 11999,
        originalPrice: 15499,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 380,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "ofc-2",
        title: "TUQO Portable Dental & Studio Oil-Free Compressor 10L",
        price: 8499,
        originalPrice: 11500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 4,
        ratingCount: 95,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "ofc-3",
        title: "TUQO Double Head Oil-Free Silent Compressor 50L / 2.0HP",
        price: 17500,
        originalPrice: 22999,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 140,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "oil-type-compressor": {
    slug: "oil-type-compressor",
    name: "Oil Type Air Compressor",
    subtitle: "ROBUST PERFORMANCE FOR CONTINUOUS WORKLOADS",
    description: "High durability lubrication systems designed for automobile repair garages, pneumatic machinery, and continuous tool usage.",
    subCategories: [
      { name: "All Air Compressors", slug: "air-compressor" },
      { name: "Oil Free Compressor", slug: "oil-free-compressor" }
    ],
    products: [
      {
        id: "otc-1",
        title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type Direct Drive",
        price: 14500,
        originalPrice: 18500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "otc-2",
        title: "TUQO Industrial Heavy-Duty Belt Driven Air Compressor 50L 3HP",
        price: 24999,
        originalPrice: 32000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 110,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "otc-3",
        title: "TUQO High Output Commercial Workshop Air Compressor 100L",
        price: 38500,
        originalPrice: 48000,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 65,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "cordless-tools": {
    slug: "cordless-tools",
    name: "Cordless Tools",
    subtitle: "UNRESTRICTED WIRELESS POWER",
    description: "Lithium-ion powered cordless pressure washers, drills, impact wrenches, and grinders for ultimate portability.",
    subCategories: [
      { name: "High Pressure Washer", slug: "high-pressure-washer" },
      { name: "Power Tools", slug: "power-tools" }
    ],
    products: [
      {
        id: "cord-1",
        title: "TUQO Cordless High Pressure Washer CDW400 / 24V Lithium",
        price: 6299,
        originalPrice: 8299,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 320,
        subType: "domestic",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "cord-2",
        title: "TUQO 20V Cordless Brushless Impact Drill Driver with 2 Batteries",
        price: 4899,
        originalPrice: 6599,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 290,
        subType: "general",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "cord-3",
        title: "TUQO 20V Cordless Brushless Angle Grinder 100mm",
        price: 5499,
        originalPrice: 7299,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 4,
        ratingCount: 175,
        subType: "general",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "cord-4",
        title: "TUQO 20V Cordless Heavy Duty Rotary Hammer Drill SDS-Plus",
        price: 6799,
        originalPrice: 8999,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 140,
        subType: "general",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "power-tools": {
    slug: "power-tools",
    name: "Power Tools",
    subtitle: "PRECISION MACHINERY & DRILLING RIGS",
    description: "Professional rotary hammers, angle grinders, circular saws, and tile cutters for industrial construction and workshops.",
    subCategories: [
      { name: "Cordless Tools", slug: "cordless-tools" },
      { name: "Hand Tools", slug: "hand-tools" }
    ],
    products: [
      {
        id: "pt-1",
        title: "TUQO Heavy Duty Rotary Hammer Drill 26mm / 800W Copper Armature",
        price: 3899,
        originalPrice: 5299,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 420,
        subType: "general",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pt-2",
        title: "TUQO Professional Angle Grinder 850W 100mm with Side Handle",
        price: 2199,
        originalPrice: 3199,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 610,
        subType: "general",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pt-3",
        title: "TUQO Woodworking Precision Circular Saw 185mm / 1400W",
        price: 3999,
        originalPrice: 5599,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 4,
        ratingCount: 230,
        subType: "general",
        brand: "TUQO",
        inStock: true
      },
      {
        id: "pt-4",
        title: "TUQO Heavy Duty Industrial Demolition Hammer 1500W / 15KG",
        price: 8999,
        originalPrice: 12500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 115,
        subType: "commercial",
        brand: "TUQO",
        inStock: true
      }
    ]
  },

  "hand-tools": {
    slug: "hand-tools",
    name: "Hand Tools",
    subtitle: "FORGED FOR DURABILITY & ACCURACY",
    description: "Socket sets, spanners, heavy duty pliers, and magnetic driver kits crafted from premium chrome vanadium steel.",
    subCategories: [
      { name: "Power Tools", slug: "power-tools" },
      { name: "Accessories & Spares", slug: "accessories-spares" }
    ],
    products: [
      {
        id: "ht-1",
        title: "METSO Professional 46-Piece Ratchet Socket Wrench Toolkit",
        price: 1899,
        originalPrice: 2699,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 380,
        subType: "general",
        brand: "METSO",
        inStock: true
      },
      {
        id: "ht-2",
        title: "METSO Heavy Duty Combination Spanner Set 6mm-22mm 12Pcs",
        price: 1299,
        originalPrice: 1899,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 290,
        subType: "general",
        brand: "METSO",
        inStock: true
      },
      {
        id: "ht-3",
        title: "METSO Chrome Vanadium Pliers & Wire Cutter 3-Piece Set",
        price: 799,
        originalPrice: 1199,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 4,
        ratingCount: 410,
        subType: "general",
        brand: "METSO",
        inStock: true
      },
      {
        id: "ht-4",
        title: "METSO Multi-Bit Magnetic Screwdriver Toolset 32-in-1 with Case",
        price: 499,
        originalPrice: 799,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 520,
        subType: "general",
        brand: "METSO",
        inStock: true
      }
    ]
  }
};

export function getProductById(id: string): (CategoryProduct & { categorySlug?: string; categoryName?: string }) | null {
  for (const cat of Object.values(CATEGORIES_DATA)) {
    const found = cat.products.find((p) => p.id === id);
    if (found) {
      return {
        ...found,
        categorySlug: cat.slug,
        categoryName: cat.name,
      };
    }
  }

  // Fallback defaults for standard prod IDs
  if (id === "prod-1") {
    return {
      id: "prod-1",
      title: "TUQO High Pressure Washer HW2000 / 140 Bar",
      price: 4999,
      originalPrice: 6999,
      imageUrl: "/images/products/hw2000.jpg",
      rating: 5,
      ratingCount: 241,
      subType: "domestic",
      brand: "TUQO",
      categorySlug: "high-pressure-washer",
      categoryName: "High Pressure Washer",
      inStock: true
    };
  }
  if (id === "prod-2") {
    return {
      id: "prod-2",
      title: "TUQO HG12 High Pressure Washer Trigger Gun / M22-M14",
      price: 999,
      originalPrice: 1499,
      imageUrl: "/images/products/trigger_gun.jpg",
      rating: 5,
      ratingCount: 780,
      subType: "accessory",
      brand: "TUQO",
      categorySlug: "accessories-spares",
      categoryName: "Accessories & Spares",
      inStock: true
    };
  }
  if (id === "prod-3") {
    return {
      id: "prod-3",
      title: "TUQO Cordless High Pressure Washer CDW400",
      price: 6299,
      originalPrice: 8299,
      imageUrl: "/images/products/cdw400.jpg",
      rating: 4,
      ratingCount: 605,
      subType: "domestic",
      brand: "TUQO",
      categorySlug: "cordless-tools",
      categoryName: "Cordless Tools",
      inStock: true
    };
  }
  if (id === "prod-4") {
    return {
      id: "prod-4",
      title: "TUQO DS102 Premium Pressure Washer 4Pcs Nozzle Tips",
      price: 399,
      originalPrice: 599,
      imageUrl: "/images/products/nozzle_tips.jpg",
      rating: 4,
      ratingCount: 420,
      subType: "accessory",
      brand: "TUQO",
      categorySlug: "accessories-spares",
      categoryName: "Accessories & Spares",
      inStock: true
    };
  }
  if (id === "prod-5") {
    return {
      id: "prod-5",
      title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type",
      price: 14500,
      originalPrice: 18500,
      imageUrl: "/images/products/compressor.jpg",
      rating: 5,
      ratingCount: 241,
      subType: "commercial",
      brand: "TUQO",
      categorySlug: "air-compressor",
      categoryName: "Air Compressor",
      inStock: true
    };
  }

  return null;
}
