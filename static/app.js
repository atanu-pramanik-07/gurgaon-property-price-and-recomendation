/* ==========================================================================
   AravaliIndex — Frontend Controller (app.js)
   Connects to FastAPI endpoints:
     - GET  /api/sectors
     - POST /predict
     - GET  /api/localities?q=...&limit=20
     - GET  /api/recommend?locality=...&radius_km=...
     - GET  /api/similar?property_name=...&top_n=10
   ========================================================================== */

const FALLBACK_SECTORS = ["Manesar", "Sector 1", "Sector 102", "Sector 103", "Sector 104", "Sector 105", "Sector 106", "Sector 107", "Sector 108", "Sector 109", "Sector 10a", "Sector 11", "Sector 110", "Sector 111", "Sector 112", "Sector 113", "Sector 12", "Sector 13", "Sector 14", "Sector 15", "Sector 17", "Sector 2", "Sector 21", "Sector 22", "Sector 23", "Sector 24", "Sector 25", "Sector 26", "Sector 27", "Sector 28", "Sector 3", "Sector 30", "Sector 31", "Sector 33", "Sector 36", "Sector 36a", "Sector 37c", "Sector 37d", "Sector 38", "Sector 39", "Sector 4", "Sector 40", "Sector 41", "Sector 42", "Sector 43", "Sector 45", "Sector 46", "Sector 47", "Sector 48", "Sector 49", "Sector 5", "Sector 50", "Sector 51", "Sector 52", "Sector 53", "Sector 54", "Sector 55", "Sector 56", "Sector 57", "Sector 58", "Sector 59", "Sector 6", "Sector 60", "Sector 61", "Sector 62", "Sector 63", "Sector 63a", "Sector 65", "Sector 66", "Sector 67", "Sector 67a", "Sector 68", "Sector 69", "Sector 7", "Sector 70", "Sector 70a", "Sector 71", "Sector 72", "Sector 73", "Sector 74", "Sector 76", "Sector 77", "Sector 78", "Sector 79", "Sector 8", "Sector 80", "Sector 81", "Sector 82", "Sector 82a", "Sector 83", "Sector 84", "Sector 85", "Sector 86", "Sector 88a", "Sector 88b", "Sector 89", "Sector 9", "Sector 90", "Sector 91", "Sector 92", "Sector 93", "Sector 95", "Sector 99", "Sector 99a", "Sector 9a", "Sohna"];

const POPULAR_LANDMARKS = [
  "Cyber Hub",
  "Golf Course Road",
  "Dwarka Expressway",
  "Huda City Centre",
  "IFFCO Chowk",
  "Sohna Road",
  "Ambience Mall",
  "Medanta Hospital"
];

