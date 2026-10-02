import mongoose from "mongoose";
import { Product, Category, Banner, Brand, HomeSettings, DEFAULT_HOME_SETTINGS } from "@/lib/schemas";
import { HERO_SLIDES, BRAND_CATEGORIES } from "@/data/home";

/**
 * Seeds default categories, subcategories, brands, products, banners,
 * ONLY when explicitly requested (force === true).
 */
export async function ensureDatabaseInitialized(force: boolean = false) {
  if (!force) {
    return;
  }

  try {
    // 1. Initialize Brands
    const defaultBrands = [
      { id: "tuqo", name: "TUQO", logo: "/images/brands/tuqo.svg", tagline: "Professional Machinery & Power Tools", enabled: true, order: 1 },
      { id: "pumpkin", name: "PUMPKIN", logo: "/images/brands/pumpkin.svg", tagline: "Durable Industrial & Hand Tools", enabled: true, order: 2 },
      { id: "mitsuki", name: "MITSUKI", logo: "/images/brands/mitsuki.svg", tagline: "Japanese Technology Power Equipment", enabled: true, order: 3 },
      { id: "metso", name: "METSO", logo: "/images/brands/metso.svg", tagline: "Heavy Duty Workshop & Garage Gear", enabled: true, order: 4 },
      { id: "costec", name: "COSTEC", logo: "/images/brands/costec.svg", tagline: "Smart Tech & Car Accessories", enabled: true, order: 5 },
      { id: "ultratouch", name: "Ultra TOUCH", logo: "/images/brands/ultratouch.svg", tagline: "Premium Auto Care & Detailing", enabled: true, order: 6 },
    ];

    for (const b of defaultBrands) {
      await Brand.findOneAndUpdate({ id: b.id } as any, { $set: b }, { upsert: true, new: true });
    }

    // 2. Initialize Hero Banners
    for (const slide of HERO_SLIDES) {
      await Banner.findOneAndUpdate(
        { id: slide.id } as any,
        {
          $set: {
            id: slide.id,
            imageUrl: slide.imageUrl,
            mobileImageUrl: slide.mobileImageUrl || "",
            link: slide.link || "/",
          },
        },
        { upsert: true, new: true }
      );
    }

    // 3. Initialize Categories & Subcategories
    let orderIndex = 1;
    for (const [brandKey, brandObj] of Object.entries(BRAND_CATEGORIES)) {
      for (const cat of brandObj.categories) {
        const subcategories = [];
        if (cat.id.includes("pressure-washer") || cat.name.toLowerCase().includes("washer")) {
          subcategories.push(
            { id: "domestic", name: "Domestic Pressure Washers", description: "Portable 100-140 Bar Washers", imageUrl: "/images/products/hw2000.jpg" },
            { id: "commercial", name: "Commercial & Industrial", description: "Heavy Duty 150-250 Bar Washers", imageUrl: "/images/products/compressor.jpg" },
            { id: "accessories", name: "Guns, Hoses & Nozzles", description: "Standard Replacement Attachments", imageUrl: "/images/products/trigger_gun.jpg" }
          );
        } else if (cat.id.includes("compressor") || cat.name.toLowerCase().includes("compressor")) {
          subcategories.push(
            { id: "oil-free", name: "Oil-Free Compressors", description: "Quiet Dental & DIY Applications", imageUrl: "/images/products/compressor.jpg" },
            { id: "oil-type", name: "Oil-Type Heavy Duty", description: "High Flow Garage Compressors", imageUrl: "/images/products/compressor.jpg" }
          );
        }

        await Category.findOneAndUpdate(
          { id: cat.id } as any,
          {
            $set: {
              id: cat.id,
              name: cat.name,
              brand: brandKey,
              imageUrl: cat.imageUrl,
              link: cat.link,
              description: `Explore our premium collection of ${cat.name} from ${brandObj.name}.`,
              subcategories: subcategories,
              order: orderIndex++,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Initialize Products
    const allProducts: Array<Record<string, unknown>> = [
      {
        id: "prod-1",
        title: "TUQO High Pressure Washer HW2000 / 140 Bar",
        price: 4999,
        originalPrice: 6999,
        imageUrl: "/images/products/hw2000.jpg",
        gallery: ["/images/products/hw2000.jpg", "/images/products/cdw400.jpg"],
        rating: 5,
        ratingCount: 241,
        brand: "tuqo",
        category: "high-pressure-washer",
        subCategory: "domestic",
        description: [
          "Powerful 140 Bar max output for thorough car & home cleaning",
          "High-efficiency copper induction motor with auto-stop system",
          "Compact portable design with built-in ergonomic carry handle"
        ],
        specifications: ["Voltage: 220-240V ~ 50Hz", "Max Pressure: 140 Bar", "Power: 1800 Watts", "Flow Rate: 8.5 L/min", "Hose: 8 Meters"],
        whatsInBox: ["1x HW2000 Pressure Washer", "1x High Pressure Gun", "1x 8M Braided Hose", "1x Quick Foam Lance", "1x Inlet Filter"],
        inStock: true,
        isBestSeller: true,
        order: 1,
      },
    ];

    for (const p of allProducts) {
      await Product.findOneAndUpdate({ id: p.id } as any, { $set: p }, { upsert: true, new: true });
    }

    // 5. Initialize Home Settings
    await HomeSettings.findOneAndUpdate(
      { id: "default" } as any,
      { $set: DEFAULT_HOME_SETTINGS },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
