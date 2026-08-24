export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  link: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  price: number;
  originalPrice?: number;
  badge?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export const HERO_SLIDES: Banner[] = [
  {
    id: "banner-1",
    title: "Master Full-Stack Web Development",
    subtitle: "Build modern, production-ready web applications with Next.js, React, Node.js, and MongoDB. Learn from elite engineers.",
    imageUrl: "/images/banners/web-dev.jpg",
    buttonText: "Explore Developer Skills",
    link: "/shop?category=development",
  },
  {
    id: "banner-2",
    title: "Design High-Converting Interfaces",
    subtitle: "Master Figma, wireframing, prototyping, and modern design principles. Elevate your creative portfolio today.",
    imageUrl: "/images/banners/design.jpg",
    buttonText: "Explore Design Skills",
    link: "/shop?category=design",
  },
  {
    id: "banner-3",
    title: "Lead the AI & Machine Learning Wave",
    subtitle: "Dive deep into Python, neural networks, generative AI, and advanced predictive analytics. Master future-proof technologies.",
    imageUrl: "/images/banners/ai.jpg",
    buttonText: "Explore Data Skills",
    link: "/shop?category=ai",
  },
];

export const BEST_SELLERS: Product[] = [
  {
    id: "prod-1",
    title: "Next.js 16 & React 19: The Complete Guide",
    category: "Development",
    instructor: "Dr. Angela Yu, Sarah Connor",
    rating: 4.8,
    ratingCount: 12450,
    price: 89.99,
    originalPrice: 179.99,
    badge: "Best Seller",
  },
  {
    id: "prod-2",
    title: "Figma UI/UX Masterclass: Wireframe to Prototype",
    category: "Design",
    instructor: "Andrei Neagoie, Daniel Walter",
    rating: 4.9,
    ratingCount: 8930,
    price: 69.99,
    originalPrice: 139.99,
    badge: "New",
  },
  {
    id: "prod-3",
    title: "Data Science, Deep Learning & Python Bootcamp",
    category: "AI & Data Science",
    instructor: "Jose Portilla, Frank Kane",
    rating: 4.7,
    ratingCount: 15300,
    price: 99.99,
    originalPrice: 199.99,
    badge: "Hot",
  },
  {
    id: "prod-4",
    title: "Premium Digital Marketing & SEO Strategy 2026",
    category: "Marketing",
    instructor: "Rob Percival, Daragh Walsh",
    rating: 4.6,
    ratingCount: 6420,
    price: 49.99,
    originalPrice: 99.99,
  },
  {
    id: "prod-5",
    title: "The Ultimate Product Management A-Z Certification",
    category: "Business",
    instructor: "Cole Mercer, Evan Kimbrell",
    rating: 4.8,
    ratingCount: 7120,
    price: 79.99,
    originalPrice: 159.99,
  },
  {
    id: "prod-6",
    title: "Advanced CSS Animations, Flexbox, Grid & Layouts",
    category: "Design",
    instructor: "Jonas Schmedtmann",
    rating: 4.9,
    ratingCount: 11050,
    price: 39.99,
    originalPrice: 79.99,
    badge: "Trending",
  },
];

export const BRANDS: Brand[] = [
  { id: "brand-google", name: "Google" },
  { id: "brand-amazon", name: "Amazon" },
  { id: "brand-meta", name: "Meta" },
  { id: "brand-microsoft", name: "Microsoft" },
  { id: "brand-netflix", name: "Netflix" },
];
