import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, ChevronRight, AlertCircle, Bell, Search } from 'lucide-react';
import { getAllInvoices } from '../services/invoiceApi';

const InvoiceListPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-8 py-4 bg-sidebar border-b border-border sticky top-0 z-10">
                <div className="flex items-center gap-3 bg-background rounded-xl px-4 py-2 w-64">
                    <Search size={16} className="text-text-label" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="bg-transparent text-sm text-text-main placeholder:text-text-label outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                        <Bell size={18} />
                    </button>
                    <button className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-colors">
                        🎁 Earn $90
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-text-main">Invoices</h1>
                    <span className="text-sm text-text-muted">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-text-muted text-sm animate-pulse">Loading invoices...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 text-red-600">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && invoices.length === 0 && (
                    <div className="bg-sidebar border border-border rounded-2xl p-16 text-center text-text-muted">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-semibold text-lg text-text-main">No invoices yet</p>
                        <p className="text-sm mt-1">Run <code className="bg-background px-2 py-1 rounded text-primary font-mono">node seed.js</code> to add sample data.</p>
                    </div>
                )}

                {/* List */}
                {!loading && !error && invoices.length > 0 && (
                    <div className="bg-sidebar rounded-2xl border border-border overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3 bg-background border-b border-border">
                            <span className="text-xs font-semibold text-text-label uppercase tracking-wider">Invoice</span>
                            <span className="text-xs font-semibold text-text-label uppercase tracking-wider">Status</span>
                            <span className="text-xs font-semibold text-text-label uppercase tracking-wider">Due Date</span>
                            <span className="text-xs font-semibold text-text-label uppercase tracking-wider text-right">Balance Due</span>
                            <span></span>
                        </div>

                        {/* Rows */}
                        {invoices.map((invoice, i) => {
                            const isPaid = invoice.status === 'PAID';
                            return (
                                <Link
                                    key={invoice._id}
                                    to={`/invoices/${invoice._id}`}
                                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-6 py-4 items-center hover:bg-background transition-colors duration-150 group ${i !== invoices.length - 1 ? 'border-b border-border' : ''}`}
                                >
                                    {/* Invoice info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                                            <FileText size={16} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-text-main text-sm group-hover:text-primary transition-colors truncate">
                                                {invoice.invoiceNumber}
                                            </p>
                                            <p className="text-xs text-text-muted truncate">{invoice.customerName}</p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isPaid ? 'bg-success-bg text-success-text' : 'bg-draft-bg text-draft-text'}`}>
                                            {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {invoice.status}
                                        </span>
                                    </div>

                                    {/* Due date */}
                                    <p className="text-sm text-text-muted">
                                        {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>

                                    {/* Balance */}
                                    <p className={`text-sm font-semibold text-right ${isPaid ? 'text-primary' : 'text-text-main'}`}>
                                        ${Number(invoice.balanceDue).toFixed(2)}
                                    </p>

                                    <ChevronRight size={16} className="text-text-label group-hover:text-primary transition-colors justify-self-end" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceListPage;
