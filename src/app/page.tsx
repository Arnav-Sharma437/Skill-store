import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import HeroBanner from "@/components/home/HeroBanner";
import FeatureBadges from "@/components/home/FeatureBadges";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import BestSellerSection from "@/components/home/BestSellerSection";
import BrandShowcase from "@/components/home/BrandShowcase";
import SummerOffer from "@/components/home/SummerOffer";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main style={{ flexGrow: 1 }}>
        <HeroBanner />
        <FeatureBadges />
        <CategoryShowcase />
        <BestSellerSection />
        <BrandShowcase />
        <SummerOffer />
        <WhyChooseUs />
      </main>
      <Footer />
    </>
  );
}
