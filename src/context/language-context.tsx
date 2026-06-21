import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'te' | 'hi';

const STORAGE_KEY = '@hc_buyer_language';

const EN = {
  // Settings modal
  settings_title:               'App Settings',

  settings_notifications:       'Notifications',
  notif_order_updates:          'Order Status Updates',
  notif_order_updates_desc:     'Placed → dispatched → out for delivery → delivered',
  notif_price_drops:            'Price Drop Alerts',
  notif_price_drops_desc:       'Alert when a wishlist item drops in price',
  notif_new_arrivals:           'New Arrivals Nearby',
  notif_new_arrivals_desc:      'Fresh products from sellers in your area',
  notif_promos:                 'Offers & Promotions',
  notif_promos_desc:            'Discounts, cashback, and seasonal deals',

  settings_display:             'Display',
  display_language:             'Language',
  display_dark_mode:            'Appearance',
  display_dark_mode_desc:       'Choose your preferred theme',
  theme_light:                  'Light',
  theme_dark:                   'Dark',
  theme_system:                 'System',

  settings_shopping:            'Shopping Preferences',
  shop_wallet_auto:             'Auto-apply Harvest Wallet',
  shop_wallet_auto_desc:        'Automatically use wallet balance at checkout',
  shop_gst_inclusive:           'Show GST-inclusive Prices',
  shop_gst_inclusive_desc:      'Display final price including all taxes',

  settings_privacy:             'Privacy & Legal',
  privacy_policy:               'Privacy Policy',
  terms_of_service:             'Terms of Service',
  data_permissions:             'Data & Permissions',

  settings_about:               'About',
  about_version:                'App Version',
  about_rate_app:               'Rate HarvestConnect',
  about_rate_app_desc:          'Enjoying the app? Leave us a review',

  // Help & Support
  help_title:                   'Help & Support',
  help_hint:                    'Common questions answered below. Tap any question to expand.',

  help_faqs:                    'Frequently Asked Questions',
  help_faq_q1:                  'How do I track my order?',
  help_faq_a1:                  'Go to Orders tab → tap your order → you\'ll see real-time status from seller dispatch to doorstep delivery.',
  help_faq_q2:                  'How do I cancel an order?',
  help_faq_a2:                  'You can cancel before the seller dispatches. Go to Orders → tap the order → tap Cancel. Once dispatched, contact support.',
  help_faq_q3:                  'What payment methods are accepted?',
  help_faq_a3:                  'We accept UPI (GPay, PhonePe, Paytm), debit/credit cards, and Harvest Wallet balance.',
  help_faq_q4:                  'How does Harvest Wallet work?',
  help_faq_a4:                  'Wallet is credited from refunds and referral rewards. It can be used at checkout to pay part or full order value.',
  help_faq_q5:                  'How do I request a refund?',
  help_faq_a5:                  'If you received wrong or damaged goods, raise a return request within 24 hours of delivery via Orders → Issue with Order. Refund is processed in 3–5 business days.',
  help_faq_q6:                  'Can I change my delivery address after ordering?',
  help_faq_a6:                  'Address changes are possible before the seller accepts the order. Contact support immediately on WhatsApp for fastest resolution.',
  help_faq_q7:                  'Which areas does HarvestConnect deliver to?',
  help_faq_a7:                  'We currently serve mandals across Nizamabad, Armoor, Banswada, Kamareddy, and surrounding districts. Coverage is expanding.',
  help_faq_q8:                  'How do I contact the seller directly?',
  help_faq_a8:                  'Once your order is confirmed, the seller\'s contact details appear on the Order Details screen.',

  help_contact:                 'Contact Support',
  help_call:                    'Call Us',
  help_call_hours:              'Mon–Sat, 9 AM – 6 PM',
  help_whatsapp:                'WhatsApp',
  help_whatsapp_sub:            'Fastest response',
  help_email:                   'Email',
  help_email_sub:               'Reply within 24 hrs',

  help_guide:                   'Buyer Guide',
  help_guide_sub:               'Tips for ordering, tracking, and getting the best deals',
};

