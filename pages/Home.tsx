import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { ProductSection } from "../components/ProductSection";
import { LensSection } from "../components/LensSection";
import { VisionSection } from "../components/VisionSection";
import MultifocalHero from "@/components/MultifocalHero";
import Multifocus from "@/components/MultiFocus";

import FeaturesSectionSecond from "@/components/FeaturesSectionSecond";
import MultiFrames from "@/components/product/MultiFrames";
import ChooseRightLens from "@/components/product/ChooseRightLens";
import PersonalLens from "@/components/product/PersonalLens";
import GoodLiving from "@/components/product/GoodLiving";
import NamingSystemSection from "@/components/NamingSystemSection";

export const Home: React.FC = () => {


  return (
    <>
      <HeroSection />
      <MultifocalHero />
      <FeaturesSectionSecond />
      {/* <FeaturesSection /> */}
      <ProductSection />
      {/* <LensSection /> */}
      {/* <VisionSection /> */}
      <div className="block lg:hidden">
        <PersonalLens />
      </div>
      {/* Image block with mobile-safe containment */}
      <div className="w-full flex justify-center hidden lg:block ">
        <img
          src="four2.png"
          alt=""
          className="w-full max-w-full object-contain"
          style={{ objectFit: "contain" }}
        />
      </div>
      <ChooseRightLens />
      {/* <MultiFrames /> */}

      {/* Mobile view - Show mm.png image with button */}
      <div
        className="block md:hidden"
        style={{ position: "relative", width: "100%" }}
      >
        <img
          src="mm.png"
          alt="Shop Our Range"
          style={{ width: "100%", display: "block", objectFit: "contain" }}
        />
        <button
          onClick={() => (window.location.href = "/glasses")}
          className="rounded-full transition-all whitespace-nowrap flex-shrink-0 bg-gray-800 text-white"
          style={{
            position: "absolute",
            top: "calc(50% - 70px)",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "180px",
            height: "60px",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            border: "1px solid rgb(74, 85, 104)",
            cursor: "pointer",
          }}
        >
          SHOP OUR RANGE
        </button>
      </div>

      {/* Desktop view - Show img44.png with button overlay */}
      <div
        className="hidden md:block"
        style={{ position: "relative", width: "100%" }}
      >
        <img
          src="img44.png"
          alt=""
          style={{ width: "100%", display: "block", objectFit: "contain" }}
        />
        <button
          onClick={() => (window.location.href = "/glasses")}
          className="rounded-full transition-all whitespace-nowrap flex-shrink-0 bg-gray-800 text-white left-1/2 md:left-1/4"
          style={{
            position: "absolute",
            bottom: "20px",
            transform: "translateX(-50%)",
            width: "180px",
            height: "60px",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            border: "1px solid rgb(74, 85, 104)",
            cursor: "pointer",
          }}
        >
          SHOP OUR RANGE
        </button>
      </div>
      <Multifocus />
      {/* {/*    */}
      {/* <div className="block lg:hidden">
        <GoodLiving />
      </div>  */}
      <NamingSystemSection />
    </>
  );
};