// Exact 635 unique PropertyName -> 635 unique PHOTO_URL mappings from link_of_property_photo.pkl / photo_link.csv
const PROPERTY_PHOTO_MAP = {
  "Alpha Corp GurgaonOne 84": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1080&h=720&q=85",
  "DLF The Ultima": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1080&h=720&q=85",
  "Experion Windchants": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1080&h=720&q=85",
  "ATS Triumph": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1080&h=720&q=85",
  "M3M Skywalk": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1080&h=720&q=85",
  "Experion The Westerlies": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1080&h=720&q=85",
  "BPTP Amstoria": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1080&h=720&q=85",
  "G99": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1080&h=720&q=85",
  "Ireo Skyon": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1080&h=720&q=85",
  "Emaar MGF The Palm Drive": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1080&h=720&q=85",
  "Indiabulls Enigma": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1080&h=720&q=85",
  "Brisk Lumbini Terrace Homes": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1080&h=720&q=85",
  "Emaar Imperial Gardens": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1080&h=720&q=85",
  "M3M Latitude": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1080&h=720&q=85",
  "Shapoorji Pallonji Joyville Gurugram": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1080&h=720&q=85",
  "Signature Global City": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1080&h=720&q=85",
  "M3M Capital": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1080&h=720&q=85",
  "Emaar MGF Sky Terraces": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1080&h=720&q=85",
  "Puri Diplomatic Greens": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1080&h=720&q=85",
  "M3M Golfestate": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1080&h=720&q=85",
  "Emaar Digihomes": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1080&h=720&q=85",
  "La Vida by Tata Housing": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1080&h=720&q=85",
  "Raisina Residency": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1080&h=720&q=85",
  "Conscient Heritage One": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1080&h=720&q=85",
  "ILD Grand": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1080&h=720&q=85",
  "Parsvnath Exotica": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1080&h=720&q=85",
  "Suncity Essel Towers": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1080&h=720&q=85",
  "Ireo Victory Valley": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1080&h=720&q=85",
  "DLF Park Place": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1080&h=720&q=85",
  "Elan The Mark": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1080&h=720&q=85",
  "Sobha City": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1080&h=720&q=85",
  "Godrej Meridien": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1080&h=720&q=85",
  "Conscient Heritage Max": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1080&h=720&q=85",
  "Pioneer Park": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1092&h=728&q=85",
  "DLF Belvedere Towers": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1080&h=720&q=85",
  "Vatika Independent Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1080&h=720&q=85",
  "DLF Westend Heights": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&h=720&q=85",
  "DLF Wellington Estate": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1092&h=728&q=85",
  "Emaar The Palm Springs": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1080&h=720&q=85",
  "Central Park Flower Valley Mikasa Plots": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1080&h=720&q=85",
  "DLF Regal Gardens": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ansal Housing Highland Park": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1092&h=728&q=85",
  "Satya The Hermitage": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1092&h=728&q=85",
  "Hero Homes": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1092&h=728&q=85",
  "M3M Woodshire": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1092&h=728&q=85",
  "DLF Belvedere Park": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1080&h=720&q=85",
  "Malibu Towne": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1080&h=720&q=85",
  "Anant Raj Estate Plots": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1080&h=720&q=85",
  "Anant Raj Estates": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1080&h=720&q=85",
  "Shree Vardhman City": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1080&h=720&q=85",
  "Uppal Southend": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1080&h=720&q=85",
  "Ansals Shiva Som Valley": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1080&h=720&q=85",
  "Pareena Mi Casa": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1092&h=728&q=85",
  "Vipul Tatvam Villa": "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1080&h=720&q=85",
  "Unitech Nirvana Birch Court": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1080&h=720&q=85",
  "Emaar MGF Palm Studios": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1092&h=728&q=85",
  "M3M Merlin": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1092&h=728&q=85",
  "Vatika Express City": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1092&h=728&q=85",
  "Satya Merano Greens": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1092&h=728&q=85",
  "Unitech South City 2": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1080&h=720&q=85",
  "Krisumi Waterfall Residences": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1092&h=728&q=85",
  "Vatika One Express City": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ireo Uptown": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1092&h=728&q=85",
  "Orris Woodview Residencies": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ansal API Esencia": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1092&h=728&q=85",
  "M3M Heights": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1092&h=728&q=85",
  "M3M Skycity": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1092&h=728&q=85",
  "Mahindra Aura": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1080&h=720&q=85",
  "Apex Our Homes": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1092&h=728&q=85",
  "Orchid Island": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1080&h=720&q=85",
  "Adani Brahma Samsara Vilasa": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1092&h=728&q=85",
  "Bestech Park View Ananda": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1080&h=720&q=85",
  "Mayfield Gardens": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1080&h=720&q=85",
  "Raheja Atlantis": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ansals Palam Vihar": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1080&h=720&q=85",
  "All Punjabi Welfare Association": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1092&h=728&q=85",
  "CGHS Doordarshan Apartments": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1092&h=728&q=85",
  "Emaar Emerald Hills": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1104&h=736&q=85",
  "Ansal API Versalia": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1092&h=728&q=85",
  "Central Park Flower Valley": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1092&h=728&q=85",
  "Silverglades The Melia": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1092&h=728&q=85",
  "Central Park Resorts": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1092&h=728&q=85",
  "ATS Tourmaline": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1092&h=728&q=85",
  "ATS Kocoon": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1092&h=728&q=85",
  "Signature Global Park 4": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1092&h=728&q=85",
  "Central Park 2 Bellevue": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1092&h=728&q=85",
  "CHD Avenue 71": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1092&h=728&q=85",
  "DLF The Primus": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1092&h=728&q=85",
  "Breez Global Heights 88A": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1104&h=736&q=85",
  "Vipul World": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1092&h=728&q=85",
  "Tata Primanti": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1092&h=728&q=85",
  "Godrej Habitat": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1104&h=736&q=85",
  "Godrej Air": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1104&h=736&q=85",
  "Vatika Primrose Floors": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1092&h=728&q=85",
  "Anant Raj Ashok Estate": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1092&h=728&q=85",
  "Eros Rosewood City": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1092&h=728&q=85",
  "Unitech Greenwood City": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1092&h=728&q=85",
  "Breez Global Heights": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1104&h=736&q=85",
  "GLS Arawali Homes": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1104&h=736&q=85",
  "Signature The Serenas": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1104&h=736&q=85",
  "Piedmont Taksila Heights": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1104&h=736&q=85",
  "M3M Polo Suites": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1104&h=736&q=85",
  "Paras Dews": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1104&h=736&q=85",
  "Indiabulls Centrum Park": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1104&h=736&q=85",
  "Unitech Fresco": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1104&h=736&q=85",
  "Shree Vardhman Victoria": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1104&h=736&q=85",
  "Shree Vardhman Mantra": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1104&h=736&q=85",
  "Signature Global Park": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1092&h=728&q=85",
  "Emaar MGF Emerald Floors Premier": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1092&h=728&q=85",
  "SS The Leaf": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1104&h=736&q=85",
  "Adani M2K Oyster Grande": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1104&h=736&q=85",
  "Godrej Oasis": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1104&h=736&q=85",
  "Assotech Blith": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1104&h=736&q=85",
  "Pareena Express Heights": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1104&h=736&q=85",
  "Pareena Coban Residences": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1104&h=736&q=85",
  "Bestech Park View Sanskruti": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1092&h=728&q=85",
  "Tulip Violet": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1104&h=736&q=85",
  "DLF Richmond Park": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1116&h=744&q=85",
  "Suncity Vatsal Valley": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1104&h=736&q=85",
  "Vatika Gurgaon 21": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1116&h=744&q=85",
  "Godrej Nature Plus": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1116&h=744&q=85",
  "Bestech Park View Spa Next": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1092&h=728&q=85",
  "Tulip Ivory": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1092&h=728&q=85",
  "Tulip Yellow": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1116&h=744&q=85",
  "Suncity Platinum Towers": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1092&h=728&q=85",
  "Bestech Park View City 2": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1092&h=728&q=85",
  "Mahindra Luminare": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1116&h=744&q=85",
  "Conscient Elevate": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1116&h=744&q=85",
  "Bestech Altura": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1116&h=744&q=85",
  "Mapsko Casa Bella": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1116&h=744&q=85",
  "Breez Global Heights 89": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1116&h=744&q=85",
  "BPTP Terra": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1116&h=744&q=85",
  "Raheja Vanya": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1104&h=736&q=85",
  "AIPL Zen Residences": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1116&h=744&q=85",
  "BPTP Park Serene": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ardee City": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1104&h=736&q=85",
  "GPL Eden Heights": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1116&h=744&q=85",
  "Spaze Privy AT4": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF New Town Heights 2": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1104&h=736&q=85",
  "Emaar Urban Oasis": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1116&h=744&q=85",
  "Pyramid Urban": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF Exclusive Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1104&h=736&q=85",
  "Orchid Petals": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF City Plots Phase 2": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1104&h=736&q=85",
  "M2K Aura": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1116&h=744&q=85",
  "Central Park Flower Valley Cerise Floors": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1104&h=736&q=85",
  "SS The Coralwood": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1116&h=744&q=85",
  "Ansal Sushant Lok 2": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1104&h=736&q=85",
  "Ambience Lagoon": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1116&h=744&q=85",
  "Vatika India Next Plots": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1104&h=736&q=85",
  "M3M Golf Hills": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1116&h=744&q=85",
  "Birla Navya": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1104&h=736&q=85",
  "ATS Marigold": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1128&h=752&q=85",
  "GLS Avenue 86": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF The Camellias": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1104&h=736&q=85",
  "Ashiana Amarah": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1128&h=752&q=85",
  "Shree Vardhman Flora": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF The Belaire": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1104&h=736&q=85",
  "Emaar Palm Gardens": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1128&h=752&q=85",
  "Unitech Heritage City": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1104&h=736&q=85",
  "Mapsko Royale Ville": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1104&h=736&q=85",
  "Mapsko Paradise": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF The Skycourt": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF Carlton Estate": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ireo The Corridors": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1128&h=752&q=85",
  "Suncity Township": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1104&h=736&q=85",
  "Ansal Sushant Apartments": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1128&h=752&q=85",
  "Power Grid Township": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1128&h=752&q=85",
  "La Lagune": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1104&h=736&q=85",
  "M3M Soulitude": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1128&h=752&q=85",
  "Signature Global Solera 2": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1128&h=752&q=85",
  "Adani Oyster Greens": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1104&h=736&q=85",
  "Orchid Gardens": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1128&h=752&q=85",
  "Roots Courtyard": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1104&h=736&q=85",
  "Signature Global Solera": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1128&h=752&q=85",
  "Shree Ganesh Apartments": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1128&h=752&q=85",
  "Unitech Aspen Greens": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1080&h=720&q=85",
  "Ansal Heights": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1128&h=752&q=85",
  "Emaar MGF Premier Terraces": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1128&h=752&q=85",
  "Emaar MGF Emerald Floors": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1104&h=736&q=85",
  "DLF South City 1": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1104&h=736&q=85",
  "Puri Emerald Bay": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1128&h=752&q=85",
  "Raheja Sampada": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1128&h=752&q=85",
  "BPTP Green Oaks": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1116&h=744&q=85",
  "Ansal Florence Residency": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1116&h=744&q=85",
  "Nirvana Cedar Crest": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1116&h=744&q=85",
  "SS Aaron Ville": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1116&h=744&q=85",
  "Signature Global City 63A": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF Oakwood Estate": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1080&h=720&q=85",
  "Unitech Deerwood Chase": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1116&h=744&q=85",
  "Emaar MGF Marbella": "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1080&h=720&q=85",
  "International City by Sobha Phase 1": "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1080&h=720&q=85",
  "Navraj The Antalyas": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1116&h=744&q=85",
  "Vipul Orchid Gardens": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1104&h=736&q=85",
  "Vatika Xpressions": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1116&h=744&q=85",
  "Signature Global City 92": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1116&h=744&q=85",
  "MRG World Ultimus": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1140&h=760&q=85",
  "MRG Primark 90": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1140&h=760&q=85",
  "Pareena Rama Homes": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1140&h=760&q=85",
  "Suncity Avenue 76": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1140&h=760&q=85",
  "Agrante Kavyam": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1140&h=760&q=85",
  "ROF Insignia Park": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1104&h=736&q=85",
  "JMS The Nation": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1116&h=744&q=85",
  "Landmark The Homes 81": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1140&h=760&q=85",
  "TDI Ourania": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1104&h=736&q=85",
  "Eldeco Accolade": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1140&h=760&q=85",
  "Suncity Heights": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1104&h=736&q=85",
  "Eros Wembley Estate": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1140&h=760&q=85",
  "DLF The Summit": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1104&h=736&q=85",
  "DLF The Pinnacle": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1104&h=736&q=85",
  "Eros Rosewood Villas": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1116&h=744&q=85",
  "Unitech Palms South City 1": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1080&h=720&q=85",
  "Silverglades Hightown Residences": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1104&h=736&q=85",
  "Paras Quartier": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1116&h=744&q=85",
  "Pyramid Urban Homes": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1140&h=760&q=85",
  "Cdot Apartment": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1140&h=760&q=85",
  "BPTP Freedom Park Life": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1140&h=760&q=85",
  "Vatika Signature Villas": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1080&h=720&q=85",
  "Trump Tower": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1116&h=744&q=85",
  "Capital Residences 360": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1140&h=760&q=85",
  "HBH Galaxy Apartments": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1140&h=760&q=85",
  "Ambience Caitriona": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF City Plots": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1092&h=728&q=85",
  "Bestech Park View City": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1116&h=744&q=85",
  "Vipul Greens": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1140&h=760&q=85",
  "ROF Normanton Park": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1116&h=744&q=85",
  "Lion Infra Green Valley": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1116&h=744&q=85",
  "New Shivalik Apartments": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1116&h=744&q=85",
  "Birla Navya Avik": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1116&h=744&q=85",
  "Ambience Creacions": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1140&h=760&q=85",
  "Ansal Sushant Lok Plots": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1116&h=744&q=85",
  "SS Linden Floors": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1116&h=744&q=85",
  "Oxirich Chintamanis": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1140&h=760&q=85",
  "CGHS HEWO Apartments": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1140&h=760&q=85",
  "Corona Optus": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF City Plots Phase 3": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF Ridgewood Estate": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1116&h=744&q=85",
  "DLF The Magnolias": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1116&h=744&q=85",
  "Adani Brahma Samsara": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1128&h=752&q=85",
  "Sare Homes": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1116&h=744&q=85",
  "The United Friends Gh-31": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1140&h=760&q=85",
  "Mapsko Mount Ville": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1140&h=760&q=85",
  "Parsvnath Green Ville": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1140&h=760&q=85",
  "National Media Centre": "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1092&h=728&q=85",
  "AB Realty The Valencia": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1128&h=752&q=85",
  "Unitech Rakshak Apartment": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1152&h=768&q=85",
  "Omaxe The Nile": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1152&h=768&q=85",
  "The Lions CGHS": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1116&h=744&q=85",
  "Vipul Lavanya": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1152&h=768&q=85",
  "Vatika Emilia Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1128&h=752&q=85",
  "Orris Carnation Residency": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1152&h=768&q=85",
  "Kiran Residency": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1152&h=768&q=85",
  "BPTP Astaire Gardens": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1128&h=752&q=85",
  "New Anand Apartments": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1116&h=744&q=85",
  "Sagar Apartment": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1152&h=768&q=85",
  "Central Park Flower Valley Aqua Front Towers": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1152&h=768&q=85",
  "Central Park The Room": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1152&h=768&q=85",
  "Ireo The Grand Arch": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1152&h=768&q=85",
  "Smart World Orchard": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1128&h=752&q=85",
  "Vatika City": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1152&h=768&q=85",
  "Emaar MGF Palm Terraces Select": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1116&h=744&q=85",
  "Bestech Park View Spa": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1128&h=752&q=85",
  "Pioneer Urban Presidia": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1128&h=752&q=85",
  "TARC Maceo": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1152&h=768&q=85",
  "Bestech Park View Grand Spa": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1152&h=768&q=85",
  "HCBS Sports Ville": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1152&h=768&q=85",
  "Today Princeton Floors": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1128&h=752&q=85",
  "The Close North": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF Alameda": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1128&h=752&q=85",
  "Aabhas Society": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ireo City Plots": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ansal Maple Heights": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1152&h=768&q=85",
  "Tarika Apartments": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1128&h=752&q=85",
  "Emaar MGF Emerald Floors Select": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1128&h=752&q=85",
  "SHF Homes": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1128&h=752&q=85",
  "GLS Avenue 51": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1152&h=768&q=85",
  "ROF Ananda": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1152&h=768&q=85",
  "Godrej Icon": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1152&h=768&q=85",
  "Microtek Greenburg": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1128&h=752&q=85",
  "Orris Aster Court Premier": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ansal Maple Crescent": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1152&h=768&q=85",
  "HUDA CGHS": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1152&h=768&q=85",
  "DLF New Town Heights 1": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1128&h=752&q=85",
  "Emaar MGF The Vilas": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1128&h=752&q=85",
  "Puri The Aravallis": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1128&h=752&q=85",
  "Pyramid Palm County": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1128&h=752&q=85",
  "SBTL Gateway 95": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1140&h=760&q=85",
  "International City by SOBHA Phase 2": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1092&h=728&q=85",
  "Vatika Lifestyle Homes": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1152&h=768&q=85",
  "Unitech The World Spa West": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1128&h=752&q=85",
  "M3M Antalya Hills": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1164&h=776&q=85",
  "M3M The Marina": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ashiana Anmol": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1164&h=776&q=85",
  "M3M Escala": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1164&h=776&q=85",
  "Tulip Leaf": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1164&h=776&q=85",
  "Signature Global City 79B": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1164&h=776&q=85",
  "Signature Global City 93": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ramprastha The Edge Towers": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ramprastha Primera": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1164&h=776&q=85",
  "Signature Global City 81": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ramprastha The Atrium": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1164&h=776&q=85",
  "DLF Regency Park 2": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1164&h=776&q=85",
  "Kibithu Villas": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF The Icon": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1128&h=752&q=85",
  "Elan The Presidential": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1128&h=752&q=85",
  "DLF Independent Floors at DLF City Phase 1 and 3": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1128&h=752&q=85",
  "Ansals Florence Villa": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1092&h=728&q=85",
  "Chintels Serenity": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1164&h=776&q=85",
  "DLF City Plots Phase 4": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1140&h=760&q=85",
  "AWHO Sispal Vihar": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1140&h=760&q=85",
  "Atulyam-83": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1140&h=760&q=85",
  "Today Blossoms 1": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1092&h=728&q=85",
  "Eldeco Mansionz": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1092&h=728&q=85",
  "Unitech Uniworld Resorts": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1092&h=728&q=85",
  "Experion The Heartsong": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1164&h=776&q=85",
  "Bhagwanti Apartment": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1164&h=776&q=85",
  "SBTL Caladium": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1164&h=776&q=85",
  "Satya The Legend": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1164&h=776&q=85",
  "Godrej Nature Plus Serenity": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1164&h=776&q=85",
  "Smart World Gems": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1140&h=760&q=85",
  "Pareena Laxmi Apartments": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1164&h=776&q=85",
  "HSIIDC Sidco Shivalik Apartments": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1164&h=776&q=85",
  "Whiteland The Aspen": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1140&h=760&q=85",
  "Whiteland Blissville": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1164&h=776&q=85",
  "Vatika Sovereign Next": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1140&h=760&q=85",
  "AIPL The Peaceful Homes": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1176&h=784&q=85",
  "Tashee Capital Gateway": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1140&h=760&q=85",
  "Bestech Park View Residency": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF Garden City Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1140&h=760&q=85",
  "Buildwick The Mist": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1140&h=760&q=85",
  "Woodstock Floors": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1140&h=760&q=85",
  "Emaar Gurgaon Greens": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF New Town Heights": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1140&h=760&q=85",
  "MRG The Crown": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1140&h=760&q=85",
  "Signature Global City 37D Ph 2": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF Gardencity Enclave": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1140&h=760&q=85",
  "AWHO Shanti Vihar": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1176&h=784&q=85",
  "Ansal Heights 86": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1140&h=760&q=85",
  "Today Blossoms 2": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1140&h=760&q=85",
  "AP Floors 1": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1140&h=760&q=85",
  "Vatika India Next": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1140&h=760&q=85",
  "JMS Megacity": "https://images.unsplash.com/photo-1516095901529-0ef7be431a4f?auto=format&fit=crop&w=1140&h=760&q=85",
  "Pareena Hanu Residency": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1176&h=784&q=85",
  "Vatika Boulevard Residences and Heights": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1176&h=784&q=85",
  "Smartworld One DXP": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1140&h=760&q=85",
  "Laburnum Victory Floors": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1152&h=768&q=85",
  "DLF Gardencity": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1140&h=760&q=85",
  "BPTP Park Prime": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1176&h=784&q=85",
  "M3M Crown": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1140&h=760&q=85",
  "Emaar Emerald Classic": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1176&h=784&q=85",
  "Tulip Monsella": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF The Crest": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1176&h=784&q=85",
  "M3M Sierra 68": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1176&h=784&q=85",
  "Spaze Privy": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1176&h=784&q=85",
  "ROF Aalayas": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1176&h=784&q=85",
  "Central Park Flower Valley Flamingo Floors": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1152&h=768&q=85",
  "DLF Royalton Tower": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1140&h=760&q=85",
  "Zara Aavaas": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1176&h=784&q=85",
  "Emaar MGF Palm Hills": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1176&h=784&q=85",
  "NBCC Heights": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1140&h=760&q=85",
  "Tata Gurgaon Gateway": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF The Arbour": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1176&h=784&q=85",
  "Godrej Summit": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1176&h=784&q=85",
  "Signature The Roselia": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1176&h=784&q=85",
  "M3M St Andrews": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1140&h=760&q=85",
  "Krrish Florence Estate": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1188&h=792&q=85",
  "Tulip Orange": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1188&h=792&q=85",
  "Emaar MGF The Enclave": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1188&h=792&q=85",
  "Unitech Uniworld City": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1140&h=760&q=85",
  "Orchid IVY Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1152&h=768&q=85",
  "Ansal Eden Villa": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1152&h=768&q=85",
  "The Close South": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1188&h=792&q=85",
  "DLF Beverly Park": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1152&h=768&q=85",
  "GLS Avenue City": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1140&h=760&q=85",
  "Emaar MGF Palm Terraces": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1152&h=768&q=85",
  "BPTP Pedestal": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1152&h=768&q=85",
  "Raheja Navodaya": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1188&h=792&q=85",
  "Pyramid Urban Homes 2": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1188&h=792&q=85",
  "Vatika City Homes": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1188&h=792&q=85",
  "DLF The Aralias": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1152&h=768&q=85",
  "Kibuthu Villa": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1152&h=768&q=85",
  "Ansal Harmony Homes": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1152&h=768&q=85",
  "4S Aradhya Homes": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1152&h=768&q=85",
  "Imperia The Esfera": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1188&h=792&q=85",
  "Ganga Nandaka": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1152&h=768&q=85",
  "Unitech The Residences": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1188&h=792&q=85",
  "Saksham Welfare Association": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1152&h=768&q=85",
  "Abhas Apartment": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1152&h=768&q=85",
  "Ashiana Mulberry": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1188&h=792&q=85",
  "Karanvir Towers": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1188&h=792&q=85",
  "Balaji Apartment": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1188&h=792&q=85",
  "Umang Winter Hills": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1188&h=792&q=85",
  "Sheetla Enclave": "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1092&h=728&q=85",
  "Tulip White": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1188&h=792&q=85",
  "Landmark Avana": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1164&h=776&q=85",
  "Emaar MGF Emerald Estate": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1188&h=792&q=85",
  "SS Southend Floors": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1164&h=776&q=85",
  "Unitech Espace": "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1092&h=728&q=85",
  "Godrej Aria": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1188&h=792&q=85",
  "Royal Homez": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1152&h=768&q=85",
  "DLF Princeton Estate": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1188&h=792&q=85",
  "Unitech Harmony": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1188&h=792&q=85",
  "Suvidha Apartment": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1188&h=792&q=85",
  "Sanskriti Apartments": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1188&h=792&q=85",
  "DLF The Grove": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1164&h=776&q=85",
  "Guru Gram Haryana CGHS": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1152&h=768&q=85",
  "Supertech Araville": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&h=800&q=85",
  "Baani City Center": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&h=800&q=85",
  "The Laburnum": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1152&h=768&q=85",
  "Greenopolis": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&h=800&q=85",
  "Tulip Purple": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1152&h=768&q=85",
  "Umang Monsoon Breeze": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&h=800&q=85",
  "Emaar Palm Heights": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&h=800&q=85",
  "Central Park": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1152&h=768&q=85",
  "M3M Ikonic": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&h=800&q=85",
  "DLF Park Heights": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&h=800&q=85",
  "Raheja Vedaanta": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&h=800&q=85",
  "Pioneer Araya": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1152&h=768&q=85",
  "Pivotal 84 Down Street": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&h=800&q=85",
  "Saan Verdante": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1200&h=800&q=85",
  "SS The Palladians": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1164&h=776&q=85",
  "M3M Corner Walk": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1200&h=800&q=85",
  "SS The Lilac": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1164&h=776&q=85",
  "SS Cendana Residences": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1200&h=800&q=85",
  "Sare Crescent Parc": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1152&h=768&q=85",
  "Diplomats Golf Link": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1200&h=800&q=85",
  "Godrej 101": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&h=800&q=85",
  "Vatika Sovereign Park": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1152&h=768&q=85",
  "Trisara Our Homes 3": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1200&h=800&q=85",
  "Emaar Palm Premier": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1200&h=800&q=85",
  "M2K Villa": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1200&h=800&q=85",
  "DLF Regency Park 1": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1200&h=800&q=85",
  "CGHS Paarth Apartments": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&h=800&q=85",
  "Shri Banke Bihari Society": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&h=800&q=85",
  "Hextax Commune": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1212&h=808&q=85",
  "Salcon The Verandas": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1152&h=768&q=85",
  "DLF Silver Oaks": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1164&h=776&q=85",
  "Kendriya Vihar": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1212&h=808&q=85",
  "Mittal Cosmos Executive Apartments": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1212&h=808&q=85",
  "Crest Infratech Floors 2": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ardee Palm Grove Heights": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1212&h=808&q=85",
  "Paras Irene": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1212&h=808&q=85",
  "Tulsiani Easy in Homes": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1212&h=808&q=85",
  "Ansals Boom Plaza": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1164&h=776&q=85",
  "M3M Flora": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1212&h=808&q=85",
  "Royal Homes": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1164&h=776&q=85",
  "Dhoot Time Residency": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1212&h=808&q=85",
  "Jasminium Apartment": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1212&h=808&q=85",
  "Bancourt Apartment": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1164&h=776&q=85",
  "Whiteland Arena 76": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1212&h=808&q=85",
  "AWHO Sujjan Vihar": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1212&h=808&q=85",
  "Ansal Sushant Residency": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ansals Sushant Floors": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1164&h=776&q=85",
  "Unitech Ivory Towers": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1212&h=808&q=85",
  "Unitech Escape": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1212&h=808&q=85",
  "The Rama Apartment CGHS": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1164&h=776&q=85",
  "Vatika The Seven Lamps": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1212&h=808&q=85",
  "Satya The Surbhi Apartment": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1164&h=776&q=85",
  "Paras Connoisseur Twin Tower": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ansal API Sushant Estate": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1212&h=808&q=85",
  "Vatika Seven Elements": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1212&h=808&q=85",
  "Ameya Sapphire Residences": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1212&h=808&q=85",
  "Vatika INXT Floors": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1176&h=784&q=85",
  "Malibu Towers": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1176&h=784&q=85",
  "DLF Privana North": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ansal Oriental Villas": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1092&h=728&q=85",
  "Ajaat Shatru Society": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1164&h=776&q=85",
  "Nirvana Country": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1176&h=784&q=85",
  "New Greenwood Society": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1164&h=776&q=85",
  "Central Park Resort Belgravia Residences": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1212&h=808&q=85",
  "Ansal API Spanish Court": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1092&h=728&q=85",
  "Shiv Shankar Society": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1212&h=808&q=85",
  "Suncity Avenue 102": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1212&h=808&q=85",
  "Vipul Belmonte": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1224&h=816&q=85",
  "DLF Hamilton Court": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1164&h=776&q=85",
  "Vatika Iris Floors": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1176&h=784&q=85",
  "Emaar Palm Select": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1224&h=816&q=85",
  "Lord Krishna CGHS": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1164&h=776&q=85",
  "DLF Windsor Court": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1164&h=776&q=85",
  "M3M Paragon 57": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1224&h=816&q=85",
  "Signature Global Grand IVA": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1224&h=816&q=85",
  "DLF Amaltas Drive": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1176&h=784&q=85",
  "Today Luxotica": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1176&h=784&q=85",
  "Antriksh Royal Palm Apartments": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1224&h=816&q=85",
  "Birch Street": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1176&h=784&q=85",
  "Corona Gracieux": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1224&h=816&q=85",
  "Bedarwal Consortium Sixty Three Golf Drive": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1224&h=816&q=85",
  "Signature Global Prime": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1224&h=816&q=85",
  "Gulmohar Apartment": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1224&h=816&q=85",
  "Progressive Society": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1164&h=776&q=85",
  "Antriksh Skyland Apartments": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1224&h=816&q=85",
  "Green Homes": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1224&h=816&q=85",
  "Ansals Florence Marvel": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1164&h=776&q=85",
  "Ganpati Apartment": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1224&h=816&q=85",
  "Parth CGHS": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1224&h=816&q=85",
  "Raheja Shilas": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1224&h=816&q=85",
  "Flora Avenue 33": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1224&h=816&q=85",
  "Central Park Flower Valley The Room": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1224&h=816&q=85",
  "Valley View Estate": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1224&h=816&q=85",
  "Marc House": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1104&h=736&q=85",
  "MVN Athens": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1224&h=816&q=85",
  "Breez Global Hill View": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1224&h=816&q=85",
  "HUDA PWO Housing Complex": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1224&h=816&q=85",
  "Central Park Flower Valley Clover Floors": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1176&h=784&q=85",
  "Raheja Akshara": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1140&h=760&q=85",
  "Unitech South City Heights": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1236&h=824&q=85",
  "Smriti Apartment": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1236&h=824&q=85",
  "Pivotal Riddhi Siddhi": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1236&h=824&q=85",
  "Millenium Bajrang Society": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1176&h=784&q=85",
  "Prerna Society": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1236&h=824&q=85",
  "KW Royal Court": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1176&h=784&q=85",
  "Mariners Home": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1176&h=784&q=85",
  "AIPL Club Residences": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1236&h=824&q=85",
  "Akash Ganga Apartment": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1236&h=824&q=85",
  "DLF Pink Town House": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1176&h=784&q=85",
  "IFFCO Nagar and 17B RWA": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1176&h=784&q=85",
  "SS Almeria": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1236&h=824&q=85",
  "ILD Greens": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1236&h=824&q=85",
  "Huda HBC Society": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1176&h=784&q=85",
  "ROF Amaltas": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1236&h=824&q=85",
  "Signature Andour Heights": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1236&h=824&q=85",
  "Pyramid Pride": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1236&h=824&q=85",
  "BPTP Visionnaire": "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1104&h=736&q=85",
  "Zara Rossa": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1236&h=824&q=85",
  "AKDA Mihir Apartments": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1176&h=784&q=85",
  "Shree Ganesh Apartment": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1236&h=824&q=85",
  "Park Royal Apartment": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1236&h=824&q=85",
  "JBMR The Mist": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1236&h=824&q=85",
  "BPTP Spacio": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1236&h=824&q=85",
  "Silverglades The Ivy": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1176&h=784&q=85",
  "The Penthouses at the Hibiscus": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1176&h=784&q=85",
  "SS Hibiscus": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1236&h=824&q=85",
  "Laburnum Apartment": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1176&h=784&q=85",
  "Unitech Uniworld Gardens": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1176&h=784&q=85",
  "Raheja Atharva": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1176&h=784&q=85",
  "Unitech Residency Greens": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1188&h=792&q=85",
  "The Retreat": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1236&h=824&q=85",
  "Madhur Jeevan Apartments": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1176&h=784&q=85",
  "Citizen Apartment": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1176&h=784&q=85",
  "Sahara Grace": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1104&h=736&q=85",
  "M3M Duo High": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1236&h=824&q=85",
  "Ansal Florence Elite": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1104&h=736&q=85",
  "IRWO Classic Apartments": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1236&h=824&q=85",
  "S S Delight and Splendours": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1188&h=792&q=85",
  "Antriksh Green": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1176&h=784&q=85",
  "Avalon Heights CGHS": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1248&h=832&q=85",
  "BPTP Park Generations": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1248&h=832&q=85",
  "AWHO Vijay Rattan Vihar": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1248&h=832&q=85",
  "The Royal Residency CGHS": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1248&h=832&q=85",
  "Hector Trimurti Heights": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1188&h=792&q=85",
  "Forte The Olive Crescent": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1248&h=832&q=85",
  "Apex Apartments": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1248&h=832&q=85",
  "Essel Tower": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1188&h=792&q=85",
  "Native Visionnaire Luxe Villas": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1104&h=736&q=85",
  "Orris Aster Court": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1248&h=832&q=85",
  "Ansal Florence Super": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1188&h=792&q=85",
  "Progressive RWA": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1104&h=736&q=85",
  "Rainbow Apartments": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1188&h=792&q=85",
  "DLF Trinity Towers": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1188&h=792&q=85",
  "Unitech Uniworld Gardens 2": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1248&h=832&q=85",
  "RWA East Pocket": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1104&h=736&q=85",
  "Ajanta Apartment": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1248&h=832&q=85",
  "Pivotal Devaan": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1248&h=832&q=85",
  "Spaze Privvy The Address": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1248&h=832&q=85",
  "Suposhaa Smartworld Orchard": "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=1188&h=792&q=85",
  "Ace Palm Floors": "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1188&h=792&q=85",
  "Krrish Provence Estate": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1188&h=792&q=85",
  "Silverglades Tarudhan Valley Golf Resort": "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1104&h=736&q=85",
  "Signature Global Orchard Avenue 2": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1248&h=832&q=85",
  "GLS Avenue 81": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1248&h=832&q=85",
  "MRG Primark": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1248&h=832&q=85",
  "Yashika 104": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1248&h=832&q=85",
  "Czar Mahira Homes 104": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1248&h=832&q=85",
  "Signature Global Proxima": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1248&h=832&q=85",
  "ROF Alante": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1248&h=832&q=85",
  "Jalvayu Towers": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1248&h=832&q=85",
  "Ardee Platinum": "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?auto=format&fit=crop&w=1188&h=792&q=85",
  "Ardee The Residency": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1188&h=792&q=85",
  "Central Park Resorts Sky Villas": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1248&h=832&q=85",
  "Ekta Apartments": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1260&h=840&q=85",
  "Godrej Frontier": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1260&h=840&q=85",
  "SS Hibiscus 2": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1260&h=840&q=85",
  "MR KATARIA APARTMENT": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1260&h=840&q=85",
  "Antriksh Heights": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1260&h=840&q=85",
  "Palm Crest Floors": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1188&h=792&q=85",
  "JMS The Pride": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1152&h=768&q=85",
  "Eldeco Acclaim": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1260&h=840&q=85",
  "Bestech Spa Signature": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1188&h=792&q=85",
  "Siddhartha Apartment": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1260&h=840&q=85",
  "Ramprastha AWHO": "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?auto=format&fit=crop&w=1188&h=792&q=85",
  "Bhawani Apartments": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1260&h=840&q=85",
  "New Ifs Righ View Apartment": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1260&h=840&q=85",
  "Signature Global Orchard Avenue": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1260&h=840&q=85",
  "Ramsons Kshitij": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1260&h=840&q=85",
  "Stadia County Homes": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1260&h=840&q=85",
  "DLF Regent House": "https://images.unsplash.com/photo-1604328702728-d26d2062c20b?auto=format&fit=crop&w=1188&h=792&q=85",
  "Media House CGHS": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1188&h=792&q=85",
  "Abhinandan CGHS": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1188&h=792&q=85",
  "CAPITAL TOWER": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1188&h=792&q=85",
  "Royal Blue City": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1260&h=840&q=85",
  "The Pasupati CGHS": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1260&h=840&q=85",
  "Whispering Meadows": "https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&w=1188&h=792&q=85",
  "Dron Apartment": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1260&h=840&q=85",
  "AVL 36 Gurgaon": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1260&h=840&q=85",
  "Green Court": "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1260&h=840&q=85",
  "Sapphire Eighty Three": "https://images.unsplash.com/photo-1635108198979-9806fdf275c6?auto=format&fit=crop&w=1260&h=840&q=85",
  "M3M Natura": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1260&h=840&q=85",
  "Lotus Winsome Home": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1152&h=768&q=85",
  "Supertech Hill Town": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1260&h=840&q=85",
  "Arete by ILD": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1272&h=848&q=85",
  "Landmark The Residency": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1272&h=848&q=85",
  "Wembley Premium Tower": "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1272&h=848&q=85",
  "Chintels Paradiso": "https://images.unsplash.com/photo-1784894690165-8c6fe7dae24d?auto=format&fit=crop&w=1188&h=792&q=85",
  "SS Residential Condominium": "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1272&h=848&q=85",
  "Rail Vihar CGHS": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1272&h=848&q=85",
  "Surbhi Apartment": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&h=800&q=85",
  "Alaknanda Apartments": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&h=800&q=85",
  "Apna Enclave": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1188&h=792&q=85",
  "Divine Grace Apartment": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1272&h=848&q=85",
  "Millenium Apartment": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=800&q=85",
  "Plus Project Senate Court": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1272&h=848&q=85",
  "Ansal Homes": "https://images.unsplash.com/photo-1561753757-d8880c5a3551?auto=format&fit=crop&w=1188&h=792&q=85",
  "Palam Vihar Extension West Zone RWA": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=800&q=85",
  "Conscient Habitat": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1272&h=848&q=85",
  "Lotus Homz": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1272&h=848&q=85",
  "ATS Grandstand": "https://images.unsplash.com/photo-1551241090-67de81d3541c?auto=format&fit=crop&w=1272&h=848&q=85",
  "M3M Smart City": "https://images.unsplash.com/photo-1697299262049-e9b5fa1e9761?auto=format&fit=crop&w=1272&h=848&q=85",
  "Tulip Lemon": "https://images.unsplash.com/photo-1719299225324-301bad5c333c?auto=format&fit=crop&w=1272&h=848&q=85",
  "DLF The Sixty Three": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&h=800&q=85",
  "DLF Imperial Residences": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=800&q=85",
  "Spaze Kalistaa": "https://images.unsplash.com/photo-1720432972486-2d53db5badf0?auto=format&fit=crop&w=1272&h=848&q=85",
  "Mayfield Palm Floors": "https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1200&h=800&q=85",
  "Narkanda Apartment": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1272&h=848&q=85",
  "DLF Express Greens": "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=1272&h=848&q=85",
  "Ramprastha Skyz": "https://images.unsplash.com/photo-1641910532059-ad684fd3049c?auto=format&fit=crop&w=1272&h=848&q=85"
};

