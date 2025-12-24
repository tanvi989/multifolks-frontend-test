import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GetMyFitModal } from "../components/GetMyFitModal";
import { useQuery } from "@tanstack/react-query";
import { getFrames, getAllProducts } from "../api/retailerApis";
import NamingSystemSection from "../components/NamingSystemSection";
import WhyChooseMultifolks from "../components/WhyChooseMultifolks";
import StyleBanner from "../components/StyleBanner";
import NoProductsFound from "../components/NoProductsFound";
import { CheckboxItem } from "../components/CheckboxItem";
import { FilterSection } from "../components/FilterSection";
// import { GenderFilter } from "../components/GenderFilter";
import { ShapeFilter } from "../components/ShapeFilter";

import { getColorFromSkuid } from "../utils/colorMapping";
import { getHexColorsFromNames } from "../utils/colorNameToHex";
import { GenderFilter } from "@/components/GenderFilter";

// --- MOCK DATA REMOVED ---

// --- FILTER DATA ---
const PRICES = ["£80 - 100", "£100 - 120", "£120 - 140"];
const SHOP_FOR = [
  "Eyeglasses",
  "Sunglasses",
  "Computer Glasses",
  "Reading Glasses",
  "Contact Lenses",
];
const MATERIALS = [
  "Acetate",
  "Combination",
  "Metallic",
  "Stainless Steel",
  "Thermoplastic",
  "Titanium",
];
const COLLECTIONS = ["Offline Collection", "Premium Eyeglasses"];
const COMFORT = [
  "Hinges",
  "Lightweight",
  "Universal fit",
  "Nosepad",
];
const FRAME_COLORS = [
  "Beige",
  "Black",
  "Black & Gold",
  "Black Transparent",
  "Blue",
  "Bronze",
  "Brown",
  "Burgundy",
  "Copper",
  "Cream",
  "Gold",
  "Golden",
  "Green",
  "Grey",
  "Grey Transparent",
  "Gun",
  "Gunmetal",
  "Maroon",
  "Matte",
  "Mauve",
  "Multi",
  "Orange",
  "Peach",
  "Pink",
  "Purple",
  "Red",
  "Rose Gold",
  "Royal Blue",
  "Silver",
  "Tortoise",
  "White",
  "Transparent",
  "White Transparent",
  "Wine",
].sort();


// Color mapping for visual indicators
const FRAME_COLOR_MAP: { [key: string]: string } = {
  Beige: "#F5F5DC",
  Black: "#000000",
  "Black & Gold": "linear-gradient(135deg, #000000 0%, #FFD700 100%)",
  "Black Transparent": "rgba(0, 0, 0, 0.3)",
  Blue: "#0066CC",
  Bronze: "#CD7F32",
  Brown: "#8B4513",
  Burgundy: "#800020",
  Copper: "#B87333",
  Cream: "#FFFDD0",
  Gold: "#FFD700",
  Golden: "#FFD700",
  Green: "#228B22",
  Grey: "#808080",
  "Grey Transparent": "rgba(128, 128, 128, 0.3)",
  Gun: "#4A4A4A",
  Gunmetal: "#2C3539",
  Maroon: "#800000",
  Matte: "#D3D3D3",
  Mauve: "#E0B0FF",
  Multi: "linear-gradient(90deg, #FF0000 0%, #00FF00 33%, #0000FF 66%, #FFFF00 100%)",
  Orange: "#FF8C00",
  Peach: "#FFE5B4",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Red: "#DC143C",
  "Rose Gold": "#B76E79",
  "Royal Blue": "#4169E1",
  Silver: "#C0C0C0",
  Tortoise: "#8B4513",
  White: "#FFFFFF",
  Transparent: "#FFFFFF",
  "White Transparent": "rgba(255, 255, 255, 0.3)",
  Wine: "#722F37",
};

const FILTER_OPTIONS = {
  Size: ["Large", "Medium", "Small"],
  Brand: ["Berg", "Face A Face", "Leon", "Miyama"],
  Styles: ["Full Frame", "Half Frame", "Rimless"],
    Gender: ["Men", "Women"],

  Shape: [
    "Aviator",
    "Cateye",
    "Hexagon",
    "Oval",
    "Rectangle",
    "Round",
    "Semi Square",
    "Square",
    "Wayfarer",
  ],
};

