import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Product, Category, Banner, Brand, HomeSettings, DEFAULT_HOME_SETTINGS } from "@/lib/schemas";
import { HERO_SLIDES, BRAND_CATEGORIES } from "@/data/home";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    // 1. Seed Brands
    const brandCount = await Brand.countDocuments({});
    if (brandCount === 0 || force) {
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
    }

    // 2. Seed Hero Banners
    const bannerCount = await Banner.countDocuments({});
    if (bannerCount === 0 || force) {
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
    }

    // 3. Seed Categories & Subcategories across all brands
    const categoryCount = await Category.countDocuments({});
    if (categoryCount === 0 || force) {
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
    }

    // 4. Seed Products
    const productCount = await Product.countDocuments({});
    if (productCount === 0 || force) {
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
        {
          id: "prod-2",
          title: "TUQO HG12 High Pressure Washer Trigger Gun / M22-M14",
          price: 999,
          originalPrice: 1499,
          imageUrl: "/images/products/trigger_gun.jpg",
          gallery: ["/images/products/trigger_gun.jpg", "/images/products/nozzle_tips.jpg"],
          rating: 5,
          ratingCount: 780,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "accessory",
          description: [
            "Heavy-duty brass core valve engineered for pressures up to 300 Bar",
            "Universal M22 inlet and 1/4 inch quick disconnect outlet",
            "Safety trigger lock prevents accidental discharge"
          ],
          specifications: ["Max Pressure: 300 Bar / 4350 PSI", "Max Temp: 60°C", "Inlet: M22-14mm", "Outlet: 1/4\" Quick Coupler"],
          whatsInBox: ["1x Short Trigger Spray Gun", "1x 1/4\" Quick Connect Adapter"],
          inStock: true,
          isBestSeller: true,
          order: 2,
        },
        {
          id: "prod-3",
          title: "TUQO Cordless High Pressure Washer CDW400",
          price: 6299,
          originalPrice: 8299,
          imageUrl: "/images/products/cdw400.jpg",
          gallery: ["/images/products/cdw400.jpg", "/images/products/hw2000.jpg"],
          rating: 4,
          ratingCount: 605,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "domestic",
          description: [
            "24V Lithium-ion cordless freedom - draw water from buckets, pools or taps",
            "Multi-function 6-in-1 spray nozzle for jet stream, fan spray, and shower mode",
            "Up to 45 minutes of continuous runtime on a single charge"
          ],
          specifications: ["Battery: 24V 4.0Ah Li-Ion", "Pressure: 35-50 Bar", "Water Flow: 4.5 L/min", "Weight: 2.1 Kg"],
          whatsInBox: ["1x CDW400 Cordless Washer", "1x 24V Li-Ion Battery", "1x Fast Charger", "1x 5M Suction Hose with Filter", "1x Foam Bottle"],
          inStock: true,
          isBestSeller: true,
          order: 3,
        },
        {
          id: "prod-4",
          title: "TUQO DS102 Premium Pressure Washer 4Pcs Nozzle Tips",
          price: 399,
          originalPrice: 599,
          imageUrl: "/images/products/nozzle_tips.jpg",
          gallery: ["/images/products/nozzle_tips.jpg"],
          rating: 4,
          ratingCount: 420,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "accessory",
          description: [
            "Set of 4 stainless steel color-coded nozzles (0°, 15°, 25°, 40°)",
            "1/4 inch quick connector fits most standard pressure washer wands",
            "Laser-drilled orifices ensure precise spray pattern without pressure drop"
          ],
          specifications: ["Connector: 1/4\" Quick Plug", "Degrees: 0°, 15°, 25°, 40°", "Max Pressure: 4000 PSI"],
          whatsInBox: ["1x 0° Red Nozzle", "1x 15° Yellow Nozzle", "1x 25° Green Nozzle", "1x 40° White Nozzle"],
          inStock: true,
          isBestSeller: true,
          order: 4,
        },
        {
          id: "prod-5",
          title: "TUQO Air Compressor 25 Liters LK25DB - Oil Type",
          price: 14500,
          originalPrice: 18500,
          imageUrl: "/images/products/compressor.jpg",
          gallery: ["/images/products/compressor.jpg"],
          rating: 5,
          ratingCount: 241,
          brand: "tuqo",
          category: "air-compressor",
          subCategory: "commercial",
          description: [
            "25 Litre high-capacity steel pressure vessel with anti-corrosion coating",
            "Cast-iron cylinder pump with oil lubrication for extended lifespan",
            "Dual pressure gauges for tank and regulated working pressure"
          ],
          specifications: ["Tank Capacity: 25L", "Motor: 2.5 HP", "Working Pressure: 8 Bar / 115 PSI", "Air Delivery: 190 L/min"],
          whatsInBox: ["1x LK25DB 25L Compressor", "2x Transport Wheels", "1x Air Filter Intake", "1x Oil Breather"],
          inStock: true,
          isBestSeller: true,
          order: 5,
        },
        {
          id: "dom-1",
          title: "TUQO High Pressure Washer HW1200 / 110 Bar",
          price: 3999,
          originalPrice: 5499,
          imageUrl: "/images/products/hw2000.jpg",
          gallery: ["/images/products/hw2000.jpg"],
          rating: 5,
          ratingCount: 110,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "domestic",
          description: ["Ideal for two-wheeler, bicycle and patio washing", "Lightweight and compact carry design"],
          specifications: ["Power: 1400W", "Pressure: 110 Bar", "Hose: 5M"],
          whatsInBox: ["1x HW1200 Washer", "1x Spray Lance", "1x Hose Pipe"],
          inStock: true,
          order: 6,
        },
        {
          id: "dom-2",
          title: "TUQO Heavy Duty High Pressure Washer 2200W",
          price: 5999,
          originalPrice: 7999,
          imageUrl: "/images/products/cdw400.jpg",
          gallery: ["/images/products/cdw400.jpg"],
          rating: 5,
          ratingCount: 89,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "domestic",
          description: ["2200W high performance motor for tough mud and grime removal", "Includes soap dispenser bottle"],
          specifications: ["Power: 2200W", "Pressure: 150 Bar", "Flow: 9 L/min"],
          whatsInBox: ["1x 2200W Washer", "1x Heavy Gun", "1x 8M Hose"],
          inStock: true,
          order: 7,
        },
        {
          id: "com-1",
          title: "TUQO Commercial Pressure Washer 2800 PSI Induction",
          price: 18500,
          originalPrice: 24500,
          imageUrl: "/images/products/compressor.jpg",
          gallery: ["/images/products/compressor.jpg"],
          rating: 5,
          ratingCount: 75,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "commercial",
          description: ["Heavy duty ceramic plunger pump built for daily car wash center operations", "Induction motor rated for continuous 8-hour daily use"],
          specifications: ["Power: 2800W", "Pressure: 180 Bar", "Flow: 14 L/min", "Weight: 28 Kg"],
          whatsInBox: ["1x Commercial Pressure Washer", "1x 10M Steel Wire Braided Hose", "1x Professional Foam Cannon"],
          inStock: true,
          order: 8,
        },
        {
          id: "com-2",
          title: "TUQO Industrial Grade Pressure Washer 3500 PSI / 3.5KW",
          price: 29999,
          originalPrice: 38999,
          imageUrl: "/images/products/compressor.jpg",
          gallery: ["/images/products/compressor.jpg"],
          rating: 5,
          ratingCount: 42,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "commercial",
          description: ["Triplex crankshaft pump with brass manifold", "Heavy-duty steel roll-cage frame with 10-inch pneumatic tyres"],
          specifications: ["Power: 3500W / 4.7 HP", "Pressure: 240 Bar", "Flow: 16 L/min"],
          whatsInBox: ["1x Industrial Pressure Machine", "1x 15M High Pressure Hose", "4x Quick Connect Nozzles"],
          inStock: true,
          order: 9,
        },
        {
          id: "vac-1",
          title: "TUQO Wet & Dry Heavy Duty Vacuum Cleaner 30L",
          price: 7499,
          originalPrice: 9999,
          imageUrl: "/images/products/cdw400.jpg",
          gallery: ["/images/products/cdw400.jpg"],
          rating: 5,
          ratingCount: 130,
          brand: "tuqo",
          category: "vaccum-cleaner",
          subCategory: "domestic",
          description: ["Stainless steel 30L drum with powerful 1600W blower and suction motor", "Washable HEPA filtration system"],
          specifications: ["Capacity: 30 Litres", "Power: 1600W", "Suction: 20 kPa"],
          whatsInBox: ["1x 30L Vacuum Unit", "1x Flexible Hose", "2x Extension Tubes", "1x Floor Brush", "1x Crevice Tool"],
          inStock: true,
          order: 10,
        },
      ];

      for (const p of allProducts) {
        await Product.findOneAndUpdate({ id: p.id } as any, { $set: p }, { upsert: true, new: true });
      }
    }

    // 5. Seed Home Settings
    const homeSettings = await HomeSettings.findOne({ id: "default" } as any);
    if (!homeSettings || force) {
      await HomeSettings.findOneAndUpdate(
        { id: "default" } as any,
        { $set: DEFAULT_HOME_SETTINGS },
        { upsert: true, new: true }
      );
    }

    const counts = {
      brands: await Brand.countDocuments({}),
      categories: await Category.countDocuments({}),
      banners: await Banner.countDocuments({}),
      products: await Product.countDocuments({}),
      homeSettings: await HomeSettings.countDocuments({}),
    };

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded and synchronized with all products, categories, brands, and banners!",
      counts,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