const PROPERTY_PHOTO_MAP_LOWER = Object.fromEntries(
  Object.entries(PROPERTY_PHOTO_MAP).map(([name, url]) => [name.toLowerCase(), url])
);

/* --------------------------------------------------------------------------
   Photo helpers
   Many PHOTO_URL values differ only by size params (w=1080 / 1092 / 1200 / 1272)
   but point to the SAME Unsplash photo. We compare photos by their photo-ID
   so a repeated picture is detected correctly, then hand out photos so that
   no two cards on screen share a picture (as far as the pool allows).
   -------------------------------------------------------------------------- */
const PHOTO_ID_RE = /images\.unsplash\.com\/(photo-[A-Za-z0-9_-]+)/;

function photoIdOf(url) {
  const m = PHOTO_ID_RE.exec(String(url || ""));
  return m ? m[1] : null;
}

function canonicalPhotoUrl(photoId) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1080&h=720&q=85`;
}

// Pool of every distinct photo available in PROPERTY_PHOTO_MAP (deduplicated by photo-ID)
const PHOTO_POOL = Array.from(
  new Set(Object.values(PROPERTY_PHOTO_MAP).map(photoIdOf).filter(Boolean))
);

function stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getPropertyPhotoUrl(propertyName, apiImageUrl) {
  if (propertyName) {
    const cleanName = String(propertyName).trim();
    if (PROPERTY_PHOTO_MAP[cleanName]) {
      return PROPERTY_PHOTO_MAP[cleanName];
    }
    const lowerMatch = PROPERTY_PHOTO_MAP_LOWER[cleanName.toLowerCase()];
    if (lowerMatch) {
      return lowerMatch;
    }
  }
  if (apiImageUrl && String(apiImageUrl).trim() !== "") {
    return String(apiImageUrl).trim();
  }
  return "";
}

/**
 * Returns one image URL per item (same order as `items`).
 * 1) A property keeps its own mapped photo if no earlier card in this list uses it.
 * 2) Otherwise it gets the least-used photo from PHOTO_POOL, so repeats only
 *    start once the list is longer than the number of distinct photos.
 */
function assignUniquePhotos(items) {
  const counts = new Map(PHOTO_POOL.map((id) => [id, 0]));
  const urls = new Array(items.length).fill("");
  const pending = [];

  items.forEach((item, i) => {
    const own = getPropertyPhotoUrl(item.property_name, item.image_url);
    const id = photoIdOf(own);
    if (!id) {
      urls[i] = own; // non-Unsplash / empty URL: leave untouched
      if (!own) pending.push(i);
      return;
    }
    if (!counts.has(id)) counts.set(id, 0);
    if (counts.get(id) === 0) {
      counts.set(id, 1);
      urls[i] = canonicalPhotoUrl(id);
    } else {
      pending.push(i);
    }
  });

  pending.forEach((i) => {
    if (PHOTO_POOL.length === 0) return;
    const start = stableHash(String(items[i].property_name || i)) % PHOTO_POOL.length;
    let bestId = null;
    let bestCount = Infinity;
    for (let k = 0; k < PHOTO_POOL.length; k++) {
      const id = PHOTO_POOL[(start + k) % PHOTO_POOL.length];
      const c = counts.get(id) || 0;
      if (c < bestCount) {
        bestCount = c;
        bestId = id;
        if (c === 0) break;
      }
    }
    counts.set(bestId, bestCount + 1);
    urls[i] = canonicalPhotoUrl(bestId);
  });

  return urls;
}

// name -> image URL for the currently loaded "nearby" list (stable while filtering)
let nearbyPhotoByName = new Map();

let cachedNearbyProperties = [];
let sessionHistory = [];
let activeAutocompleteIndex = -1;
let localityDebounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initPredictFormControls();
  initRecommendControls();
  loadSectors();
  loadInitialLocalities();
});

/* --------------------------------------------------------------------------
   1. Animated 2-Tab Switcher
   -------------------------------------------------------------------------- */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabGlider = document.getElementById("tabGlider");
  const panelPredict = document.getElementById("panelPredict");
  const panelRecommend = document.getElementById("panelRecommend");

  function switchTab(targetTab) {
    tabBtns.forEach((btn, idx) => {
      const isTarget = btn.dataset.tab === targetTab;
      btn.classList.toggle("active", isTarget);
      btn.setAttribute("aria-selected", isTarget ? "true" : "false");
      if (isTarget && tabGlider) {
        tabGlider.style.transform = `translateX(${idx * 100}%)`;
      }
    });

    if (targetTab === "predict") {
      panelPredict.hidden = false;
      panelPredict.classList.add("active");
      panelRecommend.hidden = true;
      panelRecommend.classList.remove("active");
    } else {
      panelRecommend.hidden = false;
      panelRecommend.classList.add("active");
      panelPredict.hidden = true;
      panelPredict.classList.remove("active");
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Bridge button: Jump from Price Prediction to Recommender with current sector
  const exploreBtn = document.getElementById("exploreSectorInRecBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      const selectedSector = document.getElementById("sectorSelect").value || "Sector 102";
      switchTab("recommend");
      const locInput = document.getElementById("localityInput");
      locInput.value = selectedSector;
      triggerLocalitySearchAndRecommend(selectedSector, parseFloat(document.getElementById("radiusInput").value) || 5);
    });
  }
}

/* --------------------------------------------------------------------------
   2. Load Sectors from /api/sectors (with Fallback)
   -------------------------------------------------------------------------- */
async function loadSectors() {
  const sectorSelect = document.getElementById("sectorSelect");
  const apiStatus = document.getElementById("apiStatus");
  const apiStatusText = document.getElementById("apiStatusText");

  let sectors = FALLBACK_SECTORS;

  try {
    const res = await fetch("/api/sectors");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        sectors = data;
      }
      apiStatus.classList.add("online");
      apiStatusText.textContent = "FastAPI Connected";
    } else {
      apiStatusText.textContent = "Ready (Local Schema)";
    }
  } catch (err) {
    apiStatusText.textContent = "Ready (Standby)";
  }

  sectorSelect.innerHTML = "";
  sectors.forEach((sec) => {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = sec;
    if (sec === "Sector 102") opt.selected = true;
    sectorSelect.appendChild(opt);
  });

  updateLiveSummaryLabels();
}

/* --------------------------------------------------------------------------
   3. Interactive Price Valuation Controls & Submit
   -------------------------------------------------------------------------- */
function initPredictFormControls() {
  // Segmented controls & balcony pills
  document.querySelectorAll(".segmented-control, .pill-group").forEach((group) => {
    const hiddenInput = group.querySelector("input[type='hidden']");
    const buttons = group.querySelectorAll("button");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (hiddenInput) {
          hiddenInput.value = btn.dataset.value;
          updateLiveSummaryLabels();
        }
      });
    });
  });

  // Built-up area slider <-> number input sync
  const areaInput = document.getElementById("builtUpArea");
  const areaSlider = document.getElementById("builtUpAreaRange");

  areaSlider.addEventListener("input", () => {
    areaInput.value = areaSlider.value;
    updateLiveSummaryLabels();
  });

  areaInput.addEventListener("input", () => {
    const val = parseFloat(areaInput.value);
    if (!isNaN(val)) {
      areaSlider.value = Math.min(8000, Math.max(300, val));
      updateLiveSummaryLabels();
    }
  });

  // Area preset chips
  document.querySelectorAll(".tick-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.area;
      areaInput.value = val;
      areaSlider.value = val;
      updateLiveSummaryLabels();
    });
  });

  // Bedroom & Bathroom steppers
  document.querySelectorAll(".step-ctrl").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const step = parseInt(btn.dataset.step, 10);
      const input = document.getElementById(targetId);
      if (!input) return;
      const current = parseInt(input.value, 10) || 1;
      const next = Math.min(20, Math.max(1, current + step));
      input.value = next;
      updateLiveSummaryLabels();
    });
  });

  // Compass Rose Facing Selector
  const compassBtns = document.querySelectorAll(".compass-btn");
  const inputFacing = document.getElementById("inputFacing");
  const compassBadge = document.getElementById("compassBadge");

  compassBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      compassBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      inputFacing.value = btn.dataset.dir;
      compassBadge.textContent = btn.dataset.dir;
      updateLiveSummaryLabels();
    });
  });

  // Sector & Age change listeners
  document.getElementById("sectorSelect").addEventListener("change", updateLiveSummaryLabels);
  document.getElementById("agePossessionSelect").addEventListener("change", updateLiveSummaryLabels);

  // Clear history log
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    sessionHistory = [];
    renderValuationHistory();
  });

  // Form Submission -> POST /predict
  const predictForm = document.getElementById("predictForm");
  predictForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitPricePrediction();
  });
}

function getPredictFormPayload() {
  return {
    bedRoom: parseInt(document.getElementById("bedRoomInput").value, 10),
    bathroom: parseInt(document.getElementById("bathroomInput").value, 10),
    built_up_area: parseFloat(document.getElementById("builtUpArea").value),
    servant_room: document.getElementById("inputServantRoom").value,
    store_room: document.getElementById("inputStoreRoom").value,
    property_type: document.getElementById("inputPropertyType").value,
    sector: document.getElementById("sectorSelect").value,
    balcony: document.getElementById("inputBalcony").value,
    agePossession: document.getElementById("agePossessionSelect").value,
    furnishing_type: document.getElementById("inputFurnishing").value,
    luxury_category: document.getElementById("inputLuxury").value,
    floor_category: document.getElementById("inputFloor").value,
    facing: document.getElementById("inputFacing").value
  };
}

function updateLiveSummaryLabels() {
  const payload = getPredictFormPayload();
  const sectorTag = document.getElementById("resSectorTag");
  const configSummary = document.getElementById("metricConfigSummary");
  const orientationSummary = document.getElementById("metricOrientationSummary");

  if (sectorTag && payload.sector) {
    sectorTag.textContent = `${payload.sector} • ${payload.property_type}`;
  }
  if (configSummary) {
    configSummary.textContent = `${payload.bedRoom} BHK • ${Number(payload.built_up_area || 0).toLocaleString("en-IN")} sq.ft.`;
  }
  if (orientationSummary) {
    const tierMap = { Low: "Essential", Medium: "Premium", High: "Luxury" };
    orientationSummary.textContent = `${payload.facing} • ${tierMap[payload.luxury_category] || payload.luxury_category}`;
  }
}

async function submitPricePrediction() {
  const submitBtn = document.getElementById("predictSubmitBtn");
  const payload = getPredictFormPayload();

  if (!payload.built_up_area || payload.built_up_area <= 100) {
    showToast("Built-up area must be greater than 100 sq.ft.", true);
    return;
  }

  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server responded with status ${response.status}`);
    }

    const result = await response.json();
    const [low, high] = result.predicted_price_limit;
    const msg =
      result.message ||
      `The price of the ${payload.property_type} is between ₹ ${low} Cr and ₹ ${high} Cr.`;

    renderPredictionResult(low, high, msg, payload);
    showToast(`Valuation computed for ${payload.sector}`);
  } catch (err) {
    showToast(`Prediction error: ${err.message}`, true);
  } finally {
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
  }
}

