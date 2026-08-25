import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product, Category, Banner } from "@/lib/schemas";
import { HERO_SLIDES, BRAND_CATEGORIES, BEST_SELLERS } from "@/data/home";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Seed Banners if empty
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      const bannerSeeds = HERO_SLIDES.map((slide) => ({
        id: slide.id,
        imageUrl: slide.imageUrl,
        link: slide.link,
      }));
      await Banner.insertMany(bannerSeeds);
    }

    // 2. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categorySeeds: Array<{ id: string; name: string; brand: string; imageUrl: string; link: string }> = [];
      Object.entries(BRAND_CATEGORIES).forEach(([brandKey, brandObj]) => {
        brandObj.categories.forEach((cat) => {
          categorySeeds.push({
            id: cat.id,
            name: cat.name,
            brand: brandKey,
            imageUrl: cat.imageUrl,
            link: cat.link,
          });
        });
      });
      await Category.insertMany(categorySeeds);
    }

    // 3. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productSeeds: Array<Record<string, unknown>> = [];

      // Add best sellers
      BEST_SELLERS.forEach((p) => {
        productSeeds.push({
          id: p.id,
          title: p.title,
          price: p.price || 4999,
          originalPrice: (p.price || 4999) + 2000,
          imageUrl: p.imageUrl,
          rating: p.rating,
          ratingCount: p.ratingCount,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "domestic",
          description: ["Power Wash Spray Gun", "Professional quality output", "Simple connection"],
          specifications: ["Voltage: 24V", "Pressure: 140 Bar", "Weight: 2.8Kg"],
          whatsInBox: ["Washer Machine", "Hose Pipe", "Adapter Coupler"],
          inStock: true,
        });
      });

      // Add domestic category products
      const initialDomestic = [
        { id: "dom-1", title: "TUQO Cordless High Pressure Washer CDW400", price: 6299, imageUrl: "/images/products/cdw400.jpg" },
        { id: "dom-2", title: "TUQO High Pressure Washer HW1200", price: 3999, imageUrl: "/images/products/hw2000.jpg" },
        { id: "dom-3", title: "TUQO High Pressure Washer HW2000 / 140 Bar", price: 4999, imageUrl: "/images/products/hw2000.jpg" },
        { id: "dom-4", title: "TUQO Heavy Duty High Pressure Washer 2200W", price: 5999, imageUrl: "/images/products/cdw400.jpg" },
        { id: "dom-5", title: "TUQO High Pressure Washer 1500W Portable", price: 6100, imageUrl: "/images/products/hw2000.jpg" },
        { id: "dom-6", title: "TUQO High Pressure Washer 1200W Classic", price: 3999, imageUrl: "/images/products/hw2000.jpg" },
        { id: "dom-7", title: "TUQO High Pressure Washer 1800W Advanced", price: 4999, imageUrl: "/images/products/cdw400.jpg" },
        { id: "dom-8", title: "TUQO Cordless High Pressure Washer 24V", price: 5999, imageUrl: "/images/products/cdw400.jpg" },
      ];

      initialDomestic.forEach((p) => {
        // Prevent duplicate IDs
        if (!productSeeds.some((s) => s.id === p.id)) {
          productSeeds.push({
            id: p.id,
            title: p.title,
            price: p.price,
            originalPrice: p.price + 2000,
            imageUrl: p.imageUrl,
            rating: 5,
            ratingCount: 120,
            brand: "tuqo",
            category: "high-pressure-washer",
            subCategory: "domestic",
            description: ["Excellent power output", "Lightweight portable handle", "Draw water from anywhere"],
            specifications: ["Power: 1200W", "Weight: 3.1Kg", "Hose: 5M"],
            whatsInBox: ["Pressure Gun", "Water Filter", "Extension Rod"],
            inStock: true,
          });
        }
      });

      // Add commercial category products
      const initialCommercial = [
        { id: "com-1", title: "TUQO Commercial Pressure Washer 2800 PSI", price: 12500, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-2", title: "TUQO Industrial Pressure Washer 3000 PSI", price: 14999, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-3", title: "TUQO Heavy Duty Commercial Washer 150 Bar", price: 18500, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-4", title: "TUQO High Flow Commercial Pressure Washer 4000", price: 22000, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-5", title: "TUQO Commercial Pressure Washer 15HP Gas", price: 28999, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-6", title: "TUQO Mobile Gas-Powered Commercial Washer", price: 24500, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-7", title: "TUQO Professional Commercial Cleaner 3.0 GPM", price: 19999, imageUrl: "/images/products/compressor.jpg" },
        { id: "com-8", title: "TUQO Heavy Duty Skid Mounted Pressure Washer", price: 32000, imageUrl: "/images/products/compressor.jpg" },
      ];

      initialCommercial.forEach((p) => {
        productSeeds.push({
          id: p.id,
          title: p.title,
          price: p.price,
          originalPrice: p.price + 5000,
          imageUrl: p.imageUrl,
          rating: 4,
          ratingCount: 88,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "commercial",
          description: ["Industrial grade piston pump", "Heavy duty induction motor", "Continuous load operations"],
          specifications: ["Power: 2800W", "Pressure: 180 Bar", "Water Flow: 15L/min"],
          whatsInBox: ["High Pressure Machine", "Steel Braided Hose 10M", "Soap Bottle"],
          inStock: true,
        });
      });

      // Add accessories & spares
      const initialAccessories = [
        { id: "acc-1", title: "Brass Coupler Connector Fitting Quick Join", price: 499, imageUrl: "/images/products/nozzle_tips.jpg" },
        { id: "acc-2", title: "TUQO Premium 4Pcs Spray Nozzle Set", price: 899, imageUrl: "/images/products/nozzle_tips.jpg" },
        { id: "acc-3", title: "Heavy Duty Brass Adapter Coupling Male/Female", price: 650, imageUrl: "/images/products/trigger_gun.jpg" },
        { id: "acc-4", title: "Universal Red Adapter Quick Release Fitting", price: 399, imageUrl: "/images/products/trigger_gun.jpg" },
        { id: "acc-5", title: "High Pressure Washer Water Hose 5 Meters", price: 1200, imageUrl: "/images/products/hw2000.jpg" }
      ];

      initialAccessories.forEach((p) => {
        productSeeds.push({
          id: p.id,
          title: p.title,
          price: p.price,
          originalPrice: p.price + 200,
          imageUrl: p.imageUrl,
          rating: 5,
          ratingCount: 300,
          brand: "tuqo",
          category: "high-pressure-washer",
          subCategory: "accessory",
          description: ["Solid brass construction", "Quick release connectors", "High wear resistance"],
          specifications: ["Material: Brass", "Fit size: M22/M14"],
          whatsInBox: ["Connector Adapter"],
          inStock: true,
        });
      });

      await Product.insertMany(productSeeds);
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
