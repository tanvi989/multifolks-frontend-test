import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import ProductDetailsFooter from "../components/ProductDetailsFooter";
import { setCartLensOverride } from "../utils/priceUtils";


const SelectLensPackages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();
  const [showLensGuide, setShowLensGuide] = useState(false);

  const product = state?.product || {
    name: "Unknown",
    price: "0",
    image: "",
    colors: [],
  };

  const getPrescriptionTypeLabel = () => {
    const tier = state?.prescriptionTier;
    if (tier === "advanced") return "Premium Progressive";
    if (tier === "standard") return "Standard Progressive";
    return "Bifocal/Progressive";
  };

  const lensCategory = state?.lensCategory || "blue";

  const BLUE_PROTECT_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 Blue Protect High Index",
      price: "+£79",
      features: [
        "30% thinner than 1.50 Standard lenses",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 Blue Protect High Index",
      price: "+£119",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const BIFOCAL_BLUE_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
      price: "+£29",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 Blue Protect High Index",
      price: "+£49",
      features: [
        "30% thinner than 1.50 Standard lenses",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 Blue Protect High Index",
      price: "+£79",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const PHOTOCHROMIC_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Photochromic High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 Photochromic High Index",
      price: "+£79",
      features: [
        "30% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 Photochromic High Index",
      price: "+£99",
      features: [
        "40% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const CLEAR_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£39",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 High Index",
      price: "+£59",
      features: [
        "30% thinner than 1.50 Standard lenses",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 High Index",
      price: "+£89",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const BIFOCAL_CLEAR_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£0",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 High Index",
      price: "+£29",
      features: [
        "30% thinner than 1.50 Standard lenses",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 High Index",
      price: "+£69",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const SUNGLASSES_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
  ];

  // Select packages based on category
  const packages =
    lensCategory === "blue"
      ? state?.lensType === "bifocal"
        ? BIFOCAL_BLUE_PACKAGES
        : BLUE_PROTECT_PACKAGES
      : lensCategory === "photo"
        ? PHOTOCHROMIC_PACKAGES
        : lensCategory === "sun"
          ? SUNGLASSES_PACKAGES
          : state?.lensType === "bifocal"
            ? BIFOCAL_CLEAR_PACKAGES
            : CLEAR_PACKAGES;

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackage(pkgId);

    // Find the package to get its price
    const selectedPkg = packages.find(p => p.id === pkgId);
    let priceValue = 0;
    if (selectedPkg) {
      // Parse "£49" or "+£49" to number 49
      priceValue = parseFloat(selectedPkg.price.replace(/[^0-9.]/g, "")) || 0;
    }

    // For sunglasses, go to lens color selection
    // For other lens types, go to coatings
    const path = lensCategory === "sun"
      ? `/product/${id}/select-lens-color`
      : `/product/${id}/select-lens-coatings`;

    navigate(path, {
      state: {
        ...state,
        selectedLensPackage: pkgId,
        selectedLensPrice: priceValue, // Pass the exact price value
      },
    });

    try {
      sessionStorage.setItem(
        "pending_lens_selection_v1",
        JSON.stringify({
          lensPackage: pkgId,
          lensPackagePrice: priceValue,
          lensCategory: state?.lensCategory,
          updatedAt: Date.now(),
        })
      );
    } catch { }
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pt-0 md:pt-4 px-4 md:px-8">
      <div className="hidden md:block">
        <CheckoutStepper
        currentStep={4}
        selections={{
          2: "Bifocal/Progressive Eyeglasses",
          3: "Prescription Details",
        }}
      />

      </div>

      <div className="max-w-[1000px] mx-auto mt-0 md:mt-2">
        {/* Header */}
        <div className="text-center mb-2 pb-3 md:pb-0 border-b md:border-b-0 border-gray-200 relative">
          {/* <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button> */}

          <div className="md:hidden">
            <div className="flex items-center justify-between py-2 ">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-md font-normal uppercase text-black transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                LENS TYPE | {lensCategory}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex items-center pb-4 border-b border-black mb-6">
              <span className="text-xl font-normal text-[#1F1F1F] uppercase tracking-widest whitespace-nowrap">
                SELECT YOUR LENS INDEX
              </span>
              <button
                onClick={() => setShowLensGuide(true)}
                className="text-[#E94D37] hover:text-[#D43F2A] transition-colors ml-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>


          <p className="hidden md:flex text-[18px] md:text-[24px] font-medium text-[#1F1F1F] uppercase tracking-widest flex items-center justify-center gap-2">
            SELECT A LENS TYPE
            <button
              onClick={() => setShowLensGuide(true)}
              className="text-[#E94D37] text-lg cursor-pointer hover:text-[#d43f2a] transition-colors"
              title="Help"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 md:[&>*:last-child]:col-span-2 md:[&>*:last-child]:max-w-[420px] md:[&>*:last-child]:mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg.id)}
              className={`rounded-[24px] p-5 md:p-6 cursor-pointer transition-all duration-300 border-2 group flex flex-col gap-3 w-full ${selectedPackage === pkg.id
                ? "bg-white border-[#025048] shadow-md"
                : "bg-[#F3F0E7] border-gray-200  hover:border-[#025048] hover:shadow-md"
                }`}
            >
              {/* Recommended Badge */}
              {pkg.recommended && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wide bg-[#025048] px-3 py-1 rounded-full">
                    Recommended for your prescription
                  </span>
                </div>
              )}

              {/* Title and Price */}
              <div className="flex items-start justify-between pr-6">
                <h3 className="text-lg md:text-xl font-bold text-[#1F1F1F] font-serif">
                  {pkg.title}
                </h3>
                <span className="text-2xl font-bold text-[#025048] whitespace-nowrap">
                  {pkg.price}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 flex-1">
                {pkg.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13px] md:text-sm text-[#525252] font-medium"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 bg-[#025048] rounded-full shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Product Details Footer - Mobile Only */}
        <div className="mx-auto md:hidden">
          <ProductDetailsFooter
            product={product}
            selectedColor={product.colors ? product.colors[0] : undefined}
            prescriptionData={{
              prescriptionType: getPrescriptionTypeLabel(),
              pd: state?.prescriptionData?.pdOD
                ? `${state.prescriptionData.pdOD}/${state.prescriptionData.pdOS}`
                : state?.prescriptionData?.totalPD,
              birthYear: state?.prescriptionData?.birthYear,
              od: {
                sph: state?.prescriptionData?.sphOD,
                cyl: state?.prescriptionData?.cylOD,
                axis: state?.prescriptionData?.axisOD,
              },
              os: {
                sph: state?.prescriptionData?.sphOS,
                cyl: state?.prescriptionData?.cylOS,
                axis: state?.prescriptionData?.axisOS,
              },
              addPower: state?.prescriptionData?.addOD,
            }}
          />
        </div>
      </div>

      {/* Lens Index Guide Modal */}
      {showLensGuide && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLensGuide(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLensGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">
              How to Choose a Lens Index
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg width="100" height="120" viewBox="0 0 100 120">
                    <path d="M 20 20 Q 50 10 80 20 L 80 100 Q 50 110 20 100 Z" fill="#0066CC" opacity="0.8" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">1.50/1.56</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Normal Thickness</li>
                  <li>• For Low Powers Only.</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg width="100" height="120" viewBox="0 0 100 120">
                    <path d="M 25 20 Q 50 12 75 20 L 75 100 Q 50 108 25 100 Z" fill="#0066CC" opacity="0.8" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">1.59/1.61</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 20% Thinner Than 1.50/1.56</li>
                  <li>• For Powers Up to -4/+4</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg width="100" height="120" viewBox="0 0 100 120">
                    <path d="M 30 20 Q 50 14 70 20 L 70 100 Q 50 106 30 100 Z" fill="#0066CC" opacity="0.8" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">1.67</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 30% Thinner Than 1.50/1.56</li>
                  <li>• For Powers Up to -8/+8</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg width="100" height="120" viewBox="0 0 100 120">
                    <path d="M 35 20 Q 50 16 65 20 L 65 100 Q 50 104 35 100 Z" fill="#0066CC" opacity="0.8" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">1.74</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 40% Thinner Than 1.50/1.56</li>
                  <li>• For All Powers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectLensPackages;
