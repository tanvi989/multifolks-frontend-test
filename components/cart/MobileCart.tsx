import React, { useState, useEffect } from "react";
import { CartItem } from "../../types";
import {
    formatFrameSize,
    getLensTypeDisplay,
    getLensIndex,
    getLensCoating
} from "../../utils/priceUtils";
import WhyMutlifolks from "../WhyMutlifolks";
import CouponTermsDialog from "../product/CouponTermsDialog";
import { Footer } from "../Footer";
import ManualPrescriptionModal from "../ManualPrescriptionModal";

interface MobileCartProps {
    cartItems: CartItem[];
    cartData: any;
    frontendSubtotal: number;
    discountAmount: number;
    shippingCost: number;
    frontendTotalPayable: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    handleApplyCoupon: () => void;
    handleRemoveCoupon: () => void;
    handleShippingChange: (method: string) => void;
    shippingMethod: string;
    deliveryAddress: string;
    setDeliveryAddress: (addr: string) => void;
    terms: boolean;
    setTerms: (open: boolean) => void;
    handleDeleteItem: (cartId: number) => void;
    handleQuantityChange: (cartId: number, currentQuantity: number, change: number) => void;
    isQuantityUpdating: boolean;
    navigate: (path: string, state?: any) => void;
    authData: { isAuthenticated: boolean; firstName: string };
    setShowLoginModal: (show: boolean) => void;
    userPrescriptions?: any[];
}

