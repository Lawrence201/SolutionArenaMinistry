document.addEventListener('DOMContentLoaded', function () {
    loadBirthdays();
});

async function loadBirthdays() {
    const container = document.getElementById('birthday-cards-container');
    if (!container) return;

    const section = document.querySelector('.birthday-section');

    try {
        const response = await fetch('index_php/get_birthdays.php');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Show section (in case it was hidden)
            if (section) section.style.display = 'block';

            container.innerHTML = ''; // Clear loading state

            result.data.forEach(member => {
                const card = createBirthdayCard(member);
                container.appendChild(card);
            });
        } else {
            // No birthdays today - HIDE the whole section
            if (section) section.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading birthdays:', error);
        // On error, also hide the section to avoid broken UI
        if (section) section.style.display = 'none';
    }
}

function createBirthdayCard(member) {
    const div = document.createElement('div');
    div.className = 'birthday-card';

    // Determine image logic
    // 1. Use birthday_thumb (flyer) if available
    // 2. Use photo_path if available
    // 3. Fallback placeholder
    let imageSrc = 'assets/images/placeholder_user.png'; // Default
    let isFlyer = false;

    if (member.birthday_thumb) {
        imageSrc = `../admin_dashboard/Add_Members/${member.birthday_thumb}`;
        isFlyer = true;
    } else if (member.photo_path) {
        imageSrc = `../admin_dashboard/Add_Members/${member.photo_path}`;
    }

    // Determine Title and Message
    // If no specific title, use generic "Happy Birthday [Name]"
    const title = member.birthday_title || `Happy Birthday ${member.first_name}!`;
    const message = member.birthday_message || "Wishing you God's richest blessings on your special day.";

    // Format Date (e.g., "12th")
    const dateObj = new Date(member.date_of_birth);
    const day = dateObj.getDate();
    // Month name
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const suffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };
    const dateString = `${month} ${day}${suffix(day)}`;

    div.innerHTML = `
        <div class="b-card-image">
            <div class="b-date-badge">${dateString}</div>
            <img src="${imageSrc}" alt="${member.first_name}'s Birthday" loading="lazy" 
                 onerror="this.src='assets/images/user-profile.svg'">
        </div>
        <div class="b-card-content">
            <h3 class="b-card-title">${title}</h3>
            <p class="b-card-msg">"${message}"</p>
            ${!isFlyer ? `<div class="b-card-name">${member.first_name} ${member.last_name}</div>` : ''}
        </div>
    `;

    return div;
}
