import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';

const PaymentHistory = ({ payments, onAddPaymentClick }) => {
    return (
        <div className="glass rounded-2xl p-6 md:p-8 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <DollarSign className="text-primary" />
                    Payment History
                </h3>
                <button
                    onClick={onAddPaymentClick}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center gap-2"
                >
                    <DollarSign size={16} />
                    Add Payment
                </button>
            </div>

            {!payments || payments.length === 0 ? (
                <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-xl">
                    <p>No payments recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="flex justify-between items-center p-4 rounded-xl border border-border bg-white/50 hover:bg-white/80 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-success-bg text-success-text rounded-lg">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-text-main">
                                        ${Number(payment.amount).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                                        <Calendar size={14} />
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
