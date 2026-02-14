
document.addEventListener('DOMContentLoaded', () => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    if (!isDesktop) return;

    const events = document.querySelectorAll('.unique-event-container');
    const eventWrapper = document.querySelector('.unique-events-wrapper');
    let currentIndex = 0;
    const displayCount = 2;
    const delay = 4000; // 4 seconds
    let timeoutID;

    // Show current batch
    function showEvents() {
        events.forEach((event, index) => {
            event.style.display = (index >= currentIndex && index < currentIndex + displayCount) ? 'flex' : 'none';
        });
    }

    // Schedule next slide
    function scheduleNext() {
        timeoutID = setTimeout(() => {
            currentIndex = (currentIndex + displayCount) % events.length;
            showEvents();
            scheduleNext(); // recursive timeout
        }, delay);
    }

    // Start loop
    function startSliding() {
        showEvents();
        scheduleNext();
    }

    // Stop loop
    function stopSliding() {
        clearTimeout(timeoutID);
    }

    // Init
    startSliding();

    // Pause on hover
    if (eventWrapper) {
        eventWrapper.addEventListener('mouseenter', stopSliding);
        eventWrapper.addEventListener('mouseleave', () => {
            showEvents();
            scheduleNext();
        });
    }
});


























document.addEventListener("DOMContentLoaded", function () {
const events = document.querySelectorAll(".unique-event-container");
let currentIndex = 0;
const transitionTime = 100; // Fade transition (ms)
const displayTime = 8000; // Display time per event (ms)
let timeoutId;

function isMobileOrTablet() {
    return window.matchMedia("(max-width: 1024px)").matches;
}

function showNextEvent() {
    if (!isMobileOrTablet()) return;

    events.forEach(event => event.classList.remove("active"));

    // Move to next
    currentIndex = (currentIndex + 1) % events.length;
    events[currentIndex].classList.add("active");

    // Schedule the next
    timeoutId = setTimeout(showNextEvent, displayTime);
}

function initializeEvents() {
    // Clear old timeout if any
    clearTimeout(timeoutId);

    if (!isMobileOrTablet()) return;

    // Reset
    currentIndex = 0;
    events.forEach(event => event.classList.remove("active"));
    events[currentIndex].classList.add("active");

    // Start the timed loop
    timeoutId = setTimeout(showNextEvent, displayTime);
}

// Init on load
initializeEvents();

// Re-initialize on screen resize
window.addEventListener("resize", initializeEvents);
});
