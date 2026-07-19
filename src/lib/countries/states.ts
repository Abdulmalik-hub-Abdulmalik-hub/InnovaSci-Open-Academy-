// Comprehensive State/Province and City Database
// Organized by country code

export interface StateData {
  code: string
  name: string
  cities?: string[]
}

export const statesByCountry: Record<string, StateData[]> = {
  // United States
  US: [
    { code: "AL", name: "Alabama", cities: ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa"] },
    { code: "AK", name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Knik"] },
    { code: "AZ", name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"] },
    { code: "AR", name: "Arkansas", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"] },
    { code: "CA", name: "California", cities: ["Los Angeles", "San Diego", "San Francisco", "San Jose", "Sacramento", "Fresno", "Long Beach", "Oakland"] },
    { code: "CO", name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood"] },
    { code: "CT", name: "Connecticut", cities: ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury"] },
    { code: "DE", name: "Delaware", cities: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"] },
    { code: "FL", name: "Florida", cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee"] },
    { code: "GA", name: "Georgia", cities: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens"] },
    { code: "HI", name: "Hawaii", cities: ["Honolulu", "Hilo", "Kailua", "Kapolei", "Kaneohe"] },
    { code: "ID", name: "Idaho", cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"] },
    { code: "IL", name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield"] },
    { code: "IN", name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"] },
    { code: "IA", name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"] },
    { code: "KS", name: "Kansas", cities: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka"] },
    { code: "KY", name: "Kentucky", cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"] },
    { code: "LA", name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"] },
    { code: "ME", name: "Maine", cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"] },
    { code: "MD", name: "Maryland", cities: ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie"] },
    { code: "MA", name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"] },
    { code: "MI", name: "Michigan", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"] },
    { code: "MN", name: "Minnesota", cities: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington"] },
    { code: "MS", name: "Mississippi", cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"] },
    { code: "MO", name: "Missouri", cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"] },
    { code: "MT", name: "Montana", cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"] },
    { code: "NE", name: "Nebraska", cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"] },
    { code: "NV", name: "Nevada", cities: ["Las Vegas", "Reno", "Henderson", "Sparks", "Carson City"] },
    { code: "NH", name: "New Hampshire", cities: ["Manchester", "Nashua", "Concord", "Dover", "Rochester"] },
    { code: "NJ", name: "New Jersey", cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton"] },
    { code: "NM", name: "New Mexico", cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"] },
    { code: "NY", name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"] },
    { code: "NC", name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"] },
    { code: "ND", name: "North Dakota", cities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"] },
    { code: "OH", name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
    { code: "OK", name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"] },
    { code: "OR", name: "Oregon", cities: ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"] },
    { code: "PA", name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"] },
    { code: "RI", name: "Rhode Island", cities: ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"] },
    { code: "SC", name: "South Carolina", cities: ["Charleston", "Columbia", "Mount Pleasant", "Rock Hill", "Greenville"] },
    { code: "SD", name: "South Dakota", cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"] },
    { code: "TN", name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"] },
    { code: "TX", name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington"] },
    { code: "UT", name: "Utah", cities: ["Salt Lake City", "Provo", "West Valley City", "Orem", "Sandy"] },
    { code: "VT", name: "Vermont", cities: ["Burlington", "Essex Junction", "Rutland", "South Burlington", "Barre"] },
    { code: "VA", name: "Virginia", cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington"] },
    { code: "WA", name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"] },
    { code: "WV", name: "West Virginia", cities: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"] },
    { code: "WI", name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"] },
    { code: "WY", name: "Wyoming", cities: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"] },
    { code: "DC", name: "District of Columbia", cities: ["Washington"] },
  ],

  // Nigeria
  NG: [
    { code: "AB", name: "Abia", cities: ["Umuahia", "Aba", "Ohafia", "Bende", "Isiala-Ngwa"] },
    { code: "AD", name: "Adamawa", cities: ["Yola", "Mubi", "Jimeta", "Numan", "Hong"] },
    { code: "AK", name: "Akwa Ibom", cities: ["Uyo", "Ikot Ekpene", "Eket", "Oron", "Uron"] },
    { code: "AN", name: "Anambra", cities: ["Awka", "Onitsha", "Nnewi", "Awkuzu", "Orumba"] },
    { code: "BA", name: "Bauchi", cities: ["Bauchi", "Azare", "Jama'are", "Misau", "Darazo"] },
    { code: "BY", name: "Bayelsa", cities: ["Yenagoa", "Brass", "Ogbia", "Sagbama", "Ekeremor"] },
    { code: "BE", name: "Benue", cities: ["Makurdi", "Obi", "Otukpo", "Idah", "Kogi"] },
    { code: "BO", name: "Borno", cities: ["Maiduguri", "Bama", "Biu", "Dikwa", "Gwoza"] },
    { code: "CR", name: "Cross River", cities: ["Calabar", "Ikom", "Ogoja", "Ugep", "Obudu"] },
    { code: "DE", name: "Delta", cities: ["Asaba", "Warri", "Sapele", "Ughelli", "Abraka"] },
    { code: "EB", name: "Ebonyi", cities: ["Abakaliki", "Afikpo", "Izzi", "Ohafia", "Ikwo"] },
    { code: "ED", name: "Edo", cities: ["Benin City", "Ekpoma", "Auchi", "Uromi", "Igueben"] },
    { code: "EK", name: "Ekiti", cities: ["Ado-Ekiti", "Ikere-Ekiti", "Oye-Ekiti", "Ise-Ekiti", "Emure"] },
    { code: "EN", name: "Enugu", cities: ["Enugu", "Nsukka", "Awgu", "Udi", "Oji River"] },
    { code: "GO", name: "Gombe", cities: ["Gombe", "Billiri", "Kaltungo", "Dukku", "Funakaye"] },
    { code: "IM", name: "Imo", cities: ["Owerri", "Orlu", "Okigwe", "Umuahia", "Mbaitoli"] },
    { code: "JG", name: "Jigawa", cities: ["Dutse", "Hadejia", "Gumel", "Kazaure", "Ringim"] },
    { code: "KB", name: "Kebbi", cities: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Bagudo"] },
    { code: "KD", name: "Kaduna", cities: ["Kaduna", "Zaria", "Kano", "Ilorin", "Jos"] },
    { code: "KG", name: "Kogi", cities: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa"] },
    { code: "KT", name: "Katsina", cities: ["Katsina", "Daura", "Funtua", "Dutsin-Ma", "Mani"] },
    { code: "KE", name: "Kebbi", cities: ["Birnin-Kebbi", "Argungu", "Yauri", "Zuru", "Jega"] },
    { code: "KN", name: "Kano", cities: ["Kano", "Wudil", "Gaya", "Rano", "Bebeji"] },
    { code: "KO", name: "Kogi", cities: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa"] },
    { code: "KW", name: "Kwara", cities: ["Ilorin", "Offa", "Omu-Aran", "Ikeji", "Jebba"] },
    { code: "LA", name: "Lagos", cities: ["Lagos", "Ikeja", "Victoria Island", "Lekki", "Badagry", "Epe"] },
    { code: "NA", name: "Nasarawa", cities: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Toto"] },
    { code: "NI", name: "Niger", cities: ["Minna", "Bida", "Kontagora", "Suleja", "Lapai"] },
    { code: "OG", name: "Ogun", cities: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ibara"] },
    { code: "ON", name: "Ondo", cities: ["Akure", "Ondo", "Owo", "Okitipupa", "Ikare"] },
    { code: "OS", name: "Osun", cities: ["Ile-Ife", "Ilesa", "Osogbo", "Ikirun", "Ede"] },
    { code: "OY", name: "Oyo", cities: ["Ibadan", "Iseyin", "Oyo", "Ogbomoso", "Saki"] },
    { code: "PL", name: "Plateau", cities: ["Jos", "Bukuru", "Pankshin", "Barkin-Ladi", "Langtang"] },
    { code: "RI", name: "Rivers", cities: ["Port Harcourt", "Obio-Akpor", "Okrika", "Eleme", "Gokana"] },
    { code: "SO", name: "Sokoto", cities: ["Sokoto", "Sokoto North", "Sokoto South", "Tambuwal", "Wurno"] },
    { code: "TA", name: "Taraba", cities: ["Jalingo", "Bali", "Gashaka", "Ibi", "Wukari"] },
    { code: "YB", name: "Yobe", cities: ["Damaturu", "Potiskum", "Gujba", "Bade", "Nguru"] },
    { code: "ZA", name: "Zamfara", cities: ["Gusau", "Kaura-Namoda", "Maru", "Talata-Mafara", "Zurmi"] },
    { code: "FC", name: "Federal Capital Territory", cities: ["Abuja", "Kuje", "Abaji", "Gwagwalada"] },
  ],

  // United Kingdom
  GB: [
    { code: "ENG", name: "England", cities: ["London", "Birmingham", "Manchester", "Leeds", "Sheffield", "Liverpool", "Newcastle", "Bristol"] },
    { code: "SCT", name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Stirling"] },
    { code: "WLS", name: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor"] },
    { code: "NIR", name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor"] },
  ],

  // Canada
  CA: [
    { code: "AB", name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Grande Prairie"] },
    { code: "BC", name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"] },
    { code: "MB", name: "Manitoba", cities: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Selkirk"] },
    { code: "NB", name: "New Brunswick", cities: ["Moncton", "Saint John", "Fredericton", "Miramichi", "Edmundston"] },
    { code: "NL", name: "Newfoundland and Labrador", cities: ["St. John's", "Mount Pearl", "Conception Bay South", "Corner Brook", "Grand Falls-Windsor"] },
    { code: "NS", name: "Nova Scotia", cities: ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow"] },
    { code: "NT", name: "Northwest Territories", cities: ["Yellowknife", "Inuvik", "Hay River", "Fort Smith"] },
    { code: "NU", name: "Nunavut", cities: ["Iqaluit", "Rankin Inlet", "Arviat", "Baker Lake"] },
    { code: "ON", name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "Kitchener", "London"] },
    { code: "PE", name: "Prince Edward Island", cities: ["Charlottetown", "Summerside", "Stratford", "Cornwall"] },
    { code: "QC", name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke"] },
    { code: "SK", name: "Saskatchewan", cities: ["Saskatoon", "Regina", "Moose Jaw", "Prince Albert", "Swift Current"] },
    { code: "YT", name: "Yukon", cities: ["Whitehorse", "Dawson City", "Watson Lake", "Haines Junction"] },
  ],

  // Australia
  AU: [
    { code: "NSW", name: "New South Wales", cities: ["Sydney", "Newcastle", "Central Coast", "Wollongong", "Campbelltown"] },
    { code: "VIC", name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"] },
    { code: "QLD", name: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"] },
    { code: "SA", name: "South Australia", cities: ["Adelaide", "Mount Gambier", "Port Adelaide", "Port Augusta", "Whyalla"] },
    { code: "WA", name: "Western Australia", cities: ["Perth", "Fremantle", "Rockingham", "Mandurah", "Bunbury"] },
    { code: "TAS", name: "Tasmania", cities: ["Hobart", "Launceston", "Devonport", "Burnie", "Clarence"] },
    { code: "ACT", name: "Australian Capital Territory", cities: ["Canberra", "Tuggeranong", "Gungahlin"] },
    { code: "NT", name: "Northern Territory", cities: ["Darwin", "Alice Springs", "Palmerston", "Katherine"] },
  ],

  // India
  IN: [
    { code: "DL", name: "Delhi", cities: ["New Delhi", "Old Delhi", "Noida", "Gurgaon", "Faridabad"] },
    { code: "MH", name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"] },
    { code: "KA", name: "Karnataka", cities: ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"] },
    { code: "TN", name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
    { code: "AP", name: "Andhra Pradesh", cities: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"] },
    { code: "TG", name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam"] },
    { code: "UP", name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Allahabad"] },
    { code: "WB", name: "West Bengal", cities: ["Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah"] },
    { code: "RJ", name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"] },
    { code: "GJ", name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"] },
    { code: "MP", name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"] },
    { code: "KL", name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"] },
    { code: "PB", name: "Punjab", cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"] },
    { code: "HR", name: "Haryana", cities: ["Chandigarh", "Faridabad", "Gurgaon", "Hisar", "Rohtak"] },
    { code: "CG", name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Durg", "Bilaspur", "Korba"] },
    { code: "BR", name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"] },
    { code: "JK", name: "Jammu and Kashmir", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"] },
    { code: "OR", name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur"] },
    { code: "AS", name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"] },
    { code: "JH", name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"] },
  ],

  // Germany
  DE: [
    { code: "BW", name: "Baden-Württemberg", cities: ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg"] },
    { code: "BY", name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg"] },
    { code: "BE", name: "Berlin", cities: ["Berlin"] },
    { code: "BB", name: "Brandenburg", cities: ["Potsdam", "Cottbus", "Brandenburg", "Frankfurt (Oder)", "Eisenhüttenstadt"] },
    { code: "HB", name: "Bremen", cities: ["Bremen", "Bremerhaven"] },
    { code: "HH", name: "Hamburg", cities: ["Hamburg"] },
    { code: "HE", name: "Hesse", cities: ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel", "Marburg"] },
    { code: "MV", name: "Mecklenburg-Vorpommern", cities: ["Rostock", "Schwerin", "Stralsund", "Greifswald", "Neubrandenburg"] },
    { code: "NI", name: "Lower Saxony", cities: ["Hanover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg"] },
    { code: "NW", name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg"] },
    { code: "RP", name: "Rhineland-Palatinate", cities: ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern"] },
    { code: "SL", name: "Saarland", cities: ["Saarbrücken", "Neunkirchen", "Saarlouis", "Homburg", "Völklingen"] },
    { code: "SN", name: "Saxony", cities: ["Dresden", "Leipzig", "Chemnitz", "Zwickau", "Görlitz"] },
    { code: "ST", name: "Saxony-Anhalt", cities: ["Magdeburg", "Halle", "Dessau", "Wittenberg", "Bitterfeld"] },
    { code: "SH", name: "Schleswig-Holstein", cities: ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt"] },
    { code: "TH", name: "Thuringia", cities: ["Erfurt", "Jena", "Gera", "Weimar", "Gotha"] },
  ],

  // France
  FR: [
    { code: "IDF", name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Versailles"] },
    { code: "ARA", name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Saint-Étienne", "Grenoble", "Clermont-Ferrand", "Annecy"] },
    { code: "PAC", name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"] },
    { code: "OCC", name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"] },
    { code: "NAQ", name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers", "La Rochelle", "Pau"] },
    { code: "HDF", name: "Hauts-de-France", cities: ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque"] },
    { code: "GE", name: "Grand Est", cities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Colmar"] },
    { code: "BFC", name: "Bourgogne-Franche-Comté", cities: ["Dijon", "Besançon", "Belfort", "Chalon-sur-Saône", "Nevers"] },
    { code: "NOR", name: "Normandie", cities: ["Rouen", "Caen", "Le Havre", "Cherbourg", "Évreux"] },
    { code: "CVL", name: "Centre-Val de Loire", cities: ["Tours", "Orléans", "Bourges", "Blois", "Chartres"] },
    { code: "BRE", name: "Bretagne", cities: ["Rennes", "Brest", "Quimper", "Lorient", "Vannes"] },
    { code: "PDL", name: "Pays de la Loire", cities: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "Cholet"] },
    { code: "COR", name: "Corse", cities: ["Ajaccio", "Bastia", "Sartène", "Corte", "Calvi"] },
  ],

  // Ghana
  GH: [
    { code: "AH", name: "Ashanti", cities: ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo"] },
    { code: "BA", name: "Brong-Ahafo", cities: ["Sunyani", "Techiman", "Duayaw Nkwanta", "Nkoranza", "Berekum"] },
    { code: "CE", name: "Central", cities: ["Cape Coast", "Mfantsiman", "Komenda", "Kissidougou", "Abura"] },
    { code: "EA", name: "Eastern", cities: ["Koforidua", "Akim Oda", "Akwapim", "New Juaben", "Lower West"] },
    { code: "GA", name: "Greater Accra", cities: ["Accra", "Tema", "Teshie", "Nungua", "Madina"] },
    { code: "NO", name: "Northern", cities: ["Tamale", "Savelugu", "Yendi", "Garu-Atom", "Bimbilla"] },
    { code: "UE", name: "Upper East", cities: ["Bolgatanga", "Bawku", "Paga", "Navrongo", "Zebilla"] },
    { code: "UW", name: "Upper West", cities: ["Wa", "Lawra", "Jirapa", "Tumu", "Nandom"] },
    { code: "VO", name: "Volta", cities: ["Ho", "Keta", "Hohoe", "Aflao", "Sogakope"] },
    { code: "WE", name: "Western", cities: ["Sekondi", "Takoradi", "Shama", "Ahanta West", "Nzema"] },
    { code: "WN", name: "Western North", cities: ["Prestea", "Bia", "Bogy", "Sefwi", "Aowin"] },
  ],

  // Kenya
  KE: [
    { code: "Nairobi", name: "Nairobi", cities: ["Nairobi", "Kasarani", "Ruiru", "Kiambu"] },
    { code: "Mombasa", name: "Mombasa", cities: ["Mombasa", "Kilifi", "Kwale", "Lamu"] },
    { code: "Kisumu", name: "Kisumu", cities: ["Kisumu", "Siaya", "Homa Bay", "Migori"] },
    { code: "Nakuru", name: "Nakuru", cities: ["Nakuru", "Naivasha", "Molo", "Kariokor"] },
    { code: "Uasin", name: "Uasin Gishu", cities: ["Eldoret", "Kapsabet", "Iten", "Turbo"] },
    { code: "Kiambu", name: "Kiambu", cities: ["Thika", "Kiambu", "Ruiru", "Githunguri"] },
    { code: "Machakos", name: "Machakos", cities: ["Machakos", "Athi River", "Kangundo", "Mwala"] },
    { code: "Kajiado", name: "Kajiado", cities: ["Kajiado", "Ngong", "Mai Mahiu"] },
    { code: "Narok", name: "Narok", cities: ["Narok", "Mai Mahiu", "Suswa"] },
    { code: "Bungoma", name: "Bungoma", cities: ["Bungoma", "Webuye", "Kimilili", "Mwebone"] },
    { code: "Kakamega", name: "Kakamega", cities: ["Kakamega", "Mumias", "Malava", "Lurambi"] },
  ],

  // South Africa
  ZA: [
    { code: "GP", name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Soweto", "Centurion", "Sandton"] },
    { code: "KZN", name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle", "Ballito"] },
    { code: "WC", name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Paarl", "George", "Worcester"] },
    { code: "EC", name: "Eastern Cape", cities: ["Port Elizabeth", "East London", "Makhanda", "Gqeberha", "Queenstown"] },
    { code: "FS", name: "Free State", cities: ["Bloemfontein", "Bethlehem", "Kroonstad", "Welkom", "Sasolburg"] },
    { code: "LP", name: "Limpopo", cities: ["Polokwane", "Mokopane", "Thabazimbi", "Louis Trichardt", "Musina"] },
    { code: "MP", name: "Mpumalanga", cities: ["Nelspruit", "Witbank", "Secunda", "Middelburg", "Barberton"] },
    { code: "NW", name: "North West", cities: ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng", "Brits"] },
    { code: "NC", name: "Northern Cape", cities: ["Kimberley", "Upington", "Springbok", "De Aar", "Calvinia"] },
  ],

  // UAE
  AE: [
    { code: "DXB", name: "Dubai", cities: ["Dubai", "Deira", "Jumeirah", "Palm Jumeirah", "Silicon Oasis"] },
    { code: "AD", name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain", "Al Dhafra", "Musaffah", "Khalifa City"] },
    { code: "SHJ", name: "Sharjah", cities: ["Sharjah", "Khor Fakkan", "Kalba", "Dibba Al-Hisn"] },
    { code: "AJM", name: "Ajman", cities: ["Ajman", "Masfout", "Manama"] },
    { code: "UQC", name: "Umm Al Quwain", cities: ["Umm Al Quwain", "Falaj Al Mualla"] },
    { code: "RAK", name: "Ras Al Khaimah", cities: ["Ras Al Khaimah", "Julfar", "Al Hamra", "Sham"] },
    { code: "FUJ", name: "Fujairah", cities: ["Fujairah", "Dibba Al-Fujairah", "Murbeh", "Qidya"] },
  ],

  // Saudi Arabia
  SA: [
    { code: "RI", name: "Riyadh", cities: ["Riyadh", "Al Kharj", "Dhruma", "Al Majma'ah", "Al Aflaj"] },
    { code: "JED", name: "Jeddah", cities: ["Jeddah", "Makkah", "Taif", "Rabigh", "Al Qunfudhah"] },
    { code: "ME", name: "Mecca", cities: ["Mecca", "Jeddah", "Taif", "Rabigh", "Al Qunfudhah"] },
    { code: "MN", name: "Medina", cities: ["Medina", "Yanbu", "Al Ula", "Khaybar", "Badr"] },
    { code: "EA", name: "Eastern Province", cities: ["Dammam", "Dhahran", "Al Khobar", "Hofuf", "Qatif"] },
    { code: "AS", name: "Asir", cities: ["Abha", "Khamis Mushait", "Najran", "Bisha", "Muhayil"] },
    { code: "HA", name: "Hail", cities: ["Hail", "Baqa", "Al Shinan", "Al Khriya"] },
    { code: "QA", name: "Qassim", cities: ["Buraydah", "Unaizah", "Al Rass", "Al Bukayriyyah", "Al Badaya"] },
    { code: "TB", name: "Tabuk", cities: ["Tabuk", "Tayma", "Duba", "Haql", "Al Wajh"] },
    { code: "NJ", name: "Najran", cities: ["Najran", "Shaybah", "Habuna", "Thar"] },
  ],

  // Singapore
  SG: [
    { code: "SG", name: "Singapore", cities: ["Singapore", "Woodlands", "Tampines", "Jurong", "Ang Mo Kio", "Bukit Merah", "Bedok", "Changi"] },
  ],

  // Malaysia
  MY: [
    { code: "KUL", name: "Kuala Lumpur", cities: ["Kuala Lumpur", "Petaling Jaya", "Ampang", "Cheras", "Bangsar"] },
    { code: "SEL", name: "Selangor", cities: ["Shah Alam", "Subang Jaya", "Klang", "Ampang", "Cheras"] },
    { code: "PH", name: "Penang", cities: ["George Town", "Seberang Perai", "Butterworth", "Bayan Lepas", "Bukit Mertajam"] },
    { code: "JH", name: "Johor", cities: ["Johor Bahru", "Skudai", "Tebrau", "Pasir Gudang", "Kulai"] },
    { code: "MK", name: "Kedah", cities: ["Alor Setar", "Sungai Petani", "Kuala Kedah", "Kulim", "Yan"] },
    { code: "KB", name: "Kelantan", cities: ["Kota Bharu", "Kuala Krai", "Tumpat", "Pasir Mas", "Tanah Merah"] },
    { code: "PN", name: "Pahang", cities: ["Kuantan", "Temerloh", "Bentong", "Mentakab", "Raub"] },
    { code: "NS", name: "Negeri Sembilan", cities: ["Seremban", "Port Dickson", "Nilai", "Bahau", "Kuala Pilah"] },
    { code: "TR", name: "Terengganu", cities: ["Kuala Terengganu", "Chukai", "Dungun", "Marang", "Jertih"] },
    { code: "SB", name: "Sabah", cities: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau"] },
    { code: "SW", name: "Sarawak", cities: ["Kuching", "Sibu", "Miri", "Bintulu", "Samarahan"] },
  ],

  // Indonesia
  ID: [
    { code: "JK", name: "Jakarta", cities: ["Jakarta", "West Jakarta", "South Jakarta", "East Jakarta", "Central Jakarta", "North Jakarta"] },
    { code: "JR", name: "East Java", cities: ["Surabaya", "Malang", "Kediri", "Mojokerto", "Pasuruan"] },
    { code: "JB", name: "West Java", cities: ["Bandung", "Bekasi", "Depok", "Tangerang", "Sukabumi"] },
    { code: "BT", name: "Banten", cities: ["Tangerang", "Serang", "Cilegon", "Tangerang Selatan", "Pandeglang"] },
    { code: "SM", name: "North Sumatra", cities: ["Medan", "Binjai", "Pematangsiantar", "Tebing Tinggi", "Tanjungbalai"] },
    { code: "ST", name: "South Sulawesi", cities: ["Makassar", "Parepare", "Palopo", "Maros", "Gowa"] },
    { code: "KT", name: "Central Java", cities: ["Semarang", "Solo", "Salatiga", "Pekalongan", "Tegal"] },
    { code: "YO", name: "Yogyakarta", cities: ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunung Kidul"] },
    { code: "BA", name: "Bali", cities: ["Denpasar", "Badung", "Gianyar", "Buleleng", "Tabanan"] },
    { code: "LB", name: "Lampung", cities: ["Bandar Lampung", "Metro", "Tulang Bawang", "Lampung Selatan", "Lampung Tengah"] },
  ],

  // Philippines
  PH: [
    { code: "NCR", name: "National Capital Region", cities: ["Manila", "Quezon City", "Makati", "Caloocan", "Pasay", "Taguig", "Mandaluyong"] },
    { code: "CEB", name: "Cebu", cities: ["Cebu City", "Mandaue", "Lapu-Lapu", "Davao City", "Iloilo City"] },
    { code: "DAV", name: "Davao del Sur", cities: ["Davao City", "Digos", "Mati", "Tagum", "General Santos"] },
    { code: "ILO", name: "Iloilo", cities: ["Iloilo City", "Passi", "Cabatuan", "San Joaquin", "Miagao"] },
    { code: "PNL", name: "Pangasinan", cities: ["Dagupan", "San Fabian", "Lingayen", "Urdaneta", "Dasmariñas"] },
    { code: "BTG", name: "Batangas", cities: ["Batangas City", "Lipa", "Tanauan", "Nasugbu", "Santo Tomas"] },
    { code: "LZN", name: "Laguna", cities: ["Santa Rosa", "Biñan", "San Pablo", "Cabuyao", "Calamba"] },
    { code: "CVS", name: "Cavite", cities: ["Dasmariñas", "Bacoor", "Imus", "Trece Martires", "Kawit"] },
    { code: "RIZ", name: "Rizal", cities: ["Antipolo", "Cainta", "Rodriguez", "San Mateo", "Taytay"] },
    { code: "BUL", name: "Bulacan", cities: ["Malolos", "San Jose del Monte", "Meycauayan", "Plaridel", "Guiguinto"] },
  ],

  // Brazil
  BR: [
    { code: "SP", name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos", "São Bernardo do Campo", "Santo André"] },
    { code: "RJ", name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu"] },
    { code: "MG", name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"] },
    { code: "BA", name: "Bahia", cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna"] },
    { code: "PR", name: "Paraná", cities: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"] },
    { code: "RS", name: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"] },
    { code: "PE", name: "Pernambuco", cities: ["Recife", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Petrolina"] },
    { code: "CE", name: "Ceará", cities: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"] },
    { code: "PA", name: "Pará", cities: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas"] },
    { code: "SC", name: "Santa Catarina", cities: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma"] },
    { code: "GO", name: "Goiás", cities: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Luziânia", "Rio Verde"] },
    { code: "MA", name: "Maranhão", cities: ["São Luís", "Imperatriz", "Timon", "Caxias", "Codó"] },
    { code: "AM", name: "Amazonas", cities: ["Manaus", "Manacapuru", "Itacoatiara", "Parintins", "Coari"] },
    { code: "PB", name: "Paraíba", cities: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"] },
    { code: "ES", name: "Espírito Santo", cities: ["Vitória", "Vila Velha", "Serra", "Cachoeiro de Itapemirim", "Linhares"] },
  ],

  // Mexico
  MX: [
    { code: "CMX", name: "Mexico City", cities: ["Mexico City", "Coyoacán", "Iztapalapa", "Gustavo A. Madero", "Alvaro Obregón"] },
    { code: "JAL", name: "Jalisco", cities: ["Guadalajara", "Zapopan", "Tonalá", "Puerto Vallarta", "Tlaquepaque"] },
    { code: "NL", name: "Nuevo León", cities: ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "Santa Catarina"] },
    { code: "PUE", name: "Puebla", cities: ["Puebla", "Tehuacán", "Cholula", "Atlixco", "San Andrés Cholula"] },
    { code: "VER", name: "Veracruz", cities: ["Veracruz", "Xalapa", "Córdoba", "Boca del Río", "Orizaba"] },
    { code: "YUC", name: "Yucatán", cities: ["Mérida", "Valladolid", "Tizimin", "Kanasín", "Progreso"] },
    { code: "GTO", name: "Guanajuato", cities: ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato"] },
    { code: "MIC", name: "Michoacán", cities: ["Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Apatzingán"] },
    { code: "OA", name: "Oaxaca", cities: ["Oaxaca", "Puerto Escondido", "Juchitán", "Tuxtepec", "Salina Cruz"] },
    { code: "CHIS", name: "Chiapas", cities: ["Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula", "Comitán", "Palenque"] },
    { code: "TAB", name: "Tabasco", cities: ["Villahermosa", "Cárdenas", "Huimanguillo", "Comalcalco", "Tenosique"] },
    { code: "QRO", name: "Querétaro", cities: ["Querétaro", "San Juan del Río", "El Marqués", "Corregidora", "Cadereyta"] },
  ],

  // Pakistan
  PK: [
    { code: "ISB", name: "Islamabad", cities: ["Islamabad", "Rawalpindi"] },
    { code: "PB", name: "Punjab", cities: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Sargodha"] },
    { code: "SN", name: "Sindh", cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpur Khas"] },
    { code: "KP", name: "Khyber Pakhtunkhwa", cities: ["Peshawar", "Mardan", "Abbottabad", "Swat", "Kohat"] },
    { code: "BL", name: "Balochistan", cities: ["Quetta", "Gwadar", "Khuzdar", "Sibi", "Chaman"] },
    { code: "AJK", name: "Azad Kashmir", cities: ["Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Poonch"] },
    { code: "GB", name: "Gilgit-Baltistan", cities: ["Gilgit", "Skardu", "Hunza", "Ghizer", "Astore"] },
  ],

  // Bangladesh
  BD: [
    { code: "DHK", name: "Dhaka", cities: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Manikganj"] },
    { code: "CHT", name: "Chittagong", cities: ["Chittagong", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari"] },
    { code: "SYL", name: "Sylhet", cities: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"] },
    { code: "KHL", name: "Khulna", cities: ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Narail"] },
    { code: "RAJ", name: "Rajshahi", cities: ["Rajshahi", "Bogra", "Pabna", "Naogaon", "Natore"] },
    { code: "RNG", name: "Rangpur", cities: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat"] },
    { code: "MYM", name: "Mymensingh", cities: ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"] },
    { code: "BAR", name: "Barisal", cities: ["Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"] },
  ],

  // Japan
  JP: [
    { code: "TK", name: "Tokyo", cities: ["Tokyo", "Shinjuku", "Minato", "Shibuya", "Chiyoda", "Setagaya"] },
    { code: "OS", name: "Osaka", cities: ["Osaka", "Sakai", "Toyonaka", "Kadoma", "Matsuyama"] },
    { code: "KY", name: "Kyoto", cities: ["Kyoto", "Uji", "Kameoka", "Joyo", "Mukō"] },
    { code: "HY", name: "Hyogo", cities: ["Kobe", "Himeji", "Nishinomiya", "Amagasaki", "Akashi"] },
    { code: "SG", name: "Saitama", cities: ["Saitama", "Kawaguchi", "Saitama", "Tokorozawa", "Kawagoe"] },
    { code: "KN", name: "Kanagawa", cities: ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Hiratsuka"] },
    { code: "AI", name: "Aichi", cities: ["Nagoya", "Toyota", "Okazaki", "Toyohashi", "Nagakute"] },
    { code: "FB", name: "Fukuoka", cities: ["Fukuoka", "Kitakyushu", "Kurume", "Iizuka", "Tobata"] },
    { code: "HT", name: "Hokkaido", cities: ["Sapporo", "Hakodate", "Otaru", "Kushiro", "Tomakomai"] },
    { code: "HG", name: "Hiroshima", cities: ["Hiroshima", "Fukuyama", "Kure", "Higashihiroshima", "Onomichi"] },
  ],

  // China
  CN: [
    { code: "BJ", name: "Beijing", cities: ["Beijing", "Chaoyang", "Haidian", "Fengtai", "Xicheng"] },
    { code: "SH", name: "Shanghai", cities: ["Shanghai", "Pudong", "Huangpu", "Xuhui", "Changning"] },
    { code: "GD", name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhongshan"] },
    { code: "JS", name: "Jiangsu", cities: ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong"] },
    { code: "ZJ", name: "Zhejiang", cities: ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing", "Jiaxing"] },
    { code: "SD", name: "Shandong", cities: ["Jinan", "Qingdao", "Yantai", "Weifang", "Zibo"] },
    { code: "SC", name: "Sichuan", cities: ["Chengdu", "Mianyang", "Deyang", "Leshan", "Nanchong"] },
    { code: "HE", name: "Hebei", cities: ["Shijiazhuang", "Tangshan", "Handan", "Zhangjiakou", "Baoding"] },
    { code: "HN", name: "Hunan", cities: ["Changsha", "Zhuzhou", "Xiangtan", "Yueyang", "Changde"] },
    { code: "JX", name: "Jiangxi", cities: ["Nanchang", "Jiujiang", "Jingdezhen", "Shangrao", "Fuzhou"] },
    { code: "HA", name: "Henan", cities: ["Zhengzhou", "Luoyang", "Kaifeng", "Xinxiang", "Anyang"] },
    { code: "LN", name: "Liaoning", cities: ["Shenyang", "Dalian", "Anshan", "Fushun", "Jinzhou"] },
    { code: "JL", name: "Jilin", cities: ["Changchun", "Jilin City", "Siping", "Liaoyuan", "Tonghua"] },
    { code: "HL", name: "Heilongjiang", cities: ["Harbin", "Qiqihar", "Mudanjiang", "Jiamusi", "Daqing"] },
    { code: "TJ", name: "Tianjin", cities: ["Tianjin", "Heping", "Hebei", "Ninghe", "Wuqing"] },
    { code: "CQ", name: "Chongqing", cities: ["Chongqing", "Yuzhong", "Jiangbei", "Jiulongpo", "Nan'an"] },
    { code: "SN", name: "Shaanxi", cities: ["Xi'an", "Xianyang", "Baoji", "Tongchuan", "Weinan"] },
    { code: "SX", name: "Shanxi", cities: ["Taiyuan", "Datong", "Yangquan", "Changzhi", "Lüliang"] },
    { code: "YN", name: "Yunnan", cities: ["Kunming", "Dali", "Qujing", "Yuxi", "Lijiang"] },
    { code: "GZ", name: "Guizhou", cities: ["Guiyang", "Zunyi", "Anshun", "Bijie", "Liupanshui"] },
  ],
}

// Helper functions
export function getStatesByCountry(countryCode: string): StateData[] {
  return statesByCountry[countryCode] || []
}

export function getCitiesByState(countryCode: string, stateCode: string): string[] {
  const states = statesByCountry[countryCode]
  if (!states) return []
  const state = states.find(s => s.code === stateCode)
  return state?.cities || []
}

export function searchStates(countryCode: string, query: string): StateData[] {
  const states = statesByCountry[countryCode] || []
  const lowerQuery = query.toLowerCase()
  return states.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.code.toLowerCase().includes(lowerQuery)
  )
}

export function searchCities(countryCode: string, stateCode: string, query: string): string[] {
  const cities = getCitiesByState(countryCode, stateCode)
  const lowerQuery = query.toLowerCase()
  return cities.filter(c => c.toLowerCase().includes(lowerQuery))
}

export function hasStates(countryCode: string): boolean {
  return !!statesByCountry[countryCode] && statesByCountry[countryCode].length > 0
}

export function hasCities(countryCode: string, stateCode: string): boolean {
  const cities = getCitiesByState(countryCode, stateCode)
  return cities.length > 0
}
