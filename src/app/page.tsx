import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import HeroBanner from "@/components/home/HeroBanner";
import BestSellerSection from "@/components/home/BestSellerSection";
import SummerOffer from "@/components/home/SummerOffer";
import BrandsSection from "@/components/home/BrandsSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main style={{ flexGrow: 1 }}>
        <HeroBanner />
        <BestSellerSection />
        <SummerOffer />
        <BrandsSection />
      </main>
      <Footer />
    </>
  );
}