const TE: typeof EN = {
  settings_title:               'యాప్ సెట్టింగ్‌లు',

  settings_notifications:       'నోటిఫికేషన్లు',
  notif_order_updates:          'ఆర్డర్ స్థితి అప్‌డేట్లు',
  notif_order_updates_desc:     'ఆర్డర్ పెట్టబడింది → పంపబడింది → డెలివరీలో ఉంది → అందింది',
  notif_price_drops:            'ధర తగ్గింపు హెచ్చరికలు',
  notif_price_drops_desc:       'విష్‌లిస్ట్ వస్తువు ధర తగ్గినప్పుడు తెలపండి',
  notif_new_arrivals:           'దగ్గర్లో కొత్త వస్తువులు',
  notif_new_arrivals_desc:      'మీ ప్రాంతంలోని విక్రేతల నుండి తాజా ఉత్పత్తులు',
  notif_promos:                 'ఆఫర్లు & ప్రమోషన్లు',
  notif_promos_desc:            'తగ్గింపులు, క్యాష్‌బ్యాక్ మరియు సీజనల్ డీల్స్',

  settings_display:             'డిస్‌ప్లే',
  display_language:             'భాష',
  display_dark_mode:            'రూపం',
  display_dark_mode_desc:       'మీకు నచ్చిన థీమ్ ఎంచుకోండి',
  theme_light:                  'వెలుతురు',
  theme_dark:                   'చీకటి',
  theme_system:                 'సిస్టమ్',

  settings_shopping:            'షాపింగ్ ప్రాధాన్యతలు',
  shop_wallet_auto:             'వాలెట్ స్వయంచాలకంగా వర్తించు',
  shop_wallet_auto_desc:        'చెక్‌అవుట్‌లో వాలెట్ బ్యాలెన్స్ స్వయంచాలకంగా ఉపయోగించు',
  shop_gst_inclusive:           'GST తో ధర చూపించు',
  shop_gst_inclusive_desc:      'అన్ని పన్నులతో సహా తుది ధర చూపించు',

  settings_privacy:             'గోప్యత & చట్టపరమైనది',
  privacy_policy:               'గోప్యతా విధానం',
  terms_of_service:             'సేవా నిబంధనలు',
  data_permissions:             'డేటా & అనుమతులు',

  settings_about:               'గురించి',
  about_version:                'యాప్ వెర్షన్',
  about_rate_app:               'HarvestConnect రేట్ చేయండి',
  about_rate_app_desc:          'యాప్ నచ్చిందా? మాకు రివ్యూ ఇవ్వండి',

  // Help & Support
  help_title:                   'సహాయం & మద్దతు',
  help_hint:                    'సాధారణ ప్రశ్నలు క్రింద ఉన్నాయి. విస్తరించడానికి నొక్కండి.',

  help_faqs:                    'తరచుగా అడిగే ప్రశ్నలు',
  help_faq_q1:                  'నా ఆర్డర్‌ని ఎలా ట్రాక్ చేయాలి?',
  help_faq_a1:                  'Orders టాబ్ → మీ ఆర్డర్ నొక్కండి → విక్రేత పంపించినది నుండి డెలివరీ వరకు రియల్-టైమ్ స్థితి కనిపిస్తుంది.',
  help_faq_q2:                  'ఆర్డర్ ఎలా రద్దు చేయాలి?',
  help_faq_a2:                  'విక్రేత పంపించే ముందు రద్దు చేయవచ్చు. Orders → ఆర్డర్ నొక్కి → Cancel చేయండి.',
  help_faq_q3:                  'ఏ పేమెంట్ పద్ధతులు అందుబాటులో ఉన్నాయి?',
  help_faq_a3:                  'UPI (GPay, PhonePe, Paytm), డెబిట్/క్రెడిట్ కార్డులు మరియు Harvest Wallet స్వీకరిస్తాం.',
  help_faq_q4:                  'Harvest Wallet ఎలా పని చేస్తుంది?',
  help_faq_a4:                  'రీఫండ్లు మరియు రెఫరల్ రివార్డుల నుండి వాలెట్ నిండుతుంది. చెక్‌అవుట్‌లో పూర్తి లేదా పాక్షిక పేమెంట్ చేయవచ్చు.',
  help_faq_q5:                  'రీఫండ్ ఎలా అడగాలి?',
  help_faq_a5:                  'తప్పుడు లేదా దెబ్బతిన్న వస్తువు వస్తే, డెలివరీ తర్వాత 24 గంటల్లో Orders → Issue with Order ద్వారా అభ్యర్థన చేయండి.',
  help_faq_q6:                  'ఆర్డర్ తర్వాత చిరునామా మార్చవచ్చా?',
  help_faq_a6:                  'విక్రేత ఆర్డర్ స్వీకరించే ముందు మార్చవచ్చు. వేగంగా WhatsApp ద్వారా సంప్రదించండి.',
  help_faq_q7:                  'HarvestConnect ఎక్కడ డెలివరీ చేస్తుంది?',
  help_faq_a7:                  'ప్రస్తుతం నిజామాబాద్, ఆర్మూర్, బాన్సువాడ, కామారెడ్డి మరియు చుట్టుపక్కల మండలాలలో సేవలు అందిస్తున్నాం.',
  help_faq_q8:                  'విక్రేతను నేరుగా సంప్రదించడం ఎలా?',
  help_faq_a8:                  'ఆర్డర్ నిర్ధారించబడిన తర్వాత, Order Details స్క్రీన్‌లో విక్రేత సంప్రదింపు వివరాలు కనిపిస్తాయి.',

  help_contact:                 'మద్దతు సంప్రదించండి',
  help_call:                    'కాల్ చేయండి',
  help_call_hours:              'సోమ–శని, ఉ. 9 – సా. 6',
  help_whatsapp:                'WhatsApp',
  help_whatsapp_sub:            'వేగవంతమైన సమాధానం',
  help_email:                   'ఇమెయిల్',
  help_email_sub:               '24 గంటల్లో సమాధానం',

  help_guide:                   'కొనుగోలుదారు గైడ్',
  help_guide_sub:               'ఆర్డర్లు, ట్రాకింగ్ మరియు మంచి డీల్స్ కోసం చిట్కాలు',
};

