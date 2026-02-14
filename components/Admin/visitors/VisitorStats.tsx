import React from 'react';
import styles from './visitors.module.css';

interface VisitorStatsProps {
    totalVisitors: number;
    newVisitors: number;
    urgentFollowups: number;
    pendingFollowups: number;
    contactedCount: number;
    returningVisitors: number;
    convertedMembers: number;
    conversionRate: string;
}

const VisitorStats: React.FC<VisitorStatsProps> = ({
    totalVisitors,
    newVisitors,
    urgentFollowups,
    pendingFollowups,
    contactedCount,
    returningVisitors,
    convertedMembers,
    conversionRate
}) => {
    return (
        <div className={styles.cfStatsContainer}>
            <div className={styles.cfStatsLayout}>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorPrimary}>{totalVisitors}</h2>
                    <p>Total Visitors</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorSecondary}>{newVisitors}</h2>
                    <p>New This Week</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 style={{ color: '#ef4444' }}>{urgentFollowups}</h2>
                    <p>Urgent Follow-ups</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorAccent}>{pendingFollowups}</h2>
                    <p>Pending Follow-ups</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorInfo}>{contactedCount}</h2>
                    <p>Contacted</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorPurple}>{returningVisitors}</h2>
                    <p>Returning Visitors</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorSuccess}>{convertedMembers}</h2>
                    <p>Converted Members</p>
                </div>
                <div className={styles.cfStatUnit}>
                    <h2 className={styles.cfColorWarning}>{conversionRate}</h2>
                    <p>Conversion Rate</p>
                </div>
            </div>
        </div>
    );
};

export default VisitorStats;
