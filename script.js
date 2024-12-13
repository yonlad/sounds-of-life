import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Mobile detection function
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (typeof window.orientation !== "undefined") || 
           (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Function to handle mobile display
function handleMobileDisplay() {
    const isMobile = isMobileDevice();
    const mobileOverlay = document.getElementById('mobile-overlay');
    const body = document.body;
    const calendar = document.querySelector('.calendar');
    
    if (isMobile) {
        body.classList.add('is-mobile');
        mobileOverlay.style.display = 'flex';
        // Prevent any interaction with the main content
        if (calendar) {
            calendar.style.pointerEvents = 'none';
        }
        // Stop any ongoing sounds or processes
        if (typeof stopCurrentSound === 'function') {
            stopCurrentSound();
        }
    } else {
        body.classList.remove('is-mobile');
        mobileOverlay.style.display = 'none';
        if (calendar) {
            calendar.style.pointerEvents = 'auto';
        }
    }
}

// Initial check
handleMobileDisplay();

// Check on resize
window.addEventListener('resize', handleMobileDisplay);

// Prevent orientation change from showing the desktop version
window.addEventListener('orientationchange', () => {
    if (isMobileDevice()) {
        handleMobileDisplay();
    }
});



const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

console.log('Firebase Config:', firebaseConfig); // Add this line


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);


console.log('Loading script.js version:', Date.now());


// State variables
let isPlayingSound = false;
let activePopups = [];
let currentSound = null;
//let inactivityTimer;
//const inactivityTimeLimit = 10000;
let isAutomationRunning = false;
var zIndexLast = 1000;

// Select all necessary DOM elements
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const timestamps = document.querySelectorAll('.timestamp');
const closePopupBtn = document.getElementById('close-popup');
const redDates = document.querySelectorAll('.red');
const whiteDates = document.querySelectorAll('.date');
const greyDates = document.querySelectorAll('.grey');
const headerPopup = document.getElementById('header-popup');
const headerPopupTitle = document.getElementById('header-popup-title');
const closeHeaderPopupBtn = document.getElementById('close-header-popup');
const titleHeader = document.querySelector('.calendar-header h1');
const yellowPopup = document.getElementById('yellow-popup');
const yellowPopupTitle = document.getElementById('yellow-popup-title');
const closeYellowPopupBtn = document.getElementById('close-yellow-popup');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');

// Tooltip content mapping
const tooltipContent = {
    // Red or White or Grey dates
    '2024-10-03': 'flight to nyc (back home?)',
    '2024-10-02': 'in athens you can breath',
    '2024-10-01': 'bye',
    '2024-09-30': 'political imagination workshop at Van Leer Institute, Jerusalem',
    '2024-09-29': 'close Israeli bank account',
    '2024-09-28': 'batsheva dance show tonight',
    '2024-09-26': 'Jerusalem: sprawl festival',
    '2024-09-25': 'Tartuffe at the Camery theater',
    '2024-09-24': 'dentist appointment',
    '2024-09-23': 'blood test',
    '2024-09-20': 'Shishi and Matan\'s wedding',
    '2024-09-18': 'sushi with grandma',
    '2024-09-17': 'Russian Cabaret night',
    '2024-09-14': 'Shabbat Hatan (the groom\'s sabbath)',
    '2024-09-13': 'party at a hangar: someone falls from the roof',
    '2024-09-11': 'withdraw all money from Israeli bank account',
    '2024-09-08': 'visit grandma',
    '2024-09-07': 'demonstration tonight',
    '2024-09-06': 'one day layover in Larnaca',
    '2024-09-04': 'tate modern',

    // Yellow numbers
    '331': 'Israeli airstrikes target Jenin, the West Bank',
    '332': 'Israeli fighter jets attack Southern Lebanon',
    '336': 'Aysenur Ezgi Eygi, a 26-year-old Turkish-American peace activist, killed by Israeli sniper in West Bank during a peaceful protest',
    '337': 'three Lebanese rescue workers were killed in an Israeli airstrike in Southern Lebanon',
    '338': 'Qatar\'s red crescent to give $4.5 million dollars in financial support of Gazan workers and patients stuck in the West Bank',
    '340': 'Israeli drone attacks a residential apartment in Southern Lebanon',
    '342': 'a child killed in Southern Lebanon in an Israeli airstrike',
    '346': 'Israeli settlers attack Palestinians and Israeli leftist activists at a school in the West Bank',
    '347': 'Israel blows up thousands of pagers belonging to Hezbollah affiliates in Lebanon, killing and severely injuring civilians as well',
    '348': 'Israel blows up hundreds of communication devices belonging to Hezbollah affiliates in Lebanon, killing and severely injuring (again) civiliians as well',
    '350': 'The UN\'s High Comissioner for Human Rights, Volker Türk, called Israel\'s pager attack in Lebanon a violation of International Law',
    '353': 'the deathtoll in Lebanon due to the recent Israeli attacks have risen to 492 people, including 35 children and 58 women',
    '354': 'Lebanon\'s Minister of Foreign Affairs has said that about half a million Lebanese were displaced since the beinning of the war',
    '357': 'Israel assassinates Hassan Nasrallah, the Secretary-General of Hezbollah for over 30 years',
    '358': 'Israeli aristrikes in Lebanon have caused the displacement of about a million people out of Lebanon\'s population of 5.5 million people',
    '360': 'Israel mobilizes forces to its Northern border in preparation for land-invasion to Lebanon. Israel increases its  heavy airstrikes in Southern Lebanon',
    '361': 'Israel invades Lebanon. Iran fires a barrage of missiles at Israel. two Palestinian militants carried out a shooting attack in Tel Aviv-Yafo',
    '362': 'more than 1.2 million Lebanese have been displaced as a result of Israeli attacks in Lebanon',
    '363': 'Israel assassinates Hashem Safieddine, \'number two\' in Hezbollah and the expected successor of Nasrallah',
    '364': 'at least 2,011 Lebanese people have been killed by Israel since the beginning of the war',
    '365': 'a year has passed, and things are only worse'
};

