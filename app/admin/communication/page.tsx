'use client';
import { useState } from 'react';
import Sidebar from '@/components/Admin/Sidebar';
import toast from 'react-hot-toast';
import './communication.css';

export default function CommunicationPage() {
    const [activeTab, setActiveTab] = useState('compose');
    const [selectedChannels, setSelectedChannels] = useState(['email']);
    const [messageType, setMessageType] = useState('announcement');
    const [audience, setAudience] = useState('all');
    const [audienceValue, setAudienceValue] = useState('');
    const [messageTitle, setMessageTitle] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const toggleChannel = (channel: string) => {
        if (selectedChannels.includes(channel)) {
            setSelectedChannels(selectedChannels.filter(c => c !== channel));
        } else {
            setSelectedChannels([...selectedChannels, channel]);
        }
    };

    const handleAudienceChange = (value: string) => {
        setAudience(value);
    };

    const handleSendMessage = async () => {
        // Validation
        if (!messageTitle.trim()) {
            toast.error('Please enter a message title');
            return;
        }

        if (!messageContent.trim()) {
            toast.error('Please enter message content');
            return;
        }

        if (selectedChannels.length === 0) {
            toast.error('Please select at least one delivery channel');
            return;
        }

        setIsSending(true);
        const loadingToast = toast.loading('Sending message...');

        try {
            const response = await fetch('/api/communication/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: messageTitle,
                    content: messageContent,
                    delivery_channels: selectedChannels,
                    audience_type: audience,
                    audience_value: audienceValue,
                    message_type: messageType,
                    action: 'send'
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Message sent successfully to ${data.total_recipients} recipients!`, {
                    id: loadingToast,
                });

                // Clear form
                setMessageTitle('');
                setMessageContent('');
                setAudience('all');
                setAudienceValue('');
            } else {
                toast.error(data.error || 'Failed to send message', {
                    id: loadingToast,
                });
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.', {
                id: loadingToast,
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {/* Page Header */}
            <div className="vax-header">
                <div className="vax-content">
                    <h1>Communications Hub</h1>
                    <p>Unified platform for email, SMS, and social media management</p>
                </div>
                <div className="vax-actions">
                    <button className="cmd-btn cmd-alt">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Templates
                    </button>
                    <button className="cmd-btn cmd-main">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        New Message
                    </button>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="insights-header">
                    <div className="insight-header-row">
                        <span className="insight-icon">
                            <img src="/assets/chatbot.png" alt="AI Insights" />
                        </span>
                        <h2>AI-Powered Insights</h2>
                    </div>
                    <div className="notif-grid">
                        <div className="notif-box" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                            <p style={{ color: '#94a3b8' }}>Loading insights...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                <div className="kpi-box">
                    <div className="kpi-top">
                        <span className="kpi-label">Messages Sent</span>
                        <span className="kpi-symbol">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                                <path d="m21.854 2.147-10.94 10.939"></path>
                            </svg>
                        </span>
                    </div>
                    <div className="kpi-value">0</div>
                    <div className="kpi-diff steady">All time</div>
                </div>

                <div className="kpi-box">
                    <div className="kpi-top">
                        <span className="kpi-label">Open Rate</span>
                        <span className="kpi-symbol">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </span>
                    </div>
                    <div className="kpi-value">0%</div>
                    <div className="kpi-diff">Calculating...</div>
                </div>

                <div className="kpi-box">
                    <div className="kpi-top">
                        <span className="kpi-label">Inbox</span>
                        <span className="kpi-symbol">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </span>
                    </div>
                    <div className="kpi-value">...</div>
                    <div className="kpi-diff">+12% from last month</div>
                </div>

                <div className="kpi-box">
                    <div className="kpi-top">
                        <span className="kpi-label">Users</span>
                        <span className="kpi-symbol">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </span>
                    </div>
                    <div className="kpi-value">...</div>
                    <div className="kpi-diff">Total Users on site</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="rat-section">
                <div className="rat-nav">
                    <button
                        className={`rat-tab ${activeTab === 'compose' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('compose')}
                    >
                        Compose
                    </button>
                    <button
                        className={`rat-tab ${activeTab === 'inbox' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('inbox')}
                    >
                        Inbox
                    </button>
                    <button
                        className={`rat-tab ${activeTab === 'calendar' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        Content Calendar
                    </button>
                    <button
                        className={`rat-tab ${activeTab === 'sent' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        Sent Messages
                    </button>
                    <button
                        className={`rat-tab ${activeTab === 'analytics' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {/* Compose Content */}
            {activeTab === 'compose' && (
                <div className="dash-section active">
                    <div className="msg-layout">
                        <div className="msg-form">
                            <div>
                                <h2 className="dash-title">Compose New Message</h2>
                                <p className="dash-subtitle">Create and send messages to your congregation</p>
                            </div>

                            <div id="successMessage" className="success-notif" style={{ display: 'none' }}>
                                <h3>Message Sent Successfully!</h3>
                                <p>Your message has been delivered to the selected audience.</p>
                            </div>

                            <div className="frm-row">
                                <div className="frm-group">
                                    <label className="frm-label">Message Type</label>
                                    <select
                                        className="frm-select"
                                        value={messageType}
                                        onChange={(e) => setMessageType(e.target.value)}
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="event">Event</option>
                                        <option value="prayer_request">Prayer Request</option>
                                        <option value="newsletter">Newsletter</option>
                                        <option value="birthday">Birthday Wish</option>
                                    </select>
                                </div>

                                <div className="frm-group">
                                    <label className="frm-label">Audience</label>
                                    <select
                                        className="frm-select"
                                        value={audience}
                                        onChange={(e) => handleAudienceChange(e.target.value)}
                                    >
                                        <option value="all">All Members</option>
                                        <option value="users">All Users (Registered on site)</option>
                                        <option value="department">Departments</option>
                                        <option value="church_group">Church Groups</option>
                                        <option value="ministry">Ministry</option>
                                        <option value="others">Others (Search Member)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Selectors */}
                            {audience === 'department' && (
                                <div className="frm-group">
                                    <label className="frm-label">Select Department</label>
                                    <select
                                        className="frm-select"
                                        value={audienceValue}
                                        onChange={(e) => setAudienceValue(e.target.value)}
                                    >
                                        <option value="">Select a department</option>
                                        <option value="Usher">Usher</option>
                                        <option value="Choir">Choir</option>
                                        <option value="Media">Media</option>
                                        <option value="Instrumentalist">Instrumentalist</option>
                                    </select>
                                </div>
                            )}

                            {audience === 'church_group' && (
                                <div className="frm-group">
                                    <label className="frm-label">Select Church Group</label>
                                    <select
                                        className="frm-select"
                                        value={audienceValue}
                                        onChange={(e) => setAudienceValue(e.target.value)}
                                    >
                                        <option value="">Select a church group</option>
                                        <option value="Dunamis">Dunamis</option>
                                        <option value="Kabod">Kabod</option>
                                        <option value="Judah">Judah</option>
                                        <option value="Karis">Karis</option>
                                    </select>
                                </div>
                            )}

                            {audience === 'ministry' && (
                                <div className="frm-group">
                                    <label className="frm-label">Select Ministry</label>
                                    <select
                                        className="frm-select"
                                        value={audienceValue}
                                        onChange={(e) => setAudienceValue(e.target.value)}
                                    >
                                        <option value="">Select a ministry</option>
                                        <option value="Children">Children</option>
                                        <option value="Women">Women</option>
                                        <option value="Men">Men</option>
                                        <option value="Youth">Youth</option>
                                    </select>
                                </div>
                            )}

                            {audience === 'others' && (
                                <div className="frm-group">
                                    <label className="frm-label">Search Member by Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="frm-input"
                                            placeholder="Type member name to search..."
                                            autoComplete="off"
                                        />
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.3-4.3"></path>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            <div className="frm-group">
                                <label className="frm-label">Message Title</label>
                                <input
                                    type="text"
                                    className="frm-input"
                                    placeholder="Enter message title..."
                                    value={messageTitle}
                                    onChange={(e) => setMessageTitle(e.target.value)}
                                />
                            </div>

                            <div className="frm-group">
                                <label className="frm-label">Message Content</label>
                                <textarea
                                    className="frm-textarea"
                                    placeholder="Type your message here..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="frm-label">Delivery Channels</label>
                                <div className="chan-options">
                                    <button
                                        className={`chan-btn ${selectedChannels.includes('email') ? 'active' : ''}`}
                                        onClick={() => toggleChannel('email')}
                                    >
                                        Email
                                    </button>
                                    <button
                                        className={`chan-btn ${selectedChannels.includes('sms') ? 'active' : ''}`}
                                        onClick={() => toggleChannel('sms')}
                                    >
                                        SMS
                                    </button>
                                    <button
                                        className={`chan-btn ${selectedChannels.includes('push') ? 'active' : ''}`}
                                        onClick={() => toggleChannel('push')}
                                    >
                                        Push Notification
                                    </button>
                                </div>
                            </div>

                            <div className="frm-actions">
                                <button
                                    className="cmd-large main"
                                    onClick={handleSendMessage}
                                    disabled={isSending}
                                >
                                    {isSending ? 'Sending...' : 'Send Now'}
                                </button>
                                <button className="cmd-large alt">Schedule</button>
                                <button className="cmd-large alt">Save Draft</button>
                            </div>
                        </div>

                        <div>
                            <div className="ai-panel">
                                <div className="ai-top">
                                    <h3>AI Writing Assistant</h3>
                                </div>
                                <div className="ai-tools">
                                    <button className="ai-tool">Generate Sunday reminder</button>
                                    <button className="ai-tool">Create event announcement</button>
                                    <button className="ai-tool">Write prayer request</button>
                                    <button className="ai-tool">Suggest follow-up message</button>
                                </div>
                            </div>

                            <div className="msg-preview">
                                <h3 className="preview-head">Message Preview</h3>
                                <div className="preview-body">
                                    <h4>{messageTitle || 'Message Title'}</h4>
                                    <p>{messageContent || 'Your message content will appear here...'}</p>
                                    <p className="preview-info">To: {audience === 'all' ? 'All Members' : 'Select audience'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inbox Content */}
            {activeTab === 'inbox' && (
                <div className="dash-section active">
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', minHeight: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 className="dash-title">Email Inbox</h2>
                                <p className="dash-subtitle">View and manage received emails</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="cmd-btn cmd-alt">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                                    </svg>
                                    Refresh
                                </button>
                                <button className="cmd-btn cmd-main">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                                    </svg>
                                    Compose
                                </button>
                            </div>
                        </div>

                        {/* Inbox Toolbar */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input type="text" placeholder="Search emails..." style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </svg>
                            </div>
                            <select style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}>
                                <option value="all">All Emails</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                            </select>
                        </div>

                        {/* Split Pane */}
                        <div style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', minHeight: '500px' }}>
                            {/* Email List */}
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflowY: 'auto', maxHeight: '600px' }}>
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                                    <p>Loading emails...</p>
                                </div>
                            </div>

                            {/* Email Detail */}
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', overflowY: 'auto', maxHeight: '600px', background: '#f9fafb' }}>
                                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>No email selected</p>
                                    <p style={{ fontSize: '14px' }}>Select an email from the list to view its contents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Content */}
            {activeTab === 'calendar' && (
                <div className="dash-section active">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 className="dash-title">Content Calendar</h2>
                        <p className="dash-subtitle">Plan and schedule your communications across all channels</p>
                    </div>

                    <div className="cal-grid">
                        <div className="cal-day">
                            <div className="day-num">1</div>
                            <div className="day-items">2 posts</div>
                        </div>
                        <div className="cal-day">
                            <div className="day-num">2</div>
                        </div>
                        <div className="cal-day scheduled">
                            <div className="day-num">3</div>
                            <div className="day-items">1 post</div>
                        </div>
                        <div className="cal-day">
                            <div className="day-num">4</div>
                        </div>
                        <div className="cal-day scheduled">
                            <div className="day-num">5</div>
                            <div className="day-items">3 posts</div>
                        </div>
                        <div className="cal-day">
                            <div className="day-num">6</div>
                        </div>
                        <div className="cal-day scheduled">
                            <div className="day-num">7</div>
                            <div className="day-items">Sunday Service</div>
                        </div>
                    </div>

                    <button className="cmd-large main">Schedule New Content</button>
                </div>
            )}

            {/* Sent Messages Content */}
            {activeTab === 'sent' && (
                <div className="dash-section active">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 className="dash-title">Sent Messages</h2>
                        <p className="dash-subtitle">Messages delivered to your congregation</p>
                    </div>

                    <div className="msg-list">
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <p>Loading sent messages...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Content */}
            {activeTab === 'analytics' && (
                <div className="dash-section active">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 className="dash-title">Communication Analytics</h2>
                        <p className="dash-subtitle">Insights into your messaging performance and engagement</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* Message Volume Chart */}
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Message Volume (Last 7 Days)</h3>
                            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                Chart placeholder
                            </div>
                        </div>

                        {/* Channel Distribution */}
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Channel Distribution</h3>
                            <div style={{ height: '200px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                Chart placeholder
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                                Distribution of sent messages by channel
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Engagement Chart */}
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Recent Engagement Rates</h3>
                            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                Chart placeholder
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Recent Activity</h3>
                            <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading activity...</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
