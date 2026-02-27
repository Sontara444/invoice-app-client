import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Loader2, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { createInvoice } from '../services/invoiceApi';
import { formatCurrency } from '../utils/formatters';

const InvoiceCreatePage = () => {
    const navigate = useNavigate();
    const [submittingTo, setSubmittingTo] = useState(null);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(true);

    // Form State
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
        customerName: '',
        customerEmail: '',
        address: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        taxRate: 0,
    });

    const [items, setItems] = useState([
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);

    // Handle Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };

    // Item Management
    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value };
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (id) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * ((invoiceData.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    // Submit
    const handleSave = async (status = 'DRAFT') => {
        try {
            setError(null);

            // Client-side validation
            if (!invoiceData.customerName.trim()) {
                setError('Customer name is required');
                return;
            }
            if (!invoiceData.invoiceNumber.trim()) {
                setError('Invoice number is required');
                return;
            }
            if (items.some(item => item.quantity <= 0)) {
                setError('Item quantity must be at least 1');
                return;
            }

            setSubmittingTo(status);

            const payload = {
                ...invoiceData,
                status,
                items: items.map(({ description, quantity, unitPrice }) => ({ description: description || 'Untitled Item', quantity, unitPrice }))
            };

            const result = await createInvoice(payload);
            navigate(`/invoices/${result.invoice._id}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create invoice. Please try again.');
        } finally {
            setSubmittingTo(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-border sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-1 -ml-1 md:-ml-2 rounded-xl hover:bg-sidebar text-text-muted transition-colors opacity-100 hover:opacity-100 md:opacity-0 md:absolute md:left-4"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[28px] font-black text-text-main tracking-tighter">New Invoice</h1>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3 ml-2">
                        <span className="text-[13px] font-bold text-text-main">Show Preview</span>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${showPreview ? 'bg-[#96F26D]' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${showPreview ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                    {error && (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 shadow-sm animate-in fade-in zoom-in duration-300 w-full md:w-auto">
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="text-[13px] font-bold tracking-wide max-w-[300px] truncate">
                                {error}
                            </span>
                        </div>
                    )}
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={() => handleSave('DRAFT')}
                            disabled={!!submittingTo}
                            className="flex-1 md:flex-none justify-center px-4 md:px-6 py-2.5 text-[13px] font-bold tracking-wide rounded-full border border-border text-text-main hover:bg-sidebar transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {submittingTo === 'DRAFT' ? <Loader2 size={16} className="animate-spin" /> : null}
                            Save as Draft
                        </button>
                        <button
                            onClick={() => handleSave('PAID')}
                            disabled={!!submittingTo}
                            className="flex-1 md:flex-none justify-center px-4 md:px-6 py-2.5 text-[13px] font-bold tracking-wide rounded-full bg-[#96F26D] text-[#1D3216] hover:brightness-95 hover:shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {submittingTo === 'PAID' ? <Loader2 size={16} className="animate-spin" /> : null}
                            Send Invoice
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 w-full max-w-[1700px] mx-auto items-stretch h-auto xl:h-[calc(100vh-80px)] overflow-x-hidden xl:overflow-hidden">

                {/* LEFT: FORM BOX */}
                <div className="space-y-6 md:space-y-8 flex flex-col bg-white rounded-2xl border border-border pb-8 pt-6 md:pt-10 shadow-none h-full overflow-y-auto xl:overflow-y-auto custom-scrollbar px-5 md:px-8">
                    {/* Bill To Section */}
                    <div>
                        <label className="block text-[13px] text-text-main mb-2 font-medium">Bill to</label>
                        <div className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:border-text-muted transition-colors">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-[#6452f3] flex items-center justify-center shrink-0">
                                    <div className="w-[14px] h-[14px] border-2 border-white rounded-full relative overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[2px] bg-white rotate-45"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full">
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={invoiceData.customerName}
                                        onChange={handleInputChange}
                                        className="font-bold text-[15px] text-text-main bg-transparent outline-none w-full placeholder:font-normal placeholder:text-text-main leading-none"
                                        placeholder="Acme Enterprise"
                                    />
                                    <input
                                        type="text"
                                        name="customerEmail"
                                        value={invoiceData.customerEmail}
                                        onChange={handleInputChange}
                                        className="text-[12px] text-text-muted bg-transparent outline-none w-full leading-none mt-1.5"
                                        placeholder="cme@enterprise.com"
                                    />
                                </div>
                            </div>
                            <ChevronDown size={18} className="text-text-main shrink-0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] text-text-main mb-2 font-medium">Invoice number</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={invoiceData.invoiceNumber}
                                onChange={handleInputChange}
                                placeholder="Enter invoice"
                                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-text-muted transition-all placeholder:text-text-muted"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] text-text-main mb-2 font-medium">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={invoiceData.address}
                                onChange={handleInputChange}
                                placeholder="Enter address"
                                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-text-muted transition-all placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-[13px] text-text-main mb-2 font-medium">Issue date</label>
                            <div className="relative">
                                <style>{`
                                  input[type="date"]::-webkit-calendar-picker-indicator {
                                    opacity: 0;
                                    width: 100%;
                                    height: 100%;
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    cursor: pointer;
                                  }
                                `}</style>
                                <input
                                    type="date"
                                    name="issueDate"
                                    value={invoiceData.issueDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-10 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-text-muted transition-all appearance-none"
                                />
                                <Calendar size={18} className="text-text-main absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] text-text-main mb-2 font-medium">Due date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={invoiceData.dueDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-10 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-text-muted transition-all appearance-none"
                                />
                                <Calendar size={18} className="text-text-main absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#F3F4F6] my-2"></div>

                    {/* Items Section */}
                    <div>
                        <h2 className="text-xl font-bold text-text-main mb-8">Invoice items</h2>

                        <div className="mb-6 w-1/3">
                            <label className="block text-[13px] text-text-main mb-2 font-medium">Currency</label>
                            <div className="relative w-full border border-border rounded-xl overflow-hidden focus-within:border-[#a5e27a] focus-within:ring-1 focus-within:ring-[#a5e27a] transition-all">
                                <select
                                    name="currency"
                                    value={invoiceData.currency}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-10 py-2.5 bg-white text-[14px] font-medium text-text-main focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="USD">US Dollar</option>
                                    <option value="EUR">Euro</option>
                                    <option value="GBP">British Pound</option>
                                    <option value="INR">Indian Rupee</option>
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] flex items-center justify-center pointer-events-none">
                                    {invoiceData.currency === 'USD' ? '🇺🇸' : invoiceData.currency === 'EUR' ? '🇪🇺' : invoiceData.currency === 'GBP' ? '🇬🇧' : '🇮🇳'}
                                </div>
                                <ChevronDown size={18} className="text-text-main absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* List items wrapper */}
                        <div className="overflow-x-auto custom-scrollbar pb-4 -mx-1 px-1">
                            <div className="min-w-[500px]">
                                {/* List items header */}
                                <div className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-2 md:gap-4 mb-2">
                                    <span className="text-[13px] text-text-main font-medium">Items</span>
                                    <span className="text-[13px] text-text-main font-medium">QTY</span>
                                    <span className="text-[13px] text-text-main font-medium">Rate</span>
                                    <span className="text-[13px] text-text-main font-medium">Total</span>
                                    <span></span>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-2 md:gap-4 items-center">
                                            <input
                                                type="text"
                                                placeholder="Item Description"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-[#a5e27a] focus:ring-1 focus:ring-[#a5e27a] transition-all placeholder:text-text-muted"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-[#a5e27a] focus:ring-1 focus:ring-[#a5e27a] transition-all placeholder:text-text-muted"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice === 0 ? '' : item.unitPrice}
                                                onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-[#a5e27a] focus:ring-1 focus:ring-[#a5e27a] transition-all placeholder:text-text-muted"
                                            />
                                            <div className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-[14px] text-text-muted h-[42px] flex items-center shadow-none bg-gray-50/50">
                                                {item.quantity && item.unitPrice ? (item.quantity * item.unitPrice).toFixed(0) : '0'}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                disabled={items.length === 1}
                                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[#2d6123] hover:text-[#11240e] transition-colors"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                </div>

                {/* RIGHT: LIVE PREVIEW */}
                <div className={`transition-all duration-300 xl:h-full ${!showPreview ? 'opacity-0 scale-[0.98] h-0 xl:h-auto pointer-events-none xl:absolute' : 'relative mt-6 xl:mt-0'}`}>
                    {/* Outer Gray wrapper similar to the picture */}
                    <div className="bg-sidebar border border-border rounded-[20px] p-4 lg:p-10 min-h-[500px] xl:min-h-[700px] shadow-sm flex flex-col h-full overflow-x-auto custom-scrollbar">
                        <h2 className="text-[15px] font-bold text-text-main mb-6 pl-1 tracking-tight shrink-0 hidden xl:block">Preview</h2>

                        {/* The White Document Card */}
                        <div className="bg-white border border-border rounded-[16px] p-6 lg:p-10 shadow-sm flex flex-col flex-1 shrink-0 overflow-hidden min-w-[600px] mx-auto w-full max-w-[800px]">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h1 className="text-[32px] font-extrabold text-text-main tracking-tight leading-tight mb-1">Invoice</h1>
                                    <p className="text-[13px] text-text-muted mt-0.5">
                                        Invoice Number {invoiceData.invoiceNumber ? <span className="text-text-main pl-1">{invoiceData.invoiceNumber}</span> : ''}
                                    </p>
                                </div>
                                <div className="w-11 h-11 bg-[#a5e27a] rounded-full flex items-center justify-center shrink-0">
                                    <div className="grid grid-cols-2 gap-[2.5px] rotate-45">
                                        <div className="w-[8px] h-[8px] bg-[#1a2f14] rounded-[1px]"></div>
                                        <div className="w-[8px] h-[8px] bg-[#1a2f14] rounded-[1px]"></div>
                                        <div className="w-[8px] h-[8px] bg-[#1a2f14] rounded-[1px]"></div>
                                        <div className="w-[8px] h-[8px] bg-[#1a2f14] rounded-[1px]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Details Grid Box */}
                                <div className="border border-border rounded-xl mb-6 flex flex-col shrink-0">
                                    <div className="grid grid-cols-2 border-b border-border">
                                        <div className="p-5 border-r border-border">
                                            <p className="text-[12px] text-text-muted mb-2 font-medium">Billed to</p>
                                            <p className="text-[13px] font-bold text-text-main leading-tight tracking-[0.01em]">{invoiceData.customerName || 'Acme Enterprise'}</p>
                                            <p className="text-[13px] font-bold text-text-main leading-tight mt-1">{invoiceData.customerEmail || 'Acme@enterprise.com'}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="p-5 border-b border-border">
                                                <p className="text-[12px] text-text-muted mb-2 font-medium">Issue date</p>
                                                <p className="text-[13px] font-bold text-text-main">
                                                    {invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString('en-GB') : '-'}
                                                </p>
                                            </div>
                                            <div className="p-5">
                                                <p className="text-[12px] text-text-muted mb-2 font-medium">Due date</p>
                                                <p className="text-[13px] font-bold text-text-main">
                                                    {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-GB') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white">
                                        <p className="text-[12px] text-text-muted mb-2 font-medium">Address</p>
                                        <p className="text-[13px] font-bold text-text-main leading-tight tracking-tight">{invoiceData.address || '-'}</p>
                                    </div>
                                </div>

                                {/* List Items Grid */}
                                <div className="border border-border rounded-xl overflow-hidden mb-6 flex flex-col shrink-0">
                                    <div className="grid grid-cols-[3fr_1fr_1fr_1.2fr] border-b border-border bg-white sticky top-0 z-10">
                                        <div className="p-4 border-r border-border text-[12px] text-text-muted font-medium">Items</div>
                                        <div className="p-4 border-r border-border text-[12px] text-text-muted font-medium text-center">QTY</div>
                                        <div className="p-4 border-r border-border text-[12px] text-text-muted font-medium text-center">Rate</div>
                                        <div className="p-4 text-[12px] text-text-muted font-medium text-center">Total</div>
                                    </div>

                                    <div className="divide-y divide-border bg-white">
                                        {items.length === 0 || (items.length === 1 && !items[0].description) ? (
                                            <div className="grid grid-cols-[3fr_1fr_1fr_1.2fr] items-stretch min-h-[50px]">
                                                <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main leading-tight flex items-center">-</div>
                                                <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main flex items-center justify-center">0</div>
                                                <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main flex items-center justify-center">{formatCurrency(0, invoiceData.currency).replace(/[.,]00$/, '')}</div>
                                                <div className="p-4 py-3.5 text-[13px] font-bold text-text-main flex items-center justify-center">{formatCurrency(0, invoiceData.currency).replace(/[.,]00$/, '')}</div>
                                            </div>
                                        ) : (
                                            items.map((item, idx) => (
                                                <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1.2fr] items-stretch min-h-[50px]">
                                                    <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main truncate flex items-center">{item.description || '-'}</div>
                                                    <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main flex items-center justify-center">{item.quantity || 0}</div>
                                                    <div className="p-4 py-3.5 border-r border-border text-[13px] font-bold text-text-main flex items-center justify-center">{formatCurrency(item.unitPrice || 0, invoiceData.currency).replace(/[.,]00$/, '')}</div>
                                                    <div className="p-4 py-3.5 text-[13px] font-bold text-text-main flex items-center justify-center">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0), invoiceData.currency).replace(/[.,]00$/, '')}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Totals Box */}
                            <div className="flex justify-end pr-0 mt-6 pt-6 border-t border-border shrink-0">
                                <div className="w-[300px] border border-border rounded-[14px] p-5 py-6 space-y-4 bg-gray-50/30">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-text-muted">Subtotal</span>
                                        <span className="text-[13px] font-bold text-text-main">{formatCurrency(subtotal, invoiceData.currency).replace(/[.,]00$/, '')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-text-muted">Discount</span>
                                        <span className="text-[13px] font-bold text-text-main">{formatCurrency(0, invoiceData.currency).replace(/[.,]00$/, '')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-text-muted">Tax</span>
                                        <span className="text-[13px] font-bold text-text-main">{formatCurrency(taxAmount, invoiceData.currency).replace(/[.,]00$/, '')}</span>
                                    </div>

                                    <div className="w-full h-[1px] bg-border my-2"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[14px] text-text-muted">Total</span>
                                        <span className="text-[18px] font-black text-primary">{formatCurrency(total, invoiceData.currency).replace(/[.,]00$/, '')}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default InvoiceCreatePage;
