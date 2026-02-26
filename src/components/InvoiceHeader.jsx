import React from 'react';
import { Calendar, User, FileText, CheckCircle, Clock, Archive, ArchiveRestore, Loader2 } from 'lucide-react';

const InvoiceHeader = ({ invoice, onArchiveToggle, archiving }) => {
    if (!invoice) return null;

    const isPaid = invoice.status === 'PAID';
    const isArchived = invoice.isArchived;

    return (
        <div className={`glass rounded-2xl p-6 md:p-8 space-y-6 transition-opacity duration-300 ${isArchived ? 'opacity-70' : 'opacity-100'}`}>

            {/* Archived Banner */}
            {isArchived && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold">
                    <Archive size={16} />
                    This invoice is archived
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-text-main">
                        <FileText className="text-primary" />
                        Invoice #{invoice.invoiceNumber}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-text-muted">
                        <User size={16} />
                        <span className="font-medium">{invoice.customerName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${isPaid
                        ? 'bg-success-bg text-success-text border border-success/30'
                        : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                        {isPaid ? <CheckCircle size={18} /> : <Clock size={18} />}
                        {invoice.status}
                    </div>

                    {/* Archive / Restore Button */}
                    <button
                        onClick={onArchiveToggle}
                        disabled={archiving}
                        className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 border transition-all duration-200 disabled:opacity-50 ${isArchived
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                    >
                        {archiving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isArchived ? (
                            <ArchiveRestore size={16} />
                        ) : (
                            <Archive size={16} />
                        )}
                        {archiving ? '...' : isArchived ? 'Restore' : 'Archive'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-6 mt-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-background rounded-xl text-primary">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted uppercase tracking-wider font-semibold">Issue Date</p>
                        <p className="font-medium text-text-main">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-background rounded-xl text-rose-500">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted uppercase tracking-wider font-semibold">Due Date</p>
                        <p className="font-medium text-text-main">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceHeader;