const MobileCart: React.FC<MobileCartProps> = ({
    cartItems,
    cartData,
    frontendSubtotal,
    discountAmount,
    shippingCost,
    frontendTotalPayable,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleShippingChange,
    shippingMethod,
    deliveryAddress,
    setDeliveryAddress,
    terms,
    setTerms,
    handleDeleteItem,
    handleQuantityChange,
    isQuantityUpdating,
    navigate,
    authData,
    setShowLoginModal,
    userPrescriptions = [],
}) => {
    const [shippingOpen, setShippingOpen] = useState(false);
    const [addressOpen, setAddressOpen] = useState(false);
    const [cartItemsOpen, setCartItemsOpen] = useState(false);
    const [priceDetailsOpen, setPriceDetailsOpen] = useState(false);
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [prescriptionRefresh, setPrescriptionRefresh] = useState(0);

    // Check if returning from prescription page
    useEffect(() => {
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            sessionStorage.removeItem("fromPrescription");
            setPrescriptionRefresh(prev => prev + 1);
        }
    }, []);

    // Helper function to get prescription from user's prescriptions array (database)
    const getPrescriptionByCartId = (cartId: number, cartItem?: CartItem): any | null => {
        try {
            // Search user's prescriptions array from database
            if (userPrescriptions && userPrescriptions.length > 0) {
                let prescription = userPrescriptions.find((p: any) =>
                    p.associatedProduct?.cartId && String(p.associatedProduct.cartId) === String(cartId)
                );

                if (prescription) {
                    console.log('✅ Found prescription in user database (Mobile):', prescription);
                    return prescription;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching prescription from user database:", error);
            return null;
        }
    };

    return (
        <div className="md:hidden max-w-[1366px] mx-auto px-4 md:px-21 bg-white">
            {/* Satisfaction Banner - Mobile Only */}
            <div className="flex items-start gap-4 py-6 px-2 w-full">
                {/* <img
                    src="/Satisfaction_Icon.svg"
                    alt="satisfaction guarantee"
                    className="h-[85px] w-auto flex-shrink-0 object-contain"
                />
                <p className="text-[13px] leading-relaxed text-[#1F1F1F] font-medium">
                    Just in case you don't like your MultiFolks glasses we offer full refund, No question asked!
                    <br />
                    <span className="underline underline-offset-2 cursor-pointer">See our Policy</span>
                </p> */}
                <div className="bg-green-100 text-[#2E7D32] px-4 py-3 rounded-md font-bold text-sm mb-6 border">
                    Satisfaction Guaranteed - Hassle Free 30 Days Refunds.
                </div>
            </div>


            {/* Payment Method Selection */}
            <div className="mb-6">
                <h2 className="text-[15px] font-bold text-[#1F1F1F] mb-4">
                    Select Your Preferred Method Of Payment:
                </h2>
                <div className="flex items-center gap-4">
                    {/* Split Logo */}
                    <div className="flex items-center justify-center w-[80px] h-[80px]">
                        <img src="/stripe-logo.png" alt="logo" className="h-auto w-full " />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Secure Checkout Box */}
            <div className="bg-[#FBFCFD] border border-gray-100 rounded-xl p-5 mb-6 shadow-sm flex items-start gap-4">
                <div className="bg-[#10B981] rounded-full p-2 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div>
                    <h3 className="text-[#1F1F1F] font-bold text-[15px] mb-0.5">Secure Checkout</h3>
                    <p className="text-[#757575] text-[13px] font-medium leading-snug">
                        Your payment information is fully protected.
                    </p>
                </div>
            </div>

            {/* Your Cart Accordion */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-8">
                <button
                    onClick={() => setCartItemsOpen(!cartItemsOpen)}
                    className="w-full flex items-center justify-between px-6 py-5"
                >
                    <span className="text-[16px] font-bold text-[#1F1F1F]">
                        Your Cart ({cartItems.length} items)
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${cartItemsOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {cartItemsOpen && (
                    <div className="px-4 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                        {cartItems.map((item) => (
                            <div key={item.cart_id} className="relative border-t border-gray-100 pt-8 pb-4 first:border-0 first:pt-0">
                                {/* Remove Link */}
                                <button
                                    onClick={() => handleDeleteItem(item.cart_id)}
                                    className="absolute top-2 right-0 text-[#E53935] text-[11px] font-semibold hover:text-red-700 transition-colors z-10"
                                >
                                    Remove
                                </button>

                                {/* Mobile Item Layout */}
                                <div className="grid grid-cols-[100px_1fr] gap-4">
                                    {/* Image Column */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div
                                            className="w-full aspect-[4/3] flex items-center justify-center mb-2 bg-[#F9FAFB] rounded-lg cursor-pointer overflow-hidden"
                                            onClick={() => {
                                                const productId = item.product?.products?.skuid;
                                                if (productId) {
                                                    navigate(`/product/${productId}`, {
                                                        state: { product: item.product?.products },
                                                    });
                                                }
                                            }}
                                        >
                                            <img
                                                src={
                                                    item.product?.products?.image ||
                                                    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=300"
                                                }
                                                alt={item.product?.products?.name}
                                                className="w-[90%] h-auto object-contain mix-blend-multiply"
                                            />
                                        </div>

                                        <h3 className="font-bold text-[#1F1F1F] text-[10px] uppercase text-center tracking-tight leading-tight">
                                            {item.product?.products?.naming_system || item.product?.products?.brand || "BERG"}
                                        </h3>

                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                                style={{
                                                    backgroundColor: item.product?.products?.framecolor?.toLowerCase() || "#F5F5F5",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details Column */}
                                    <div className="flex flex-col pr-14">
                                        <div className="text-[12px] text-[#1F1F1F] space-y-1.5">
                                            {item.prescription?.patient_name && (
                                                <p className="flex justify-between gap-2">
                                                    <span className="font-bold">Prescription For: </span>
                                                    <span className="text-[#525252] text-right">{item.prescription.patient_name}</span>
                                                </p>
                                            )}
                                            <p className="flex justify-between gap-2">
                                                <span className="font-bold">Frame Price: </span>
                                                <span className="text-[#525252]">£{Number(item.product?.products?.list_price).toFixed(2)}</span>
                                            </p>
                                            <p className="flex justify-between gap-2">
                                                <span className="font-bold">Frame Size: </span>
                                                <span className="text-[#525252]">
                                                    {formatFrameSize(item.product?.products?.size)}
                                                </span>
                                            </p>
                                            <p className="flex justify-between gap-2">
                                                <span className="font-bold">Lens Type: </span>
                                                <span className="text-[#525252] text-right">{getLensTypeDisplay(item)}</span>
                                            </p>
                                            <p className="flex justify-between gap-2">
                                                <span className="font-bold">Lens Index: </span>
                                                <span className="text-[#525252]">
                                                    {getLensIndex(item).index}
                                                </span>
                                            </p>
                                            <p className="flex justify-between gap-2">
                                                <span className="font-bold">Lens Coating: </span>
                                                <span className="text-[#525252] text-right">
                                                    {getLensCoating(item).name}
                                                </span>
                                            </p>

                                            {/* Show Prescription Button */}
                                            <button
                                                onClick={() => {
                                                    const prescription = getPrescriptionByCartId(item.cart_id, item);
                                                    if (prescription) {
                                                        setViewPrescription(prescription);
                                                    } else {
                                                        // Redirect to manual prescription page with cart_id
                                                        navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                                    }
                                                }}
                                                className="bg-[#E94D37] hover:bg-[#bf3e2b] text-white font-bold text-[11px] px-3 py-1.5 rounded-md transition-colors"
                                            >
                                                {(() => {
                                                    // Force re-evaluation when prescriptionRefresh changes
                                                    const _ = prescriptionRefresh;
                                                    return getPrescriptionByCartId(item.cart_id, item) ? 'Show Prescription' : 'Add Prescription';
                                                })()}
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-[#F9FAFB] px-2.5 py-1.5 rounded-md border border-gray-100">
                                                <button
                                                    disabled={isQuantityUpdating}
                                                    onClick={() => handleQuantityChange(item.cart_id, item.quantity || 1, -1)}
                                                    className="w-6 h-6 flex items-center justify-center text-[#757575] font-bold text-base"
                                                >
                                                    -
                                                </button>
                                                <span className="min-w-[16px] text-center font-bold text-sm">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    disabled={isQuantityUpdating}
                                                    onClick={() => handleQuantityChange(item.cart_id, item.quantity || 1, 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-[#757575] font-bold text-base"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[#1F1F1F] font-bold text-[16px]">
                                                    £
                                                    {(
                                                        (Number(item.product?.products?.list_price || 0) +
                                                            Number(item.lens?.selling_price || 0) +
                                                            Number(getLensCoating(item).price || 0)) *
                                                        (item.quantity || 1)
                                                    ).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Summary & Offers */}
            <div className="w-full shrink-0 flex flex-col gap-6 min-w-0">
                {/* Apply Coupon Section */}
                <div className="bg-white p-4 rounded border border-gray-200">
                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">Apply Coupon</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={cartData?.coupon?.code || couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={!!cartData?.coupon}
                            placeholder="Enter code"
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#025048] disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode || !!cartData?.coupon}
                            className="bg-[#025048] text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                        >
                            Apply
                        </button>
                    </div>

                    {!cartData?.coupon && (
                        <div
                            className="
                  flex items-center justify-between
                  w-full
                  rounded-lg
                  border border-dashed border-[#025048]
                  bg-[#EAF6F4]
                  px-4 py-3
                  mt-4
                  text-sm
                  font-medium
                  text-[#025048]
                  hover:bg-[#DFF1EE]
                  transition
                "
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Available Code:</span>
                                    <button className="bg-white border border-[#025048] px-2 py-0.5 rounded text-[10px] font-bold">
                                        <span>LAUNCH50</span>
                                    </button>
                                </div>
                                <span
                                    onClick={() => setTerms(true)}
                                    className="text-[#025048] underline text-xs cursor-pointer"
                                >
                                    View Details
                                </span>
                            </div>

                            <button
                                onClick={() => setTerms(true)}
                                className="
                    bg-[#025048]
                    text-white
                    px-3 py-2
                    rounded-md
                    text-xs
                    font-bold
                    hover:bg-[#013b35]
                    transition-colors
                  "
                            >
                                <span>Apply</span>
                            </button>
                        </div>
                    )}

                    <CouponTermsDialog
                        open={terms}
                        onClose={() => setTerms(false)}
                        couponCode="LAUNCH50"
                        onAgree={() => {
                            setCouponCode("LAUNCH50");
                            handleApplyCoupon();
                            setTerms(false);
                        }}
                    />

                    {cartData?.coupon && (
                        <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded border border-green-100">
                            <span className="text-green-700 text-sm font-medium">
                                Code <b>{cartData.coupon.code}</b> applied!
                            </span>
                            <button
                                onClick={handleRemoveCoupon}
                                className="text-red-500 text-xs font-bold hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Shipping Method */}
                <div className="bg-white p-4 rounded border border-gray-200 w-full min-w-0 overflow-hidden">
                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">Shipping Method</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setShippingOpen(!shippingOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white text-[#1F1F1F] font-bold text-sm"
                        >
                            <span>Select Shipping Speed</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${shippingOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {shippingOpen && (
                            <div className="border-t border-gray-100 p-2 space-y-1 bg-white">
                                {[
                                    {
                                        id: "standard",
                                        label: "Standard Shipping",
                                        time: "8-12 working days",
                                        price: cartData?.subtotal > 75 ? "Free" : "£6",
                                    },
                                    {
                                        id: "express",
                                        label: "Express Shipping",
                                        time: "4-6 working days",
                                        price: "£29",
                                    },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                            <input
                                                type="radio"
                                                name="shipping_mobile_comp"
                                                checked={shippingMethod === method.id}
                                                onChange={() => {
                                                    handleShippingChange(method.id);
                                                    setShippingOpen(false);
                                                }}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-5 h-5 rounded-full border ${shippingMethod === method.id ? "border-[#E53935]" : "border-gray-300"
                                                    } bg-white transition-colors`}
                                            />
                                            {shippingMethod === method.id && (
                                                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <div className="font-bold text-[#1F1F1F]">
                                                {method.label} - {method.time} - {method.price}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* Price Summary - Mobile Version */}
                <div className="bg-white p-4 rounded border border-gray-200">
                    <button
                        onClick={() => setPriceDetailsOpen(!priceDetailsOpen)}
                        className="w-full flex items-center justify-between text-lg font-bold text-[#1F1F1F]"
                    >
                        <span>Price Details</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${priceDetailsOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {priceDetailsOpen && (
                        <div className="space-y-3 text-sm mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between font-bold text-[#1F1F1F]">
                                <span>Price</span>
                                <span>£{frontendSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-[#1F1F1F]">
                                <span>Subtotal</span>
                                <span>£{frontendSubtotal.toFixed(0)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between font-bold text-green-600">
                                    <span>Discount ({cartData.coupon?.code})</span>
                                    <span>-£{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-[#1F1F1F]">
                                <span>Shipping</span>
                                <span>£{Number(shippingCost).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-[#1F1F1F]">
                                <span>Total Payables</span>
                                <span>£{frontendTotalPayable.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 w-full min-w-0">
                    <label className="block text-sm font-bold text-[#1F1F1F] mb-4">Delivery Address</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setAddressOpen(!addressOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white text-[#1F1F1F] font-bold text-sm"
                        >
                            <span>Select Delivery Address</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${addressOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {addressOpen && (
                            <div className="border-t border-gray-100 p-2 space-y-1 bg-white">
                                {[
                                    {
                                        id: "addr1",
                                        label: "Home — John Doe",
                                        address: "221B Baker Street, Marylebone, London NW1 6XE",
                                    },
                                ].map((addr) => (
                                    <label
                                        key={addr.id}
                                        className="flex flex-col gap-2 p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                                <input
                                                    type="radio"
                                                    name="address_mobile_comp"
                                                    checked={deliveryAddress === addr.id}
                                                    onChange={() => {
                                                        setDeliveryAddress(addr.id);
                                                        setAddressOpen(false);
                                                    }}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-5 h-5 rounded-full border ${deliveryAddress === addr.id ? "border-[#E53935]" : "border-gray-300"
                                                        } bg-white transition-colors`}
                                                />
                                                {deliveryAddress === addr.id && (
                                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                                                )}
                                            </div>
                                            <div className="text-sm font-bold text-[#1F1F1F]">{addr.label}</div>
                                        </div>
                                        <div className="pl-8 text-xs text-gray-500 leading-tight">{addr.address}</div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="flex justify-center items-center p-6">
                <p className=" text-xl text-black font-bold ">Prices includes applicable VAT</p>
            </div>



            {/* Trust & Policy Section */}
            <div className="bg-[#F8F9FA] py-8 mb-6">
                <div className="flex flex-col gap-6 px-4">
                    <div className="w-full flex justify-center">
                        <img
                            src="/fda.png"
                            alt="FDA Approved"
                            className="w-full max-w-[280px] h-auto object-contain"
                        />
                    </div>

                    <div className="flex justify-center items-center gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#8C8C8C] rounded-full"></span>
                            <p className="text-[#58718A] text-[13px] font-medium tracking-tight">Secure Payment</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#8C8C8C] rounded-full"></span>
                            <p className="text-[#58718A] text-[13px] font-medium tracking-tight">30 Days Easy Refund</p>
                        </div>
                    </div>
                    <div className="w-full flex justify-center">
                        <img
                            src="/sda.png"
                            alt="Payment Methods"
                            className="w-full max-w-[320px] h-auto object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex flex-col px-4 py-3 gap-3">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-bold text-black">Total:</p>
                        <p className="text-lg font-bold text-[#1F1F1F]">£{frontendTotalPayable.toFixed(0)}</p>
                    </div>

                    <button
                        onClick={() => {
                            if (localStorage.getItem("token")) {
                                navigate("/payment");
                            } else {
                                sessionStorage.setItem("returnTo", "/cart");
                                setShowLoginModal(true);
                            }
                        }}
                        className="w-full bg-[#1F1F1F] text-white py-3 rounded font-bold text-sm hover:bg-black transition-colors"
                    >
                        Checkout
                    </button>
                    <div className="flex justify-center">
                        <p className=" text-xl text-black mt-2">Prices includes applicable VAT</p>
                    </div>
                </div>
            </div>

            {/* Manual Prescription Modal */}
            <ManualPrescriptionModal
                open={!!viewPrescription}
                onClose={() => setViewPrescription(null)}
                prescription={viewPrescription}
            />
        </div >
    );
};

export default MobileCart;
