// Comprehensive Global Country Database
// Contains all recognized countries with localization metadata

export interface Country {
  code: string
  name: string
  flag: string
  currency: string
  currencySymbol: string
  currencyCode: string
  language: string
  languageCode: string
  timezone: string
  callingCode: string
  paymentGateways: string[]
}

export interface State {
  code: string
  name: string
  countryCode: string
  cities?: string[]
}

export interface LocalizationData {
  country: Country
  states: State[]
}

// Complete country database
export const countries: Country[] = [
  // Africa
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN", currencySymbol: "₦", currencyCode: "NGN", language: "English", languageCode: "en", timezone: "Africa/Lagos", callingCode: "+234", paymentGateways: ["paystack", "flutterwave"] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS", currencySymbol: "₵", currencyCode: "GHS", language: "English", languageCode: "en", timezone: "Africa/Accra", callingCode: "+233", paymentGateways: ["paystack", "flutterwave"] },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES", currencySymbol: "KSh", currencyCode: "KES", language: "English", languageCode: "en", timezone: "Africa/Nairobi", callingCode: "+254", paymentGateways: ["paystack", "mpesa"] },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", currencySymbol: "R", currencyCode: "ZAR", language: "English", languageCode: "en", timezone: "Africa/Johannesburg", callingCode: "+27", paymentGateways: ["paystack", "stripe"] },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "EGP", currencySymbol: "E£", currencyCode: "EGP", language: "Arabic", languageCode: "ar", timezone: "Africa/Cairo", callingCode: "+20", paymentGateways: ["paystack", "stripe"] },
  { code: "MA", name: "Morocco", flag: "🇲🇦", currency: "MAD", currencySymbol: "د.م.", currencyCode: "MAD", language: "Arabic", languageCode: "ar", timezone: "Africa/Casablanca", callingCode: "+212", paymentGateways: ["stripe", "paypal"] },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", currency: "TZS", currencySymbol: "TSh", currencyCode: "TZS", language: "English", languageCode: "en", timezone: "Africa/Dar_es_Salaam", callingCode: "+255", paymentGateways: ["mpesa"] },
  { code: "UG", name: "Uganda", flag: "🇺🇬", currency: "UGX", currencySymbol: "USh", currencyCode: "UGX", language: "English", languageCode: "en", timezone: "Africa/Kampala", callingCode: "+256", paymentGateways: ["mpesa"] },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", currency: "ETB", currencySymbol: "Br", currencyCode: "ETB", language: "Amharic", languageCode: "am", timezone: "Africa/Addis_Ababa", callingCode: "+251", paymentGateways: ["stripe"] },
  { code: "SN", name: "Senegal", flag: "🇸🇳", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Dakar", callingCode: "+221", paymentGateways: ["stripe", "paypal"] },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Abidjan", callingCode: "+225", paymentGateways: ["stripe", "orange_money"] },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "English", languageCode: "en", timezone: "Africa/Douala", callingCode: "+237", paymentGateways: ["stripe"] },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", currency: "RWF", currencySymbol: "FRw", currencyCode: "RWF", language: "English", languageCode: "en", timezone: "Africa/Kigali", callingCode: "+250", paymentGateways: ["stripe"] },
  { code: "BW", name: "Botswana", flag: "🇧🇼", currency: "BWP", currencySymbol: "P", currencyCode: "BWP", language: "English", languageCode: "en", timezone: "Africa/Gaborone", callingCode: "+267", paymentGateways: ["stripe"] },
  { code: "NA", name: "Namibia", flag: "🇳🇦", currency: "NAD", currencySymbol: "$", currencyCode: "NAD", language: "English", languageCode: "en", timezone: "Africa/Windhoek", callingCode: "+264", paymentGateways: ["stripe"] },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", currency: "ZMW", currencySymbol: "ZK", currencyCode: "ZMW", language: "English", languageCode: "en", timezone: "Africa/Lusaka", callingCode: "+260", paymentGateways: ["stripe"] },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", currency: "ZWL", currencySymbol: "$", currencyCode: "ZWL", language: "English", languageCode: "en", timezone: "Africa/Harare", callingCode: "+263", paymentGateways: ["stripe"] },
  { code: "AO", name: "Angola", flag: "🇦🇴", currency: "AOA", currencySymbol: "Kz", currencyCode: "AOA", language: "Portuguese", languageCode: "pt", timezone: "Africa/Luanda", callingCode: "+244", paymentGateways: ["stripe"] },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", currency: "MZN", currencySymbol: "MT", currencyCode: "MZN", language: "Portuguese", languageCode: "pt", timezone: "Africa/Maputo", callingCode: "+258", paymentGateways: ["stripe"] },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", currency: "TND", currencySymbol: "د.ت", currencyCode: "TND", language: "Arabic", languageCode: "ar", timezone: "Africa/Tunis", callingCode: "+216", paymentGateways: ["stripe"] },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", currency: "DZD", currencySymbol: "د.ج", currencyCode: "DZD", language: "Arabic", languageCode: "ar", timezone: "Africa/Algiers", callingCode: "+213", paymentGateways: ["stripe"] },
  { code: "LY", name: "Libya", flag: "🇱🇾", currency: "LYD", currencySymbol: "ل.د", currencyCode: "LYD", language: "Arabic", languageCode: "ar", timezone: "Africa/Tripoli", callingCode: "+218", paymentGateways: ["stripe"] },
  { code: "SD", name: "Sudan", flag: "🇸🇩", currency: "SDG", currencySymbol: "ج.س.", currencyCode: "SDG", language: "Arabic", languageCode: "ar", timezone: "Africa/Khartoum", callingCode: "+249", paymentGateways: ["stripe"] },
  { code: "NG", name: "Niger", flag: "🇳🇪", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Niamey", callingCode: "+227", paymentGateways: ["stripe"] },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Ouagadougou", callingCode: "+226", paymentGateways: ["stripe"] },
  { code: "ML", name: "Mali", flag: "🇲🇱", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Bamako", callingCode: "+223", paymentGateways: ["stripe"] },
  { code: "NE", name: "Niger", flag: "🇳🇪", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Niamey", callingCode: "+227", paymentGateways: ["stripe"] },
  { code: "TG", name: "Togo", flag: "🇹🇬", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Lome", callingCode: "+228", paymentGateways: ["stripe"] },
  { code: "BJ", name: "Benin", flag: "🇧🇯", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "French", languageCode: "fr", timezone: "Africa/Porto-Novo", callingCode: "+229", paymentGateways: ["stripe"] },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", currency: "SLL", currencySymbol: "Le", currencyCode: "SLL", language: "English", languageCode: "en", timezone: "Africa/Freetown", callingCode: "+232", paymentGateways: ["stripe"] },
  { code: "LR", name: "Liberia", flag: "🇱🇷", currency: "LRD", currencySymbol: "$", currencyCode: "LRD", language: "English", languageCode: "en", timezone: "Africa/Monrovia", callingCode: "+231", paymentGateways: ["stripe"] },
  { code: "GM", name: "Gambia", flag: "🇬🇲", currency: "GMD", currencySymbol: "D", currencyCode: "GMD", language: "English", languageCode: "en", timezone: "Africa/Banjul", callingCode: "+220", paymentGateways: ["stripe"] },
  { code: "GN", name: "Guinea", flag: "🇬🇳", currency: "GNF", currencySymbol: "FG", currencyCode: "GNF", language: "French", languageCode: "fr", timezone: "Africa/Conakry", callingCode: "+224", paymentGateways: ["stripe"] },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", currency: "XOF", currencySymbol: "CFA", currencyCode: "XOF", language: "Portuguese", languageCode: "pt", timezone: "Africa/Bissau", callingCode: "+245", paymentGateways: ["stripe"] },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", currency: "CVE", currencySymbol: "$", currencyCode: "CVE", language: "Portuguese", languageCode: "pt", timezone: "Atlantic/Cape_Verde", callingCode: "+238", paymentGateways: ["stripe"] },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", currency: "SCR", currencySymbol: "₨", currencyCode: "SCR", language: "English", languageCode: "en", timezone: "Indian/Mahe", callingCode: "+248", paymentGateways: ["stripe"] },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", currency: "MUR", currencySymbol: "₨", currencyCode: "MUR", language: "English", languageCode: "en", timezone: "Indian/Mauritius", callingCode: "+230", paymentGateways: ["stripe"] },
  { code: "RE", name: "Réunion", flag: "🇷🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "French", languageCode: "fr", timezone: "Indian/Reunion", callingCode: "+262", paymentGateways: ["stripe", "paypal"] },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", currency: "MGA", currencySymbol: "Ar", currencyCode: "MGA", language: "French", languageCode: "fr", timezone: "Indian/Antananarivo", callingCode: "+261", paymentGateways: ["stripe"] },
  { code: "MW", name: "Malawi", flag: "🇲🇼", currency: "MWK", currencySymbol: "MK", currencyCode: "MWK", language: "English", languageCode: "en", timezone: "Africa/Blantyre", callingCode: "+265", paymentGateways: ["stripe"] },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", currency: "DJF", currencySymbol: "Fdj", currencyCode: "DJF", language: "French", languageCode: "fr", timezone: "Africa/Djibouti", callingCode: "+253", paymentGateways: ["stripe"] },
  { code: "SO", name: "Somalia", flag: "🇸🇴", currency: "SOS", currencySymbol: "S", currencyCode: "SOS", language: "Somali", languageCode: "so", timezone: "Africa/Mogadishu", callingCode: "+252", paymentGateways: ["stripe"] },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", currency: "ERN", currencySymbol: "Nfk", currencyCode: "ERN", language: "Tigrinya", languageCode: "ti", timezone: "Africa/Asmara", callingCode: "+291", paymentGateways: ["stripe"] },
  { code: "SS", name: "South Sudan", flag: "🇸🇸", currency: "SSP", currencySymbol: "£", currencyCode: "SSP", language: "English", languageCode: "en", timezone: "Africa/Juba", callingCode: "+211", paymentGateways: ["stripe"] },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "French", languageCode: "fr", timezone: "Africa/Bangui", callingCode: "+236", paymentGateways: ["stripe"] },
  { code: "TD", name: "Chad", flag: "🇹🇩", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "French", languageCode: "fr", timezone: "Africa/Ndjamena", callingCode: "+235", paymentGateways: ["stripe"] },
  { code: "CG", name: "Congo", flag: "🇨🇬", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "French", languageCode: "fr", timezone: "Africa/Brazzaville", callingCode: "+242", paymentGateways: ["stripe"] },
  { code: "CD", name: "DR Congo", flag: "🇨🇩", currency: "CDF", currencySymbol: "FC", currencyCode: "CDF", language: "French", languageCode: "fr", timezone: "Africa/Kinshasa", callingCode: "+243", paymentGateways: ["stripe"] },
  { code: "GA", name: "Gabon", flag: "🇬🇦", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "French", languageCode: "fr", timezone: "Africa/Libreville", callingCode: "+241", paymentGateways: ["stripe"] },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", currency: "XAF", currencySymbol: "FCFA", currencyCode: "XAF", language: "Spanish", languageCode: "es", timezone: "Africa/Malabo", callingCode: "+240", paymentGateways: ["stripe"] },
  
  // Americas
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "English", languageCode: "en", timezone: "America/New_York", callingCode: "+1", paymentGateways: ["stripe", "paypal"] },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencySymbol: "$", currencyCode: "CAD", language: "English", languageCode: "en", timezone: "America/Toronto", callingCode: "+1", paymentGateways: ["stripe", "paypal"] },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN", currencySymbol: "$", currencyCode: "MXN", language: "Spanish", languageCode: "es", timezone: "America/Mexico_City", callingCode: "+52", paymentGateways: ["stripe", "paypal"] },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", currencyCode: "BRL", language: "Portuguese", languageCode: "pt", timezone: "America/Sao_Paulo", callingCode: "+55", paymentGateways: ["stripe", "pagseguro"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS", currencySymbol: "$", currencyCode: "ARS", language: "Spanish", languageCode: "es", timezone: "America/Buenos_Aires", callingCode: "+54", paymentGateways: ["stripe", "mercadopago"] },
  { code: "CO", name: "Colombia", flag: "🇨🇴", currency: "COP", currencySymbol: "$", currencyCode: "COP", language: "Spanish", languageCode: "es", timezone: "America/Bogota", callingCode: "+57", paymentGateways: ["stripe", "payu"] },
  { code: "PE", name: "Peru", flag: "🇵🇪", currency: "PEN", currencySymbol: "S/.", currencyCode: "PEN", language: "Spanish", languageCode: "es", timezone: "America/Lima", callingCode: "+51", paymentGateways: ["stripe", "culqi"] },
  { code: "CL", name: "Chile", flag: "🇨🇱", currency: "CLP", currencySymbol: "$", currencyCode: "CLP", language: "Spanish", languageCode: "es", timezone: "America/Santiago", callingCode: "+56", paymentGateways: ["stripe", "webpay"] },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", currency: "VES", currencySymbol: "Bs", currencyCode: "VES", language: "Spanish", languageCode: "es", timezone: "America/Caracas", callingCode: "+58", paymentGateways: ["stripe"] },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "Spanish", languageCode: "es", timezone: "America/Guayaquil", callingCode: "+593", paymentGateways: ["stripe", "paypal"] },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", currency: "BOB", currencySymbol: "Bs.", currencyCode: "BOB", language: "Spanish", languageCode: "es", timezone: "America/La_Paz", callingCode: "+591", paymentGateways: ["stripe"] },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", currency: "PYG", currencySymbol: "₲", currencyCode: "PYG", language: "Spanish", languageCode: "es", timezone: "America/Asuncion", callingCode: "+595", paymentGateways: ["stripe"] },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", currency: "UYU", currencySymbol: "$", currencyCode: "UYU", language: "Spanish", languageCode: "es", timezone: "America/Montevideo", callingCode: "+598", paymentGateways: ["stripe", "mercadopago"] },
  { code: "GY", name: "Guyana", flag: "🇬🇾", currency: "GYD", currencySymbol: "$", currencyCode: "GYD", language: "English", languageCode: "en", timezone: "America/Guyana", callingCode: "+592", paymentGateways: ["stripe"] },
  { code: "SR", name: "Suriname", flag: "🇸🇷", currency: "SRD", currencySymbol: "$", currencyCode: "SRD", language: "Dutch", languageCode: "nl", timezone: "America/Paramaribo", callingCode: "+597", paymentGateways: ["stripe"] },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", currency: "TTD", currencySymbol: "$", currencyCode: "TTD", language: "English", languageCode: "en", timezone: "America/Port_of_Spain", callingCode: "+1", paymentGateways: ["stripe"] },
  { code: "BB", name: "Barbados", flag: "🇧🇧", currency: "BBD", currencySymbol: "$", currencyCode: "BBD", language: "English", languageCode: "en", timezone: "America/Barbados", callingCode: "+1", paymentGateways: ["stripe"] },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", currency: "BSD", currencySymbol: "$", currencyCode: "BSD", language: "English", languageCode: "en", timezone: "America/Nassau", callingCode: "+1", paymentGateways: ["stripe"] },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", currency: "JMD", currencySymbol: "$", currencyCode: "JMD", language: "English", languageCode: "en", timezone: "America/Jamaica", callingCode: "+1", paymentGateways: ["stripe"] },
  { code: "HT", name: "Haiti", flag: "🇭🇹", currency: "HTG", currencySymbol: "G", currencyCode: "HTG", language: "French", languageCode: "fr", timezone: "America/Port-au-Prince", callingCode: "+509", paymentGateways: ["stripe"] },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", currency: "DOP", currencySymbol: "$", currencyCode: "DOP", language: "Spanish", languageCode: "es", timezone: "America/Santo_Domingo", callingCode: "+1", paymentGateways: ["stripe"] },
  { code: "CU", name: "Cuba", flag: "🇨🇺", currency: "CUP", currencySymbol: "₱", currencyCode: "CUP", language: "Spanish", languageCode: "es", timezone: "America/Havana", callingCode: "+53", paymentGateways: [] },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "English", languageCode: "en", timezone: "America/Puerto_Rico", callingCode: "+1", paymentGateways: ["stripe", "paypal"] },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", currency: "CRC", currencySymbol: "₡", currencyCode: "CRC", language: "Spanish", languageCode: "es", timezone: "America/Costa_Rica", callingCode: "+506", paymentGateways: ["stripe"] },
  { code: "PA", name: "Panama", flag: "🇵🇦", currency: "PAB", currencySymbol: "B/.", currencyCode: "PAB", language: "Spanish", languageCode: "es", timezone: "America/Panama", callingCode: "+507", paymentGateways: ["stripe"] },
  { code: "HN", name: "Honduras", flag: "🇭🇳", currency: "HNL", currencySymbol: "L", currencyCode: "HNL", language: "Spanish", languageCode: "es", timezone: "America/Tegucigalpa", callingCode: "+504", paymentGateways: ["stripe"] },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", currency: "NIO", currencySymbol: "C$", currencyCode: "NIO", language: "Spanish", languageCode: "es", timezone: "America/Managua", callingCode: "+505", paymentGateways: ["stripe"] },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "Spanish", languageCode: "es", timezone: "America/El_Salvador", callingCode: "+503", paymentGateways: ["stripe", "paypal"] },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", currency: "GTQ", currencySymbol: "Q", currencyCode: "GTQ", language: "Spanish", languageCode: "es", timezone: "America/Guatemala", callingCode: "+502", paymentGateways: ["stripe"] },
  { code: "BZ", name: "Belize", flag: "🇧🇿", currency: "BZD", currencySymbol: "$", currencyCode: "BZD", language: "English", languageCode: "en", timezone: "America/Belize", callingCode: "+501", paymentGateways: ["stripe"] },
  
  // Europe
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", currencyCode: "GBP", language: "English", languageCode: "en", timezone: "Europe/London", callingCode: "+44", paymentGateways: ["stripe", "paypal"] },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "German", languageCode: "de", timezone: "Europe/Berlin", callingCode: "+49", paymentGateways: ["stripe", "paypal", "giropay"] },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "French", languageCode: "fr", timezone: "Europe/Paris", callingCode: "+33", paymentGateways: ["stripe", "paypal"] },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Italian", languageCode: "it", timezone: "Europe/Rome", callingCode: "+39", paymentGateways: ["stripe", "paypal"] },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Spanish", languageCode: "es", timezone: "Europe/Madrid", callingCode: "+34", paymentGateways: ["stripe", "paypal"] },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Dutch", languageCode: "nl", timezone: "Europe/Amsterdam", callingCode: "+31", paymentGateways: ["stripe", "paypal", "ideal"] },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Dutch", languageCode: "nl", timezone: "Europe/Brussels", callingCode: "+32", paymentGateways: ["stripe", "paypal"] },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF", currencySymbol: "CHF", currencyCode: "CHF", language: "German", languageCode: "de", timezone: "Europe/Zurich", callingCode: "+41", paymentGateways: ["stripe", "paypal"] },
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "German", languageCode: "de", timezone: "Europe/Vienna", callingCode: "+43", paymentGateways: ["stripe", "paypal"] },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "PLN", currencySymbol: "zł", currencyCode: "PLN", language: "Polish", languageCode: "pl", timezone: "Europe/Warsaw", callingCode: "+48", paymentGateways: ["stripe", "paypal", "blik"] },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr", currencyCode: "SEK", language: "Swedish", languageCode: "sv", timezone: "Europe/Stockholm", callingCode: "+46", paymentGateways: ["stripe", "paypal", "klarna"] },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr", currencyCode: "NOK", language: "Norwegian", languageCode: "no", timezone: "Europe/Oslo", callingCode: "+47", paymentGateways: ["stripe", "paypal"] },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr", currencyCode: "DKK", language: "Danish", languageCode: "da", timezone: "Europe/Copenhagen", callingCode: "+45", paymentGateways: ["stripe", "paypal", "mobilepay"] },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Finnish", languageCode: "fi", timezone: "Europe/Helsinki", callingCode: "+358", paymentGateways: ["stripe", "paypal"] },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "English", languageCode: "en", timezone: "Europe/Dublin", callingCode: "+353", paymentGateways: ["stripe", "paypal"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Portuguese", languageCode: "pt", timezone: "Europe/Lisbon", callingCode: "+351", paymentGateways: ["stripe", "paypal"] },
  { code: "GR", name: "Greece", flag: "🇬🇷", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Greek", languageCode: "el", timezone: "Europe/Athens", callingCode: "+30", paymentGateways: ["stripe", "paypal"] },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", currency: "CZK", currencySymbol: "Kč", currencyCode: "CZK", language: "Czech", languageCode: "cs", timezone: "Europe/Prague", callingCode: "+420", paymentGateways: ["stripe", "paypal"] },
  { code: "RO", name: "Romania", flag: "🇷🇴", currency: "RON", currencySymbol: "lei", currencyCode: "RON", language: "Romanian", languageCode: "ro", timezone: "Europe/Bucharest", callingCode: "+40", paymentGateways: ["stripe", "paypal"] },
  { code: "HU", name: "Hungary", flag: "🇭🇺", currency: "HUF", currencySymbol: "Ft", currencyCode: "HUF", language: "Hungarian", languageCode: "hu", timezone: "Europe/Budapest", callingCode: "+36", paymentGateways: ["stripe", "paypal"] },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", currency: "BGN", currencySymbol: "лв", currencyCode: "BGN", language: "Bulgarian", languageCode: "bg", timezone: "Europe/Sofia", callingCode: "+359", paymentGateways: ["stripe", "paypal"] },
  { code: "HR", name: "Croatia", flag: "🇭🇷", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Croatian", languageCode: "hr", timezone: "Europe/Zagreb", callingCode: "+385", paymentGateways: ["stripe", "paypal"] },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Slovak", languageCode: "sk", timezone: "Europe/Bratislava", callingCode: "+421", paymentGateways: ["stripe", "paypal"] },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Slovenian", languageCode: "sl", timezone: "Europe/Ljubljana", callingCode: "+386", paymentGateways: ["stripe", "paypal"] },
  { code: "EE", name: "Estonia", flag: "🇪🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Estonian", languageCode: "et", timezone: "Europe/Tallinn", callingCode: "+372", paymentGateways: ["stripe", "paypal"] },
  { code: "LV", name: "Latvia", flag: "🇱🇻", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Latvian", languageCode: "lv", timezone: "Europe/Riga", callingCode: "+371", paymentGateways: ["stripe", "paypal"] },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Lithuanian", languageCode: "lt", timezone: "Europe/Vilnius", callingCode: "+370", paymentGateways: ["stripe", "paypal"] },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", currency: "UAH", currencySymbol: "₴", currencyCode: "UAH", language: "Ukrainian", languageCode: "uk", timezone: "Europe/Kiev", callingCode: "+380", paymentGateways: ["stripe", "paypal", "liqpay"] },
  { code: "BY", name: "Belarus", flag: "🇧🇾", currency: "BYN", currencySymbol: "Br", currencyCode: "BYN", language: "Belarusian", languageCode: "be", timezone: "Europe/Minsk", callingCode: "+375", paymentGateways: ["stripe"] },
  { code: "MD", name: "Moldova", flag: "🇲🇩", currency: "MDL", currencySymbol: "L", currencyCode: "MDL", language: "Romanian", languageCode: "ro", timezone: "Europe/Chisinau", callingCode: "+373", paymentGateways: ["stripe"] },
  { code: "RS", name: "Serbia", flag: "🇷🇸", currency: "RSD", currencySymbol: "дин", currencyCode: "RSD", language: "Serbian", languageCode: "sr", timezone: "Europe/Belgrade", callingCode: "+381", paymentGateways: ["stripe"] },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", currency: "BAM", currencySymbol: "KM", currencyCode: "BAM", language: "Bosnian", languageCode: "bs", timezone: "Europe/Sarajevo", callingCode: "+387", paymentGateways: ["stripe"] },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Montenegrin", languageCode: "me", timezone: "Europe/Podgorica", callingCode: "+382", paymentGateways: ["stripe"] },
  { code: "AL", name: "Albania", flag: "🇦🇱", currency: "ALL", currencySymbol: "L", currencyCode: "ALL", language: "Albanian", languageCode: "sq", timezone: "Europe/Tirane", callingCode: "+355", paymentGateways: ["stripe"] },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", currency: "MKD", currencySymbol: "ден", currencyCode: "MKD", language: "Macedonian", languageCode: "mk", timezone: "Europe/Skopje", callingCode: "+389", paymentGateways: ["stripe"] },
  { code: "XK", name: "Kosovo", flag: "🇽🇰", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Albanian", languageCode: "sq", timezone: "Europe/Prague", callingCode: "+383", paymentGateways: ["stripe"] },
  { code: "IS", name: "Iceland", flag: "🇮🇸", currency: "ISK", currencySymbol: "kr", currencyCode: "ISK", language: "Icelandic", languageCode: "is", timezone: "Atlantic/Reykjavik", callingCode: "+354", paymentGateways: ["stripe", "paypal"] },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "French", languageCode: "fr", timezone: "Europe/Luxembourg", callingCode: "+352", paymentGateways: ["stripe", "paypal"] },
  { code: "MT", name: "Malta", flag: "🇲🇹", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "English", languageCode: "en", timezone: "Europe/Malta", callingCode: "+356", paymentGateways: ["stripe", "paypal"] },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Greek", languageCode: "el", timezone: "Asia/Nicosia", callingCode: "+357", paymentGateways: ["stripe", "paypal"] },
  { code: "AD", name: "Andorra", flag: "🇦🇩", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Catalan", languageCode: "ca", timezone: "Europe/Andorra", callingCode: "+376", paymentGateways: ["stripe", "paypal"] },
  { code: "MC", name: "Monaco", flag: "🇲🇨", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "French", languageCode: "fr", timezone: "Europe/Monaco", callingCode: "+377", paymentGateways: ["stripe", "paypal"] },
  { code: "SM", name: "San Marino", flag: "🇸🇲", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Italian", languageCode: "it", timezone: "Europe/San_Marino", callingCode: "+378", paymentGateways: ["stripe", "paypal"] },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", currency: "EUR", currencySymbol: "€", currencyCode: "EUR", language: "Italian", languageCode: "it", timezone: "Europe/Vatican", callingCode: "+379", paymentGateways: ["stripe", "paypal"] },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", currency: "CHF", currencySymbol: "CHF", currencyCode: "CHF", language: "German", languageCode: "de", timezone: "Europe/Vaduz", callingCode: "+423", paymentGateways: ["stripe", "paypal"] },
  { code: "GE", name: "Georgia", flag: "🇬🇪", currency: "GEL", currencySymbol: "₾", currencyCode: "GEL", language: "Georgian", languageCode: "ka", timezone: "Asia/Tbilisi", callingCode: "+995", paymentGateways: ["stripe"] },
  { code: "AM", name: "Armenia", flag: "🇦🇲", currency: "AMD", currencySymbol: "֏", currencyCode: "AMD", language: "Armenian", languageCode: "hy", timezone: "Asia/Yerevan", callingCode: "+374", paymentGateways: ["stripe"] },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", currency: "AZN", currencySymbol: "₼", currencyCode: "AZN", language: "Azerbaijani", languageCode: "az", timezone: "Asia/Baku", callingCode: "+994", paymentGateways: ["stripe"] },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY", currencySymbol: "₺", currencyCode: "TRY", language: "Turkish", languageCode: "tr", timezone: "Europe/Istanbul", callingCode: "+90", paymentGateways: ["stripe", "paypal"] },
  { code: "RU", name: "Russia", flag: "🇷🇺", currency: "RUB", currencySymbol: "₽", currencyCode: "RUB", language: "Russian", languageCode: "ru", timezone: "Europe/Moscow", callingCode: "+7", paymentGateways: ["stripe"] },
  
  // Asia
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", currencySymbol: "¥", currencyCode: "CNY", language: "Chinese", languageCode: "zh", timezone: "Asia/Shanghai", callingCode: "+86", paymentGateways: ["alipay", "wechat", "stripe"] },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥", currencyCode: "JPY", language: "Japanese", languageCode: "ja", timezone: "Asia/Tokyo", callingCode: "+81", paymentGateways: ["stripe", "paypal"] },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", currencySymbol: "₹", currencyCode: "INR", language: "Hindi", languageCode: "hi", timezone: "Asia/Kolkata", callingCode: "+91", paymentGateways: ["razorpay", "paystack", "stripe"] },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", currencyCode: "KRW", language: "Korean", languageCode: "ko", timezone: "Asia/Seoul", callingCode: "+82", paymentGateways: ["stripe", "paypal"] },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", currencySymbol: "$", currencyCode: "SGD", language: "English", languageCode: "en", timezone: "Asia/Singapore", callingCode: "+65", paymentGateways: ["stripe", "paypal", "grabpay"] },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "MYR", currencySymbol: "RM", currencyCode: "MYR", language: "Malay", languageCode: "ms", timezone: "Asia/Kuala_Lumpur", callingCode: "+60", paymentGateways: ["stripe", "touchngo"] },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "THB", currencySymbol: "฿", currencyCode: "THB", language: "Thai", languageCode: "th", timezone: "Asia/Bangkok", callingCode: "+66", paymentGateways: ["stripe", "promptpay"] },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "IDR", currencySymbol: "Rp", currencyCode: "IDR", language: "Indonesian", languageCode: "id", timezone: "Asia/Jakarta", callingCode: "+62", paymentGateways: ["stripe", "gopay", "ovo"] },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP", currencySymbol: "₱", currencyCode: "PHP", language: "English", languageCode: "en", timezone: "Asia/Manila", callingCode: "+63", paymentGateways: ["stripe", "gcash"] },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "VND", currencySymbol: "₫", currencyCode: "VND", language: "Vietnamese", languageCode: "vi", timezone: "Asia/Ho_Chi_Minh", callingCode: "+84", paymentGateways: ["stripe", "vnpay"] },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR", currencySymbol: "₨", currencyCode: "PKR", language: "Urdu", languageCode: "ur", timezone: "Asia/Karachi", callingCode: "+92", paymentGateways: ["stripe", "jazzcash"] },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT", currencySymbol: "৳", currencyCode: "BDT", language: "Bengali", languageCode: "bn", timezone: "Asia/Dhaka", callingCode: "+880", paymentGateways: ["stripe", "bkash"] },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", currency: "AED", currencySymbol: "د.إ", currencyCode: "AED", language: "Arabic", languageCode: "ar", timezone: "Asia/Dubai", callingCode: "+971", paymentGateways: ["stripe", "paypal"] },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", currencySymbol: "﷼", currencyCode: "SAR", language: "Arabic", languageCode: "ar", timezone: "Asia/Riyadh", callingCode: "+966", paymentGateways: ["stripe", "mada"] },
  { code: "IL", name: "Israel", flag: "🇮🇱", currency: "ILS", currencySymbol: "₪", currencyCode: "ILS", language: "Hebrew", languageCode: "he", timezone: "Asia/Jerusalem", callingCode: "+972", paymentGateways: ["stripe", "paypal"] },
  { code: "QA", name: "Qatar", flag: "🇶🇦", currency: "QAR", currencySymbol: "ر.ق", currencyCode: "QAR", language: "Arabic", languageCode: "ar", timezone: "Asia/Qatar", callingCode: "+974", paymentGateways: ["stripe"] },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", currency: "KWD", currencySymbol: "د.ك", currencyCode: "KWD", language: "Arabic", languageCode: "ar", timezone: "Asia/Kuwait", callingCode: "+965", paymentGateways: ["stripe"] },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", currency: "BHD", currencySymbol: ".د.ب", currencyCode: "BHD", language: "Arabic", languageCode: "ar", timezone: "Asia/Bahrain", callingCode: "+973", paymentGateways: ["stripe"] },
  { code: "OM", name: "Oman", flag: "🇴🇲", currency: "OMR", currencySymbol: "ر.ع.", currencyCode: "OMR", language: "Arabic", languageCode: "ar", timezone: "Asia/Muscat", callingCode: "+968", paymentGateways: ["stripe"] },
  { code: "JO", name: "Jordan", flag: "🇯🇴", currency: "JOD", currencySymbol: "د.ا", currencyCode: "JOD", language: "Arabic", languageCode: "ar", timezone: "Asia/Amman", callingCode: "+962", paymentGateways: ["stripe"] },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", currency: "LBP", currencySymbol: "ل.ل", currencyCode: "LBP", language: "Arabic", languageCode: "ar", timezone: "Asia/Beirut", callingCode: "+961", paymentGateways: ["stripe"] },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", currency: "IQD", currencySymbol: "ع.د", currencyCode: "IQD", language: "Arabic", languageCode: "ar", timezone: "Asia/Baghdad", callingCode: "+964", paymentGateways: [] },
  { code: "IR", name: "Iran", flag: "🇮🇷", currency: "IRR", currencySymbol: "﷼", currencyCode: "IRR", language: "Persian", languageCode: "fa", timezone: "Asia/Tehran", callingCode: "+98", paymentGateways: [] },
  { code: "SY", name: "Syria", flag: "🇸🇾", currency: "SYP", currencySymbol: "£", currencyCode: "SYP", language: "Arabic", languageCode: "ar", timezone: "Asia/Damascus", callingCode: "+963", paymentGateways: [] },
  { code: "YE", name: "Yemen", flag: "🇾🇪", currency: "YER", currencySymbol: "﷼", currencyCode: "YER", language: "Arabic", languageCode: "ar", timezone: "Asia/Aden", callingCode: "+967", paymentGateways: [] },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", currency: "AFN", currencySymbol: "؋", currencyCode: "AFN", language: "Pashto", languageCode: "ps", timezone: "Asia/Kabul", callingCode: "+93", paymentGateways: [] },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", currency: "LKR", currencySymbol: "Rs", currencyCode: "LKR", language: "Sinhala", languageCode: "si", timezone: "Asia/Colombo", callingCode: "+94", paymentGateways: ["stripe"] },
  { code: "NP", name: "Nepal", flag: "🇳🇵", currency: "NPR", currencySymbol: "रू", currencyCode: "NPR", language: "Nepali", languageCode: "ne", timezone: "Asia/Kathmandu", callingCode: "+977", paymentGateways: ["stripe"] },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", currency: "BTN", currencySymbol: "Nu.", currencyCode: "BTN", language: "Dzongkha", languageCode: "dz", timezone: "Asia/Thimphu", callingCode: "+975", paymentGateways: ["stripe"] },
  { code: "MV", name: "Maldives", flag: "🇲🇻", currency: "MVR", currencySymbol: "Rf", currencyCode: "MVR", language: "Dhivehi", languageCode: "dv", timezone: "Indian/Maldives", callingCode: "+960", paymentGateways: ["stripe"] },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", currency: "MMK", currencySymbol: "K", currencyCode: "MMK", language: "Burmese", languageCode: "my", timezone: "Asia/Yangon", callingCode: "+95", paymentGateways: ["stripe"] },
  { code: "LA", name: "Laos", flag: "🇱🇦", currency: "LAK", currencySymbol: "₭", currencyCode: "LAK", language: "Lao", languageCode: "lo", timezone: "Asia/Vientiane", callingCode: "+856", paymentGateways: ["stripe"] },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", currency: "KHR", currencySymbol: "៛", currencyCode: "KHR", language: "Khmer", languageCode: "km", timezone: "Asia/Phnom_Penh", callingCode: "+855", paymentGateways: ["stripe", "wing"] },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", currency: "MNT", currencySymbol: "₮", currencyCode: "MNT", language: "Mongolian", languageCode: "mn", timezone: "Asia/Ulaanbaatar", callingCode: "+976", paymentGateways: ["stripe"] },
  { code: "KP", name: "North Korea", flag: "🇰🇵", currency: "KPW", currencySymbol: "₩", currencyCode: "KPW", language: "Korean", languageCode: "ko", timezone: "Asia/Pyongyang", callingCode: "+850", paymentGateways: [] },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", currency: "TWD", currencySymbol: "NT$", currencyCode: "TWD", language: "Chinese", languageCode: "zh", timezone: "Asia/Taipei", callingCode: "+886", paymentGateways: ["stripe", "paypal"] },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", currency: "HKD", currencySymbol: "$", currencyCode: "HKD", language: "Cantonese", languageCode: "zh", timezone: "Asia/Hong_Kong", callingCode: "+852", paymentGateways: ["stripe", "paypal", "octopus"] },
  { code: "MO", name: "Macau", flag: "🇲🇴", currency: "MOP", currencySymbol: "P", currencyCode: "MOP", language: "Cantonese", languageCode: "zh", timezone: "Asia/Macau", callingCode: "+853", paymentGateways: ["stripe"] },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", currency: "UZS", currencySymbol: "сўм", currencyCode: "UZS", language: "Uzbek", languageCode: "uz", timezone: "Asia/Tashkent", callingCode: "+998", paymentGateways: ["stripe"] },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", currency: "KZT", currencySymbol: "₸", currencyCode: "KZT", language: "Kazakh", languageCode: "kk", timezone: "Asia/Almaty", callingCode: "+7", paymentGateways: ["stripe"] },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", currency: "KGS", currencySymbol: "лв", currencyCode: "KGS", language: "Kyrgyz", languageCode: "ky", timezone: "Asia/Bishkek", callingCode: "+996", paymentGateways: ["stripe"] },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", currency: "TJS", currencySymbol: "ЅМ", currencyCode: "TJS", language: "Tajik", languageCode: "tg", timezone: "Asia/Dushanbe", callingCode: "+992", paymentGateways: ["stripe"] },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", currency: "TMT", currencySymbol: "m", currencyCode: "TMT", language: "Turkmen", languageCode: "tk", timezone: "Asia/Ashgabat", callingCode: "+993", paymentGateways: [] },
  
  // Oceania
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", currencySymbol: "$", currencyCode: "AUD", language: "English", languageCode: "en", timezone: "Australia/Sydney", callingCode: "+61", paymentGateways: ["stripe", "paypal"] },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "NZD", currencySymbol: "$", currencyCode: "NZD", language: "English", languageCode: "en", timezone: "Pacific/Auckland", callingCode: "+64", paymentGateways: ["stripe", "paypal"] },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", currency: "FJD", currencySymbol: "$", currencyCode: "FJD", language: "English", languageCode: "en", timezone: "Pacific/Fiji", callingCode: "+679", paymentGateways: ["stripe"] },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", currency: "PGK", currencySymbol: "K", currencyCode: "PGK", language: "English", languageCode: "en", timezone: "Pacific/Port_Moresby", callingCode: "+675", paymentGateways: ["stripe"] },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧", currency: "SBD", currencySymbol: "$", currencyCode: "SBD", language: "English", languageCode: "en", timezone: "Pacific/Guadalcanal", callingCode: "+677", paymentGateways: ["stripe"] },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", currency: "VUV", currencySymbol: "VT", currencyCode: "VUV", language: "Bislama", languageCode: "bi", timezone: "Pacific/Efate", callingCode: "+678", paymentGateways: ["stripe"] },
  { code: "WS", name: "Samoa", flag: "🇼🇸", currency: "WST", currencySymbol: "T", currencyCode: "WST", language: "Samoan", languageCode: "sm", timezone: "Pacific/Apia", callingCode: "+685", paymentGateways: ["stripe"] },
  { code: "TO", name: "Tonga", flag: "🇹🇴", currency: "TOP", currencySymbol: "T$", currencyCode: "TOP", language: "Tongan", languageCode: "to", timezone: "Pacific/Tongatapu", callingCode: "+676", paymentGateways: ["stripe"] },
  { code: "PW", name: "Palau", flag: "🇵🇼", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "English", languageCode: "en", timezone: "Pacific/Palau", callingCode: "+680", paymentGateways: ["stripe"] },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", currency: "AUD", currencySymbol: "$", currencyCode: "AUD", language: "English", languageCode: "en", timezone: "Pacific/Tarawa", callingCode: "+686", paymentGateways: ["stripe"] },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "English", languageCode: "en", timezone: "Pacific/Pohnpei", callingCode: "+691", paymentGateways: ["stripe"] },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭", currency: "USD", currencySymbol: "$", currencyCode: "USD", language: "English", languageCode: "en", timezone: "Pacific/Majuro", callingCode: "+692", paymentGateways: ["stripe"] },
  { code: "NR", name: "Nauru", flag: "🇳🇷", currency: "AUD", currencySymbol: "$", currencyCode: "AUD", language: "English", languageCode: "en", timezone: "Pacific/Nauru", callingCode: "+674", paymentGateways: ["stripe"] },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", currency: "AUD", currencySymbol: "$", currencyCode: "AUD", language: "English", languageCode: "en", timezone: "Pacific/Funafuti", callingCode: "+688", paymentGateways: ["stripe"] },
]

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code)
}

