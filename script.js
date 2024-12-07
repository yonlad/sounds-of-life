import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

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
    '2024-09-30': 'political imagination workshop at Van Leer Institute',
    '2024-09-29': 'close bank account',
    '2024-09-28': 'batsheva dance tonight',
    '2024-09-26': 'jerusalem: sprawl festival',
    '2024-09-25': 'Tartuffe at the Camery theater',
    '2024-09-24': 'dentist appointment',
    '2024-09-23': 'blood test',
    '2024-09-20': 'Shishi and Matan\'s wedding',
    '2024-09-18': 'sushi with grandma',
    '2024-09-17': 'russian cabaret night',
    '2024-09-14': 'Shabbat Hatan (the groom\'s sabbath',
    '2024-09-13': 'party at a hangar: someone falls from the roof',
    '2024-09-11': 'withdraw all savings',
    '2024-09-08': 'visit grandma',
    '2024-09-07': 'demonstration tonight',
    '2024-09-06': 'one day layover in Larnaca',
    '2024-09-04': 'tate modern <3',

    // Yellow numbers
    '331': 'Have a nice day',
    '332': 'Special event',
    '333': 'Third milestone',
    '357': 'wait what? They killed Nasrallah?!'
    // Add more mappings as needed
};

// Custom texts for yellow popups
const yellowPopupsContent = {
    '331': 'On Sunday, Day 331 of the ongoing genocide, Israeli missiles and shells killed at least 27 Palestinians across the starved, devastated, and besieged Gaza Strip, and wounded dozens more. Others remain under the rubble, with their friends and neighbors trying to dig them out from the latest Israeli bombardment.',
    '332': 'On Monday, September 2, day 332 of the Israeli assault on the civilian population of Gaza, Israeli forces continued their bombardment of civilian areas. At least 46 people were killed since dawn in various parts of Gaza, according to local sources. Israeli forces, for the second time in two days, bombed the St. Porphyrius Church, where Christian nuns and priests, along with many Christians and Muslim civilians, had taken refuge.',
    '333': 'On Tuesday, September 3, day 333 of the Israeli assault on the entire population of 2.24 million Palestinians in the Gaza Strip, Israeli forces continued their relentless bombardment of civilians and civilian infrastructure throughout Gaza. Around 9 Palestinians were killed today in Israeli shelling of Gaza city, among them was a young girl.',
    '334': 'A number of Palestinians were killed and injured, on Wednesday morning, day 334, as a result of the Israeli occupation forces\’ bombing of several areas in the Gaza Strip. Medical sources said that 23 Palestinians were killed, including children and women, in Israeli missile and artillery shelling of various areas of the Gaza Strip today.',
    '335': 'Two Palestinians were killed, and several others were injured, after Israeli aircraft targeted an apartment belonging to the “Dahdouh” family in the “Ajjour” building, west of Gaza City. In Rafah, in Gaza\’s southernmost part, the army bombarded the Misbah area, east of the city, killing two Palestinians and wounding many. The Ministry of Health in Gaza announced that Israel is refusing to coordinate the entry of medical teams for the emergency polio vaccination campaign in areas east of Gaza.',
    '336': 'Custom text for 336',
    // Add more mappings as needed
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
const headerInfo = `<br><p>In a time of constant movement and news flashes, there is value in freezing a moment. The moment is the month of September of the year 2024. A young man makes a visit to his home, a place that grew farther away from him ever since he left. He decides to install a surveillance app he developed on his phone. 4 times a day, the app would open and record 18x10 seconds. 4 times a day the app would reflect where, what, and how, the young man lives, assuming he still lives. The young man would survive the month of September in what used to be his home and would eventually return to his new home across the seas. A reality not many in the region where he is from are priveleged enough to live.</p><p>The recordings of life he took over his stay in his past home reminded him that not too far away from him in the month of September of the year 2024 many other young men like him were dying by bombs dropped from his skies on theirs. The recordings of life he took over his stay would remind him that many phones of young men would never hear their young men moving in the world again. That many phones would never listen to the sounds of life of their young men. The recordings of life he took are an attempt to reconcile that he survived but many other young men like him did not. The recordings of life he took are an attempt to remember all the young men whose recordings of life stopped. May they all rest in peace. May they all be blessed in heaven.</p><h2><em>In the loving memory of Medo Halimy and all the Palestinians whose recordings of life were cut short.<em></h2>`;

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
    const minHeight = Math.max(100, selectedLayout.height);
    const maxWidth = 700;
    const maxHeight = 400;
    
    // Calculate random dimensions with preference for staying closer to the minimum required dimensions
    const extraWidthRatio = Math.random() * 0.3; // Only add up to 30% extra width
    const extraHeightRatio = Math.random() * 0.3; // Only add up to 30% extra height
    
    const randomWidth = Math.min(maxWidth, minWidth + (maxWidth - minWidth) * extraWidthRatio);
    const randomHeight = Math.min(maxHeight, minHeight + (maxHeight - minHeight) * extraHeightRatio);
    
    // Calculate position
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
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    content.style.padding = '20px';
    content.style.textAlign = 'center';
    
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


async function playSound(date, timestamp, popupElement) {
    const formattedTime = timestamp.replace(":", "-");
    const soundPath = `sounds/${date}-${formattedTime}.m4a`;
    
    stopCurrentSound();

    try {
        // Create a reference using the imported ref function
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

/*
// Automation handling
function handleInactivity() {
    if (isPlayingSound || isAutomationRunning) return;
    isAutomationRunning = true;

    const redDate = document.querySelector('.red[data-date="2024-09-12"]');
    if (redDate) {
        const automationSequence = async () => {
            triggerClick(redDate);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const latestPopup = activePopups[activePopups.length - 1];
            if (latestPopup) {
                const timestamp = latestPopup.querySelector('[data-timestamp="00:00"]');
                if (timestamp) {
                    triggerClick(timestamp);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                simulateProgressBarClick(0.66); // Move to roughly 2/3 through the audio
            }
            isAutomationRunning = false;
        };
        automationSequence();
    }
}



function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(handleInactivity, inactivityTimeLimit);
}
*/
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

/*
// Add event listeners for inactivity reset
['load', 'mousemove', 'keypress', 'click'].forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
});

// Visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearTimeout(inactivityTimer);
    } else {
        resetInactivityTimer();
    }
});
*/

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
    /*
    document.removeEventListener('visibilitychange', resetInactivityTimer);
    ['load', 'mousemove', 'keypress', 'click'].forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
    });
    */

    // Hide the button
    //this.classList.add('fade-out');
    //setTimeout(() => this.style.display = 'none', 500);

    // Instead of hiding the button, make it look "used"
    //this.classList.add('used');
    
    // Prevent any existing click handlers on dates from working
    //document.querySelectorAll('.red, .date, .yellow .calendar-header h1').forEach(el => {
      //  el.style.pointerEvents = 'none';
   // });

    // Prevent new popups from being opened
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
        /*
        document.removeEventListener('visibilitychange', resetInactivityTimer);
        ['load', 'mousemove', 'keypress', 'click'].forEach(event => {
            window.removeEventListener(event, resetInactivityTimer);
        });
        */

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
        window.location.replace('http://localhost:3000');
    });

    document.body.appendChild(overlay);
}

// If you have any automation or inactivity handling, you might want to disable it
// when the overlay is clicked:
function disableAllInteractions() {
    isAutomationRunning = true;
    //clearTimeout(inactivityTimer);
    /*
    document.removeEventListener('visibilitychange', resetInactivityTimer);
    ['load', 'mousemove', 'keypress', 'click'].forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
    });
    */
}