function renderPredictionResult(low, high, message, payload) {
  const lowEl = document.getElementById("priceLowVal");
  const highEl = document.getElementById("priceHighVal");
  const msgEl = document.getElementById("priceMessageText");
  const midpointEl = document.getElementById("priceMidpointLabel");
  const rateSqftEl = document.getElementById("metricRateSqft");
  const heroBox = document.getElementById("priceHeroBox");
  const meterFill = document.getElementById("meterFillBar");

  const startLow = parseFloat(lowEl.textContent) || 0;
  const startHigh = parseFloat(highEl.textContent) || 0;

  animateValue(lowEl, startLow, low, 550);
  animateValue(highEl, startHigh, high, 550);

  msgEl.textContent = message;

  const midpointCr = ((low + high) / 2).toFixed(2);
  midpointEl.textContent = `Midpoint: ₹ ${midpointCr} Cr`;

  // Implied ₹ / sq.ft.
  const ratePerSqft = Math.round(((low + high) / 2 * 10000000) / payload.built_up_area);
  rateSqftEl.textContent = `₹ ${ratePerSqft.toLocaleString("en-IN")} / sq.ft.`;

  // Animate confidence bar position based on price bracket (0.5 Cr to 15 Cr scale)
  const normPos = Math.min(82, Math.max(12, Math.round(( parseFloat(midpointCr) / 12 ) * 70 + 12)));
  meterFill.style.left = `${Math.max(5, normPos - 25)}%`;
  meterFill.style.width = "50%";

  heroBox.classList.add("pulse-highlight");
  setTimeout(() => heroBox.classList.remove("pulse-highlight"), 450);

  // Append to session log
  sessionHistory.unshift({
    sector: payload.sector,
    type: payload.property_type,
    bhk: payload.bedRoom,
    area: payload.built_up_area,
    low,
    high
  });
  if (sessionHistory.length > 5) sessionHistory.pop();
  renderValuationHistory();
}