export function getCountryByCurrency(currency: string): Country[] {
  return countries.filter(c => c.currency === currency)
}

export function getCountriesByGateway(gateway: string): Country[] {
  return countries.filter(c => c.paymentGateways.includes(gateway))
}

export function getCountriesByLanguage(language: string): Country[] {
  return countries.filter(c => c.languageCode === language || c.language.toLowerCase() === language.toLowerCase())
}

export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase()
  return countries.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.code.toLowerCase().includes(lowerQuery) ||
    c.currency.toLowerCase().includes(lowerQuery) ||
    c.language.toLowerCase().includes(lowerQuery)
  )
}

// Currency symbols
export const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  INR: "₹",
  CNY: "¥",
  KRW: "₩",
  SGD: "S$",
  MYR: "RM",
  THB: "฿",
  IDR: "Rp",
  PHP: "₱",
  VND: "₫",
  PKR: "₨",
  BDT: "৳",
  AED: "د.إ",
  SAR: "﷼",
  ILS: "₪",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: ".د.ب",
  OMR: "ر.ع.",
  JOD: "د.ا",
  LBP: "ل.ل",
  TRY: "₺",
  RUB: "₽",
  ZAR: "R",
  BRL: "R$",
  MXN: "$",
  ARS: "$",
  COP: "$",
  PEN: "S/.",
  CLP: "$",
  UYU: "$",
  GHS: "₵",
  KES: "KSh",
  TZS: "TSh",
  UGX: "USh",
  EGP: "E£",
  MAD: "د.م.",
  TND: "د.ت",
  DZD: "د.ج",
  SDG: "ج.س.",
  GMD: "D",
  LRD: "$",
  SLL: "Le",
  SLE: "Le",
  XOF: "CFA",
  XAF: "FCFA",
  CDF: "FC",
  MZN: "MT",
  AOA: "Kz",
  ZMW: "ZK",
  MWK: "MK",
  BWP: "P",
  NAD: "$",
  ZWL: "$",
  SCR: "₨",
  MUR: "₨",
  MGA: "Ar",
  KMF: "CF",
  DJF: "Fdj",
  SOS: "S",
  ERN: "Nfk",
  SSP: "£",
  ETB: "Br",
  LSL: "L",
  SZ: "E",
  STN: "Db",
  CVE: "$",
  GIP: "£",
  SHP: "£",
  FKP: "£",
}

// Format price with currency
export function formatPrice(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toLocaleString()}`
}
