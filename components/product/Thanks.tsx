
import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentStatus, getThankYou, sendInvoice } from '../../api/retailerApis';
import { Loader } from '../Loader';

const Thanks: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Fallback for order_id if accessed directly or missing state
    const orderId = state?.order_id || searchParams.get('order_id');

    const { isLoading, data: order, refetch } = useQuery({
        queryKey: ['thank-you', orderId],
        queryFn: async () => {
            if (!orderId) return null;
            try {
                const response: any = await getThankYou(orderId);
                if (response?.data?.status) {
                    return response.data;
                }
                return null;
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        enabled: !!orderId,
        retry: false
    });

    const checkPaymentStatus = () => {
        if (order?.transaction_uuid) {
            getPaymentStatus(order.transaction_uuid).then((response) => {
                if (response?.data?.status) {
                    refetch();
                }
            });
        }
    };

    const invoiceSentRef = React.useRef(false);

    React.useEffect(() => {
        if (order && !invoiceSentRef.current) {
            sendInvoice({ order_id: orderId }).then(() => {
                console.log("Invoice sent automatically");
            });
            invoiceSentRef.current = true;
        }
    }, [order, orderId]);

    const handleSendInvoice = () => {
        sendInvoice({ order_id: orderId });
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F3F0E7] flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-2xl font-bold text-[#1F1F1F] mb-4">Order not found</h1>
                <button onClick={() => navigate('/')} className="text-[#D96C47] font-bold underline">Go Home</button>
            </div>
        );
    }

    let statusText = '';
    let StatusIcon = null;
    let statusColorClass = '';

    if (order.payment_status === 'Success') {
        statusText = 'Congratulations! The sale has been completed.';
        statusColorClass = 'text-green-500 bg-green-50';
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        );
    } else if (order.payment_status === 'Failed') {
        statusText = 'Order Failed';
        statusColorClass = 'text-red-500 bg-red-50';
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        );
    } else {
        statusText = 'Order Pending';
        statusColorClass = 'text-yellow-500 bg-yellow-50';
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
            <div className="max-w-[800px] mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => navigate('/')} className="text-[#1F1F1F] hover:text-[#E94D37]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-[#1F1F1F]">Thanks</h1>
                </div>

                <div className="bg-white rounded-xl shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)] p-6 md:p-10 relative">

                    {/* Status Section */}
                    <div className="flex flex-col items-center justify-center text-center mb-8 relative">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${statusColorClass}`}>
                            {StatusIcon}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#5B5B5B] mb-2">{statusText}</h2>
                        <p className="text-[#4596F3] text-sm font-medium mb-1">Order Id : {order?.order?.order_id}</p>
                        {order.payment_status === 'Success' && (
                            <p className="text-gray-500 text-xs mb-4">
                                An order confirmation email has been sent to <b>{order?.order?.customer?.email || order?.order?.user_email}</b>
                            </p>
                        )}

                        <button
                            onClick={checkPaymentStatus}
                            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-[#232320] transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
                            title="Refresh Status"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-2">Customer Name</h3>
                            <p className="text-base font-bold text-[#313131] mb-1">{order?.order?.customer?.first_name} {order?.order?.customer?.last_name}</p>
                            <p className="text-xs text-[#313131] font-medium">Contact No. <span className="font-bold">{order?.order?.customer?.phone_number}</span></p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-2">Store Address</h3>
                            <p className="text-base font-bold text-[#313131] mb-1">{order?.order?.store?.store_name}</p>
                            <p className="text-xs text-[#313131] font-medium mb-1">{order?.order?.store?.address}</p>
                            <p className="text-xs text-[#313131] font-medium">Store contact no. <span className="font-bold">{order?.order?.retailer?.phone_number}</span></p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-[#313131] mb-1"><strong>Shipping Address</strong></h3>
                            <p className="text-sm text-[#525252]">{order?.shipping_address}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-sm font-medium text-[#313131] mb-1"><strong>Billing Address</strong></h3>
                            <p className="text-sm text-[#525252]">{order?.billing_address}</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Product Details */}
                    <h3 className="text-base font-bold text-[#525252] mb-4">Order Detail</h3>
                    <div className="space-y-6">
                        {order?.order?.cart?.map((cart: any) => (
                            <div key={cart.cart_id} className="flex gap-4 items-center">
                                <div className="w-[75px] h-[50px] bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                                    <img
                                        src={cart.product?.products?.image || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=200"}
                                        alt="Product"
                                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-[#525252]">{cart.product?.products?.naming_system || cart.product?.products?.brand}</h4>
                                    <p className="text-xs text-[#525252]">
                                        <span className="text-[#4596F3]">Frame: </span>
                                        {cart.product?.products?.framecolor} {cart.product?.products?.style} {cart.product?.products?.primary_category}
                                    </p>
                                    <p className="text-xs font-bold text-[#525252] mt-0.5">Frame Size: <span className="ml-2 font-medium">{cart.product?.products?.size}</span></p>
                                    {cart.lens && (
                                        <p className="text-xs font-bold text-[#525252] mt-0.5">Lens: <span className="ml-2 font-medium">{cart.lens?.sub_category}</span></p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Financials */}
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#313131]">Paid Amount:</span>
                            <strong className="text-[#1F1F1F]">£{order?.order?.is_partial ? (order?.order?.order_total / 2).toFixed(2) : order?.order?.order_total?.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#313131]">Sub Total:</span>
                            <strong className="text-[#1F1F1F]">£{order?.order?.subtotal?.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-8"></div>

                    {/* Action */}
                    {order.payment_status === 'Success' && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleSendInvoice}
                                className="bg-[#232320] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[300px]"
                            >
                                Send invoice to customer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Thanks;
