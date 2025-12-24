import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCart,
    deleteProductFromCart,
    updateCartQuantity,
    applyCoupon,
    removeCoupon,
    updateShippingMethod,
    getMyPrescriptions,
    updateMyPrescriptionCartId
} from "../../api/retailerApis";
import { CartItem } from "../../types";
import Loader from "../Loader";
import DeleteDialog from "../DeleteDialog";
import { LoginModal } from "../LoginModal";
import SignUpModal from "../SignUpModal";
import ManualPrescriptionModal from "../ManualPrescriptionModal";
import { getLensCoating, getTintInfo, calculateCartSubtotal, calculateItemTotal, getLensPackagePrice, getCartLensOverride, getLensTypeDisplay, getLensIndex } from "../../utils/priceUtils";

const DesktopCart: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [shippingMethod, setShippingMethod] = useState<string>("standard");
    const [isMounting, setIsMounting] = useState(true);

    // Prescription Modal State
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [prescriptionRefresh, setPrescriptionRefresh] = useState(0);

    // Auth State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState("");

    // Handle initial mount - show loader immediately
    useEffect(() => {
        // Small delay to ensure smooth transition
        const timer = setTimeout(() => {
            setIsMounting(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Check if returning from prescription page
    useEffect(() => {
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            sessionStorage.removeItem("fromPrescription");
            // Force re-render to check localStorage for new prescriptions
            setPrescriptionRefresh(prev => prev + 1);
        }
    }, []);

    // Reactive Auth State
    const [authData, setAuthData] = useState({
        isAuthenticated: !!localStorage.getItem("token"),
        firstName: localStorage.getItem("firstName") || "User",
    });

    // Check Auth on Mount & Listen for Updates
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const name = localStorage.getItem("firstName");
            setAuthData({
                isAuthenticated: !!token,
                firstName: name || "User",
            });

            // If user logs in elsewhere (or via modal), close modals and refresh cart
            if (token) {
                setShowLoginModal(false);
                setShowSignUpModal(false);
                // Ensure cart data is synced with the logged-in user's account
                queryClient.invalidateQueries({ queryKey: ["cart"] });
            }
        };

        // Initial check
        checkAuth();

        // Listen for custom auth event
        window.addEventListener("auth-change", checkAuth);
        // Also listen for storage events in case of multi-tab changes
        window.addEventListener("storage", checkAuth);

        // Listen for cart-updated event (triggered after cart merge)
        const handleCartUpdate = () => {
            console.log('🔄 Cart update event received, refreshing cart...');
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        };
        window.addEventListener("cart-updated", handleCartUpdate);

        return () => {
            window.removeEventListener("auth-change", checkAuth);
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("cart-updated", handleCartUpdate);
        };
    }, [queryClient]);

    const switchToSignUp = (email: string) => {
        setSignUpEmail(email);
        setShowLoginModal(false);
        setShowSignUpModal(true);
    };

    const switchToLogin = (email?: string) => {
        setShowSignUpModal(false);
        setShowLoginModal(true);
    };

    // Fetch user prescriptions from database
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    // Fetch User Prescriptions
    const { data: prescriptionsResponse } = useQuery({
        queryKey: ["prescriptions"],
        queryFn: () => getMyPrescriptions(),
        enabled: authData.isAuthenticated,
    });


    const userPrescriptions = prescriptionsResponse?.data?.data || [];

    console.log("User Prescriptions:", userPrescriptions);

    // Fetch Cart Data
    const {
        data: cartResponse,
        isLoading,
        refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            try {
                console.log("🛒 Fetching cart data...");
                const response: any = await getCart({});
                console.log("🛒 Raw cart response:", response);
                console.log("🛒 Response data:", response?.data);
                return response?.data || {};
            } catch (error: any) {
                console.error("❌ Failed to fetch cart", error);
                return { error: error.message || "Unknown error" };
            }
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    console.log("🛒 Cart Response State:", cartResponse);
    console.log("🛒 Is Loading:", isLoading);

    // Force refetch when returning from prescription pages
    useEffect(() => {
    }, [refetch]);


    if (cartResponse?.error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">
                Error loading cart: {JSON.stringify(cartResponse.error)}
            </div>
        );
    }

    const cartItems = (cartResponse?.cart as CartItem[]) || [];
    const cartData = cartResponse; // Contains summary, coupon, shipping info

    console.log("🛒 Cart Items:", cartItems);
    console.log("🛒 Cart Items Length:", cartItems.length);
    console.log("🛒 Cart Data:", cartData);

    // Sync shipping method from server response when available
    useEffect(() => {
        if (cartData?.shipping_method?.id) {
            setShippingMethod(cartData.shipping_method.id);
        }
    }, [cartData?.shipping_method?.id]);

    // Coupon Mutations
    const { mutate: applyCouponMutation } = useMutation({
        mutationFn: applyCoupon,
        onSuccess: (res: any) => {
            if (res.data.success) {
                refetch();
                setCouponCode("");
                alert("Coupon applied successfully!");
            } else {
                alert(res.data.message || "Failed to apply coupon");
            }
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || "Failed to apply coupon");
        },
    });

    const { mutate: removeCouponMutation } = useMutation({
        mutationFn: removeCoupon,
        onSuccess: () => {
            refetch();
            alert("Coupon removed successfully!");
        },
    });

    const { mutate: updateShippingMutation } = useMutation({
        mutationFn: updateShippingMethod,
        onMutate: async (newMethodId: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot the previous value
            const previousCartData = queryClient.getQueryData(["cart"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["cart"], (oldData: any) => {
                if (!oldData) return oldData;

                // Define shipping costs (Must match backend logic)
                // Standard: $6 (Free > $75), Express: $29
                const methodCost = newMethodId === "express" ? 29 : (oldData.subtotal > 75 ? 0 : 6);
                const methodObj = newMethodId === "express"
                    ? { id: "express", name: "Express Shipping", cost: 29, free_threshold: null }
                    : { id: "standard", name: "Standard Shipping", cost: 6, free_threshold: 75 };

                // Recalculate totals
                // total_payable = subtotal - discount + new_shipping
                const newTotal = Number(oldData.subtotal) - Number(oldData.discount_amount || 0) + methodCost;

                return {
                    ...oldData,
                    shipping_method: methodObj,
                    shipping_cost: methodCost, // Update the displayed cost
                    total_payable: newTotal.toFixed(2), // Update the total
                };
            });

            // Return a context object with the snapshotted value
            return { previousCartData };
        },
        onError: (_err, _newMethod, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCartData) {
                queryClient.setQueryData(["cart"], context.previousCartData);
            }
            alert("Failed to update shipping method.");
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server sync
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            applyCouponMutation(couponCode);
        }
    };

    const handleRemoveCoupon = () => {
        removeCouponMutation();
    };

    const handleShippingChange = (method: string) => {
        setShippingMethod(method);
        updateShippingMutation(method);
    };

    // Delete Mutation
    const { mutate: handleDeleteItem } = useMutation({
        mutationFn: (cartId: number) =>
            deleteProductFromCart(cartId, undefined, undefined),
        onSuccess: () => {
            setDeleteDialog(false);
            setSelectedCartId(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any) => {
            console.error("Delete failed:", error);
        }
    });

    const handleDeleteClick = (cartId: number) => {
        setSelectedCartId(cartId);
        setDeleteDialog(true);
    };

    useEffect(() => {
        if (!selectedCartId || !viewPrescription) return;

        const existingCartId =
            viewPrescription?.data?.associatedProduct?.cartId;

        // ✅ update only if cartId missing
        if (!existingCartId) {
            updateMyPrescriptionCartId(viewPrescription.id, String(selectedCartId));
        }
    }, [selectedCartId, viewPrescription]);



    const confirmDelete = () => {
        if (selectedCartId) handleDeleteItem(selectedCartId);
    };

    // Update Quantity Mutation with optimistic UI
    const {
        mutate: handleUpdateQuantity,
        isPending: isQuantityUpdating,
    } = useMutation({
        mutationFn: ({
            cartId,
            quantity,
        }: {
            cartId: number;
            quantity: number;
        }) => updateCartQuantity(cartId, quantity),
        onMutate: async ({ cartId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });
            const previous = queryClient.getQueryData(["cart"]);

            queryClient.setQueryData(["cart"], (oldData: any) => {
                if (!oldData) return oldData;
                const updatedCart = (oldData.cart || []).map((item: CartItem) =>
                    item.cart_id === cartId ? { ...item, quantity } : item
                );

                const subtotal = updatedCart.reduce((sum: number, item: CartItem) => {
                    // calculateItemTotal already includes tint/coating and quantity
                    return sum + calculateItemTotal(item);
                }, 0);

                const shipping_cost = oldData.shipping_cost ?? 0;
                const discount_amount = oldData.discount_amount ?? 0;
                const total_payable = subtotal - discount_amount + shipping_cost;

                return {
                    ...oldData,
                    cart: updatedCart,
                    subtotal,
                    total_payable,
                };
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["cart"], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const handleQuantityChange = (
        cartId: number,
        currentQuantity: number,
        change: number
    ) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity >= 1) {
            handleUpdateQuantity({ cartId, quantity: newQuantity });
        }
    };



    // Helper function to get prescription from user's prescriptions array (database)
    const getPrescriptionByCartId = (
        cartId: number,
        productSku?: string,
        cartItem?: CartItem
    ): any | null => {
        try {
            if (userPrescriptions && userPrescriptions.length > 0) {

                // ✅ FIX: access data.associatedProduct
                let prescription = userPrescriptions.find((p: any) =>
                    p?.data?.associatedProduct?.cartId &&
                    String(p.data.associatedProduct.cartId) === String(cartId)
                );

                // Optional fallback (if cartId missing)
                if (!prescription && productSku) {
                    prescription = userPrescriptions.find((p: any) =>
                        p?.data?.associatedProduct?.productSku === productSku
                    );
                }

                if (prescription) {
                    console.log('✅ Found prescription:', prescription);
                    return prescription;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching prescription:", error);
            return null;
        }
    };

    // Helper function to format frame size
    const formatFrameSize = (size?: string): string => {
        if (!size) return "MEDIUM";
        const sizeUpper = size.toUpperCase().trim();
        if (sizeUpper === "S" || sizeUpper === "SMALL") return "SMALL";
        if (sizeUpper === "M" || sizeUpper === "MEDIUM") return "MEDIUM";
        if (sizeUpper === "L" || sizeUpper === "LARGE") return "LARGE";
        return sizeUpper; // Return as-is if already formatted
    };

    // Helper function to get lens type display
    const getLensTypeDisplay = (item: CartItem): string => {
        const itemAny = item as any;
        const lensAny = item.lens as any;

        // Check override first (this is where frontend stores the selected lens category and tier)
        const override = getCartLensOverride(item.cart_id);

        // Use override mainCategory if available, otherwise use backend main_category
        const mainCategory = override?.mainCategory || item.lens?.main_category || "";

        // DEBUG: Log the lens data to see what we're working with
        console.log("🔍 DEBUG getLensTypeDisplay:", {
            cart_id: item.cart_id,
            override_mainCategory: override?.mainCategory,
            backend_main_category: item.lens?.main_category,
            final_mainCategory: mainCategory,
            override_lensCategory: override?.lensCategory,
            lens_category: lensAny?.lens_category,
            lensCategory: itemAny?.lensCategory,
            sub_category: lensAny?.sub_category,
            full_override: override,
            full_lens: lensAny,
            full_item: itemAny
        });

        // Extract prescription tier from main_category
        let tier = "";
        const mainCategoryLower = mainCategory.toLowerCase();
        if (mainCategoryLower.includes("premium progressive")) {
            tier = "Premium Progressive";
        } else if (mainCategoryLower.includes("standard progressive")) {
            tier = "Standard Progressive";
        } else if (mainCategoryLower.includes("bifocal")) {
            tier = "Bifocal";
        } else if (mainCategoryLower.includes("progressive")) {
            // Generic progressive if not specified
            tier = "Progressive";
        } else {
            // Fallback to main_category if it doesn't match known patterns
            tier = mainCategory || "Progressive";
        }

        // Get lens category - check override first, then backend fields
        let category = "";
        const lensCategory = override?.lensCategory || lensAny?.lens_category || itemAny?.lensCategory;

        if (lensCategory) {
            const cat = String(lensCategory).toLowerCase();
            if (cat === "blue") category = "Blue Protect";
            else if (cat === "clear") category = "Clear";
            else if (cat === "photo" || cat === "photochromic") category = "Photochromic";
            else if (cat === "sun" || cat === "sunglasses") category = "Sunglasses";
        } else {
            // Try to extract from sub_category as fallback
            const subCategory = item.lens?.sub_category || "";
            const subLower = subCategory.toLowerCase();
            if (subLower.includes("blue")) {
                category = "Blue Protect";
            } else if (subLower.includes("clear")) {
                category = "Clear";
            } else if (subLower.includes("photo")) {
                category = "Photochromic";
            } else if (subLower.includes("sun")) {
                category = "Sunglasses";
            }
        }

        // Combine tier and category in the format: "Tier-Category"
        const result = category ? `${tier}-${category}` : tier;
        console.log("✅ getLensTypeDisplay result:", result);
        return result;
    };

    // Helper function to extract lens index
    const getLensIndex = (item: CartItem): { index: string; price: number } => {
        const itemAny = item as any;
        const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData ?? item.lens) as any;
        const sellingPrice = getLensPackagePrice(item);
        const override = getCartLensOverride(item.cart_id);

        console.log("🔍 DEBUG getLensIndex:", {
            cart_id: item.cart_id,
            lens_package: lensAny?.lens_package,
            lensPackage: itemAny?.lensPackage,
            lensPackagePrice: itemAny?.lensPackagePrice,
            lens_title: lensAny?.title,
            lens_name: lensAny?.name,
            sub_category: lensAny?.sub_category,
            lens_category: lensAny?.lens_category,
            lensCategory: itemAny?.lensCategory,
            selling_price: sellingPrice,
            full_lens_object: lensAny
        });

        // Get the lens index number
        let indexNumber = "1.61"; // default
        let lensPackagePrice = sellingPrice;

        // 1. Try to get from item-level fields (from selectLens API call)
        if (override?.lensPackage) {
            indexNumber = String(override.lensPackage);
        } else if (itemAny?.lensPackage) {
            indexNumber = String(itemAny.lensPackage);
            lensPackagePrice = Number(itemAny?.lensPackagePrice ?? itemAny?.lens_package_price ?? sellingPrice);
        }
        // 2. Try to get from lens_package field in lens object
        else if (lensAny?.lens_package) {
            indexNumber = String(lensAny.lens_package);
        }
        // 3. Try to extract from lens title/name (e.g., "1.61 Blue Protect High Index")
        else if (lensAny?.title || lensAny?.name) {
            const lensTitle = lensAny?.title || lensAny?.name;
            const indexMatch = lensTitle.match(/(1\.\d+)/);
            if (indexMatch) {
                indexNumber = indexMatch[1];
            }
        }
        // 4. Try to extract index from sub_category (e.g., "1.61", "1.67", "1.74")
        else {
            const subCategory = lensAny?.sub_category || "";
            const indexMatch = subCategory.match(/(\d\.\d+)/);
            if (indexMatch) {
                indexNumber = indexMatch[1];
            }
        }

        // Get lens category to construct full name
        const lensCategory = itemAny?.lensCategory || lensAny?.lens_category || "";
        const cat = String(lensCategory).toLowerCase();

        // Construct the full lens package name
        let fullName = "";
        if (cat === "blue") {
            fullName = `${indexNumber} Blue Protect High Index`;
        } else if (cat === "photo" || cat === "photochromic") {
            fullName = `${indexNumber} Photochromic High Index`;
        } else if (cat === "sun" || cat === "sunglasses") {
            fullName = `${indexNumber} High Index`;
        } else if (cat === "clear" || cat === "") {
            fullName = `${indexNumber} High Index`;
        } else {
            // Fallback: just use the index number with "High Index"
            fullName = `${indexNumber} High Index`;
        }

        // console.log("✅ getLensIndex result:", { fullName, price: lensPackagePrice });
        const normalizedPrice = Number.isFinite(Number(lensPackagePrice)) ? Number(lensPackagePrice) : 0;
        return { index: fullName, price: normalizedPrice };
    };

    // Helper function to get lens coating - refactored to use shared utility
    // const getLensCoating = ... (logic moved to utils/priceUtils.ts)

    const hasError = !!cartResponse?.error;

    // Show loader during initial mount or when loading cart data
    if (isMounting || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    // Frontend Calculation of Subtotal to ensure display consistency with item cards
    const frontendSubtotal = calculateCartSubtotal(cartItems);

    const discountAmount = Number(cartData?.discount_amount || 0);
    const shippingCost = Number(cartData?.shipping_cost || 0);
    const frontendTotalPayable = frontendSubtotal - discountAmount + shippingCost;

    if (!isFetched || isLoading || isFetching) {
        return (
            <Loader />

        );
    }


    console.log("cartItems", cartItems);
    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans pb-20 pt-10">

            {/* Main Content */}
            <div className="max-w-[1366px] mx-auto px-4 md:px-21 py-8">

                {cartItems.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-[36px] font-bold text-black">Your Cart</h1>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                                        // Delete all cart items
                                        cartItems.forEach(item => {
                                            handleDeleteItem(item.cart_id);
                                        });
                                    }
                                }}
                                className="text-sm font-bold text-[#E53935] hover:text-[#D32F2F] underline transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column: Cart Items */}
                            <div className="flex-1">
                                {/* Satisfaction Banner */}
                                <div className="bg-[#f3f3f3] text-[#2E7D32] px-4 py-3 rounded-md text-center font-bold text-sm mb-6 border border-[#C8E6C9]">
                                    Satisfaction Guaranteed - Hassle Free 30 Days Refunds.
                                </div>

                                <div className="space-y-6">
                                    {cartItems.map((item) => (

                                        <div
                                            key={item.cart_id}
                                            className="bg-white p-4 md:p-6 relative"
                                        >
                                            {/* Remove Link */}
                                            <button
                                                onClick={() => handleDeleteClick(item.cart_id)}
                                                className="absolute top-2 right-2 md:top-0 md:right-0 text-[#E53935] text-xs font-bold hover:underline p-2 pr-4 underline"
                                            >
                                                Remove
                                            </button>

                                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-4">
                                                {/* Image Area */}
                                                <div className="w-full md:w-[240px] flex flex-col items-center shrink-0">
                                                    <div
                                                        className="w-full aspect-[4/3] flex items-center justify-center mb-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            // PARSE ORIGINAL SKU from composite ID if needed
                                                            const rawProductId = item.product_id || item.product?.products?.skuid;
                                                            let productId = rawProductId;

                                                            if (rawProductId && typeof rawProductId === 'string' && rawProductId.includes('_')) {
                                                                productId = rawProductId.split('_')[0]; // Extract Real SKU
                                                            }

                                                            if (productId) {
                                                                navigate(`/product/${productId}`, {
                                                                    state: { product: item.product?.products }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                item.product?.products?.image ||
                                                                item.product_details?.image ||
                                                                "/placeholder-product.png"
                                                            }
                                                            alt={item.product?.products?.name || item.product_details?.name}
                                                            className="w-[90%] h-full object-contain mix-blend-multiply"
                                                        />
                                                    </div>
                                                    <h3 className="font-bold text-[#1F1F1F] text-lg uppercase text-center mb-1">
                                                        {item.product?.products?.naming_system ||
                                                            item.product?.products?.brand ||
                                                            item.product_details?.name ||
                                                            "BERG"}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span>Color:</span>
                                                        {(() => {
                                                            const frameColor = item.product?.products?.framecolor || item.product_details?.frame_color;
                                                            const selectedColor = (item as any).selectedColor || (item as any).color;
                                                            const displayColor = selectedColor || frameColor?.toLowerCase() || "#F5F5F5";
                                                            return (
                                                                <div
                                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                                    style={{ backgroundColor: displayColor }}
                                                                ></div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Details Table */}
                                                <div className="flex-1">
                                                    <div className="border border-gray-200 text-sm">
                                                        {/* Prescription For */}

                                                        {/* Frame Price */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Frame Price:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-right font-bold text-[#1F1F1F]">
                                                                £{Number(item.product?.products?.list_price || item.product_details?.price || 0).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        {/* Frame Size */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Frame Size:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-[#525252]">
                                                                {formatFrameSize(item.product?.products?.size)}
                                                            </div>
                                                        </div>
                                                        {/* Lens Type */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Lens Type:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-[#525252]">
                                                                {getLensTypeDisplay(item)}
                                                            </div>
                                                        </div>

                                                        {/* Lens Index - Always show */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Lens Index:
                                                            </div>
                                                            <div className="w-2/3 flex justify-between p-3">
                                                                <span className="text-[#525252]">
                                                                    {getLensIndex(item).index}
                                                                </span>
                                                                <span className="font-bold text-[#1F1F1F]">
                                                                    £{getLensIndex(item).price.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Conditionally show Lens Tint (for sunglasses) or Lens Coating (for regular glasses) */}
                                                        {getTintInfo(item) ? (
                                                            /* Sunglasses - Show Lens Tint */
                                                            <div className="flex">
                                                                <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                    Lens Tint:
                                                                </div>
                                                                <div className="w-2/3 flex justify-between p-3">
                                                                    <span className="text-[#525252]">
                                                                        {getTintInfo(item)!.type}
                                                                        {getTintInfo(item)!.color && `-${getTintInfo(item)!.color}`}
                                                                    </span>
                                                                    <span className="font-bold text-[#1F1F1F]">
                                                                        £{Number(getTintInfo(item)!.price).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Regular Glasses - Show Lens Coating */
                                                            <div className="flex">
                                                                <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                    Lens Coating:
                                                                </div>
                                                                <div className="w-2/3 flex justify-between p-3">
                                                                    <span className="text-[#525252]">
                                                                        {getLensCoating(item).name}
                                                                    </span>
                                                                    <span className="font-bold text-[#1F1F1F]">
                                                                        £{Number(getLensCoating(item).price || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Inline Prescription Preview */}
                                                    {/* {(() => {
                                                        const _ = prescriptionRefresh; // Force re-evaluation
                                                        const productSku = item.product?.products?.skuid || item.product_id;
                                                        const prescription = getPrescriptionByCartId(item.cart_id, productSku);
                                                        
                                                        if (prescription) {
                                                            const details = prescription.prescriptionDetails || prescription;
                                                            const isUpload = details.type === "upload" || details.image_url;
                                                            
                                                            return (
                                                                <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="text-xs font-bold text-gray-500 uppercase">Prescription</h4>
                                                                        <button
                                                                            onClick={() => setViewPrescription(prescription)}
                                                                            className="text-xs text-[#025048] hover:text-[#013a34] font-medium underline"
                                                                        >
                                                                            View Full Details
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {isUpload ? (
                                                                       
                                                                        <div className="flex items-center gap-3">
                                                                            {details.image_url && (
                                                                                <img
                                                                                    src={details.image_url}
                                                                                    alt="Prescription"
                                                                                    className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                                                                    onClick={() => setViewPrescription(prescription)}
                                                                                />
                                                                            )}
                                                                            <div className="flex-1 text-xs text-gray-600">
                                                                                <p className="font-medium">Uploaded Prescription</p>
                                                                                {details.fileName && <p className="text-gray-500 truncate">{details.fileName}</p>}
                                                                                <p className="text-gray-500">
                                                                                    PD: {details.pdType === "Dual" || (details.pdRight && details.pdLeft) 
                                                                                        ? `R: ${details.pdRight} / L: ${details.pdLeft}` 
                                                                                        : details.pdSingle}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                     
                                                                        <div className="text-xs space-y-1">
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <span className="font-bold text-gray-500">OD:</span>
                                                                                    <span className="ml-1 text-gray-700">
                                                                                        SPH {details.od?.sph || "0.00"}, 
                                                                                        CYL {details.od?.cyl || "0.00"}
                                                                                        {details.od?.axis && `, Axis ${details.od.axis}`}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-bold text-gray-500">OS:</span>
                                                                                    <span className="ml-1 text-gray-700">
                                                                                        SPH {details.os?.sph || "0.00"}, 
                                                                                        CYL {details.os?.cyl || "0.00"}
                                                                                        {details.os?.axis && `, Axis ${details.os.axis}`}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-4 text-gray-600">
                                                                                {details.addPower && <span>ADD: {details.addPower}</span>}
                                                                                <span>
                                                                                    PD: {details.pdType === "Dual" 
                                                                                        ? `R: ${details.pdRight} / L: ${details.pdLeft}` 
                                                                                        : details.pdSingle}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        return null;
                                                    })()} */}

                                                    {/* Two-column layout: Prescription button + Free text on left, Qty + Total on right */}
                                                    <div className="mt-4 flex flex-col md:flex-row items-start justify-between gap-4">
                                                        {/* Left Side: Prescription button and Free items text */}
                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    const productSku = item.product?.products?.skuid || item.product_id;
                                                                    const prescription = getPrescriptionByCartId(item.cart_id, productSku, item);
                                                                    if (prescription) {
                                                                        console.log('📋 Opening prescription modal with data:', prescription);
                                                                        setViewPrescription(prescription);
                                                                    } else {
                                                                        // Redirect to manual prescription page with cart_id
                                                                        navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                                                    }
                                                                }}
                                                                className="bg-[#E94D37] hover:bg-[#bf3e2b] text-white font-bold text-sm px-4 py-2 rounded-md transition-colors w-fit"
                                                            >
                                                                {(() => {
                                                                    const _ = prescriptionRefresh;
                                                                    const productSku = item.product?.products?.skuid || item.product_id;
                                                                    return getPrescriptionByCartId(item.cart_id, productSku, item) ? 'View Prescription' : 'Add Prescription';
                                                                })()}
                                                            </button>

                                                            <div className="text-[#E53935] text-sm font-medium">
                                                                Case & Cleaning cloth included for Free
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Qty and Total side-by-side */}
                                                        <div className="flex items-center gap-6">
                                                            {/* Quantity controls */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#1F1F1F]">
                                                                    Qty
                                                                </span>
                                                                <div className="flex items-center border border-gray-300 rounded bg-white">
                                                                    <button
                                                                        disabled={isQuantityUpdating}
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                item.cart_id,
                                                                                item.quantity || 1,
                                                                                -1
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="px-2 py-1 text-sm font-bold min-w-[24px] text-center">
                                                                        {item.quantity || 1}
                                                                    </span>
                                                                    <button
                                                                        disabled={isQuantityUpdating}
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                item.cart_id,
                                                                                item.quantity || 1,
                                                                                1
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Total pricing */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#1F1F1F]">
                                                                    Total
                                                                </span>
                                                                <span className="font-bold text-2xl text-[#1F1F1F]">
                                                                    £{calculateItemTotal(item).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Summary & Offers */}
                            <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                                {/* Apply Coupon Section */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">
                                        Apply Coupon
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter code"
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#025048]"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode}
                                            className="bg-[#025048] text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                                        >
                                            Apply
                                        </button>
                                    </div>
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
                                    <div className="mt-2 text-xs text-gray-500">
                                        Available codes: LAUNCH50 (50% Off)
                                    </div>
                                </div>

                                {/* Shipping Method */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">
                                        Shipping Method
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={shippingMethod === "standard"}
                                                onChange={() => handleShippingChange("standard")}
                                                className="accent-[#025048]"
                                            />
                                            <div className="flex-1 text-sm">
                                                <div className="font-bold text-[#1F1F1F]">
                                                    Standard Shipping
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    8-12 working days
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#1F1F1F]">
                                                {cartData?.subtotal > 75 ? "Free" : "£6"}
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={shippingMethod === "express"}
                                                onChange={() => handleShippingChange("express")}
                                                className="accent-[#025048]"
                                            />
                                            <div className="flex-1 text-sm">
                                                <div className="font-bold text-[#1F1F1F]">
                                                    Express Shipping
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    4-6 working days
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#1F1F1F]">£29</div>
                                        </label>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="text-lg font-bold text-[#1F1F1F] mb-4">
                                        Price Summary
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between font-bold text-[#1F1F1F]">
                                            <span>Subtotal</span>
                                            {/* Subtotal Calculated in Frontend */}
                                            <span>£{frontendSubtotal.toFixed(2)}</span>
                                        </div>

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between font-bold text-green-600">
                                                <span>Discount ({cartData.coupon?.code})</span>
                                                <span>-£{discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between font-bold text-[#1F1F1F]">
                                            <span>Shipping</span>
                                            <span>£{Number(cartData?.shipping_cost || 0).toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-[#1F1F1F]">
                                            <span>Total Payables</span>
                                            <span>£{frontendTotalPayable.toFixed(2)}</span>
                                        </div>
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
                                        className="w-full bg-[#1F1F1F] text-white py-3 rounded mt-6 font-bold text-sm hover:bg-black transition-colors"
                                    >
                                        Checkout
                                    </button>
                                    <p className="text-xs pt-2 text-center">
                                        Prices includes applicable VAT
                                    </p>
                                </div>

                                {/* Trust Badges */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 mb-4">
                                        {/* Seal SVG Placeholder */}
                                        <svg
                                            viewBox="0 0 100 100"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-full h-full text-black"
                                        >
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M50 15 L55 35 L75 35 L60 50 L65 70 L50 60 L35 70 L40 50 L25 35 L45 35 Z"
                                                fill="currentColor"
                                                opacity="0.1"
                                            />
                                            <text
                                                x="50"
                                                y="55"
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="bold"
                                                fill="currentColor"
                                            >
                                                100%
                                            </text>
                                            <text
                                                x="50"
                                                y="65"
                                                textAnchor="middle"
                                                fontSize="8"
                                                fill="currentColor"
                                            >
                                                GUARANTEE
                                            </text>
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                                        If you're not 100% satisfied with your purchase within 30
                                        days, our Customer Happiness team is ready to assist with a
                                        hassle-free refund, 24/7. Just email us.
                                    </p>

                                    {/* GLOBAL DEBUG BUTTON */}
                                    {/* <div className="mb-6 px-4">
                                        <button
                                            onClick={() => {
                                                const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                                                const cartStatus = cartItems.map((item: any) => ({
                                                    cartId: item.cart_id,
                                                    product: item.product?.name,
                                                    hasLinkedPrescription: !!getPrescriptionByCartId(item.cart_id)
                                                }));

                                                alert(
                                                    "📊 DEBUG: CART DIAGNOSTICS\n\n" +
                                                    "Cart Items: " + cartItems.length + "\n" +
                                                    "Stored Prescriptions: " + allPrescriptions.length + "\n\n" +
                                                    "Cart Linkage Status:\n" + JSON.stringify(cartStatus, null, 2) + "\n\n" +
                                                    "All LocalStorage Data:\n" + JSON.stringify(allPrescriptions, null, 2)
                                                );
                                                console.log("Debug Data:", { cartItems, allPrescriptions });
                                            }}
                                            className="w-full bg-red-600 text-white py-2 rounded font-bold text-xs uppercase hover:bg-red-700 transition w-full"
                                        >
                                            DEBUG: SHOW ALL DATA
                                        </button>
                                    </div> */}
                                    <div className="flex flex-col md:flex-row md:justify-center md:gap-8 text-xs text-gray-500 font-bold mb-6 w-full border-t border-gray-100 pt-4">
                                        <span className="flex items-center gap-2 justify-center mb-2 md:mb-0">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                                            Secure Payment
                                        </span>
                                        <span className="flex items-center gap-2 justify-center">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                                            30 Days Easy Refund
                                        </span>
                                    </div>
                                    <div className="flex justify-center gap-2 md:gap-3 opacity-60">
                                        {/* Payment Icons */}
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                                            className="h-3 md:h-4"
                                            alt="Visa"
                                        />
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                                            className="h-3 md:h-4"
                                            alt="Mastercard"
                                        />
                                        <div className="flex items-center gap-1 text-[6px] md:text-[8px] font-bold border border-gray-300 px-1 rounded">
                                            <svg
                                                width="8"
                                                height="8"
                                                className="md:w-2 md:h-2"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="11"
                                                    rx="2"
                                                    ry="2"
                                                ></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            256 BIT SSL
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State - Replaced with requested Layout */
                    <div className="review-order-wrap w-full">
                        <h4 className="mb-3 text-[28px] font-bold">Your Cart</h4>
                        <ul className="list-group review-order-group list-group-lg list-group-flush-x w-full bg-white rounded-lg shadow-sm p-0 list-none">
                            <li className="list-group-item bg-white border-0 p-6 flex flex-col items-center justify-center">
                                <h6 className="font-size-base mb-4 text-center text-base font-medium">
                                    Your Shopping Cart is empty!
                                </h6>
                                <div className="d-flex align-items-center justify-content-center flex items-center justify-center mb-6">
                                    <img
                                        className="img-fluid max-w-full h-auto"
                                        src="https://cdn.multifolks.us/desktop/images/static-page/cart/cw-empty-cart2.svg"
                                        style={{ width: "150px" }}
                                        alt="Empty Cart"
                                    />
                                </div>
                                <p className="text-center mb-6 text-gray-600">
                                    Add items to it now.
                                </p>
                                <div className="mb-10 px-4 flex justify-center">
                                    <button
                                        onClick={() => navigate("/glasses")}
                                        className="w-[200px] py-6 bg-[#232320] text-white rounded-full uppercase transition-all duration-300 hover:bg-[#1a1a1a]"
                                        style={{
                                            fontSize: '12px',
                                            fontFamily: 'Lynstone-regular, sans-serif',
                                            fontWeight: 600,
                                            letterSpacing: '1.2px',
                                            wordWrap: 'break-word'
                                        }}
                                    >
                                        EXPLORE OUR RANGE
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <DeleteDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={confirmDelete}
                itemType="product"
            />

            {/* Manual Prescription Modal */}
            <ManualPrescriptionModal
                open={!!viewPrescription}
                onClose={() => setViewPrescription(null)}
                prescription={viewPrescription}
            />

            {/* Auth Modals */}
            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onNext={switchToSignUp}
            />

            <SignUpModal
                open={showSignUpModal}
                onHide={() => setShowSignUpModal(false)}
                setOpen={setShowSignUpModal}
                initialEmail={signUpEmail}
                onSwitchToLogin={switchToLogin}
                withAuthBackground={false} // Use modal style
            />
        </div>
    );
};

export default DesktopCart;