function renderValuationHistory() {
  const listEl = document.getElementById("valuationHistoryList");
  if (!sessionHistory.length) {
    listEl.innerHTML = `<li class="history-empty">Your recent property estimates will appear here for side-by-side comparison.</li>`;
    return;
  }

  listEl.innerHTML = sessionHistory
    .map(
      (item) => `
      <li class="history-item">
        <span class="history-item-meta">${item.sector} &bull; ${item.bhk}BHK ${item.type} (${item.area} sq.ft.)</span>
        <span class="history-item-price">₹ ${item.low} – ${item.high} Cr</span>
      </li>
    `
    )
    .join("");
}

function animateValue(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    el.textContent = current.toFixed(2);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* --------------------------------------------------------------------------
   4. TAB 2: Property Recommender & Cosine Similarity Discovery
   -------------------------------------------------------------------------- */
function initRecommendControls() {
  const locInput = document.getElementById("localityInput");
  const clearBtn = document.getElementById("clearLocalityBtn");
  const listbox = document.getElementById("localityListbox");
  const radiusInput = document.getElementById("radiusInput");
  const radiusSlider = document.getElementById("radiusSlider");
  const recForm = document.getElementById("recommendForm");
  const filterInput = document.getElementById("propertyFilterInput");
  const closeSimilarBtn = document.getElementById("closeSimilarPanelBtn");

  // Sync radius slider and number input
  radiusSlider.addEventListener("input", () => {
    radiusInput.value = radiusSlider.value;
  });

  radiusInput.addEventListener("input", () => {
    const val = parseFloat(radiusInput.value);
    if (!isNaN(val)) {
      radiusSlider.value = Math.min(30, Math.max(0.5, val));
    }
  });

  // Clear locality input
  clearBtn.addEventListener("click", () => {
    locInput.value = "";
    listbox.hidden = true;
    locInput.focus();
  });

  // Debounced Autocomplete Search -> GET /api/localities
  locInput.addEventListener("input", () => {
    clearTimeout(localityDebounceTimer);
    const q = locInput.value.trim();
    localityDebounceTimer = setTimeout(() => {
      fetchLocalitySuggestions(q);
    }, 160);
  });

  locInput.addEventListener("focus", () => {
    fetchLocalitySuggestions(locInput.value.trim());
  });

  // Keyboard navigation in combobox
  locInput.addEventListener("keydown", (e) => {
    const items = listbox.querySelectorAll(".autocomplete-item");
    if (listbox.hidden || !items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeAutocompleteIndex = (activeAutocompleteIndex + 1) % items.length;
      highlightAutocompleteItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeAutocompleteIndex = (activeAutocompleteIndex - 1 + items.length) % items.length;
      highlightAutocompleteItem(items);
    } else if (e.key === "Enter" && activeAutocompleteIndex >= 0) {
      e.preventDefault();
      const chosen = items[activeAutocompleteIndex].dataset.locality;
      selectLocalityOption(chosen);
    } else if (e.key === "Escape") {
      listbox.hidden = true;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".combobox-container")) {
      listbox.hidden = true;
    }
  });

  // Submit recommendation search
  recForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loc = locInput.value.trim();
    const rad = parseFloat(radiusInput.value) || 5;
    if (!loc) {
      showToast("Please enter or select a locality first.", true);
      locInput.focus();
      return;
    }
    listbox.hidden = true;
    await fetchNearbyProperties(loc, rad);
  });

  // Instant client-side filter on returned nearby properties
  filterInput.addEventListener("input", () => {
    const term = filterInput.value.trim().toLowerCase();
    const filtered = cachedNearbyProperties.filter((p) =>
      p.property_name.toLowerCase().includes(term)
    );
    renderNearbyGrid(filtered);
  });

  // Close Similar Properties Panel
  closeSimilarBtn.addEventListener("click", () => {
    document.getElementById("similarSpotlightSection").hidden = true;
  });
}

