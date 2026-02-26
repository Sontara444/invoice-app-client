import React from 'react';

const LineItemsTable = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="glass rounded-2xl overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary/5 text-text-muted text-sm font-semibold uppercase tracking-wider">
                            <th className="px-6 py-4 rounded-tl-2xl">Description</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-right rounded-tr-2xl">Line Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-primary/5 transition-colors duration-200 group"
                            >
                                <td className="px-6 py-4 font-medium text-text-main group-hover:text-primary transition-colors">
                                    {item.description}
                                </td>
                                <td className="px-6 py-4 text-right text-text-muted">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-right text-text-muted">
                                    ${Number(item.unitPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-text-main">
                                    ${Number(item.lineTotal).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LineItemsTable;
