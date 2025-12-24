"use client";

import { useState } from "react";

export default function ChooseRightLens() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  const tabs = ["OVERVIEW", "STANDARD", "ADVANCED", "PRECISION"];

  // Content for each tab
  const tabContent = {
    OVERVIEW: {
      image: "./drive.png",
      title: "CHOOSING THE RIGHT LENS",
      description: [
        "One of the brilliant things about multifocals is the different lens types you have to choose from to suit exactly what you want them for, whether that's reading, working, driving or everything.",
        "Here's an explanation of the three types of multifocal lens. And click on our sitting tool to choose the right one for you.",
      ],
      middleImage: "./Specs 3.png",
      middleContent: null,
    },
    STANDARD: {
      image: "./specs1Right.png",
      title: "CHOOSING THE RIGHT LENS",
      description: [
        "This lens is perfect for those who spend long hours reading, writing, or working on detailed indoor tasks. It features an extra-wide near vision zone — ideal for home and desk use.",
        "Best for: \n For anyone seeking a dedicated pair for reading and home activities.A perfect companion for quiet routines and a life lived up close.",
      ],
      middleImage: "./specs 1.png",
      middleContent: "Ideal for general use with balanced performance",
    },
    ADVANCED: {
      image: "./specs2Right.png",
      title: "CHOOSING THE RIGHT LENS",
      description: [
        "For users who are always on the move, this lens offers a balanced view across near, intermediate, and distance zones, making it perfect for work, screens, and driving. With smoother transitions and reduced distortion, it adapts seamlessly to your daily routine.",
        "Best For: \n First-time progressive wearers. Busy, active lifestyles with screen time, driving, and multitasking.",
        "A smart upgrade for anyone who needs sharp, stable vision throughout the day.",
      ],
      middleImage: "./Specs 2.png",
      middleContent: "Enhanced for professional and active lifestyles",
    },
    "PRECISION": {
      image: "./specs3Right.png",
      title: "CHOOSING THE RIGHT LENS",
      description: [
        "Our most advanced lens, Precision+ delivers ultra-wide viewing zones with minimal distortion, designed to fit seamlessly into modern, narrower frames. No trade-offs, just clarity and comfort.",
        "Best For: \n Seasoned multifocal users, those seeking premium clarity in sleek frames and want top performance in any design.",
        "A powerful upgrade for those who know and expect the best",
      ],
      middleImage: "./Specs 3.png",
      middleContent: "Custom-tailored for optimal visual performance",
    },
  };

  const content = tabContent[activeTab];

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:flex flex-col lg:flex-row h-auto lg:h-screen w-full">
        {/* Left Section */}
        <div
          className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12"
          style={{ backgroundColor: "#f5f1ed" }}
        >
          {/* Title - Always at the top */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1
              className="text-[20px] font-normal tracking-[0.1em]"
              style={{ color: "#1a1a1a" }}
            >
              {content.title}
            </h1>
          </div>

          {/* Middle Section - Image appears here for STANDARD, ADVANCED, PRECISION */}
          <div className="flex-grow flex flex-col justify-center items-start">
            {content.middleImage ? (
              <>
                <img src={content.middleImage} alt="" />
              </>
            ) : (
              <div className="h-48 sm:h-56 md:h-64"></div>
            )}
          </div>

          {/* Description - Always at the bottom */}
          <div
            className="mb-6 sm:mb-8 md:mb-10"
            style={{ width: "508px", height: "130px" }}
          >
            <div
              className="space-y-3 sm:space-y-4 leading-relaxed"
              style={{
                color: "#333333",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                fontSize: "17px",
                letterSpacing: "-0.03em", // -3%
              }}
            >
              {content.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Tab Buttons - All in same row for mobile */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex gap-2 sm:gap-3 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? "bg-gray-800 text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  }`}
                  style={{
                    width: "128px",
                    height: "60px",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.1em", // 10%
                    border:
                      activeTab === tab
                        ? "1px solid #4a5568"
                        : "1px solid #e0dcd8",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Background Image */}
        <div className="w-full lg:w-1/2 relative overflow-hidden">
          <img
            src={content.image}
            alt={content.title}
            className="object-cover w-full h-full transition-opacity duration-300"
          />

          {/* Optional overlay text for image */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-6 sm:p-8">
            <div className="text-white">
              <p className="text-sm sm:text-base md:text-lg font-light">
                {activeTab === "OVERVIEW"
                  ? "Discover the perfect multifocal lenses for your lifestyle"
                  : `Viewing: ${activeTab.replace(" >", "")} LENSES`}
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="flex lg:hidden flex-col pt-4 w-full p-0 sm:p-6" style={{ backgroundColor: "#f5f1ed" }}>
        {/* Title - 2 lines at the top */}
        <div className="mb-6">
          <h1
            className="text-[20px] font-normal text-center tracking-[0.1em] leading-tight"
            style={{ color: "#1a1a1a" }}
          >
            CHOOSING
            <br />
            THE RIGHT LENS
          </h1>
        </div>

        {/* Tab Buttons - 2 per row */}
        <div className="grid grid-cols-2 gap-3 mb-8 p-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full transition-all flex items-center justify-center h-16 ${
                activeTab === tab
                  ? "bg-gray-800 text-white"
                  : "bg-white hover:bg-gray-100 text-black"
              }`}
              style={{
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                border:
                  activeTab === tab
                    ? "1px solid #4a5568"
                    : "1px solid #e0dcd8",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Description Text */}
        <div className="mb-8 p-6">
          <div
            className="space-y-4 leading-relaxed text-center"
            style={{
              color: "#333333",
              fontSize: "16px",
              letterSpacing: "-0.03em",
            }}
          >
            {content.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Middle Image - Below text for mobile */}
        <div className="flex justify-center mb-8 p-6">
          {content.middleImage && (
            <div className="relative w-full max-w-sm">
              <img 
                src={content.middleImage} 
                alt="" 
                className="w-full h-auto object-contain"
              />
              {content.middleContent && (
                <div className="mt-4 text-center text-gray-600 text-sm">
                  {content.middleContent}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section Image - Full width at bottom */}
        <div className="relative w-full  overflow-hidden">
          <img
            src={content.image}
            alt={content.title}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}