async function loadInitialLocalities() {
  const chipContainer = document.getElementById("quickLocalityChips");
  let landmarks = POPULAR_LANDMARKS;

  try {
    const res = await fetch("/api/localities?limit=12");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.localities) && data.localities.length > 0) {
        landmarks = data.localities.slice(0, 8);
      }
    }
  } catch (_) {
    // Fallback to POPULAR_LANDMARKS
  }

  chipContainer.innerHTML = landmarks
    .map(
      (loc) =>
        `<button type="button" class="landmark-chip" data-loc="${escapeHtml(loc)}">${escapeHtml(loc)}</button>`
    )
    .join("");

  chipContainer.querySelectorAll(".landmark-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chipContainer.querySelectorAll(".landmark-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const loc = chip.dataset.loc;
      document.getElementById("localityInput").value = loc;
      const rad = parseFloat(document.getElementById("radiusInput").value) || 5;
      fetchNearbyProperties(loc, rad);
    });
  });
}

async function fetchLocalitySuggestions(queryText) {
  const listbox = document.getElementById("localityListbox");
  const locInput = document.getElementById("localityInput");

  try {
    const res = await fetch(`/api/localities?q=${encodeURIComponent(queryText)}&limit=20`);
    if (!res.ok) return;
    const data = await res.json();
    const localities = data.localities || [];

    if (!localities.length) {
      listbox.hidden = true;
      return;
    }

    activeAutocompleteIndex = -1;
    listbox.innerHTML = localities
      .map(
        (loc) => `
        <li class="autocomplete-item" role="option" data-locality="${escapeHtml(loc)}">
          <span>${highlightMatch(loc, queryText)}</span>
          <small style="color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">Locality</small>
        </li>
      `
      )
      .join("");

    listbox.hidden = false;
    locInput.setAttribute("aria-expanded", "true");

    listbox.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("click", () => {
        selectLocalityOption(item.dataset.locality);
      });
    });
  } catch (_) {
    listbox.hidden = true;
  }
}

