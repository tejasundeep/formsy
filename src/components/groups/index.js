const religionOptions = [
    'Hinduism', 
    'Islam', 
    'Christianity', 
    'Sikhism', 
    'Buddhism', 
    'Adivasi', 
    'Jainism', 
    'Judaism', 
    'No Religion', 
    'Others'
];

const religionToCastMap = {
    Hinduism: ["Reddy", "Kamma", "Naidu", "Kapus", "Balija", "Chettiar", "Vanniyar", "Gounder",
        "Iyer", "Iyengar", "Lingayat", "Vokkaliga", "Nair", "Menon", "Ezhava",
        "Mukkulathor", "Mudaliar", "Pillai", "Nadars", "Brahmin (Saraswat)", "Brahmin (Gaur)", "Brahmin (Kanyakubj)", "Rajput",
        "Jat", "Yadav", "Kurmi", "Kayastha", "Agarwal", "Bhumihar", "Chamar",
        "Khatik", "Bania", "Thakur", "Lodhi", "Saini", "Gupta", "Teli", "Meena",
        "Chaurasia", "Ahir", "Maratha", "Kunbi", "Patel", "Leva Patel", "Modh", "Koli", "Bhandari",
        "Lohana", "Brahmin (Deshastha)", "Brahmin (Chitpavan)", "Mahadev Koli",
        "Mali", "Gurjar", "Brahmin (Kulin)", "Kayastha", "Baidya", "Namasudra", "Sadgop", "Karana",
        "Khandayat", "Teli", "Bauri", "Poddar", "Mahishya", "Brahmin (Radhi)", "Brahmin (Varendra)", "Vaishya", "Chaudhary", "Koli", "Goud", "Thiyya", "Velama", "Ravidas", "Meghwal"
    ].sort(),
    Islam: [
        "Syed", "Shaikh", "Pathan", "Mughal", "Ansari", "Qureshi", "Teli", "Mallah", "Khan",
        "Rajput Muslim", "Darzi", "Fakir", "Qassab", "Bohra", "Khoja", "Memons", "Dawoodi Bohra",
        "Siddis", "Kutchi Muslims", "Mapilla", "Labbai", "Dudekula", "Shaikh", "Syed", "Pathan",
        "Sheikh Maraikayar", "Sheikh", "Syed", "Pathan", "Mughal", "Pirzada", "Julaha", "Ghosi",
        "Choudhary", "Ansari", "Qureshi", "Dhobi Muslim", "Nai Muslim", "Mallah", "Kasai", "Hajjam",
        "Bhangi Muslim", "Meo", "Momin", "Pirzada", "Sayyid", "Qazi", "Shaikh Siddiqui"
    ].sort(),
    Christianity: [
        "Syrian Christian", "Latin Catholic", "Malankara Catholic", "Malabar Catholic", "Knanaya", "Anglo-Indian", 
        "Nadar Christian", "Paravar Christian", "Mukkulathor Christian", "Vellalar Christian", "Goan Catholic", 
        "Mangalorean Catholic", "East Indian Catholic", "Adivasi Christian", "Santhal Christian", "Oraon Christian", 
        "Kuki Christian", "Mizo Christian", "Khasi Christian", "Garo Christian", "Bodo Christian", "Roman Catholic", 
        "Protestant", "Anglican", "Dalit Christian", "Scheduled Caste Christian", "Tribal Christian", 
        "Converted Christian", "Pentecostal", "Baptist", "Methodist", "Evangelical", "Seventh-day Adventist"
    ].sort(),
    Sikhism: [
        "Jat", "Khatri", "Arora", "Ramgarhia", "Ahluwalia", "Majhabi", "Labana", "Ravidasia", "Mazhabi", "Saini",
        "Rai", "Nai", "Kalal", "Bhatia", "Ramdasiya", "Kamboj", "Tarkhan", "Ghumar", "Balmiki"
    ].sort(),
    Buddhism: [
        "Navayana Buddhist", "Mahar", "Scheduled Caste Buddhist", "Baiga", "Bhutia", "Tibetan Buddhist", 
        "Ladakhi Buddhist", "Tamang", "Sherpa", "Lepcha", "Chakma", "Barua", "Gurung", "Newar Buddhist", 
        "Magar", "Theravada Buddhist", "Neo-Buddhist"
    ].sort(),
    Adivasi: [
        "Santhal", "Gond", "Bhil", "Munda", "Oraon", "Khasi", "Garo", "Meena", "Ho", "Baiga", "Bodo", 
        "Kuki", "Naga", "Lepcha", "Jarwa", "Chenchu", "Siddi", "Toto", "Sahariya", "Korwa", "Mizo", "Toda", 
        "Irula", "Koya", "Rabha", "Khas", "Bhutia", "Kol", "Dongria Kondh", "Halbi", "Khond", "Pahari Korwa", 
        "Birhor"
    ].sort(),
    Jainism: [
        "Agarwal Jain", "Oswal", "Porwal", "Shrimal Jain", "Khandelwal Jain", "Chandraseniya Kayastha Prabhu (CKP)", 
        "Saitwal", "Digambar Jain", "Shwetambar Jain", "Sthanakvasi", "Terapanthi", "Humad", "Panchama", 
        "Visa Oswal", "Modh Jain", "Prajapati Jain", "Kutchi Jain", "Dasha Shrimali Jain", "Bisa Oswal"
    ].sort(),
    Judaism: [
        "Cochin Jews", "Bene Israel", "Baghdadi Jews", "Bene Ephraim", "Manipuri Jews", "Bnei Menashe"
    ].sort(),
    Others: ['Other']
};

// Export both religionOptions and religionToCastMap
export { religionOptions, religionToCastMap };
