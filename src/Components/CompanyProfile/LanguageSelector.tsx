import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoCheckmark, IoLanguage, IoSearch, IoInformationCircle } from 'react-icons/io5';

interface LanguageSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (selectedLanguages: string[]) => void;
    initialSelected?: any;
    title?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialSelected = [],
    title = "Select Languages"
}) => {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    


    const languages = [
        { "language_code": "en", "language": "English" },
        { "language_code": "ja", "language": "Japanese" },
        { "language_code": "zh", "language": "Chinese" },
        { "language_code": "de", "language": "German" },
        { "language_code": "hi", "language": "Hindi" },
        { "language_code": "fr", "language": "French" },
        { "language_code": "ko", "language": "Korean" },
        { "language_code": "pt", "language": "Portuguese" },
        { "language_code": "it", "language": "Italian" },
        { "language_code": "es", "language": "Spanish" },
        { "language_code": "id", "language": "Indonesian" },
        { "language_code": "nl", "language": "Dutch" },
        { "language_code": "tr", "language": "Turkish" },
        { "language_code": "fil", "language": "Filipino" },
        { "language_code": "pl", "language": "Polish" },
        { "language_code": "sv", "language": "Swedish" },
        { "language_code": "bg", "language": "Bulgarian" },
        { "language_code": "ro", "language": "Romanian" },
        { "language_code": "ar", "language": "Arabic" },
        { "language_code": "cs", "language": "Czech" },
        { "language_code": "el", "language": "Greek" },
        { "language_code": "fi", "language": "Finnish" },
        { "language_code": "hr", "language": "Croatian" },
        { "language_code": "ms", "language": "Malay" },
        { "language_code": "sk", "language": "Slovak" },
        { "language_code": "da", "language": "Danish" },
        { "language_code": "ta", "language": "Tamil" },
        { "language_code": "uk", "language": "Ukrainian" },
        { "language_code": "ru", "language": "Russian" }
    ];

//    console.log(initialSelected)
    const filteredLanguages = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return languages;
        }

        const query = searchQuery.toLowerCase();
        const filtered = languages.filter(lang =>
            lang.language.toLowerCase().includes(query) ||
            lang.language_code.toLowerCase().includes(query)
        );


        return filtered.sort((a, b) => {
            const aLang = a.language.toLowerCase();
            const bLang = b.language.toLowerCase();

            if (aLang === query) return -1;
            if (bLang === query) return 1;
            if (aLang.startsWith(query) && !bLang.startsWith(query)) return -1;
            if (bLang.startsWith(query) && !aLang.startsWith(query)) return 1;

            return aLang.localeCompare(bLang);
        });
    }, [searchQuery]);

    const toggleLanguage = (language: string) => {
        setSelectedLanguages(prev => {
            if (prev.includes(language)) {
                return prev.filter(lang => lang !== language);
            } else {
                return [...prev, language];
            }
        });
    };

    const removeLanguage = (language: string) => {
        setSelectedLanguages(prev => prev.filter(lang => lang !== language));
    };

    const handleSubmit = () => {
        onSubmit(selectedLanguages);
        onClose();
    };

    const handleCancel = () => {
        setSelectedLanguages(initialSelected);
        onClose();
    };

    const clearAll = () => {
        setSelectedLanguages([]);
    };

    const handleSearchFocus = () => {
        setDropdownOpen(true);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setDropdownOpen(true);
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);


    useEffect(() => {
        if (isOpen) {
            setSelectedLanguages(initialSelected);
            setDropdownOpen(false);
            setSearchQuery('');
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                ref={popupRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in duration-200"
            >

                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <IoLanguage className="w-5 h-5 text-primary" />
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoClose className="w-5 h-5 text-gray-500" />
                    </button>
                </div>


                {selectedLanguages.length > 0 && (
                    <div className="my-4 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Already Assigned ({selectedLanguages.length})
                            </span>
                            <button
                                onClick={clearAll}
                                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedLanguages.map(lang => (
                                <span
                                    key={lang}
                                    className="inline-flex items-center bg-blue-100 text-primary text-xs px-2 py-1 rounded-full"
                                >
                                    {lang}
                                    <button
                                        onClick={() => removeLanguage(lang)}
                                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                    >
                                        <IoClose className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}


                <div className="p-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IoSearch className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search languages..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    searchInputRef.current?.focus();
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <IoClose className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>


                    {dropdownOpen && (
                        <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-sm max-h-28 overflow-y-auto" style={{
                            overflowY: 'scroll',
                            scrollbarWidth: 'thin',
                            msOverflowStyle: 'none',
                        }}

                        >
                            {filteredLanguages?.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No languages found
                                </div>
                            ) : (
                                filteredLanguages.map(lang => (
                                    <button
                                        key={lang.language_code}
                                        onClick={() => toggleLanguage(lang.language)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${selectedLanguages.includes(lang.language)
                                            ? 'bg-blue-100 text-primary'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        <span>
                                            {searchQuery ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: lang.language.replace(
                                                        new RegExp(searchQuery, 'gi'),
                                                        match => `<mark class="bg-yellow-200">${match}</mark>`
                                                    )
                                                }} />
                                            ) : (
                                                lang.language
                                            )}
                                        </span>
                                        {selectedLanguages.includes(lang.language) && (
                                            <IoCheckmark className="w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>



                <div className="px-2 sm:px-4">
                    <span className="text-sm text-primary/90 flex items-center">
                        <IoInformationCircle className="mr-1 text-lg m-2" />
                        <span className="text-gray-500 text-xs">By default, language is set to English.</span>
                    </span>
                </div>

                <div className="flex gap-3 p-4 border-t border-gray-200">
                    <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedLanguages?.length === 0}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${selectedLanguages?.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white'
                            }`}
                    >
                        Assign {selectedLanguages?.length > 0 && `(${selectedLanguages?.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;