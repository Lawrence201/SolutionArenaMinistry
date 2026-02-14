"use client";

import React, { useState, useEffect } from "react";

interface Member {
    member_id: number;
    first_name: string;
    last_name: string;
    photo_path: string;
    birthday_thumb: string;
    birthday_title: string;
    birthday_message: string;
    date_of_birth: string;
}

const BirthdayCelebrations = () => {
    const [birthdays, setBirthdays] = useState<Member[]>([]);
    const [showSection, setShowSection] = useState(false);

    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                const response = await fetch('/api/website/birthdays');
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                    setBirthdays(data.data);
                    setShowSection(true);
                } else {
                    setShowSection(false);
                }
            } catch (err) {
                console.error("Error loading birthdays:", err);
                setShowSection(false);
            }
        };
        fetchBirthdays();
    }, []);

    if (!showSection) return null;

    return (
        <section className="gap birthday-section">
            <div className="container">
                <div className="heading">
                    <img src="/assets/images/Logo.PNG" alt="Heading Image" />
                    <p>Celebrating Our Precious Members</p>
                    <h2>Birthday Celebrations</h2>
                </div>
                <div id="birthday-cards-container" className="birthday-cards-grid">
                    {birthdays.map((member) => (
                        <div key={member.member_id} className="birthday-card" data-aos="fade-up">
                            <div className="b-card-image">
                                <div className="b-date-badge">
                                    {formatBirthdayDate(member.date_of_birth)}
                                </div>
                                <img
                                    src={getBirthdayImage(member)}
                                    alt={`${member.first_name}'s Birthday`}
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/user-profile.svg' }}
                                />
                            </div>
                            <div className="b-card-content">
                                <h3 className="b-card-title">{member.birthday_title || `Happy Birthday ${member.first_name}!`}</h3>
                                <p className="b-card-msg">"{member.birthday_message || "Wishing you God's richest blessings on your special day."}"</p>
                                {!member.birthday_thumb && (
                                    <div className="b-card-name">{member.first_name} {member.last_name}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Helper to format date like "Jan 12th"
function formatBirthdayDate(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });

    const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${month} ${day}${suffix(day)}`;
}

// Helper to resolve birthday image path
function getBirthdayImage(member: Member) {
    // Logic matches legacy birthday_loader.js
    if (member.birthday_thumb) {
        return `/admin_dashboard/Add_Members/${member.birthday_thumb}`;
    } else if (member.photo_path) {
        return `/admin_dashboard/Add_Members/${member.photo_path}`;
    }
    return '/assets/images/placeholder_user.png';
}

export default BirthdayCelebrations;
