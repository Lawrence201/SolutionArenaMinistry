"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./add-finance.css";
import { X, Trash2 } from "lucide-react";

type Member = {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    photo_path: string | null;
};

const MemberAvatar = ({ member }: { member: Member }) => {
    const [error, setError] = useState(false);
    // Logic: If photo exists and didn't error, show it. Otherwise fall back to initials.
    if (member.photo_path && member.photo_path !== 'NULL' && !error) {
        // Handle paths that might already be absolute or external
        const imgSrc = (member.photo_path.startsWith('/') || member.photo_path.startsWith('http'))
            ? member.photo_path
            : `/uploads/members/${member.photo_path}`;

        return (
            <img
                src={imgSrc}
                alt={member.full_name}
                className="member-avatar"
                onError={() => setError(true)}
            />
        );
    }
    return <div className="member-avatar-initials">{member.full_name.charAt(0)}</div>;
};

const ReceiptModal = ({
    isOpen,
    onClose,
    data
}: {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}) => {
    if (!isOpen || !data) return null;

    const handlePrint = () => {
        const originalTitle = document.title;
        const filename = `${data.name.replace(/\s+/g, '_')}_Tithe_Receipt.pdf`;
        document.title = filename;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content receipt-modal-content">
                <div className="modal-header no-print">
                    <h2>Receipt Preview</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body receipt-preview">
                    {/* Header */}
                    <div className="receipt-header">
                        {/* Replaced placeholder with Logo */}
                        <img src="/assets/Logo.PNG" alt="SAM Logo" className="church-logo-img" />
                        <h1>Solution Arena Ministry</h1>
                        <p>Tithe Receipt</p>
                    </div>

                    <div className="receipt-divider"></div>

                    {/* Member Info */}
                    <div className="receipt-member-section">
                        {data.photoPath && (
                            <img
                                src={data.photoPath}
                                alt="Member"
                                className="receipt-member-photo"
                            />
                        )}
                        <div className="receipt-member-details">
                            <h3>{data.name}</h3>
                            <p>{data.email}</p>
                        </div>
                    </div>

                    <div className="receipt-details-grid">
                        <div className="receipt-row">
                            <span className="label">Receipt Number</span>
                            <span className="value">{data.receiptNumber}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date</span>
                            <span className="value">{data.date}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Payment Method</span>
                            <span className="value">{data.method}</span>
                        </div>
                        <div className="receipt-row total">
                            <span className="label">Amount</span>
                            <span className="value">₵{Number(data.amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="receipt-footer">
                        <p>Thank you for your faithful giving!</p>
                        <p className="small">system generated receipt</p>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button className="rrap_btn" onClick={onClose}>Close</button>
                    <button className="rrap_btn rrap_btnprim" onClick={handlePrint}>Print / Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default function RecordDonationPage() {
    const [activeTab, setActiveTab] = useState("offering");
    const [loading, setLoading] = useState(false);

    // Common Fields
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState("Cash");

    // Offering Fields
    const [offeringServiceType, setOfferingServiceType] = useState("Sunday Worship");
    const [offeringTime, setOfferingTime] = useState("");
    const [offeringAmount, setOfferingAmount] = useState("");
    const [offeringCountedBy, setOfferingCountedBy] = useState("");
    const [offeringNotes, setOfferingNotes] = useState("");

    // Project Offering Fields
    const [projectServiceType, setProjectServiceType] = useState("Sunday Worship");
    const [projectTime, setProjectTime] = useState("");
    const [projectName, setProjectName] = useState("Building Fund");
    const [customProjectName, setCustomProjectName] = useState("");
    const [projectAmount, setProjectAmount] = useState("");
    const [projectCountedBy, setProjectCountedBy] = useState("");
    const [projectNotes, setProjectNotes] = useState("");

    // Tithe Fields
    const [titheMemberName, setTitheMemberName] = useState("");
    const [titheMemberId, setTitheMemberId] = useState<number | null>(null);
    const [titheMemberEmail, setTitheMemberEmail] = useState("");
    const [titheAmount, setTitheAmount] = useState("");
    const [titheReceipt, setTitheReceipt] = useState("");
    const [titheNotes, setTitheNotes] = useState("");

    // Tithe Autocomplete
    const [memberSuggestions, setMemberSuggestions] = useState<Member[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Welfare Fields
    const [welfareMemberName, setWelfareMemberName] = useState("");
    const [welfareMemberId, setWelfareMemberId] = useState<number | null>(null);
    const [welfareAmount, setWelfareAmount] = useState("");
    const [welfarePeriod, setWelfarePeriod] = useState("Monthly");
    const [welfareStatus, setWelfareStatus] = useState("Paid");
    const [welfareNotes, setWelfareNotes] = useState("");
    const [welfareSuggestions, setWelfareSuggestions] = useState<Member[]>([]);
    const [showWelfareSuggestions, setShowWelfareSuggestions] = useState(false);

    // Expense Fields
    const [expenseCategory, setExpenseCategory] = useState("Utilities");
    const [customExpenseCategory, setCustomExpenseCategory] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseVendor, setExpenseVendor] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseStatus, setExpenseStatus] = useState("Pending");
    const [expenseNotes, setExpenseNotes] = useState("");

    // Manage Records State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState("offering");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [records, setRecords] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Receipt Modal
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Withdrawal Modal
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAccount, setWithdrawAccount] = useState("offering");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawRecipient, setWithdrawRecipient] = useState("");
    const [withdrawPurpose, setWithdrawPurpose] = useState("Medical Assistance");
    const [withdrawAuthorizedBy, setWithdrawAuthorizedBy] = useState("");
    const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().split("T")[0]);
    const [withdrawNotes, setWithdrawNotes] = useState("");
    const [withdrawBalance, setWithdrawBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

    // Functions
    const handleMemberSearch = (query: string, type: "tithe" | "welfare") => {
        if (type === "tithe") setTitheMemberName(query);
        else setWelfareMemberName(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        // Allow empty query to fetch defaults
        // if (query.length < 2) { ... } // Removed restriction

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/admin/members/search?query=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.success) {
                    if (type === "tithe") {
                        setMemberSuggestions(data.members);
                        setShowSuggestions(true);
                    } else {
                        setWelfareSuggestions(data.members);
                        setShowWelfareSuggestions(true);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);
    };

    const selectMember = (member: Member, type: "tithe" | "welfare") => {
        if (type === "tithe") {
            setTitheMemberName(member.full_name);
            setTitheMemberId(member.id);
            setTitheMemberEmail(member.email || "");
            setShowSuggestions(false);
        } else {
            setWelfareMemberName(member.full_name);
            setWelfareMemberId(member.id);
            setShowWelfareSuggestions(false);
        }
    };

    const clearForm = () => {
        // Common
        setDate(new Date().toISOString().split("T")[0]);
        setPaymentMethod("Cash");
        // Offering
        setOfferingServiceType("Sunday Worship");
        setOfferingTime("");
        setOfferingAmount("");
        setOfferingCountedBy("");
        setOfferingNotes("");
        // Project
        setProjectServiceType("Sunday Worship");
        setProjectTime("");
        setProjectName("Building Fund");
        setCustomProjectName("");
        setProjectAmount("");
        setProjectCountedBy("");
        setProjectNotes("");
        // Tithe
        setTitheMemberName("");
        setTitheMemberId(null);
        setTitheMemberEmail("");
        setTitheAmount("");
        setTitheReceipt("");
        setTitheNotes("");
        // Welfare
        setWelfareMemberName("");
        setWelfareMemberId(null);
        setWelfareAmount("");
        setWelfarePeriod("Monthly");
        setWelfareStatus("Paid");
        setWelfareNotes("");
        // Expense
        setExpenseCategory("Utilities");
        setCustomExpenseCategory("");
        setExpenseDescription("");
        setExpenseVendor("");
        setExpenseAmount("");
        setExpenseStatus("Pending");
        setExpenseNotes("");
    };

    const handleSubmit = async () => {
        const payload: any = { type: activeTab, date, paymentMethod };

        if (activeTab === "offering") {
            if (!offeringAmount) return alert("Please enter amount");
            payload.serviceType = offeringServiceType;
            payload.serviceTime = offeringTime;
            payload.amount = offeringAmount;
            payload.countedBy = offeringCountedBy;
            payload.notes = offeringNotes;
        } else if (activeTab === "projectoffering") {
            if (!projectAmount) return alert("Please enter amount");
            payload.serviceType = projectServiceType;
            payload.serviceTime = projectTime;
            payload.projectName = projectName === "custom" ? customProjectName : projectName;
            payload.amount = projectAmount;
            payload.countedBy = projectCountedBy;
            payload.notes = projectNotes;
        } else if (activeTab === "tithe") {
            if (!titheMemberName || !titheAmount) return alert("Please enter member and amount");
            payload.memberId = titheMemberId;
            payload.memberName = titheMemberName;
            payload.amount = titheAmount;
            payload.receiptNumber = titheReceipt;
            payload.notes = titheNotes;
        } else if (activeTab === "welfare") {
            if (!welfareMemberName || !welfareAmount) return alert("Please enter member and amount");
            payload.memberId = welfareMemberId;
            payload.amount = welfareAmount;
            payload.paymentPeriod = welfarePeriod;
            payload.status = welfareStatus;
            payload.notes = welfareNotes;
        } else if (activeTab === "expense") {
            if (!expenseDescription || !expenseAmount) return alert("Please enter description and amount");
            payload.category = expenseCategory;
            payload.customCategory = customExpenseCategory;
            payload.description = expenseDescription;
            payload.vendor = expenseVendor;
            payload.amount = expenseAmount;
            payload.status = expenseStatus;
            payload.notes = expenseNotes;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/finance/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message + '\nTransaction ID: ' + result.transaction_id);
                if (activeTab === "tithe" && confirm("Do you want to generate a receipt?")) {
                    handleGenerateReceipt(result.data);
                }
                clearForm();
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            alert("Error saving record: " + (err instanceof Error ? err.message : "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReceipt = (data: any) => {
        setReceiptData({
            name: titheMemberName,
            email: titheMemberEmail,
            amount: titheAmount,
            date: date,
            receiptNumber: titheReceipt || `RCT-${Date.now()}`,
            method: paymentMethod
        });
        setIsReceiptModalOpen(true);
    };

    // Delete Records Modal
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
        loadDeleteRecords();
    };

    const loadDeleteRecords = async () => {
        setLoadingRecords(true);
        try {
            const params = new URLSearchParams({ type: deleteType });
            if (searchTerm) params.append('search', searchTerm);
            if (filterDate) params.append('date', filterDate);

            const res = await fetch(`/api/admin/finance/records?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.data);
            } else {
                setRecords([]);
            }
        } catch (error) {
            console.error(error);
            setRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    useEffect(() => {
        if (isDeleteModalOpen) {
            loadDeleteRecords();
        }
    }, [deleteType, searchTerm, filterDate, isDeleteModalOpen]);

    const deleteSelectedRecords = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedRecords.length} record(s)?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/finance/records', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedRecords, type: deleteType })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully deleted ${data.count} records`);
                setSelectedRecords([]);
                loadDeleteRecords();
            } else {
                alert('Error deleting records: ' + data.message);
            }
        } catch (error) {
            alert('Error deleting records');
        } finally {
            setIsDeleting(false);
        }
    };

    // Get current amount for summary
    const getCurrentAmount = () => {
        switch (activeTab) {
            case "offering": return offeringAmount || "0.00";
            case "projectoffering": return projectAmount || "0.00";
            case "tithe": return titheAmount || "0.00";
            case "welfare": return welfareAmount || "0.00";
            case "expense": return expenseAmount || "0.00";
            default: return "0.00";
        }
    };

    // Get primary field for summary
    const getPrimaryField = () => {
        switch (activeTab) {
            case "offering": return offeringServiceType || "—";
            case "projectoffering": return projectName || "—";
            case "tithe": return titheMemberName || "—";
            case "welfare": return welfareMemberName || "—";
            case "expense": return expenseCategory || "—";
            default: return "—";
        }
    };

    const formatAmount = (val: string) => {
        return `₵${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Withdrawal Functions
    const fetchAccountBalance = async (account: string) => {
        setLoadingBalance(true);
        try {
            const res = await fetch(`/api/admin/finance/balance?account=${account}`);
            const result = await res.json();
            if (result.success) {
                setWithdrawBalance(result.balance);
            } else {
                setWithdrawBalance(0);
            }
        } catch (error) {
            setWithdrawBalance(0);
        } finally {
            setLoadingBalance(false);
        }
    };

    const openWithdrawModal = () => {
        setIsWithdrawModalOpen(true);
        fetchAccountBalance(withdrawAccount);
    };

    const handleWithdrawAccountChange = (account: string) => {
        setWithdrawAccount(account);
        fetchAccountBalance(account);
    };

    const processWithdrawal = async () => {
        if (!withdrawAmount || !withdrawRecipient || !withdrawPurpose || !withdrawAuthorizedBy) {
            alert("Please fill all required fields before processing withdrawal");
            return;
        }

        const amount = parseFloat(withdrawAmount);
        if (amount <= 0) {
            alert("Amount must be greater than ₵0.00");
            return;
        }

        if (amount > withdrawBalance) {
            alert(`Insufficient funds! Available balance: ₵${withdrawBalance.toFixed(2)}`);
            return;
        }

        // Get friendly account name
        const accountName = {
            offering: "Offerings Account",
            tithe: "Tithe Account",
            projectoffering: "Project Offerings Account",
            welfare: "Welfare Account"
        }[withdrawAccount] || "Account";

        setIsProcessingWithdraw(true);
        try {
            const res = await fetch("/api/admin/finance/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_type: withdrawAccount,
                    amount: withdrawAmount,
                    recipient: withdrawRecipient,
                    purpose: withdrawPurpose,
                    authorized_by: withdrawAuthorizedBy,
                    date: withdrawDate,
                    notes: withdrawNotes
                })
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message + '\nTransaction ID: ' + result.transaction_id);
                setIsWithdrawModalOpen(false);
                // Reset form
                setWithdrawAmount("");
                setWithdrawRecipient("");
                setWithdrawPurpose("Medical Assistance");
                setWithdrawAuthorizedBy("");
                setWithdrawNotes("");
            } else {
                alert("Withdrawal failed: " + result.message);
            }
        } catch (error) {
            alert("Failed to process withdrawal: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsProcessingWithdraw(false);
        }
    };

    return (
        <div className="dashboard-content">

            {/* Page Header */}
            <div className="cf-donation-header">
                <h1>Record New Donation</h1>
                <p>Capture donation details and generate receipt for church members</p>
            </div>

            <main className="zorp_mainwrap">
                <div className="rray_layout">
                    {/* Main Form Card */}
                    <div className="rray_cardbox">
                        <div className="rray_cardtop">
                            <div>
                                <div className="rray_titline">New Record</div>
                                <div className="rray_subtext">Fill in the details below. Fields adapt based on the selected type.</div>
                            </div>
                            <div className="rrap_inln">
                                <span className="rrap_badge rrap_bdggrn">Autosaved</span>
                            </div>
                        </div>

                        <div className="rray_cardmain">
                            {/* Type Tabs */}
                            <div className="rrap_tabgroup">
                                {[
                                    { id: "offering", label: "Offering" },
                                    { id: "projectoffering", label: "Project Offering" },
                                    { id: "tithe", label: "Tithe (CPS)" },
                                    { id: "welfare", label: "Welfare" },
                                    { id: "expense", label: "Expense" }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`rrap_tabitem ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => { setActiveTab(tab.id); }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Common Fields - Date & Payment Method */}
                            <div className="rray_gridlay">
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Date</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Payment Method</label>
                                    <select className="rrap_fldsel" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                        <option>Cash</option>
                                        <option>Mobile Money</option>
                                        <option>Bank Transfer</option>
                                        <option>Cheque</option>
                                        <option>Mixed</option>
                                    </select>
                                </div>
                            </div>

                            {/* OFFERING FORM */}
                            {activeTab === "offering" && (
                                <div id="formOffering">
                                    <div className="rray_sectit">Offering details</div>
                                    <div className="rray_gridlay">
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Service Type</label>
                                            <select className="rrap_fldsel" value={offeringServiceType} onChange={e => setOfferingServiceType(e.target.value)}>
                                                <option>Sunday Worship</option>
                                                <option>Wednesday Service</option>
                                                <option>Prayer Meeting</option>
                                                <option>Special Offering</option>
                                            </select>
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Service Time</label>
                                            <input className="rrap_fldinp" type="time" value={offeringTime} onChange={e => setOfferingTime(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Amount Collected (₵)</label>
                                            <input className="rrap_fldinp" type="number" placeholder="0.00" value={offeringAmount} onChange={e => setOfferingAmount(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Counted By</label>
                                            <input className="rrap_fldinp" type="text" placeholder="Deacon/Officer name" value={offeringCountedBy} onChange={e => setOfferingCountedBy(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="rrap_fieldgrp">
                                        <label className="rrap_fldlab">Notes</label>
                                        <textarea className="rrap_fldtxt" placeholder="Additional details..." value={offeringNotes} onChange={e => setOfferingNotes(e.target.value)}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* PROJECT OFFERING FORM */}
                            {activeTab === "projectoffering" && (
                                <div id="formProjectOffering">
                                    <div className="rray_sectit">Project Offering details</div>
                                    <div className="rray_gridlay">
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Service Type</label>
                                            <select className="rrap_fldsel" value={projectServiceType} onChange={e => setProjectServiceType(e.target.value)}>
                                                <option>Sunday Worship</option>
                                                <option>Wednesday Service</option>
                                                <option>Prayer Meeting</option>
                                                <option>Special Project Offering</option>
                                            </select>
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Service Time</label>
                                            <input className="rrap_fldinp" type="time" value={projectTime} onChange={e => setProjectTime(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Project Name</label>
                                            <select className="rrap_fldsel" value={projectName} onChange={e => setProjectName(e.target.value)}>
                                                <option>Building Fund</option>
                                                <option>Bus Acquisition</option>
                                                <option>Instrument Fund</option>
                                                <option>Mission Support</option>
                                                <option value="custom">Other (Type Custom)</option>
                                            </select>
                                        </div>
                                        {projectName === "custom" && (
                                            <div className="rrap_fieldgrp">
                                                <label className="rrap_fldlab">Custom Project Name</label>
                                                <input className="rrap_fldinp" type="text" placeholder="Enter project name" value={customProjectName} onChange={e => setCustomProjectName(e.target.value)} />
                                            </div>
                                        )}
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Amount (₵)</label>
                                            <input className="rrap_fldinp" type="number" placeholder="0.00" value={projectAmount} onChange={e => setProjectAmount(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Counted By</label>
                                            <input className="rrap_fldinp" type="text" placeholder="Deacon/Officer name" value={projectCountedBy} onChange={e => setProjectCountedBy(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="rrap_fieldgrp">
                                        <label className="rrap_fldlab">Notes</label>
                                        <textarea className="rrap_fldtxt" placeholder="Additional details about the project offering..." value={projectNotes} onChange={e => setProjectNotes(e.target.value)}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* TITHE FORM */}
                            {activeTab === "tithe" && (
                                <div id="formTithe">
                                    <div className="rray_sectit">Tithe details</div>
                                    <div className="rray_gridlay">
                                        <div className="rrap_fieldgrp member-autocomplete-container">
                                            <label className="rrap_fldlab">Member Name</label>
                                            <input
                                                className="rrap_fldinp"
                                                type="text"
                                                placeholder="Type member name..."
                                                value={titheMemberName}
                                                onChange={e => handleMemberSearch(e.target.value, "tithe")}
                                                onFocus={() => handleMemberSearch(titheMemberName, "tithe")}
                                                autoComplete="off"
                                            />
                                            {showSuggestions && memberSuggestions.length > 0 && (
                                                <div className="member-suggestions" style={{ display: 'block' }}>
                                                    {memberSuggestions.map(m => (
                                                        <div key={m.id} className="member-suggestion-item" onClick={() => selectMember(m, "tithe")}>
                                                            <MemberAvatar member={m} />
                                                            <div className="member-info">
                                                                <div className="member-name">{m.full_name}</div>
                                                                <div className="member-contact">{m.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Member Email (optional)</label>
                                            <input className="rrap_fldinp" type="email" placeholder="name@example.com" value={titheMemberEmail} readOnly style={{ background: '#f9fafb' }} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Amount (₵)</label>
                                            <input className="rrap_fldinp" type="number" placeholder="0.00" value={titheAmount} onChange={e => setTitheAmount(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Receipt Number</label>
                                            <input className="rrap_fldinp" type="text" placeholder="Auto or manual" value={titheReceipt} onChange={e => setTitheReceipt(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="rrap_fieldgrp">
                                        <label className="rrap_fldlab">Notes</label>
                                        <textarea className="rrap_fldtxt" placeholder="Thank you note, remarks..." value={titheNotes} onChange={e => setTitheNotes(e.target.value)}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* WELFARE FORM */}
                            {activeTab === "welfare" && (
                                <div id="formWelfare">
                                    <div className="rray_sectit">Welfare details</div>
                                    <div className="rray_gridlay">
                                        <div className="rrap_fieldgrp member-autocomplete-container">
                                            <label className="rrap_fldlab">Member Name</label>
                                            <input
                                                className="rrap_fldinp"
                                                type="text"
                                                placeholder="Type member name..."
                                                value={welfareMemberName}
                                                onChange={e => handleMemberSearch(e.target.value, "welfare")}
                                                onFocus={() => handleMemberSearch(welfareMemberName, "welfare")}
                                                autoComplete="off"
                                            />
                                            {showWelfareSuggestions && welfareSuggestions.length > 0 && (
                                                <div className="member-suggestions" style={{ display: 'block' }}>
                                                    {welfareSuggestions.map(m => (
                                                        <div key={m.id} className="member-suggestion-item" onClick={() => selectMember(m, "welfare")}>
                                                            <MemberAvatar member={m} />
                                                            <div className="member-info">
                                                                <div className="member-name">{m.full_name}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Amount (₵)</label>
                                            <input className="rrap_fldinp" type="number" placeholder="0.00" value={welfareAmount} onChange={e => setWelfareAmount(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Payment Period</label>
                                            <select className="rrap_fldsel" value={welfarePeriod} onChange={e => setWelfarePeriod(e.target.value)}>
                                                <option>Monthly</option>
                                                <option>Quarterly</option>
                                                <option>Annually</option>
                                            </select>
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Status</label>
                                            <select className="rrap_fldsel" value={welfareStatus} onChange={e => setWelfareStatus(e.target.value)}>
                                                <option>Paid</option>
                                                <option>Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="rrap_fieldgrp">
                                        <label className="rrap_fldlab">Notes</label>
                                        <textarea className="rrap_fldtxt" placeholder="Additional notes..." value={welfareNotes} onChange={e => setWelfareNotes(e.target.value)}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* EXPENSE FORM */}
                            {activeTab === "expense" && (
                                <div id="formExpense">
                                    <div className="rray_sectit">Expense details</div>
                                    <div className="rray_grid3">
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Category</label>
                                            <select className="rrap_fldsel" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                                                <option>Utilities</option>
                                                <option>Maintenance</option>
                                                <option>Salaries</option>
                                                <option>Supplies</option>
                                                <option>Events</option>
                                                <option>Transportation</option>
                                                <option value="custom">Other (Type Custom)</option>
                                            </select>
                                        </div>
                                        {expenseCategory === "custom" && (
                                            <div className="rrap_fieldgrp">
                                                <label className="rrap_fldlab">Custom Category</label>
                                                <input className="rrap_fldinp" type="text" placeholder="Enter custom category" value={customExpenseCategory} onChange={e => setCustomExpenseCategory(e.target.value)} />
                                            </div>
                                        )}
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Vendor/Payee</label>
                                            <input className="rrap_fldinp" type="text" placeholder="Company or person" value={expenseVendor} onChange={e => setExpenseVendor(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Amount (₵)</label>
                                            <input className="rrap_fldinp" type="number" placeholder="0.00" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="rray_gridlay">
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Description</label>
                                            <input className="rrap_fldinp" type="text" placeholder="What was paid for?" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} />
                                        </div>
                                        <div className="rrap_fieldgrp">
                                            <label className="rrap_fldlab">Status</label>
                                            <select className="rrap_fldsel" value={expenseStatus} onChange={e => setExpenseStatus(e.target.value)}>
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="rrap_fieldgrp">
                                        <label className="rrap_fldlab">Notes</label>
                                        <textarea className="rrap_fldtxt" placeholder="Additional details..." value={expenseNotes} onChange={e => setExpenseNotes(e.target.value)}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Receipt Upload Section */}
                            <div className="rray_sectit">Receipt Upload (optional)</div>
                            <div className="rray_uploadz">Drag & drop receipt here or <span style={{ color: '#4b8cf7', cursor: 'pointer' }}>click to upload</span></div>
                            <div className="rrap_helper">Accepted: JPG, PNG, PDF up to 10MB</div>

                            {/* Action Buttons */}
                            <div className="rray_btnarea">
                                <button className="rrap_btn" onClick={clearForm}>Reset</button>
                                <button className="rrap_btn rrap_btnwarn" onClick={openWithdrawModal} style={{ marginRight: 'auto' }}>Remove Records</button>
                                <button className="rrap_btn rrap_btnprim" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Saving..." : "Save Record"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <aside className="rray_sumside rray_cardbox">
                        <div className="rray_cardtop">
                            <div className="rray_titline">Quick Summary</div>
                        </div>
                        <div className="rray_cardmain">
                            <div className="rray_sumrow">
                                <span>Type</span>
                                <strong>{activeTab === "projectoffering" ? "Project Offering" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong>
                            </div>
                            <div className="rray_sumrow">
                                <span>Date</span>
                                <strong>{date || "—"}</strong>
                            </div>
                            <div className="rray_sumrow">
                                <span>Payment</span>
                                <strong style={{ color: '#4b8cf7' }}>{paymentMethod}</strong>
                            </div>
                            <div className="rray_divline"></div>
                            <div className="rray_sumrow">
                                <span>Primary Field</span>
                                <strong>{getPrimaryField()}</strong>
                            </div>
                            <div className="rray_sumrow">
                                <span>Amount</span>
                                <strong style={{ color: '#10b981' }}>{formatAmount(getCurrentAmount())}</strong>
                            </div>
                            <div className="rray_sumtot">
                                <span>Ready to Save</span>
                                <span className={`rrap_badge ${getCurrentAmount() !== "0.00" ? "rrap_bdggrn" : "rrap_bdgyel"}`}>
                                    {getCurrentAmount() !== "0.00" ? "Ready" : "Draft"}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Receipt Modal removed (using component) */}

            {/* Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsWithdrawModalOpen(false); }}>
                    <div className="modal-content modal-large">
                        <div className="modal-header">
                            <div>
                                <h2>Withdraw/Remove Money</h2>
                                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Remove money from church accounts for assistance or other purposes</p>
                            </div>
                            <button onClick={() => setIsWithdrawModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="rrap_fieldgrp" style={{ marginBottom: '16px' }}>
                                <label className="rrap_fldlab">Select Account to Withdraw From</label>
                                <div className="rrap_tabgroup">
                                    {[
                                        { key: 'offering', label: 'Offerings Account' },
                                        { key: 'tithe', label: 'Tithe Account' },
                                        { key: 'projectoffering', label: 'Project Offerings' },
                                        { key: 'welfare', label: 'Welfare Account' }
                                    ].map(account => (
                                        <button
                                            key={account.key}
                                            className={`rrap_tabitem ${withdrawAccount === account.key ? 'active' : ''}`}
                                            onClick={() => handleWithdrawAccountChange(account.key)}
                                        >
                                            {account.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ marginTop: '12px', padding: '16px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                                    <span style={{ color: '#0369a1', fontSize: '13px' }}>Available Balance:</span>
                                    <strong style={{ display: 'block', fontSize: '24px', color: '#0ea5e9', marginTop: '4px' }}>
                                        {loadingBalance ? '...' : `₵${withdrawBalance.toFixed(2)}`}
                                    </strong>
                                </div>
                            </div>

                            <div className="rray_gridlay" style={{ marginBottom: '16px' }}>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Amount to Withdraw (₵) *</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        max={withdrawBalance}
                                    />
                                    {Number(withdrawAmount) > withdrawBalance && (
                                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                            Amount exceeds available balance (₵{withdrawBalance.toFixed(2)})
                                        </div>
                                    )}
                                </div>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Recipient/Beneficiary Name *</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="text"
                                        placeholder="Who is receiving this money?"
                                        value={withdrawRecipient}
                                        onChange={(e) => setWithdrawRecipient(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rray_gridlay" style={{ marginBottom: '16px' }}>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Purpose/Reason *</label>
                                    <select
                                        className="rrap_fldsel"
                                        value={withdrawPurpose}
                                        onChange={(e) => setWithdrawPurpose(e.target.value)}
                                    >
                                        <option>Medical Assistance</option>
                                        <option>Educational Support</option>
                                        <option>Emergency Relief</option>
                                        <option>Funeral Assistance</option>
                                        <option>Building Maintenance</option>
                                        <option>Ministry Expenses</option>
                                        <option>Staff Welfare</option>
                                        <option>Community Outreach</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Authorized By *</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="text"
                                        placeholder="Your name"
                                        value={withdrawAuthorizedBy}
                                        onChange={(e) => setWithdrawAuthorizedBy(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rray_gridlay" style={{ marginBottom: '16px' }}>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Date *</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="date"
                                        value={withdrawDate}
                                        onChange={(e) => setWithdrawDate(e.target.value)}
                                    />
                                </div>
                                <div className="rrap_fieldgrp">
                                    <label className="rrap_fldlab">Additional Notes (Optional)</label>
                                    <input
                                        className="rrap_fldinp"
                                        type="text"
                                        placeholder="Any additional details..."
                                        value={withdrawNotes}
                                        onChange={(e) => setWithdrawNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="rrap_btn" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</button>
                            <button
                                className="rrap_btn rrap_btnprim"
                                onClick={processWithdrawal}
                                disabled={isProcessingWithdraw || !withdrawAmount || !withdrawRecipient || !withdrawAuthorizedBy}
                            >
                                {isProcessingWithdraw ? 'Processing...' : 'Process Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => {
                    setIsReceiptModalOpen(false);
                    clearForm();
                }}
                data={receiptData}
            />
        </div>
    );
}
