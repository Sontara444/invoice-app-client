import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const AddPaymentModal = ({ isOpen, onClose, balanceDue, onPaymentSubmit, submitting }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('Amount must be greater than 0.');
            return;
        }
        if (paymentAmount > balanceDue) {
            setError(`Amount cannot exceed the balance due of ${formatCurrency(balanceDue)}.`);
            return;
        }
        setError('');
        const serverError = await onPaymentSubmit(paymentAmount);
        if (serverError) {
            setError(serverError);
        } else {
            setAmount('');
        }
    };

    const handleClose = () => {
        if (submitting) return;
        setAmount('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]">
            <div className="bg-sidebar rounded-2xl w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-150">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                        <DollarSign size={18} className="text-primary" />
                        Record Payment
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="p-1.5 rounded-lg hover:bg-background text-text-muted transition-colors disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="amount" className="block text-xs font-semibold text-text-label uppercase tracking-wider mb-2">
                            Payment Amount
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-4 flex items-center text-text-muted text-sm pointer-events-none">
                                {formatCurrency(0).replace(/[0-9.,]/g, '').trim()}
                            </span>
                            <input
                                type="number"
                                id="amount"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                                disabled={submitting}
                                className="w-full pl-8 pr-4 py-3 border border-border rounded-xl text-sm text-text-main bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-label disabled:opacity-50"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                            Balance Due: <span className="font-semibold text-text-main">{formatCurrency(balanceDue)}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:bg-background transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {submitting ? <><Loader2 size={15} className="animate-spin" />Processing...</> : 'Submit Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
