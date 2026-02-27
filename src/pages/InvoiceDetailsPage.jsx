import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    AlertCircle, RefreshCw, Bell, ArrowLeft, Calendar,
    Archive, ArchiveRestore, Loader2, DollarSign, CheckCircle, Clock, Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getInvoice, addPayment, archiveInvoice, restoreInvoice } from '../services/invoiceApi';
import AddPaymentModal from '../components/AddPaymentModal';
import { formatCurrency } from '../utils/formatters';

const StatusBadge = ({ invoice }) => {
    const isPaid = invoice.status === 'PAID';
    const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date();

    let label = invoice.status;
    let colorClass = 'bg-draft-bg text-draft-text';
    let Icon = Clock;

    if (isPaid) {
        colorClass = 'bg-success-bg text-success-text';
        Icon = CheckCircle;
    } else if (isOverdue) {
        label = 'OVERDUE';
        colorClass = 'bg-red-50 text-red-600';
        Icon = AlertCircle;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const InvoiceDetailsPage = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const printRef = React.useRef();

    const fetchInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getInvoice(id);
            setInvoice(data);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoice(); }, [id]);

    const handlePaymentSubmit = async (amount) => {
        setSubmitting(true);
        try {
            await addPayment(id, amount);
            await fetchInvoice();
            setIsModalOpen(false);
            return null;
        } catch (err) {
            return err.message || 'Payment failed. Please try again.';
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchiveToggle = async () => {
        setArchiving(true);
        try {
            if (invoice.isArchived) await restoreInvoice(id);
            else await archiveInvoice(id);
            await fetchInvoice();
        } catch (err) {
            console.error('Archive/Restore failed:', err.message);
        } finally {
            setArchiving(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setDownloadingPDF(true);
        try {
            // Use standard A4 dimensions (in mm)
            const a4Width = 210;
            const a4Height = 297;
            const padding = 10; // 10mm padding on all sides

            const canvas = await html2canvas(printRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                windowWidth: 800 // Force a specific width for consistent rendering regardless of screen size
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate ratios to fit within A4 minus padding
            const printableWidth = a4Width - (padding * 2);
            const printableHeight = a4Height - (padding * 2);

            // Calculate the image dimensions to maintain aspect ratio
            const imgAspectRatio = canvas.width / canvas.height;
            let imgWidth = printableWidth;
            let imgHeight = imgWidth / imgAspectRatio;

            // If the calculated height is greater than the printable height, scale down by height instead
            if (imgHeight > printableHeight) {
                imgHeight = printableHeight;
                imgWidth = imgHeight * imgAspectRatio;
            }

            // Center the image horizontally
            const xOffset = padding + ((printableWidth - imgWidth) / 2);
            const yOffset = padding;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
            pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
        } catch (err) {
            console.error('Failed to generate PDF:', err);
        } finally {
            setDownloadingPDF(false);
        }
    };

    // Loading
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-text-muted text-sm animate-pulse">Loading invoice...</p>
        </div>
    );

    // Error
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
            <div className="bg-sidebar border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={28} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-text-main">Failed to Load Invoice</h2>
                <p className="text-text-muted text-sm">{error}</p>
                <button onClick={fetchInvoice} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
                    <RefreshCw size={15} /> Try Again
                </button>
            </div>
        </div>
    );

    const isPaid = invoice.status === 'PAID';

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-8 py-4 bg-sidebar border-b border-border sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium">
                        <ArrowLeft size={16} /> Invoices
                    </Link>
                    <span className="text-border">/</span>
                    <span className="text-sm font-semibold text-text-main">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                        <Bell size={18} />
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloadingPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border text-text-muted hover:border-text-muted transition-colors disabled:opacity-50"
                    >
                        {downloadingPDF ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                        PDF
                    </button>
                    <button
                        onClick={handleArchiveToggle}
                        disabled={archiving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${invoice.isArchived ? 'border-primary-hover text-primary hover:bg-primary-light' : 'border-border text-text-muted hover:border-text-muted'}`}
                    >
                        {archiving ? <Loader2 size={15} className="animate-spin" /> : invoice.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        {archiving ? '...' : invoice.isArchived ? 'Restore' : 'Archive'}
                    </button>
                    {!isPaid && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
                        >
                            <DollarSign size={15} /> Add Payment
                        </button>
                    )}
                </div>
            </header>

            {/* Main two-column content */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: Invoice Details */}
                <div className="space-y-5 min-w-0">

                    {/* Archived Banner */}
                    {invoice.isArchived && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium">
                            <Archive size={16} /> This invoice is archived
                        </div>
                    )}

                    {/* Invoice Details Card */}
                    <div className="bg-sidebar rounded-2xl border border-border p-6">
                        <h2 className="text-base font-bold text-text-main mb-5">Invoice details</h2>

                        {/* Billed To */}
                        <div className="mb-5">
                            <p className="text-xs text-text-label font-medium uppercase tracking-wider mb-2">Bill to</p>
                            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-text-muted shrink-0">
                                    {invoice.customerName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-text-main text-sm">{invoice.customerName}</p>
                                    <p className="text-xs text-text-muted">{invoice.customerName.toLowerCase().replace(' ', '')}@enterprise.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Number + Due Date */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <p className="text-xs text-text-label font-medium uppercase tracking-wider mb-1.5">Invoice number</p>
                                <div className="border border-border rounded-xl px-4 py-3 bg-background">
                                    <p className="text-sm font-semibold text-text-main">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-text-label font-medium uppercase tracking-wider mb-1.5">Due date</p>
                                <div className="border border-border rounded-xl px-4 py-3 bg-background flex items-center justify-between">
                                    <p className="text-sm text-text-main">{new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <Calendar size={18} className="text-text-muted" />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <p className="text-xs text-text-label font-medium uppercase tracking-wider mb-1.5">Address</p>
                            <div className="border border-border rounded-xl px-4 py-3 bg-background">
                                <p className="text-sm text-text-main">{invoice.address || 'No address provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Card */}
                    <div className="bg-sidebar rounded-2xl border border-border p-6">
                        <h2 className="text-base font-bold text-text-main mb-5">Invoice items</h2>

                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-3 border-b border-border">
                            <span className="text-xs text-text-label font-semibold uppercase tracking-wider">Items</span>
                            <span className="text-xs text-text-label font-semibold uppercase tracking-wider text-center">QTY</span>
                            <span className="text-xs text-text-label font-semibold uppercase tracking-wider text-right">Rate</span>
                            <span className="text-xs text-text-label font-semibold uppercase tracking-wider text-right">Total</span>
                        </div>

                        {/* Rows */}
                        {invoice.lineItems && invoice.lineItems.map((item) => (
                            <div key={item._id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3.5 border-b border-border-light last:border-0">
                                <span className="text-sm text-text-main font-medium">{item.description}</span>
                                <span className="text-sm text-text-muted text-center">{item.quantity}</span>
                                <span className="text-sm text-text-muted text-right">{formatCurrency(item.unitPrice)}</span>
                                <span className="text-sm font-semibold text-text-main text-right">{formatCurrency(item.lineTotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Payments Card */}
                    <div className="bg-sidebar rounded-2xl border border-border p-6">
                        <h2 className="text-base font-bold text-text-main mb-4">Payment history</h2>

                        {!invoice.payments || invoice.payments.length === 0 ? (
                            <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-xl">
                                <p className="text-sm">No payments recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoice.payments.map((payment) => (
                                    <div key={payment._id} className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-success-bg rounded-lg flex items-center justify-center">
                                                <DollarSign size={16} className="text-success" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-main">{formatCurrency(payment.amount)}</p>
                                                <p className="text-xs text-text-muted">{new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 bg-success-bg text-success-text rounded-full font-medium">Received</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Preview / Summary */}
                <div className="w-full min-w-0">
                    <div className="bg-sidebar rounded-2xl border border-border overflow-hidden sticky top-24">
                        {/* Preview Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-text-main">Preview</h3>
                            <StatusBadge invoice={invoice} />
                        </div>

                        {/* Invoice Preview */}
                        <div className="p-6 bg-background">
                            <div ref={printRef} className="bg-sidebar rounded-xl border border-border p-5 space-y-4">
                                {/* Title + Logo */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-text-main">Invoice</h2>
                                        <p className="text-xs text-text-muted mt-1">Invoice Number <span className="font-medium text-text-main">{invoice.invoiceNumber}</span></p>
                                    </div>
                                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                                        <div className="w-4 h-4 bg-white rotate-45 rounded-sm"></div>
                                    </div>
                                </div>

                                {/* Billed To + Dates + Address */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-xs text-text-label mb-1">Billed to</p>
                                            <p className="text-sm font-semibold text-text-main">{invoice.customerName}</p>
                                            <p className="text-xs text-text-muted mt-0.5">{invoice.customerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-label mb-1">Address</p>
                                            <p className="text-sm font-medium text-text-main leading-tight">{invoice.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-xs text-text-label mb-1">Issue date</p>
                                            <p className="text-sm font-semibold text-text-main">{new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-label mb-1">Due date</p>
                                            <p className="text-sm font-semibold text-text-main">{new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items mini table */}
                                <div className="pt-3 border-t border-border">
                                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-1 pb-1.5 border-b border-border">
                                        {['Items', 'QTY', 'Rate', 'Total'].map(h => (
                                            <span key={h} className="text-[10px] text-text-label font-semibold">{h}</span>
                                        ))}
                                    </div>
                                    {invoice.lineItems && invoice.lineItems.map((item) => (
                                        <div key={item._id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-1 py-1.5 border-b border-border-light last:border-0">
                                            <span className="text-[11px] text-text-main truncate">{item.description}</span>
                                            <span className="text-[11px] text-text-muted">{item.quantity}</span>
                                            <span className="text-[11px] text-text-muted">{formatCurrency(item.unitPrice)}</span>
                                            <span className="text-[11px] font-medium text-text-main">{formatCurrency(item.lineTotal)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="pt-3 border-t border-border space-y-1.5">
                                    <div className="flex justify-between text-xs text-text-muted">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(invoice.total - (invoice.taxAmount || 0))}</span>
                                    </div>
                                    {(invoice.taxAmount > 0) && (
                                        <div className="flex justify-between text-xs text-text-muted">
                                            <span>Tax ({invoice.taxRate || 10}%)</span>
                                            <span>{formatCurrency(invoice.taxAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-text-muted">
                                        <span>Amount Paid</span>
                                        <span className="text-primary">-{formatCurrency(invoice.amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-[15px] font-bold text-primary pt-2 border-t border-border mt-2">
                                        <span>Balance Due</span>
                                        <span>{formatCurrency(invoice.balanceDue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        {!isPaid && (
                            <div className="px-6 py-4 border-t border-border">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                                >
                                    <DollarSign size={16} /> Record Payment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <AddPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                balanceDue={invoice?.balanceDue}
                onPaymentSubmit={handlePaymentSubmit}
                submitting={submitting}
            />
        </div>
    );
};

export default InvoiceDetailsPage;
