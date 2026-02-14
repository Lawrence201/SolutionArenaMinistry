'use client';

import React from 'react';

type MemberStatsProps = {
    stats: any; // Use proper type from actions
};

export default function MemberStats({ stats }: MemberStatsProps) {
    if (!stats) return null;

    return (
        <div className="cf-stats-container">
            <div className="cf-stats-layout">
                <div className="cf-stat-unit">
                    <h2 className="cf-color-primary" id="stat-total">{stats.total || 0}</h2>
                    <p>Total Members</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-secondary" id="stat-active">{stats.active || 0}</h2>
                    <p>Active Members</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-secondary" id="stat-inactive">{stats.inactive || 0}</h2>
                    <p>Inactive Members</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-secondary" id="stat-pastors">{stats.pastors || 0}</h2>
                    <p>Pastors</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-secondary" id="stat-ministers">{stats.ministers || 0}</h2>
                    <p>Ministers</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-secondary" id="stat-group-leaders">{stats.groupLeaders || 0}</h2>
                    <p>Group Leaders</p>
                </div>

                {/* New Metrics based on legacy HTML */}
                <div className="cf-stat-unit">
                    <h2 className="cf-color-info" id="stat-males">{stats.males || 0}</h2>
                    <p>Males</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-success" id="stat-females">{stats.females || 0}</h2>
                    <p>Females</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-warning" id="stat-children">{stats.children || 0}</h2>
                    <p>Children</p>
                </div>

                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-baptized">{stats.baptized || 0}</h2>
                    <p>Baptized</p>
                </div>

                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-not-baptized">{stats.notBaptized || 0}</h2>
                    <p>Not Baptized</p>
                </div>

                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-pending">{stats.pendingBaptism || 0}</h2>
                    <p>Pending</p>
                </div>


                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-kabod">{stats.kabod || 0}</h2>
                    <p>Kabod</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-dunamis">{stats.dunamis || 0}</h2>
                    <p>Dunamis</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-judah">{stats.judah || 0}</h2>
                    <p>Judah</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-karis">{stats.karis || 0}</h2>
                    <p>Karis</p>
                </div>

                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-birthday">{stats.birthdayThisMonth || 0}</h2>
                    <p>Birthday This Month</p>
                </div>
                <div className="cf-stat-unit">
                    <h2 className="cf-color-accent" id="stat-total-events">{stats.totalEvents || 0}</h2>
                    <p>Total Events</p>
                </div>
            </div>
        </div>
    );
}