// Custom texts for yellow popups
const yellowPopupsContent = {
    '331': 'By Sunday, September 1, Day 331 of the ongoing Israeli genocide in Gaza, at least 40,738 Palestinians were killed and 94,154 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 47 people and injuring 94 others. In the early morning, 11 civilians were killed and dozens more injured in three airstrikes on the Safad School located near the Imam al-Shafi\'i Mosque in the Al-Zeitoun neighborhood of Gaza City. The school was reported to be sheltering displaced people. The Gaza Strip remains starved, devastated, and besieged with many victims trapped under the rubble caused by Israeli bombardments.',

   '332': 'By Monday, September 2, day 332 of the ongoing Israeli genocide in Gaza, at least 40,786 Palestinians were killed and 94,224 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 48 people and injuring 70 others. Shortly before 5.20am, at least eight civilians \– including a child \– were killed and 17 others were injured when an Israeli airstrike hit a popular market and pastry stand in front of Al Fakhoura School in Jabalia Refugee Camp in North Gaza. For the second time in two days, Israel bombed the St. Porphyrius Church, where Christian nuns and priests, along with many Christians and Muslim civilians, had taken refuge. Furthermore, the Israeli army killed Dr. Mahmoud Al-Manama, Director of the Central Laboratory Department at the Palestinian Ministry of Health in a direct airstrike on his home.',

   '333': 'By Tuesday, September 3, day 333 of the ongoing Israeli genocide in Gaza, at least 40,819 Palestinians were killed and 94,291 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 33 people and injuring 67 others. Today, An Israeli airstrike killed a young Palestinian girl in central Gaza City while she was playing on her roller blades, targeting and bombing the area where she was. Israel has killed more than 14,000 Palestinian children in Gaza since October 7, according to the latest figures from the Gaza Ministry of Health. The Lancet medical journal estimates that tens of thousands more have also been killed.',

   '334': 'By Wednseday, September 4, day 334 of the ongoing Israeli genocide in Gaza, at least 40,861 Palestinians were killed and 94,398 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 42 people and injuring 107 others. In Gaza City, Nehad al-Madhoun, a medical doctor, was killed, after the Israeli military targeted his house in the Al-Daraj neighborhood. Four Palestinians were also injured when the Israeli military bombed a barn housing a displaced family in the Al-Sahaba area in Gaza City. In the Al-Zeitoun Junun neighborhood, Israeli forces blew up residential buildings while in the vicinity of street 8 in the Tel al-Hawa neighborhood in Gaza City Israeli military vehicles opened fire on residential homes',

   '335': 'By Thursday, September 5, day 335 of the ongoing Israeli genocide in Gaza, 40,878 Palestinians were killed and 94,454 injured. In the past 24 hours, Israeli forces committed two massacres in Gaza, killing 17 people and injuring 56 others. Today was supposed to be the first day of the polio vaccination campaign in the southern governorates of the Gaza Strip as part of a continuing effort to combat the outbreak of the polio epidemic in the Gaza strip that was declared on 29th of July. However, The Ministry of Health in Gaza announced that Israel is refusing to coordinate the entry of medical teams for the emergency polio vaccination campaign in areas east of Gaza. The Health Ministry appealed to all international and human rights groups to urgently intervene to ensure the success of the vaccination campaign and reach all children in their locations.',

    '336': 'By Friday, September 6, day 336 of the ongoing Israeli genocide in Gaza, more than 40,878 Palestinians were killed and 94,454 injured. In the past 24 hours, at least 33 Palestinians were killed by Israeli forces in Gaza. Today, Israeli bombing has concentrated on the southern and central Gaza Strip. Israeli warplanes bombed the house of the Shehadeh family in the Ard al-Helou area, west of the Nuseirat camp in the central Gaza Strip. Furthermore, a Palestinian was killed, and several wounded, when Israeli occupation forces targeted a group of Palestinians in the vicinity of the Islamic Complex Mosque in the Sabra neighborhood, south of Gaza City.',


    '337': 'By Saturday, September 7, day 337 of the ongoing Israeli genocide in Gaza, at least 40,939 Palestinians were killed and 94,616 injured. In the past 48 hours, Israeli forces committed four massacres in Gaza, killing 61 people and injuring 162 others. At around 3:30 PM, an Israeli aircraft bombed the Amr Ibn Al Aas School in Gaza City, causing the death of at least four people, Omar Zakaria Al-Majdoub, Mohammed Amin Abu Nahl, Nasser Zaqout and Abdel Nassar, and injuring at least 20 people, including several children. The school, which is located in the Sheikh Radwan district north of the city, was being used as an IDP shelter at the moment of the declared Israeli strike. Furthermore, Israeli warplanes bombed the Eid family\'s house on the Old Court Street east of Al-Nuseirat camp, which led to the killing of five civilians, two women and three children.',

    '338': 'By Sunday, September 8, day 338 of the ongoing Israeli genocide in Gaza, at least 40,972 Palestinians were killed and 94,761 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 33 people and injuring 145 others. An Israeli airstrike on Sunday killed Mohammad Morsi, the deputy director of the Gaza Civil Emergency Service, along with four of his family members, according to health officials in Gaza. The killing of Morsi, who was responsible for the northern areas of the Gaza Strip, brings the total number of Civil Emergency Service members killed by Israeli fire since October 7 to 83, as reported by Gaza\'s Civil Defense.',

    '339': 'By Monday, September 9, day 339 of the ongoing Israeli genocide in Gaza, at least 40,988 Palestinians were killed and 94,825 injured. In the past 24 hours, Israeli forces committed two massacres in Gaza, killing 16 people and injuring 64 others. Five Palestinians killed, including a child and three women, and several injured in an airstrike by Israel targeting Al-Hanawi family\'s home near Jabalia Al-Balad center in the northern Gaza Strip. Also, a missile, fired at the apartment of the Labad family in the Al-Ghafri Junction area, west of Gaza City, killed five Palestinians, including two women and a child.', 


    '340': 'By Tuesday, September 10, day 340 of the ongoing Israeli genocide in Gaza, at least 41,020 Palestinians were killed and 94,925 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 32 people and injuring 100 others. During the early hours of Tuesday, the Israeli occupation launched an extensive attack against a tent encampment in al-Mawasi, Khan Younis. The massacre was described as \'one of the worst and most brutal in the Strip\'. The encampment, overcrowded with many displaced Palestinians and designated a humanitarian safe zone by Israel in December, was struck by at least three missiles. Consequently, at least 19 Palestinians were killed and 65 were wounded. This is the fifth time Israel attacks the humanitarian zone at al-Mawasi. In total, excluding the 19 deaths recorded in the latest attack, Israel has killed 148 people in its raids on the humanitarian zone.',


    '341': 'By Wednesday, September 11, day 341 of the ongoing Israeli genocide in Gaza, at least 41,084 Palestinians were killed and 95,029 injured. In the past 24 hours, Israeli forces committed four massacres in Gaza, killing 64 people and injuring 104 others. Today, Israeli forces bombed another school-turned-shelter in the Gaza stripe, killing at least 18 people, including six staff members of the United Nations agency for Palestinian refugees (UNRWA). It is the fifth time since October that Israel attacked a UN-run al-Jaouni school. Witnesses reported that the attack tore women and children to pieces.',


    '342': 'By Thursday, September 12, day 342 of the ongoing Israeli genocide in Gaza, at least 41,118 Palestinians were killed and 95,125 injured. In the past 24 hours, Israeli forces committed three massacres in Gaza, killing 34 people and injuring 96 others. Published today, an analysis conducted by the World Health Organization found that at least a quarter of the Palestinian casualties in the Gaza war suffer from life-changing injuries that require rehabilitation services for years to come. The analysis pointed out that, so far, between 13,455 and 17,550 Gazans suffered from severe limb injuries or had to undergo amputations, resulting in grave need for rehabilitation. However, the World Health Organization noted that Gazans have no access to inpatient rehabilitation services or limb and reconstruction surgical services because of Israeli attacks on hospitals, evacuation orders, and a lack of staff. Similarly, the only limb reconstruction and rehabilitation center in Gaza, located in the Nasser Medical Complex in Khan Younis in the southern part of the Strip, became unusable last December.', 


    '343': 'By Firday, September 13, day 343 of the ongoing Israeli genocide in Gaza, more than 41,118 Palestinians were killed and 95,125 injured. Overnight, Israeli bombardment has killed at least 60 Palestinians. In the Jabalia refugee camp, located in northern Gaza, at least one person was killed when Israeli forces bombed a house in the al-Faluja area. Moreover, several hospitals in the northern part of the Gaza Strip have warned that they are on the brink of shutting down due to a severe fuel shortage. In the al-Zaytoun neighborhood, southeast of Gaza City, a number of civilians, mostly women and children, were killed when a house was bombed. Rescue teams continue to search for survivors trapped under the rubble.',

    '344': 'By Saturday, September 14, day 344 of the ongoing Israeli genocide in Gaza, at least 41,182 Palestinians were killed and 95,280 injured. In the past 48 hours, the Israeli forces committed four massacres in Gaza, killing 64 Palestinians and injuring 155 others. At dawn, several civilians were reportedly injured and at least three were killed following an Israeli airstrike at Al Aliaa kindergarten on Al-Yafawiya street in the Al Trans area, located in Block 6 of the Jabalia refugee camp, in North Gaza, the Gaza Strip. Since October 7, 2023, at least 16,795 Palestinian kids have been killed by the ongoing Israeli aggression on the Gaza Strip.',

    '345': 'By Sunday, September 15, day 345 of the ongoing Israeli genocide in Gaza, at least 41,206 Palestinians were killed and 95,337 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 24 Palestinians and injuring 57 others. Today, Israeli strikes have concentrated on central and northern Gaza. Palestinian media reports indicated that three Palestinians were killed and others injured when Israeli forces targeted a house west of the Nuseirat Refugee Camp. Another Palestinian was killed and several others injured in an Israeli attack on an apartment in the Jabalia Refugee Camp in northern Gaza. Israeli warplanes also bombed a house near the Al-Yemen Al-Saeed Hospital in Jabalia and struck areas around the Al-Taleem Roundabout.',

    '346': 'By Monday, September 16, day 346 of the ongoing Israeli genocide in Gaza, at least 41,226 Palestinians were killed and 95,413 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 20 Palestinians and injuring 76 others. Today, Israel\'s air force bombed a bakery in the Sumoud refugee camp housing displaced Palestinians in the Al-Mawasi area, west of the city. The attack killed five people. In addition, Israeli forces demolished residential buildings in the Saudi neighborhood, west of Rafah, and carried out artillery strikes on central and eastern parts of the city.The bombardment resulted in the killing of at least two people and injuries to others when a home belonging to the Abu Shaar family in northern Rafah was struck, according to Gaza\'s Civil Defense.',

    '347': 'By Tuesday, September 17, day 347 of the ongoing Israeli genocide in Gaza, at least 41,252 Palestinians were killed and 95,497 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 26 Palestinians and injuring 84 others. Israel\'s siege of northern Gaza tightens up. Fuel and critical ingredients like flour, sugar, and yeast become scarcer, causing five out of the six functioning bakeries in the area to close down. Last week, UN expert Michael Fakhri accused Israel of conducting a starvation campaign against Palestinians in the Gaza Strip, warning that Israel heavily restricts the  flow of food, medicine, and other humanitarian supplies to Gazans',

    '348': 'By Wednesday, September 18, day 348 of the ongoing Israeli genocide in Gaza, at least 41,272 Palestinians were killed and 95,551 injured. In the past 24 hours, the Israeli forces committed two massacres in Gaza, killing 20 Palestinians and injuring 54 others. Earlier today, the Palestinian Ministry of Health in Gaza announced the martyrdom of Dr. Ziad Mohammad Al-Dalu in Israeli prisons, after being arrested on March 18, 2024, while fulfilling his humanitarian duty at Al-Shifa Medical Complex. The ministry condemned this heinous crime against Palestinian medical staff, emphasizing that targeting healthcare workers while carrying out their humanitarian duties is a flagrant violation of international humanitarian law and all international conventions. The Ministry also appealed to all international and human rights organizations to intervene immediately to uncover the fate of dozens of Palestinian medical staff who have been abducted from hospitals while performing their medical and humanitarian duties. The continuation of these violations against health workers constitutes a systematic targeting of the Palestinian people and their institutions, the Ministry added, stressing the need to hold the occupation accountable before the international community for its crimes against medical staff and civilians.',

    '349': 'By Thursday, September 19, day 349 of the ongoing Israeli genocide in Gaza, at least 41,272 Palestinians were killed and 95,551 injured. Yesterday, the United Nations General Assembly adopted a resolution demanding that Israel end its \'unlawful presence\' in the Occupied Palestinian Territory.The resolution, which passed with 124 votes in favor, 14 against, and 43 abstentions, calls for Israel to: 1) Withdraw its military forces from the occupied territories. 2) Cease all new colonialist activities. 3) Dismantle parts of the Annexation Wall constructed inside the occupied West Bank. 4) Return land and other immovable property seized since the occupation began in 1967. 5) Allow all Palestinians displaced during the occupation to return to their place of origin. 6) Provide reparations for the damage caused by the occupation. However, Israel has continued its aggression in Gaza today, killing at least 20 Palestinians and wounding 76 others in the past 24 hours.',

    '350': 'By Friday, September 20, day 350 of the ongoing Israeli genocide in Gaza, at least 41,272 Palestinians were killed and 95,551 injured. In the early morning, an Israeli airstrike targeting the house of Al-Hatel and Ziyara families near the Municipal Park in Gaza City killed at least six people and wounded server others. Additionally, two Palestinians, including a child, were killed and three were injured when the army fired shells near the Salahuddin Kindergarten in the Zeitoun neighborhood of Gaza City. Since October 7, 2023, Israel\'s genocidal campaign in Gaza caused the death of at least 16,673 children, 11,269 women, 888 medical staff, 203 UNRWA workers, and 172 journalists.',


    '351': 'By Saturday, September 21, day 351 of the ongoing Israeli genocide in Gaza, at least 41,391 Palestinians were killed and 95,760 injured. In the past 72 hours, the Israeli forces committed twelve massacres in Gaza, killing 119 Palestinians and injuring 209 others. The Israeli forces have committed a terrible massacre today in an attack targeting the al-Zaytoun C school, resulting in at least 22 deaths, including 13 children, six women, and a fetus at three months of pregnancy. Additionally, the bombing left 30 injured, among them nine children who suffered amputations, while others sustained severe burns. Two individuals were reported missing. This massacre is part of the ongoing genocide perpetrated by the Israeli military, which has now bombed a total of 181 displacement and shelter centers in Gaza.',

    '352': 'By Sunday, September 22, day 352 of the ongoing Israeli genocide in Gaza, at least 41,431 Palestinians were killed and 95,818 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 40 Palestinians and injuring 58 others. At dawn, Israeli forces bombed the house belonging to the al-Dawas family in the al-Hakr area in Deir al-Balah, killing four people and wounding 15 others, including several children. Israel also attacked Kafr Qasim school, which houses hundreds of forcibly displaced people, in al-Shati refugee camp west of Gaza City. The attack killed at least seven people including children and Majed Saleh, the director general at the Ministry of Public Works and Housing in Gaza.',

    '353': 'By Monday, September 23, day 353 of the ongoing Israeli genocide in Gaza, at least 41,455 Palestinians were killed and 95,878 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 24 Palestinians and injuring 60 others. Around 1 AM an Israeli strike hit a group of civilians sheltering in the Khaled bin al-Walid School, in the Al Nuseirat Refugee Camp, in Deir al-Balah, the Gaza strip. The strike injured civilians and killed a young married couple, their daughter, and one of their sons. Israel also demolished residential buildings near the Dawla intersection in the southern part of the al-Zeitoun neighborhood, southeast of Gaza City, and in the Tel al-Sultan neighborhood, west of Rafah City. The Israeli demolition of residential blocks continues as part of Israel\'s ongoing systematic campaign to prevent Palestinians from returning to their homes. According to an analysis conducted by UNOSAT\'s,  66% of the total structures in the Gaza Strip have sustained damage, many of which were completely destroyed.',

    '354': 'By Tuesday, September 24, day 354 of the ongoing Israeli genocide in Gaza, at least 41,467 Palestinians were killed and 95,921 injured. In the past 24 hours, the Israeli forces committed three massacres in Gaza, killing 12 Palestinians and injuring 43 others. At least 7 people were killed as a result of Israeli airstrikes targeting two residential houses in Khan Younis. 5 of the victims were killed in the Qizan al-Najjar area while the other two were killed in the Tahliyah area. Furthermore, at least 15 Palestinians were injured in these strikes. Furthermore, in the Sheikh Nasser area, at least two people were killed and several others wounded in another Israeli airstrike targeting a residential house.',

    '355': 'By Wednesday, September 25, day 355 of the ongoing Israeli genocide in Gaza, at least 41,495 Palestinians were killed and 96,006 injured. In the past 24 hours, the Israeli forces committed four massacres in Gaza, killing 28 Palestinians and injuring 85 others. An Israeli bombing, targeting a house in the Al-Nasr neighborhood, northeast of Rafah city, in the southern Gaza strip, killed a woman and her five children. Their names are: the mother: Islam Mazen Abu Jazar, the daughters: Nour Khalil Hasan Abu Jazar, Celine Khalil Hasan Abu Jazar, Sila Khalil Hasan Abu Jazar, and the son: Hasan Khalil Hasan Abu Jaza. Also, after 20 hours under the rubble, a Palestinian mother and her child were rescued from under a house destroyed in an Israeli bombardment yesterday.',


    '356': 'By Thursday, September 26, day 356 of the ongoing Israeli genocide in Gaza, at least 41,495 Palestinians were killed and 96,006 injured. Around 15:00, at least 16 people, including at least three children, two women, and a teacher, were killed and dozens more were injured in an Israeli airstrike on the Hafsa School located in the Al-Falouja neighbourhood of the Jabalia Refugee Camp in the Gaza Strip. Among the victims were Muhammad Nahed al-Shanbari and his sons Nahed Muhammad Nahed al-Shanbari and Jamal Muhammad Nahed al-Shanbari were killed in the Israeli strike, along with Masada Issam Sabri Abu Tabaq, Maha Jamil Darabiyah, Ayoub Sami Saeed Ghaban, Islam Sabry Mohammad Abdul Nabi, Hassan Ghassan Mohammad al-Khalidi, Jihad Ahmed Ismail al-Masry, and Jihad Hamid, Souad Abu Tabaq, Muhammad Ghraib, Ahmed Kutkut, Sahar Abu Traish, Ismail Abed al-Rahman and Reham al-Saqa. Furthermore, at around midnight, an Israeli artillery shell hit the Nuseirat Girls School in the New Camp area northwest of Nuseirat Refugee Camp, injuring two people.',

    '357': 'By Friday, September 27, day 357 of the ongoing Israeli genocide in Gaza, at least 41,534 Palestinians were killed and 96,092 injured. An Israeli airstrike, targeting the home of the al-Batsh family in the town of Jabalia in northern Gaza, killed four Palestinians: a man, his wife, and their two children with special needs. Furthermore, a Palestinian youth was killed and others were injured following the Israeli bombing of tents for displaced people within the Al-Aqsa Martyrs Hospital in Deir al-Balah, in the central Gaza Strip. From sea, Israeli warships opened fire towards the fishermen\'s port west of Gaza City, causing severe damage to several boats and disrupting fishing activities, which are a source of livelihood for many families in Gaza.',


    '358': 'By Saturday, September 28, day 358 of the ongoing Israeli genocide in Gaza, at least 41,586 Palestinians were killed and 96,210 injured. In the past 48 hours, the Israeli forces committed four massacres in Gaza, killing 52 Palestinians and injuring 118 others. Among the victims is Farah Al-Sayed, a girl with cerebral palsy, who lost her father and her leg in an Israeli airstrike that hit her home in Gaza. In Khan Younis, in the southern part of the Gaza Strip, the army fired a missile from a drone at Abasan Al-Kabira town, east of the city, killing one Palestinian and causing several injuries. Furthermore, the Israeli army fired a missile at a house belonging to the Qneita family near the Ghafri intersection on Al-Jalaa Street in central Gaza City, causing multiple deaths and injuries.',

    '359': 'By Sunday, September 29, day 359 of the ongoing Israeli genocide in Gaza, at least 41,595 Palestinians were killed and 96,251 injured. In the past 24 hours, the Israeli forces killed 9 Palestinians and injured 41 others in Gaza. Today, An Israeli airstrike on Umm al-Fahm School in the Al Salateen area of Beit Lahiya killed four civilians, including a child and a journalist, and injured 15 others.  With no fuel left in northern Gaza, Palestinians casualties are carried to the hospital on stretchers by men walking on foot, since the ambulances are unable to function.',

    '360': 'By Monday, September 30, day 360 of the ongoing Israeli genocide in Gaza, at least 41,615 Palestinians were killed and 96,359 injured. In the past 24 hours, the Israeli forces killed 20 Palestinians and injured 108 others. At approximately 1:19 am, a declared Israeli airstrike struck the Abu Jaafer School in Beit Lahia, North Gaza. Local reports indicated that 15 civilians were injured and between two and four others were killed at the facility, which was being used as a shelter by displaced civilians. Furthermore, an Israeli airstrike in Deir Al-Balah, central Gaza, killed the journalist Wafaa al-Udaini, raising the number of journalists killed since the beginning of the war to 175.',

    '361': 'By Tuesday, October 1, day 361 of the ongoing Israeli genocide in Gaza, at least 41,638 Palestinians were killed and 96,460 injured. In the past 24 hours, the Israeli forces killed 23 Palestinians and injured 101 others. At least seven Palestinians were killed today in an Israeli airstrike targeting the UN-run Shuja\'iyya School in the Tuffah neighborhood of Gaza City. This incident raised the total number of shelters and centers struck by Israel to 185 since the start of the war. Additionally, Oxfam reported that Israeli explosive weapons continue to target civilian infrastructure in Gaza, including schools and hospitals, approximately every three hours, and that Israel tends to strike schools and hospitals every four days on average.',


    '362': 'By Wednesday, October 2, day 362 of the ongoing Israeli genocide in Gaza, at least 41,689 Palestinians were killed and 96,625 injured. In the past 24 hours, the Israeli forces killed 51 Palestinians and injured 165 others. Today, Israeli bombing targeted the al-Amal Institute for Orphans, which shelters displaced people west of Gaza City, killing at least six people. Furthermore, nine people were killed, including a child, in an Israeli strike that targeted displaced civilians west of Nuseirat camp in central Gaza. Released Yesterday, a joint analysis by Oxfam and Action on Armed Violence (AOAV) shows that the amount of civilians killed in Gaza over the past year exceeds the amount of civilian deaths in any other war in the last 20 years.',


    '363': 'By Thursday, October 3, day 363 of the ongoing Israeli genocide in Gaza, at least 41,788 Palestinians were killed and 96,794 injured. In the past 24 hours, the Israeli forces killed 99 Palestinians and injured 169 others. Today, a young man was killed and another wounded in an Israeli strike targeting a house west of Al-Nuseirat camp in central Gaza. Furthermore, the bodies of five Palestinians were recovered from under the rubble, including those of a woman and two children, following an Israeli airstrike targeting the house of the Darwish family in Al-Shati camp, west of Gaza City. A joint report by Oxfam and Action on Armed Violence (AOAV) published on Tuesday pointed out that since the beginning of the war more than 6,000 Palestinian women and 11,000 children have been killed.',

    '364': 'By Friday, October 4, day 364 of the ongoing Israeli genocide in Gaza, at least 41,802 Palestinians were killed and 96,844 injured. In the past 24 hours, the Israeli forces killed 14 Palestinians and injured 50 others. Today, people have gathered to attend the funeral ceremony of Jud Karim, an 8 months old baby who was killed in an Israeli attack in the Nuseirat Refugee Camp in Deir Al Balah, Gaza. Furthermore, A Palestinian fisherman, Fares Ahmad Saadallah was killed, and others were injured due to an Israeli bombing targeting a group of fishermen northwest of Gaza City. Also, paramedics from the Palestinian Red Crescent Society (PRCS) retrieved the bodies of Majed Montaser Mohammed Al-Farra (25 years old) and Ahmed Husam Othman At-Tawil (29 years old) from under the rubble of two houses that were hit by Israeli missiles in the areas of Ma\'an and Al-Manara, south of Khan Younis city in the southern Gaza Strip.',


    '365': 'By Saturday, October 5, day 365 of the ongoing Israeli genocide in Gaza, at least 41,825 Palestinians were killed and 96,910 injured. In the past 24 hours, the Israeli forces killed 23 Palestinians and injured 66 others. It has been a year since the Israeli genocidal military campaign began. A year of Palestinians being killed, wounded, tortured, detained, starved, and besieged. There is no safety in Gaza. The war permeates everywhere and everything. And, yet, outside of Gaza, most people keep on living their lives. Most of the information gathered in this calendar has sunk into oblivion. Yet, it is an imperative to recuperate it, organize it, and present it, so the people out there who would choose to stop living in the flux of their lives and linger in a moment, here, in the month of September of the year 2024, could become aware of what was going on in Gaza whilst they were living their lives.',
};