function highlightAutocompleteItem(items) {
  items.forEach((el, i) => {
    const isActive = i === activeAutocompleteIndex;
    el.classList.toggle("active", isActive);
    if (isActive) el.scrollIntoView({ block: "nearest" });
  });
}

function selectLocalityOption(localityName) {
  const locInput = document.getElementById("localityInput");
  const listbox = document.getElementById("localityListbox");
  locInput.value = localityName;
  listbox.hidden = true;
  locInput.setAttribute("aria-expanded", "false");

  const rad = parseFloat(document.getElementById("radiusInput").value) || 5;
  fetchNearbyProperties(localityName, rad);
}

async function triggerLocalitySearchAndRecommend(query, radiusKm) {
  try {
    const res = await fetch(`/api/localities?q=${encodeURIComponent(query)}&limit=5`);
    if (res.ok) {
      const data = await res.json();
      if (data.localities && data.localities.length > 0) {
        const matched = data.localities[0];
        document.getElementById("localityInput").value = matched;
        await fetchNearbyProperties(matched, radiusKm);
        return;
      }
    }
  } catch (_) {}
  await fetchNearbyProperties(query, radiusKm);
}

/* --------------------------------------------------------------------------
   5. Fetch Nearby Properties -> GET /api/recommend
   -------------------------------------------------------------------------- */
