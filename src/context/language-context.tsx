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