// Initialize tooltips
function initializeTooltips() {
    redDates.forEach(element => {
        const date = element.dataset.date;
        if (tooltipContent[date]) {
            element.title = tooltipContent[date];
        }
    });

    whiteDates.forEach(element => {
        const date = element.dataset.date;
        if (tooltipContent[date]) {
            element.title = tooltipContent[date];
        }
    });

    greyDates.forEach(element => {
        const date = element.dataset.date;
        if (tooltipContent[date]) {
            element.title = tooltipContent[date];
        }
    });

    document.querySelectorAll('.yellow').forEach(element => {
        const number = element.textContent;
        if (tooltipContent[number]) {
            element.title = tooltipContent[number];
        }
    });
}

// Header popup functionality
const headerInfo = `<br><p>In a time of constant movement and news flashes, there is value in freezing a moment. The moment is the month of September of the year 2024. A young man makes a visit to his home, a place that grew farther away from him ever since he left. He decides to install a surveillance app he developed on his phone. 4 times a day, the app would open and record 18x10 seconds. 4 times a day the app would reflect where, what, and how, the young man lives, assuming he still lives. The young man would survive the month of September in what used to be his home and would eventually return to his new home across the seas. A reality not many in the region he is from are priveleged enough to have.</p><p>The recordings of life he took over his stay in his past home reminded him that not too far away from him in the month of September of the year 2024 many other young men like him were dying by bombs dropped from his skies on theirs. The recordings of life he took over his stay would remind him that many phones of young men would never hear their young men moving in the world again. That many phones would never listen to the sounds of life of their young men. The recordings of life he took are an attempt to reconcile that he survived but many other young men like him did not. The recordings of life he took are an attempt to remember all the young men whose recordings of life stopped. May they all rest in peace. May they all be blessed in heaven.</p><h2><em>In the loving memory of Medo Halimy and all the Palestinians whose recordings of life were cut short.<em></h2>`;