const SORT_OPTIONS = [
  "Sort By",
  "Most Popular",
  "Price Low To High",
  "Price High To Low",

];


const GENDERS = ["Men", "Women"];

// --- COMPONENTS ---


import { Loader, Loader2 } from "../components/Loader";
import { Check } from "lucide-react";

// Mobile Filter/Sort Modal Component
const MobileFilterSortModal: React.FC<{
  type: "filter" | "sort";
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: { [key: string]: string[] };
  toggleFilterOption: (category: string, option: string) => void;
  clearAllFilters: () => void;
  sortBy: string;
  setSortBy: (option: string) => void;
}> = ({
  type,
  isOpen,
  onClose,
  selectedFilters,
  toggleFilterOption,
  clearAllFilters,
  sortBy,
  setSortBy,
}) => {
    if (!isOpen) return null;

    const filterCategories = [
            { key: "Gender", title: "Gender", options: FILTER_OPTIONS.Gender },

      { key: "Prices", title: "Prices", options: PRICES },
      { key: "Shape", title: "Shape", options: FILTER_OPTIONS.Shape },
      { key: "FrameColors", title: "Frame Colors", options: FRAME_COLORS },
      { key: "Material", title: "Material", options: MATERIALS },
      { key: "Collections", title: "Collections", options: COLLECTIONS },
      { key: "Comfort", title: "Comfort", options: COMFORT },
    ];

    if (type === "sort") {
      return (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Sort By</h2>
              <button
                onClick={onClose}
                className="text-sm text-gray-900 font-medium"
              >
                Done
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex-1 overflow-y-auto p-2">
              {SORT_OPTIONS.filter((opt) => opt !== "Sort By").map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-lg mb-1 transition-colors ${sortBy === option
                    ? "bg-gray-100 text-black font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {sortBy === option && (
                      <svg
                        className="w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Filter Modal
    const [activeCategory, setActiveCategory] = useState<string>("Prices");

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 font-medium"
            >
              Clear all
            </button>
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="text-sm text-gray-900 font-medium"
            >
              Done
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Category Sidebar */}
            <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
              {filterCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full text-left flex items-center justify-between p-4 text-sm font-medium transition-colors ${activeCategory === cat.key
                    ? "bg-white text-black border-r-2 border-black"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {cat.title}
                  {selectedFilters[cat.key]?.length > 0 && (
                    <span className="ml-2 w-5 h-5 inline-flex items-center justify-center bg-white text-white text-xs rounded-full">
                      <Check color="green" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Options Panel */}
            <div className="w-2/3 overflow-y-auto p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {filterCategories.find((c) => c.key === activeCategory)?.title}
              </h3>
              <div className="space-y-3">
                {filterCategories
                  .find((c) => c.key === activeCategory)
                  ?.options.map((option) => {
                    const isSelected =
                      selectedFilters[activeCategory]?.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center justify-between py-2 cursor-pointer"
                      >
                        <span className="text-gray-700">{option}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleFilterOption(activeCategory, option)
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                              ? "bg-black border-black"
                              : "border-gray-300"
                              }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const AllProducts: React.FC = () => {
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [fitEnabled, setFitEnabled] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedGender, setSelectedGender] = useState<string>("All"); // Removed separate gender state

  const itemsPerPage = 48;
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null); // For infinite scroll
  const navigate = useNavigate();

  // Mobile Infinite Scroll State
  const [isMobile, setIsMobile] = useState(false);
  const [visibleMobileCount, setVisibleMobileCount] = useState(48);

  // Mobile Filter/Sort UI State
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [activeFilterCategory, setActiveFilterCategory] = useState<
    string | null
  >(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    Size: [],
    Brand: [],
    Styles: [],
    ShopFor: [],
    Prices: [],
    Shape: [],
    Material: [],
    Collections: [],
    Comfort: [],
    FrameColors: [],
    Gender: [],
  });

  // --- FETCH PRODUCTS (REAL-TIME FILTERING) ---
  const {
    data: productsDataResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allProducts", selectedFilters, currentPage],

    queryFn: async () => {
      // Force fetch all products for client-side pagination
      const params: any = {
        page: isMobile ? 1 : currentPage,
        limit: isMobile ? visibleMobileCount : itemsPerPage,
      };

      // Gender
      // Gender - now part of selectedFilters
      if (selectedFilters.Gender.length > 0) {
        params.gender = selectedFilters.Gender.join("|");
      }

      // Price (Parse ranges like "£80 - 100", "Under £50", "£150+")
      if (selectedFilters.Prices.length > 0) {
        let min = Infinity;
        let max = -Infinity;
        selectedFilters.Prices.forEach((range) => {
          if (range.includes("Under")) {
            // Handle "Under £80"
            const matches = range.match(/(\d+)/);
            if (matches) {
              min = 0;
              const val = parseInt(matches[0]);
              min = 0;
              max = Math.max(max, val);
            }
          } else if (range.includes("+")) {
            // Handle "£140+"
            const matches = range.match(/(\d+)/);
            if (matches) {
              const val = parseInt(matches[0]);
              min = Math.min(min, val);
            }
          } else {
            // Handle "£80 - 100"
            const matches = range.match(/(\d+)/g);
            if (matches && matches.length >= 1) {
              const v1 = parseInt(matches[0]);
              const v2 = matches.length > 1 ? parseInt(matches[1]) : v1;
              min = Math.min(min, v1);
              max = Math.max(max, v2);
            }
          }
        });

        // Only set params if we found valid numbers
        if (min !== Infinity) params.min_price = min;
        if (max !== -Infinity) params.max_price = max;
      }

      // Arrays - Join with | for regex OR logic (Backend now supports regex or split, stick to pipe for now as backend splits it)
      if (selectedFilters.Shape.length > 0) params.shape = selectedFilters.Shape.join("|");
      if (selectedFilters.FrameColors.length > 0) params.colors = selectedFilters.FrameColors.join("|");
      if (selectedFilters.Material.length > 0) params.material = selectedFilters.Material.join("|");
      if (selectedFilters.Collections.length > 0) params.collections = selectedFilters.Collections.join("|");
      if (selectedFilters.Comfort.length > 0) params.comfort = selectedFilters.Comfort.join("|");
      if (selectedFilters.Size.length > 0) params.size = selectedFilters.Size.join("|");
      if (selectedFilters.Brand.length > 0) params.brand = selectedFilters.Brand.join("|");
      if (selectedFilters.Styles.length > 0) params.style = selectedFilters.Styles.join("|");
      if (selectedFilters.ShopFor.length > 0) params.category = selectedFilters.ShopFor.join("|");

      console.log("Fetching ALL products for client pagination:", params);
      const response = await getAllProducts(params);
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Client-side Pagination Logic
  const allProducts = productsDataResponse?.products || productsDataResponse?.data || [];
  const totalProducts = allProducts.length;

  // Calculate Total Active Filters
  const totalActiveFilters = Object.values(selectedFilters).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  // Client-side sort of the FULL list (Global Sort)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setActiveFilterCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilterOption = (category: string, option: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      Size: [],
      Brand: [],
      Styles: [],
      ShopFor: [],
      Prices: [],
      Shape: [],
      Material: [],
      Collections: [],
      Comfort: [],
      FrameColors: [],
    });
    // setSelectedGender("All");
  };

  const handleFitToggle = () => {
    if (!fitEnabled) {
      setIsGetMyFitOpen(true);
      setFitEnabled(true);
    } else {
      setFitEnabled(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];
    if (sortBy === "Price Low To High") {
      result.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "Price High To Low") {
      result.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === "Newly Added") {
      result.sort((a: any, b: any) => b.id - a.id);
    } else if (sortBy === "Most Popular") {
      result.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
    }
    return result;
  }, [allProducts, sortBy]);

  // --- PAGINATION LOGIC ---
  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
    setVisibleMobileCount(48); // Reset mobile scroll on filter change
  }, [selectedFilters]); // removed sortBy to allow sorting to just re-order

  // Calculate slice indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts = isMobile
    ? filteredAndSortedProducts.slice(0, visibleMobileCount)
    : filteredAndSortedProducts;

  // Infinite Scroll Observer for Mobile
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleMobileCount((prev) => prev + 48);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isMobile, filteredAndSortedProducts.length]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative pb-20 lg:pb-0 pt-[120px]">
      {/* Back Button - Fixed in Top Left Corner */}
      {/* <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#1F1F1F] hover:text-white hover:bg-[#D96C47] border border-gray-200 rounded-full shadow-sm transition-all duration-200 group"
          aria-label="Go back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform group-hover:-translate-x-1 transition-transform duration-200"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-xs uppercase tracking-wider">Back</span>
        </button>
      </div> */}

      {/* --- Shop Our Range Banner --- */}
      <div className="w-full max-w-[1200px] mx-auto mb-0 md:mb-8 px-0 md:px-4">
        <img
          src="/men-collection-banner.png"
          alt="Shop Our Range"
          className="w-full h-auto object-cover md:object-contain scale-110 md:scale-100"
        />
      </div>


      {/* Gender Filter Tabs */}
      {/* <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-6">
        <div className="flex gap-3 justify-center">
          {["All", "Men", "Women"].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${selectedGender === gender
                ? "bg-[#232320] text-white shadow-lg"
                : "bg-[#F5F5F5] text-[#525252] hover:bg-[#EAEAEA]"
                }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div> */}

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-0 md:px-8 py-8 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar Filters - Sticky */}
        <aside className="w-full lg:w-[240px] shrink-0 pr-2 hidden lg:block sticky top-20 self-start z-10" style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-[#1F1F1F] uppercase tracking-[0.15em]" style={{ fontWeight: 800, letterSpacing: '2px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              FILTERS
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-[#D96C47] underline transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            <GenderFilter />

            <FilterSection title="Prices" isOpen={true}>
              {PRICES.map((price) => (
                <CheckboxItem
                  key={price}
                  label={price}
                  checked={selectedFilters.Prices.includes(price)}
                  onChange={() => toggleFilterOption("Prices", price)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Shape">
              <ShapeFilter
                selectedShapes={selectedFilters.Shape || []}
                onChange={(shape) => toggleFilterOption("Shape", shape)}
              />
            </FilterSection>
            <FilterSection title="Frame Colors">
              {FRAME_COLORS.map((color) => (
                <CheckboxItem
                  key={color}
                  label={color}
                  checked={selectedFilters.FrameColors.includes(color)}
                  onChange={() => toggleFilterOption("FrameColors", color)}
                  color={FRAME_COLOR_MAP[color]}
                />
              ))}
            </FilterSection>
            <FilterSection title="Material">
              {MATERIALS.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={selectedFilters.Material.includes(item)}
                  onChange={() => toggleFilterOption("Material", item)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Collections">
              {COLLECTIONS.map((collection) => (
                <CheckboxItem
                  key={collection}
                  label={collection}
                  checked={selectedFilters.Collections.includes(collection)}
                  onChange={() => toggleFilterOption("Collections", collection)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Comfort">
              {COMFORT.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={selectedFilters.Comfort.includes(item)}
                  onChange={() => toggleFilterOption("Comfort", item)}
                />
              ))}
            </FilterSection>
          </div>
        </aside>

        {/* Right Grid */}
        <div className="flex-1 relative">
          {/* Mobile Get My Fit Toggle - Right side only */}
          {/* <div className="lg:hidden flex items-center justify-end sm:mb-4 mb-0 px-2">
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="get-my-fit-mobile"
                checked={fitEnabled}
                onChange={() => {
                  if (!fitEnabled) {
                    setIsGetMyFitOpen(true);
                    setFitEnabled(true);
                  } else {
                    setFitEnabled(false);
                  }
                }}
                className="w-4 h-4 border-2 border-gray-400 rounded-sm 
                 checked:bg-[#5B9BD5] checked:border-[#5B9BD5] 
                 appearance-none cursor-pointer transition-all duration-200 
                 relative"
                style={{
                  backgroundImage: fitEnabled
                    ? 'url(\'data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16.707 5.293a1 1 0 010 1.414l-8.25 8.25a1 1 0 01-1.414 0l-4.25-4.25a1 1 0 111.414-1.414l3.543 3.543 7.543-7.543a1 1 0 011.414 0z"/></svg>\')'
                    : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />

            
            </div>
          </div> */}

          {/* Top Controls - Enhanced Filter Bar */}
          <div className="mb-8 hidden lg:block" style={{ paddingTop: '5px', zIndex: 9, background: '#ffffffff', fontFamily: 'Lynstone, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif', fontSize: '14px', color: '#333', lineHeight: '1.3', marginLeft: '-2rem', marginRight: '-2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Main Filter Bar */}
            <div className="flex flexA-wrap items-start gap-3 mb-2 pb-4 relative">
              {/* Size Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setActiveFilterCategory(
                      activeFilterCategory === "Size" ? null : "Size"
                    )
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${activeFilterCategory === "Size" ||
                    selectedFilters.Size.length > 0
                    ? "bg-[#EAEAEA] text-[#1F1F1F]"
                    : "bg-[#F5F5F5] text-[#333] hover:bg-[#EAEAEA]"
                    }`}
                >
                  Size
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${activeFilterCategory === "Size" ? "rotate-180" : ""
                      }`}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Brand Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setActiveFilterCategory(
                      activeFilterCategory === "Brand" ? null : "Brand"
                    )
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${activeFilterCategory === "Brand" ||
                    selectedFilters.Brand.length > 0
                    ? "bg-[#EAEAEA] text-[#1F1F1F]"
                    : "bg-[#F5F5F5] text-[#333] hover:bg-[#EAEAEA]"
                    }`}
                >
                  Brand
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${activeFilterCategory === "Brand" ? "rotate-180" : ""
                      }`}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Styles Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setActiveFilterCategory(
                      activeFilterCategory === "Styles" ? null : "Styles"
                    )
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${activeFilterCategory === "Styles" ||
                    selectedFilters.Styles.length > 0
                    ? "bg-[#EAEAEA] text-[#1F1F1F]"
                    : "bg-[#F5F5F5] text-[#333] hover:bg-[#EAEAEA]"
                    }`}
                >
                  Styles
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${activeFilterCategory === "Styles" ? "rotate-180" : ""
                      }`}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Shop For Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setActiveFilterCategory(
                      activeFilterCategory === "ShopFor" ? null : "ShopFor"
                    )
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${activeFilterCategory === "ShopFor" ||
                    selectedFilters.ShopFor.length > 0
                    ? "bg-[#EAEAEA] text-[#1F1F1F]"
                    : "bg-[#F5F5F5] text-[#333] hover:bg-[#EAEAEA]"
                    }`}
                >
                  Shop For
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${activeFilterCategory === "ShopFor" ? "rotate-180" : ""
                      }`}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* All Dropdowns - Positioned at parent level */}
              {activeFilterCategory === "Size" && (
                <div className="absolute top-full left-0 w-[300px] z-50 mt-0 flex flex-wrap gap-2">
                  {FILTER_OPTIONS.Size.map((size) => {
                    const isSelected = selectedFilters.Size.includes(size);
                    return (
                      <label
                        key={size}
                        className={`cursor-pointer px-4 py-2 rounded-full border text-m font-medium transition-all ${isSelected
                          ? "border-[#047857] bg-green-50 text-[#047857]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption("Size", size)}
                          className="hidden"
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
              )}

              {activeFilterCategory === "Brand" && (
                <div className="absolute top-full left-0 w-[500px] z-50 mt-0 max-h-64 overflow-y-auto flex flex-wrap gap-2">
                  {FILTER_OPTIONS.Brand.map((brand) => {
                    const isSelected = selectedFilters.Brand.includes(brand);
                    return (
                      <label
                        key={brand}
                        className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected
                          ? "border-[#047857] bg-green-50 text-[#047857]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption("Brand", brand)}
                          className="hidden"
                        />
                        {brand}
                      </label>
                    );
                  })}
                </div>
              )}

              {activeFilterCategory === "Styles" && (
                <div className="absolute top-full left-0 w-[400px] z-50 mt-0 flex flex-wrap gap-2">
                  {FILTER_OPTIONS.Styles.map((style) => {
                    const isSelected = selectedFilters.Styles.includes(style);
                    return (
                      <label
                        key={style}
                        className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected
                          ? "border-[#047857] bg-green-50 text-[#047857]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption("Styles", style)}
                          className="hidden"
                        />
                        {style}
                      </label>
                    );
                  })}
                </div>
              )}

              {activeFilterCategory === "ShopFor" && (
                <div className="absolute top-full left-0 w-[500px] z-50 mt-0 flex flex-wrap gap-2">
                  {SHOP_FOR.map((category) => {
                    const isSelected = selectedFilters.ShopFor.includes(category);
                    return (
                      <label
                        key={category}
                        className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected
                          ? "border-[#047857] bg-green-50 text-[#047857]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption("ShopFor", category)}
                          className="hidden"
                        />
                        {category}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Right Side Controls */}
              <div className="ml-auto flex items-center gap-6">
                {/* Get My Fit Toggle */}
                {/* <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#333] uppercase tracking-wider">
                    GET MY FIT
                  </span>
                  <div
                    onClick={handleFitToggle}
                    className={`w-16 h-8 rounded-full p-1 transition-all duration-300 flex items-center cursor-pointer ${fitEnabled
                      ? "bg-[#5B9BD5] justify-end"
                      : "bg-gray-300 justify-start"
                      }`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div> */}

                {/* Sort By */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#333] hover:text-[#1F1F1F] transition-colors bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full border border-gray-200"
                  >
                    <span>Sort By</span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 shadow-lg z-50">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option
                            ? "bg-[#1976D2] text-white"
                            : "text-[#333] hover:bg-[#1976D2] hover:text-white"
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Clear All Filters Button */}
            {/* {(selectedFilters.Size.length > 0 ||
              selectedFilters.Brand.length > 0 ||
              selectedFilters.Styles.length > 0 ||
              selectedFilters.ShopFor.length > 0 ||
              selectedFilters.Prices.length > 0 ||
              selectedFilters.Shape.length > 0 ||
              selectedFilters.Material.length > 0 ||
              selectedFilters.Collections.length > 0 ||
              selectedFilters.Comfort.length > 0 ||
              selectedFilters.FrameColors.length > 0) && (
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setSelectedFilters({
                        Size: [],
                        Brand: [],
                        Styles: [],
                        ShopFor: [],
                        Prices: [],
                        Shape: [],
                        Material: [],
                        Collections: [],
                        Comfort: [],
                        FrameColors: [],
                      })
                    }
                    className="px-6 py-2 text-sm font-semibold rounded-full bg-[#232320] text-white hover:bg-black transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )} */}
          </div>

          {/* Product Grid - Multifolks Style - Fixed Spacing */}
          <div className="grid grid-cols-2 lg:grid-cols-3 pt-16 sm:pt-4">
            {paginatedProducts
              .map((product: any) => (
                <div
                  key={product.id}
                  onClick={() =>
                    navigate(`/product/${product.skuid || product.id}`, {
                      state: { product },
                    })
                  }
                  className="cursor-pointer group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative p-1.5 bg-[#F7F7F7]">

                    {/* Image Container */}
                    <div className="p-0 bg-[#F7F7F7] flex relative aspect-[1.4] rounded mb-1 mt-4 overflow-hidden ">
                      {/* Color Dots - Top Left Corner - TEST with M.I001.SQ.I.6.A */}
                      {product.naming_system === "M.I001.SQ.I.6.A" && (
                        <div className="absolute top-2 left-2 z-10 flex gap-1.5 items-center bg-red-500 p-1">
                          <span className="w-4 h-4 rounded-full bg-black border-2 border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-brown-500 border-2 border-white"></span>
                        </div>
                      )}

                      {/* Color Dots - Use variants array from API */}
                      {(() => {
                        // Get colors from variants if available, otherwise use color_names
                        let colorDots: string[] = [];

                        if (product.variants && product.variants.length > 0) {
                          // Extract color_names from each variant
                          colorDots = product.variants
                            .map((v: any) => v.color_names?.[0])
                            .filter((c: string) => c); // Remove undefined/null
                        } else if (product.color_names && product.color_names.length > 0) {
                          colorDots = product.color_names;
                        }

                        if (colorDots.length === 0) return null;

                        return (
                          <div className="absolute top-1 left-1 md:top-2 md:left-2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-sm px-1 py-0.5 md:px-1.5 md:py-1 rounded-full">
                            {colorDots.map((colorName: string, i: number) => {
                              const colorHex = getHexColorsFromNames([colorName])[0] || colorName;
                              return (
                                <span
                                  key={i}
                                  style={{ backgroundColor: colorHex }}
                                  className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full border border-white shadow-sm"
                                  title={colorName}
                                ></span>
                              )
                            })}
                          </div>
                        );
                      })()}

                      {/* Default image - Base image (images[0]) */}
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
                      />
                      {/* Hover image - Shows images[1] */}
                      <img
                        src={product.images?.[1] || product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* Price - Larger */}
                    {/* Price and Naming System */}
                    <div className="flex justify-between items-end mt-2 px-2">
                      <span className="text-xs md:text-lg font-bold text-[#1F1F1F] uppercase tracking-wider">
                        {product.naming_system}
                      </span>
                      <span className="text-xs md:text-base font-bold text-[#1F1F1F]">
                        £{product.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {isLoading ? (
              <div className="col-span-full h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              paginatedProducts.length === 0 && <NoProductsFound />
            )}

          </div>

          {/* Infinite Scroll Trigger (Mobile Only) */}
          {isMobile && visibleMobileCount < filteredAndSortedProducts.length && (
            <div
              ref={observerTarget}
              className="h-20 flex items-center justify-center mt-8"
            >
              <Loader2 />
            </div>
          )}

          {/* ===== DESKTOP: Pagination Section ===== */}
          <div className="hidden lg:block">
            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                {/* Page Indicator */}
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <span className="text-gray-400">|</span>

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-teal-700 hover:text-teal-800"
                    }`}
                >
                  Prev
                </button>

                {(() => {
                  const maxVisiblePages = 7;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  const pages = [];
                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push("...");
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push("...");
                    }
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => (
                    <React.Fragment key={index}>
                      {typeof page === "number" ? (
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                            ? "bg-teal-700 text-white rounded-full"
                            : "text-gray-700 hover:text-teal-700"
                            }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span className="text-gray-400 px-1">...</span>
                      )}
                    </React.Fragment>
                  ));
                })()}

                {/* Next Button */}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-teal-700 hover:text-teal-800"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
            {/* Showing count */}
            <div className="text-center text-sm text-gray-500 my-8 lg:my-16">
              Showing {isMobile ? visibleMobileCount : (currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                isMobile ? visibleMobileCount : currentPage * itemsPerPage,
                totalProducts
              )}{" "}
              of {totalProducts} products
            </div>
          </div>
        </div>
      </div>



      {/* --- Bottom Sections --- */}
      <NamingSystemSection />

      {/* Mobile Bottom Filter/Sort Bar - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black text-white z-50 shadow-2xl">
        <div className="flex items-center justify-around">
          {/* Filter Button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium">Filter</span>
            {totalActiveFilters > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-xs rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20"></div>


          {/* Sort Button */}
          <button
            onClick={() => setShowMobileSort(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
            <span className="font-medium">Sort</span>
          </button>
        </div>
      </div>
      {/* <WhyChooseMultifolks /> */}
      {/* <StyleBanner /> */}

      {/* Mobile Filter/Sort Modals */}
      <MobileFilterSortModal
        type="filter"
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        selectedFilters={selectedFilters}
        toggleFilterOption={toggleFilterOption}
        clearAllFilters={clearAllFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <MobileFilterSortModal
        type="sort"
        isOpen={showMobileSort}
        onClose={() => setShowMobileSort(false)}
        selectedFilters={selectedFilters}
        toggleFilterOption={toggleFilterOption}
        clearAllFilters={clearAllFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <GetMyFitModal
        open={isGetMyFitOpen}
        onClose={() => setIsGetMyFitOpen(false)}
      />
    </div>
  );
};

export default AllProducts;