const HI: typeof EN = {
  settings_title:               'ऐप सेटिंग्स',

  settings_notifications:       'सूचनाएं',
  notif_order_updates:          'ऑर्डर स्टेटस अपडेट',
  notif_order_updates_desc:     'दिया गया → भेजा गया → डिलीवरी में → पहुंचा',
  notif_price_drops:            'कीमत गिरने की सूचना',
  notif_price_drops_desc:       'विशलिस्ट आइटम की कीमत गिरने पर अलर्ट',
  notif_new_arrivals:           'पास में नई चीज़ें',
  notif_new_arrivals_desc:      'आपके इलाके के विक्रेताओं के ताज़े उत्पाद',
  notif_promos:                 'ऑफर और प्रमोशन',
  notif_promos_desc:            'छूट, कैशबैक और सीज़नल डील्स',

  settings_display:             'डिस्प्ले',
  display_language:             'भाषा',
  display_dark_mode:            'रूप',
  display_dark_mode_desc:       'अपना पसंदीदा थीम चुनें',
  theme_light:                  'लाइट',
  theme_dark:                   'डार्क',
  theme_system:                 'सिस्टम',

  settings_shopping:            'शॉपिंग प्राथमिकताएं',
  shop_wallet_auto:             'वॉलेट अपने आप लगाएं',
  shop_wallet_auto_desc:        'चेकआउट पर वॉलेट बैलेंस अपने आप इस्तेमाल करें',
  shop_gst_inclusive:           'GST सहित कीमत दिखाएं',
  shop_gst_inclusive_desc:      'सभी करों सहित अंतिम कीमत दिखाएं',

  settings_privacy:             'गोपनीयता और कानूनी',
  privacy_policy:               'गोपनीयता नीति',
  terms_of_service:             'सेवा की शर्तें',
  data_permissions:             'डेटा और अनुमतियां',

  settings_about:               'ऐप के बारे में',
  about_version:                'ऐप वर्शन',
  about_rate_app:               'HarvestConnect को रेट करें',
  about_rate_app_desc:          'ऐप पसंद आया? हमें रिव्यू दें',

  // Help & Support
  help_title:                   'सहायता और समर्थन',
  help_hint:                    'नीचे सामान्य प्रश्न हैं। विस्तार के लिए टैप करें।',

  help_faqs:                    'अक्सर पूछे जाने वाले प्रश्न',
  help_faq_q1:                  'मैं अपना ऑर्डर कैसे ट्रैक करूं?',
  help_faq_a1:                  'Orders टैब → अपना ऑर्डर टैप करें → डिस्पैच से डिलीवरी तक रियल-टाइम स्टेटस देखें।',
  help_faq_q2:                  'ऑर्डर कैसे रद्द करें?',
  help_faq_a2:                  'विक्रेता के भेजने से पहले रद्द किया जा सकता है। Orders → ऑर्डर टैप करें → Cancel करें।',
  help_faq_q3:                  'कौन से पेमेंट तरीके उपलब्ध हैं?',
  help_faq_a3:                  'UPI (GPay, PhonePe, Paytm), डेबिट/क्रेडिट कार्ड और Harvest Wallet स्वीकार किए जाते हैं।',
  help_faq_q4:                  'Harvest Wallet कैसे काम करता है?',
  help_faq_a4:                  'रिफंड और रेफरल रिवॉर्ड से वॉलेट में पैसे आते हैं। चेकआउट पर पूरा या आंशिक भुगतान कर सकते हैं।',
  help_faq_q5:                  'रिफंड कैसे मांगें?',
  help_faq_a5:                  'गलत या क्षतिग्रस्त सामान मिलने पर डिलीवरी के 24 घंटे के भीतर Orders → Issue with Order से अनुरोध करें।',
  help_faq_q6:                  'ऑर्डर के बाद डिलीवरी पता बदल सकते हैं?',
  help_faq_a6:                  'विक्रेता के स्वीकार करने से पहले बदला जा सकता है। WhatsApp पर तुरंत संपर्क करें।',
  help_faq_q7:                  'HarvestConnect कहाँ डिलीवरी करता है?',
  help_faq_a7:                  'फिलहाल निज़ामाबाद, आर्मूर, बंसवाड़ा, कामारेड्डी और आसपास के क्षेत्रों में सेवा उपलब्ध है।',
  help_faq_q8:                  'विक्रेता से सीधे कैसे संपर्क करें?',
  help_faq_a8:                  'ऑर्डर कन्फर्म होने के बाद Order Details स्क्रीन पर विक्रेता का संपर्क दिखेगा।',

  help_contact:                 'सहायता से संपर्क करें',
  help_call:                    'कॉल करें',
  help_call_hours:              'सोम–शनि, सुबह 9 – शाम 6',
  help_whatsapp:                'WhatsApp',
  help_whatsapp_sub:            'सबसे तेज़ जवाब',
  help_email:                   'ईमेल',
  help_email_sub:               '24 घंटे में जवाब',

  help_guide:                   'खरीदार गाइड',
  help_guide_sub:               'ऑर्डर, ट्रैकिंग और बेहतरीन डील्स के टिप्स',
};

const TRANSLATIONS: Record<Language, typeof EN> = { en: EN, te: TE, hi: HI };

export type TranslationKey = keyof typeof EN;

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'en' || stored === 'te' || stored === 'hi') {
          setLanguageState(stored);
        }
      })
      .catch(() => {});
  }, []);

  function setLanguage(l: Language) {
    setLanguageState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }

  function t(key: TranslationKey): string {
    return TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