function showHeaderPopup() {
    headerPopupTitle.innerHTML = headerInfo;
    headerPopup.style.display = 'block';
    headerPopup.style.zIndex = ++zIndexLast;
    interactionTracker.titleNumberClicks++;
}

// Create new popup for red/white dates
function createNewPopup(type, date) {
    const newPopup = document.createElement('div');
    newPopup.className = 'popup';
    newPopup.style.zIndex = ++zIndexLast;
    newPopup.style.backgroundColor = 'rgb(220, 220, 220)';
    newPopup.style.width = '270px';
    newPopup.style.height = '280px';
    newPopup.style.position = 'fixed';
    newPopup.style.left = '50%';
    newPopup.style.top = '50%';
    newPopup.style.transform = 'translate(-50%, -50%)';
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    content.style.padding = '20px';
    content.style.textAlign = 'center';
    content.style.marginTop = '-10px';
    // content.style.cursor = 'crosshair'; // option 2 making all popup-content into crosshair cursor so easy to see?
    //content.style.color = 'rgb(0, 0, 0)';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'crosshair';
    closeBtn.style.color = 'rgb(250, 250, 250)';
    closeBtn.onclick = () => {
        //stopCurrentSound();
        newPopup.remove();
        activePopups = activePopups.filter(p => p !== newPopup);
    };
    
    const title = document.createElement('h3');
    title.textContent = type === 'red' ? `Israel: ${date}` : `Europe: ${date}`;
    title.style.fontWeight = 'lighter';
    title.style.fontSize = '16px';
    title.style.color = 'black';
    title.style.cursor = 'text';
    
    const timestampsDiv = document.createElement('div');
    timestampsDiv.className = 'timestamps';
    timestampsDiv.style.display = 'flex';
    timestampsDiv.style.flexDirection = 'column';
    timestampsDiv.style.gap = '10px';

    // Inside createNewPopup function, modify the timestamp creation part:
['06:06', '12:12', '18:18', '00:00'].forEach(time => {
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.dataset.timestamp = time;
    timestamp.textContent = time;
    timestamp.style.backgroundColor = '#f0f0f0';
    timestamp.style.border = 'none';
    timestamp.style.padding = '10px';
    timestamp.style.fontSize = '16px';
    timestamp.style.cursor = 'none';
    timestamp.style.transition = 'background-color 0.3s';
    timestamp.style.color = 'black';
    
    timestamp.onmouseover = () => {
        if (!isPlayingSound || !timestamp.classList.contains('active')) {
            timestamp.style.backgroundColor = '#ddd';
        }
    };
    
    timestamp.onmouseout = () => {
        if (!timestamp.classList.contains('active')) {
            timestamp.style.backgroundColor = '#f0f0f0';
            timestamp.style.cursor = 'pointer'; // option one for visibility of cursor in popup-content
        }
    };

    timestamp.onclick = (e) => {
        e.stopPropagation();
        // Remove active class from all timestamps in all popups
        document.querySelectorAll('.timestamp').forEach(ts => {
            ts.classList.remove('active');
            ts.style.backgroundColor = '#f0f0f0';
        });
        timestamp.classList.add('active');
        timestamp.style.backgroundColor = '#ddd';
        playSound(date, time, newPopup);
        interactionTracker.timestampClicks++;
        checkAndShowButton();
    };
    timestampsDiv.appendChild(timestamp);
});
    
const progressContainer = document.createElement('div');
progressContainer.id = `progressBarContainer-${zIndexLast}`;
progressContainer.style.width = '100%';
progressContainer.style.backgroundColor = '#ddd';
progressContainer.style.height = '20px';
progressContainer.style.marginTop = '6px';
progressContainer.style.cursor = 'e-resize';

const progressBar = document.createElement('div');
progressBar.id = `progressBar-${zIndexLast}`;
progressBar.style.width = '0%';
progressBar.style.height = '100%';
progressBar.style.backgroundColor = '#4caf50';

progressContainer.appendChild(progressBar);

progressContainer.addEventListener('mousedown', (e) => {
    const handleSeek = (e) => {
        seekAudio(e, currentSound, progressBar, progressContainer);  // Pass progressContainer
    };
    
    handleSeek(e);
    
    const mouseUpHandler = () => {
        document.removeEventListener('mousemove', handleSeek);
        document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    document.addEventListener('mousemove', handleSeek);
    document.addEventListener('mouseup', mouseUpHandler);
});


    
    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(timestampsDiv);
    content.appendChild(progressContainer);
    newPopup.appendChild(content);
    
    return newPopup;
}

// Show popups
function showRedPopup(date) {
    const newPopup = createNewPopup('red', date);
    document.body.appendChild(newPopup);
    activePopups.push(newPopup);
    newPopup.style.display = 'block';
}

function showWhitePopup(date) {
    const newPopup = createNewPopup('white', date);
    document.body.appendChild(newPopup);
    activePopups.push(newPopup);
    newPopup.style.display = 'block';
}

function showYellowPopup(numberText) {
    console.log('Showing yellow popup for number:', numberText);
    
    // Function to measure text dimensions at a specific width
    function measureText(text, width) {
        const measureElement = document.createElement('div');
        measureElement.style.cssText = `
            position: absolute;
            visibility: hidden;
            width: ${width}px;
            height: fit-content;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 18px;
            font-family: Cambria, serif;
            padding: 60px 20px 20px 20px;
        `;
        measureElement.textContent = text;
        document.body.appendChild(measureElement);
        const height = measureElement.offsetHeight;
        document.body.removeChild(measureElement);
        return height;
    }
    
    const text = yellowPopupsContent[numberText] || 'No content available';
    
    // Measure text at different widths to find various possible layouts
    const layouts = [
        { width: 300, height: 0 },  // Narrow
        { width: 450, height: 0 },  // Medium
        { width: 600, height: 0 },  // Wide
    ];
    
    // Calculate required height for each width
    layouts.forEach(layout => {
        layout.height = measureText(text, layout.width);
    });
    
    // Randomly select narrow, medium, or wide layout with equal probability
    const selectedLayout = layouts[Math.floor(Math.random() * layouts.length)];
    
    // Add some random extra space to the selected dimensions
    const minWidth = selectedLayout.width;
    const minHeight = Math.max(150, selectedLayout.height); // Ensure minimum height is at least 150px
    const maxWidth = 700;
    const maxHeight = Math.max(400, minHeight + 50); // Ensure maxHeight is always larger than minHeight
    
    // Calculate random dimensions with preference for staying closer to the minimum required dimensions
    const extraWidthRatio = Math.random() * 0.3; // Only add up to 30% extra width
    const extraHeightRatio = Math.random() * 0.3; // Only add up to 30% extra height
    
    const randomWidth = Math.min(maxWidth, minWidth + (maxWidth - minWidth) * extraWidthRatio);
    // Ensure the height is never less than what's needed for the text
    const randomHeight = Math.max(
        minHeight,
        Math.min(maxHeight, minHeight + (maxHeight - minHeight) * extraHeightRatio)
    );
    
    // Calculate position to ensure popup stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    
    const maxLeft = viewportWidth - randomWidth - padding;
    const maxTop = viewportHeight - randomHeight - padding;
    
    const randomLeft = Math.max(padding, Math.floor(Math.random() * maxLeft));
    const randomTop = Math.max(padding, Math.floor(Math.random() * maxTop));
    
    // Create popup
    const newPopup = document.createElement('div');
    newPopup.className = 'yellow-popup';
    newPopup.style.zIndex = ++zIndexLast;
    newPopup.style.width = `${randomWidth}px`;
    newPopup.style.height = `${randomHeight}px`;
    newPopup.style.position = 'fixed';
    newPopup.style.left = `${randomLeft}px`;
    newPopup.style.top = `${randomTop}px`;
    newPopup.style.transform = 'none';
    newPopup.style.overflow = 'auto'; // Prevent content overflow
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    content.style.padding = '20px';
    content.style.height = '100%'; // Fill the popup
    content.style.boxSizing = 'border-box';
    content.style.position = 'relative';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => {
        newPopup.remove();
        activePopups = activePopups.filter(p => p !== newPopup);
    };
    
    const title = document.createElement('h3');
    title.textContent = text;
    title.style.color = 'white';
    title.style.textAlign = 'justify';
    title.style.overflowWrap = 'break-word';
    title.style.wordWrap = 'break-word';
    title.style.hyphens = 'auto';
    
    
    content.appendChild(closeBtn);
    content.appendChild(title);
    newPopup.appendChild(content);
    
    document.body.appendChild(newPopup);
    activePopups.push(newPopup);
    newPopup.style.display = 'block';

    interactionTracker.yellowNumberClicks++;
    checkAndShowButton();
}

// Sound handling
function seekAudio(e, sound, progressBarElement, container) {
    if (!sound || !sound.duration) {
        console.log('No valid sound to seek');
        return;
    }

    // Prevent default
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate new position
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * sound.duration;
    
    // Remove any existing timeupdate listeners
    const oldTimeUpdateListeners = sound._timeUpdateListeners || [];
    oldTimeUpdateListeners.forEach(listener => {
        sound.removeEventListener('timeupdate', listener);
    });

    // Create a one-time listener to verify the seek worked
    const timeUpdateListener = function(e) {
        progressBarElement.style.width = `${(sound.currentTime / sound.duration * 100)}%`;
        sound.removeEventListener('timeupdate', timeUpdateListener);
    };
    
    // Store the listener for future cleanup
    sound._timeUpdateListeners = [timeUpdateListener];
    sound.addEventListener('timeupdate', timeUpdateListener);

    // Set the new time
    sound.currentTime = newTime;
}


console.log('Firebase storage initialized:', storage);
console.log('Firebase ref function:', ref);

async function playSound(date, timestamp, popupElement) {
    console.log('Starting playSound function');
    console.log('Storage:', storage);
    console.log('ref function:', ref);
    
    const formattedTime = timestamp.replace(":", "-");
    const soundPath = `sounds/${date}-${formattedTime}.m4a`;
    console.log('Sound path:', soundPath);
    
    stopCurrentSound();

    try {
        console.log('Creating storage reference...');
        const audioRef = ref(storage, soundPath);
        
        // Get the download URL
        const url = await getDownloadURL(audioRef);
        
        isPlayingSound = true;
        currentSound = new Audio();
        currentSound.preload = 'auto';
        currentSound.controlsList = 'nodownload';

        // Set up event listeners
        currentSound.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded, duration:', currentSound.duration);
        });
        
        currentSound.addEventListener('canplay', () => {
            console.log('Audio can play, duration:', currentSound.duration);
        });
        
        // Set source and play
        currentSound.src = url;
        await currentSound.play();
        
        // Highlight active timestamp
        const activeTimestamp = popupElement.querySelector(`[data-timestamp="${timestamp}"]`);
        if (activeTimestamp) {
            document.querySelectorAll('.timestamp').forEach(ts => {
                ts.classList.remove('active');
                ts.style.backgroundColor = '#f0f0f0';
            });
            activeTimestamp.classList.add('active');
            activeTimestamp.style.backgroundColor = '#ddd';
        }
        
        // Update progress bar
        const progressBar = popupElement.querySelector('[id^="progressBar-"]');
        
        function updateProgress() {
            if (currentSound && currentSound.duration) {
                const progress = (currentSound.currentTime / currentSound.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
        }
        
        currentSound.addEventListener('timeupdate', updateProgress);
        
        currentSound.addEventListener('ended', () => {
            isPlayingSound = false;
            progressBar.style.width = '0%';
            if (activeTimestamp) {
                activeTimestamp.classList.remove('active');
                activeTimestamp.style.backgroundColor = '#f0f0f0';
            }
        });
    } catch (error) {
        console.error('Error playing sound:', error);
        console.log('Failed path:', soundPath); // Add this for debugging
        console.log('Storage bucket:', firebaseConfig.storageBucket); // Add this for debugging
    }
}

function stopCurrentSound() {
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
        isPlayingSound = false;
        
        document.querySelectorAll('.timestamp').forEach(ts => {
            ts.classList.remove('active');
            ts.style.backgroundColor = '#f0f0f0';
        });
        
        document.querySelectorAll('[id^="progressBar-"]').forEach(bar => {
            bar.style.width = '0%';
        });
    }
}

