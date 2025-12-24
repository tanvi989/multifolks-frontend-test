import React, { useState } from 'react';

interface CoatingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: string;
}

const CoatingInfoModal: React.FC<CoatingInfoModalProps> = ({ isOpen, onClose, initialTab = 'anti-reflective' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    if (!isOpen) return null;

    const tabs = [
        { id: 'anti-reflective', label: 'Anti-Reflective' },
        { id: 'water-resistant', label: 'Water-Resistant' },
        { id: 'oil-resistant', label: 'Oil-Resistant' }
    ];

    const content = {
        'anti-reflective': {
            image: '/images/coatings/anti-reflective-comparison.jpg',
            leftLabel: 'Anti reflecting',
            rightLabel: 'Non anti reflecting',
            description: 'Standard Anti-Reflective Coating reduces glare, reflections, and halos around lights at night, improving the vision and the appearance of your glasses.',
            included: true,
            features: {
                ar: true,
                water: false,
                oil: false
            }
        },
        'water-resistant': {
            image: '/images/coatings/water-resistant-comparison.jpg', // Placeholder
            leftLabel: 'Water Resistant',
            rightLabel: 'Non Water Resistant',
            description: 'Water-Resistant coating repels water droplets, ensuring clear vision even in rain or humid conditions. It makes cleaning easier and prevents water stains.',
            included: true,
            features: {
                ar: true,
                water: true,
                oil: false
            }
        },
        'oil-resistant': {
            image: '/images/coatings/oil-resistant-comparison.jpg', // Placeholder
            leftLabel: 'Oil Resistant',
            rightLabel: 'Non Oil Resistant',
            description: 'Oil-Resistant (Oleophobic) coating repels fingerprints, oils, and smudges. It keeps your lenses cleaner for longer and makes them effortless to wipe clean.',
            included: true,
            features: {
                ar: true,
                water: true,
                oil: true
            }
        }
    };

    const currentContent = content[activeTab as keyof typeof content];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-8 text-center font-serif">How to Choose a Coating</h2>

                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === tab.id
                                ? 'text-[#1F1F1F]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1F1F1F]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Visual Comparison */}
                <div className="mb-8 relative">
                    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                        {/* Placeholder for dynamic image */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            [Comparison Image: {activeTab}]
                        </div>

                        {/* Labels Overlay */}
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                            <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded backdrop-blur-sm">
                                {currentContent.leftLabel}
                            </div>
                        </div>
                        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                            <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded backdrop-blur-sm">
                                {currentContent.rightLabel}
                            </div>
                        </div>

                        {/* Split Line Indicator (Visual only) */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 border-l border-dashed border-white"></div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {currentContent.description}
                    </p>
                    {currentContent.included && (
                        <div className="inline-block bg-red-50 px-4 py-2 rounded">
                            <p className="text-red-600 font-bold text-xs tracking-wider uppercase">INCLUDED</p>
                        </div>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-gray-100 pt-8">
                    {/* Anti-Reflective Icon */}
                    <div className="text-center group">
                        <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full transition-colors ${currentContent.features.ar ? 'text-[#0066CC] bg-blue-50' : 'text-gray-300 bg-gray-50'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <p className={`text-xs font-bold mb-2 ${currentContent.features.ar ? 'text-[#1F1F1F]' : 'text-gray-400'}`}>Anti-Reflective</p>
                        <div className="flex justify-center">
                            {currentContent.features.ar ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Water-Resistant Icon */}
                    <div className="text-center group">
                        <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full transition-colors ${currentContent.features.water ? 'text-[#0066CC] bg-blue-50' : 'text-gray-300 bg-gray-50'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                        </div>
                        <p className={`text-xs font-bold mb-2 ${currentContent.features.water ? 'text-[#1F1F1F]' : 'text-gray-400'}`}>Water-Resistant</p>
                        <div className="flex justify-center">
                            {currentContent.features.water ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Oil-Resistant Icon */}
                    <div className="text-center group">
                        <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full transition-colors ${currentContent.features.oil ? 'text-[#0066CC] bg-blue-50' : 'text-gray-300 bg-gray-50'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                            </svg>
                        </div>
                        <p className={`text-xs font-bold mb-2 ${currentContent.features.oil ? 'text-[#1F1F1F]' : 'text-gray-400'}`}>Oil-Resistant</p>
                        <div className="flex justify-center">
                            {currentContent.features.oil ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CoatingInfoModal;