async function fetchNearbyProperties(locality, radiusKm) {
  const submitBtn = document.getElementById("recommendSubmitBtn");
  const heading = document.getElementById("recommendResultsHeading");
  const sub = document.getElementById("recommendResultsSub");

  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  try {
    const url = `/api/recommend?locality=${encodeURIComponent(locality)}&radius_km=${encodeURIComponent(radiusKm)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Could not find locality '${locality}'`);
    }

    const data = await res.json();
    cachedNearbyProperties = data.properties || [];
    {
      const nearbyUrls = assignUniquePhotos(cachedNearbyProperties);
      nearbyPhotoByName = new Map(
        cachedNearbyProperties.map((p, i) => [p.property_name, nearbyUrls[i]])
      );
    }

    heading.textContent = `${data.count} Properties within ${data.radius_km} km of ${data.locality}`;
    sub.textContent =
      data.count > 0
        ? "Click any property name or 'Find 10 Similar' to run the hybrid cosine-similarity recommender."
        : "No properties found inside this radius. Try increasing the search radius.";

    document.getElementById("propertyFilterInput").value = "";
    renderNearbyGrid(cachedNearbyProperties);
  } catch (err) {
    showToast(err.message, true);
  } finally {
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
  }
}

function renderNearbyGrid(properties) {
  const grid = document.getElementById("nearbyPropertiesGrid");

  if (!properties || properties.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-box">
        <h4>No Matching Properties Found</h4>
        <p>Select a landmark above or expand your search radius (km) to view societies in Gurgaon.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = properties
    .map((prop, idx) => {
      const imgSrc =
        nearbyPhotoByName.get(prop.property_name) ||
        getPropertyPhotoUrl(prop.property_name, prop.image_url);
      const delay = Math.min(idx * 35, 350);

      const linkHtml = prop.property_link
        ? `<a href="${escapeHtml(prop.property_link)}" target="_blank" rel="noopener noreferrer" class="btn-card-link">See Property &nearr;</a>`
        : `<span class="btn-card-link disabled">No Link</span>`;

      return `
        <article class="prop-card" style="animation-delay: ${delay}ms">
          <div class="prop-media">
            <img
              src="${escapeHtml(imgSrc)}"
              alt="${escapeHtml(prop.property_name)}"
              loading="lazy"
            />
            <span class="prop-badge-top">${prop.distance_km.toFixed(2)} km away</span>
          </div>
          <div class="prop-body">
            <div>
              <button
                type="button"
                class="prop-name-btn"
                data-propname="${escapeHtml(prop.property_name)}"
                title="Click to find top 10 similar properties"
              >
                ${escapeHtml(prop.property_name)}
              </button>
            </div>
            <div class="prop-actions">
              <button
                type="button"
                class="btn-card-similar"
                data-propname="${escapeHtml(prop.property_name)}"
              >
                Find 10 Similar
              </button>
              ${linkHtml}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach click handlers for "Find 10 Similar" and Property Title button
  grid.querySelectorAll("[data-propname]").forEach((btn) => {
    btn.addEventListener("click", () => {
      fetchSimilarProperties(btn.dataset.propname);
    });
  });
}

/* --------------------------------------------------------------------------
   6. Fetch Top-10 Similar Properties -> GET /api/similar
   -------------------------------------------------------------------------- */
async function fetchSimilarProperties(propertyName) {
  const spotlight = document.getElementById("similarSpotlightSection");
  const titleEl = document.getElementById("similarSelectedTitle");
  const extLink = document.getElementById("selectedPropertyExternalLink");
  const container = document.getElementById("similarCardsContainer");

  try {
    const url = `/api/similar?property_name=${encodeURIComponent(propertyName)}&top_n=10`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Could not compute similarity for '${propertyName}'`);
    }

    const data = await res.json();
    const selected = data.selected_property;
    const recs = data.recommendations || [];

    titleEl.innerHTML = `Top ${recs.length} Properties Similar to <span>${escapeHtml(selected.property_name)}</span>`;

    if (selected.property_link) {
      extLink.href = selected.property_link;
      extLink.hidden = false;
    } else {
      extLink.hidden = true;
    }

    const maxScore = recs.length > 0 ? Math.max(...recs.map((r) => r.similarity_score), 1) : 1;

    const similarPhotoUrls = assignUniquePhotos(recs);

    container.innerHTML = recs
      .map((rec, idx) => {
        const imgSrc = similarPhotoUrls[idx];
        const pct = Math.min(100, Math.max(18, Math.round((rec.similarity_score / maxScore) * 100)));

        const linkHtml = rec.property_link
          ? `<a href="${escapeHtml(rec.property_link)}" target="_blank" rel="noopener noreferrer" class="btn-card-link">See Property &nearr;</a>`
          : `<span class="btn-card-link disabled">No Link</span>`;

        return `
          <article class="prop-card">
            <div class="prop-media" style="height: 155px;">
              <img
                src="${escapeHtml(imgSrc)}"
                alt="${escapeHtml(rec.property_name)}"
                loading="lazy"
              />
              <span class="prop-badge-rank">#${idx + 1} Match</span>
            </div>
            <div class="prop-body">
              <div>
                <button
                  type="button"
                  class="prop-name-btn"
                  data-simprop="${escapeHtml(rec.property_name)}"
                >
                  ${escapeHtml(rec.property_name)}
                </button>
                <div class="sim-score-bar-wrap">
                  <div class="sim-score-label">
                    <span>Similarity Score</span>
                    <strong>${rec.similarity_score.toFixed(2)}</strong>
                  </div>
                  <div class="sim-bar-track">
                    <div class="sim-bar-fill" style="width: ${pct}%"></div>
                  </div>
                </div>
              </div>
              <div class="prop-actions">
                <button
                  type="button"
                  class="btn-card-similar"
                  data-simprop="${escapeHtml(rec.property_name)}"
                >
                  Pivot Similar
                </button>
                ${linkHtml}
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    spotlight.hidden = false;
    spotlight.scrollIntoView({ behavior: "smooth", block: "start" });

    container.querySelectorAll("[data-simprop]").forEach((btn) => {
      btn.addEventListener("click", () => {
        fetchSimilarProperties(btn.dataset.simprop);
      });
    });
  } catch (err) {
    showToast(err.message, true);
  }
}

/* --------------------------------------------------------------------------
   Utilities
   -------------------------------------------------------------------------- */
function showToast(message, isError = false) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.25s ease";
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightMatch(text, query) {
  const safeText = escapeHtml(text);
  if (!query) return safeText;
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safeText.replace(new RegExp(`(${safeQuery})`, "ig"), "<mark>$1</mark>");
}