function triggerClick(element) {
    if (element) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(clickEvent);
    }
}

// Function to simulate progress bar interaction
function simulateProgressBarClick(ratio) {
    const containerWidth = progressBarContainer.offsetWidth;
    const clickX = containerWidth * ratio;
    
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: progressBarContainer.getBoundingClientRect().left + clickX,
        offsetX: clickX
    });
    
    progressBarContainer.dispatchEvent(clickEvent);
}


// Event listeners
titleHeader.addEventListener('click', showHeaderPopup);

closeHeaderPopupBtn.addEventListener('click', () => {
    headerPopup.style.display = 'none';
});

// Event listeners for date clicks
redDates.forEach(date => {
    date.addEventListener('click', (e) => {
        const dateValue = e.target.dataset.date;
        showRedPopup(dateValue);
    });
});

whiteDates.forEach(date => {
    date.addEventListener('click', (e) => {
        const dateValue = e.target.dataset.date;
        showWhitePopup(dateValue);
    });
});

// Yellow numbers click handling
document.querySelectorAll('.yellow').forEach(number => {
    number.addEventListener('click', () => {
        const numberText = number.textContent;
        if (yellowPopupsContent[numberText]) {
            showYellowPopup(numberText);
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    //resetInactivityTimer();
});



// Add this to your existing JavaScript
document.getElementById('enoughButton').addEventListener('click', function() {
    
    
    // First, stop any playing sounds
    stopCurrentSound();
    
    // Close all active popups
    activePopups.forEach(popup => {
        popup.remove();
    });
    activePopups = []; // Clear the array
    
    // Close header popup if it's open
    if (headerPopup) {
        headerPopup.style.display = 'none';
    }
    
    // Get calendar dimensions for animation
    const calendar = document.querySelector('.calendar');
    const calendarRect = calendar.getBoundingClientRect();
    
    // Fade out existing content
    document.querySelectorAll('.day, .day-header, .calendar-header').forEach(el => {
        el.classList.add('fade-out');
    });

    // Create vertical lines based on calendar grid
    for (let i = 1; i <= 6; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical-line';
        line.style.height = `${calendarRect.height}px`;
        line.style.left = `${calendarRect.left + (calendarRect.width * i / 7)}px`;
        line.style.top = `${calendarRect.top}px`;
        document.body.appendChild(line);
    }

    // Create horizontal lines
    for (let i = 1; i <= 5; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal-line';
        line.style.width = `${calendarRect.width}px`;
        line.style.left = `${calendarRect.left}px`;
        line.style.top = `${calendarRect.top + (calendarRect.height * i / 6)}px`;
        document.body.appendChild(line);
    }

    // Animate the fall
    const lines = document.querySelectorAll('.grid-line');
    const bottomY = window.innerHeight - 20;

    lines.forEach((line, index) => {
        setTimeout(() => {
            const rect = line.getBoundingClientRect();
            const stackOffset = index * 2;
            const randomRotation = Math.random() * 20 - 10;
            const randomXOffset = Math.random() * 40 - 20;
            const initialX = parseFloat(line.style.left);

            line.classList.add('falling');
            line.style.transform = `
                translateY(${bottomY - rect.top + stackOffset}px)
                translateX(${randomXOffset}px)
                rotate(${randomRotation}deg)
            `;

            // Add settling movement
            setTimeout(() => {
                const subtleMove = Math.random() * 10 - 5;
                line.style.transform = `
                    translateY(${bottomY - rect.top + stackOffset}px)
                    translateX(${randomXOffset + subtleMove}px)
                    rotate(${randomRotation + (Math.random() * 10 - 5)}deg)
                `;
            }, 1500);
        }, index * 100);
    });

    // Calculate total animation time (number of lines * 100ms delay + 1500ms settling + buffer)
    const totalLines = document.querySelectorAll('.grid-line').length;
    const animationDelay = (totalLines * 100) + 1500 + 500; // Added 500ms buffer

    // Disable the button
    this.disabled = true;
    this.style.pointerEvents = 'none';
    this.classList.add('used');
    this.style.cursor = 'pointer';

    // Disable all interactive elements
    const calendarHeader = document.querySelector('.calendar-header');
    
    // Remove all event listeners by cloning and replacing elements
    function removeAllListeners(element) {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
        return clone;
    }

    // Disable and clone calendar header
    const newHeader = removeAllListeners(calendarHeader);
    newHeader.classList.add('calendar-disabled');
    
    // Disable and clone calendar
    const newCalendar = removeAllListeners(calendar);
    newCalendar.classList.add('calendar-disabled');
    
    // Remove event listeners from all interactive elements
    document.querySelectorAll('.red, .date, .yellow, .day, .day-header').forEach(el => {
        removeAllListeners(el);
        el.classList.add('calendar-disabled');
        el.style.pointerEvents = 'none';
    });

    // Remove title click listener
    const newTitleHeader = removeAllListeners(document.querySelector('.calendar-header h1'));
    newTitleHeader.classList.add('calendar-disabled');
    
    // Disable all event listeners
    titleHeader.removeEventListener('click', showHeaderPopup);
    
    isAutomationRunning = true;
    
    // Clear any ongoing timers
    //clearTimeout(inactivityTimer);

     // Enable screen click after animation completes
     setTimeout(() => {
        // Disable all event listeners
        document.querySelectorAll('.red, .date, .yellow, .day, .day-header').forEach(el => {
            el.style.pointerEvents = 'none';
        });
        // Clear all timers
        //clearTimeout(inactivityTimer);

        // Remove all event listeners
        titleHeader.removeEventListener('click', showHeaderPopup);
        

        // Set flag to prevent new interactions
        isAutomationRunning = true;

        enableScreenClick();
    }, animationDelay);
});




// Modified interaction tracking
const interactionTracker = {
    timestampClicks: 0,
    yellowNumberClicks: 0,
    titleNumberClicks: 0,
    requiredTimestamps: 1,
    requiredYellowNumbers: 2,
    requiredTitleNumbers: 1,
    clickedYellowNumbers: new Set(),

    checkRequirements() {
        console.log('Checking requirements:', {
            timestamps: this.timestampClicks,
            yellowNumbers: this.yellowNumberClicks,
            titleNumber: this.titleNumberClicks
        });
        return this.timestampClicks >= this.requiredTimestamps && 
               this.yellowNumberClicks >= this.requiredYellowNumbers &&
               this.titleNumberClicks >= this.requiredTitleNumbers;
    }
};

// Track timestamp clicks within popups
document.body.addEventListener('click', function(e) {
    // Check if clicked element is a timestamp within a popup
    if (e.target.classList.contains('timestamp')) {
       // interactionTracker.timestampClicks++;
        console.log('Timestamp clicked, total:', interactionTracker.timestampClicks);
        checkAndShowButton();
    }
});

// Track yellow number clicks
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.yellow').forEach(yellowNumber => {
        yellowNumber.addEventListener('click', function() {
            const numberText = this.textContent;
            if (!interactionTracker.clickedYellowNumbers.has(numberText)) {
                interactionTracker.clickedYellowNumbers.add(numberText);
                //interactionTracker.yellowNumberClicks++;
                console.log('Yellow number clicked, total:', interactionTracker.yellowNumberClicks);
                checkAndShowButton();
            }
        });
    });
});

// track clicks showing the header information
titleHeader.addEventListener('click', function(){
    console.log('header clicked, total:', interactionTracker.titleNumberClicks);
    checkAndShowButton();
})

// Function to check requirements and show button
function checkAndShowButton() {
    console.log('Checking button visibility conditions...');
    if (interactionTracker.checkRequirements()) {
        console.log('Requirements met, showing button');
        const enoughButton = document.getElementById('enoughButton');
        enoughButton.classList.add('visible');
    }
}


function enableScreenClick() {
    const overlay = document.createElement('div');
    overlay.id = 'clickable-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.cursor = 'pointer';
    overlay.style.zIndex = '9999';

    overlay.addEventListener('click', () => {
        // Open React app and close current window
        window.location.replace('https://yonlad.github.io/sounds-of-life-react/'); // change url based on domain hosting
    });

    document.body.appendChild(overlay);
}

// If you have any automation or inactivity handling, you might want to disable it
// when the overlay is clicked:
function disableAllInteractions() {
    isAutomationRunning = true;
    //clearTimeout(inactivityTimer);
    
}



