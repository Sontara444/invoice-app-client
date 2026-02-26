import React from 'react';

const TotalsSummary = ({ invoice }) => {
    if (!invoice) return null;

    return (
        <div className="flex flex-col md:flex-row justify-end mt-6 gap-6">
            <div className="w-full md:w-80 glass rounded-2xl p-6 space-y-4">

                <div className="flex justify-between items-center text-text-muted">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-text-main font-semibold">${Number(invoice.total).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-medium">Amount Paid</span>
                    <span className="font-semibold">-${Number(invoice.amountPaid).toFixed(2)}</span>
                </div>

                <div className="h-px w-full bg-border my-2"></div>

                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-text-main">Balance Due</span>
                    <span className="text-2xl font-bold text-primary">${Number(invoice.balanceDue).toFixed(2)}</span>
                </div>

            </div>
        </div>
    );
};

export default TotalsSummary;
