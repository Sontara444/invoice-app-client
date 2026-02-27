import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, CheckCircle, Clock, ChevronRight, AlertCircle,
    Bell, Search, Plus, Loader2
} from 'lucide-react';
import { getAllInvoices } from '../services/invoiceApi';
import { formatCurrency } from '../utils/formatters';

const StatusBadge = ({ invoice }) => {
    const isPaid = invoice.status === 'PAID';
    const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date();

    let config = {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: <CheckCircle size={14} />,
        label: 'PAID'
    };

    if (isOverdue) {
        config = {
            bg: 'bg-red-50',
            text: 'text-red-600',
            icon: <Clock size={14} />,
            label: 'OVERDUE'
        };
    } else if (!isPaid) {
        config = {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            icon: <AlertCircle size={14} />,
            label: 'PENDING'
        };
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider border border-transparent ${config.bg} ${config.text}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

const InvoiceListPage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await getAllInvoices();
                setInvoices(data);
            } catch (err) {
                setError(err.message || 'Failed to load invoices.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const isPaid = inv.status === 'PAID';
        const isOverdue = !isPaid && new Date(inv.dueDate) < new Date();
        const computedStatus = isOverdue ? 'Overdue' : (isPaid ? 'Paid' : 'Pending');

        if (activeFilter === 'All') return true;
        return computedStatus === activeFilter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-24">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Loading Invoices...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
            {/* Top Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-10 py-5 bg-white border-b border-border sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-4 bg-[#F3F4F6] rounded-xl px-5 py-2.5 w-full md:w-[320px]">
                    <Search size={18} className="text-text-muted shrink-0" />
                    <input
                        type="text"
                        placeholder="Search Invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-[14px] text-text-main placeholder:text-text-muted outline-none w-full font-medium"
                    />
                </div>
                <div className="flex items-center justify-end gap-6 w-full md:w-auto">
                    <button className="text-text-muted hover:text-text-main transition-colors">
                        <Bell size={22} />
                    </button>
                    <button
                        onClick={() => navigate('/invoices/new')}
                        className="bg-[#22C55E] text-white text-[14px] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-95 transition-all shadow-sm"
                    >
                        <Plus size={18} /> New Invoice
                    </button>
                </div>
            </header>

            {/* Page Title Section */}
            <div className="px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row md:items-end justify-between gap-2">
                <h1 className="text-[28px] md:text-[32px] font-black text-text-main tracking-tight leading-none">Invoices</h1>
                <p className="text-text-muted text-[13px] font-bold uppercase tracking-wider">{filteredInvoices.length} invoices</p>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 md:px-10 mb-6 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {['All', 'Pending', 'Paid', 'Overdue'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeFilter === filter
                            ? 'bg-[#22C55E] text-white shadow-sm'
                            : 'bg-white text-text-muted border border-border hover:bg-gray-50 hover:text-text-main'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Invoices List Display */}
            <div className="px-4 md:px-10 pb-10 w-full">
                <div className="bg-white rounded-2xl md:rounded-[24px] border border-border shadow-sm overflow-w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border/60">
                                <th className="px-8 py-5 text-[11px] font-black text-text-muted uppercase tracking-[0.1em]">Invoice</th>
                                <th className="px-8 py-5 text-[11px] font-black text-text-muted uppercase tracking-[0.1em] text-center">Status</th>
                                <th className="px-8 py-5 text-[11px] font-black text-text-muted uppercase tracking-[0.1em] text-center">Due Date</th>
                                <th className="px-8 py-5 text-[11px] font-black text-text-muted uppercase tracking-[0.1em] text-right">Balance Due</th>
                                <th className="px-8 py-5 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={48} className="text-border" />
                                            <p className="text-text-muted font-bold">No invoices found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr
                                        key={inv._id}
                                        onClick={() => navigate(`/invoices/${inv._id}`)}
                                        className="hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-11 h-11 bg-background rounded-xl border border-border flex items-center justify-center text-text-muted group-hover:bg-white group-hover:border-primary/20 transition-all">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-black text-text-main tracking-tight">{inv.invoiceNumber}</span>
                                                    <span className="text-[13px] font-bold text-text-muted mt-0.5">{inv.customerName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <StatusBadge invoice={inv} />
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-[14px] font-bold text-text-muted">{formatDate(inv.dueDate)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[16px] font-black text-text-main">{formatCurrency(inv.balanceDue, inv.currency)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-text-muted">
                                            <ChevronRight size={18} className="group-hover:text-primary transition-colors" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default InvoiceListPage;
