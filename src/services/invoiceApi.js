const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api/invoices`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllInvoices = async () => {
    const response = await fetch(BASE_URL, {
        headers: { ...getAuthHeaders() }
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load invoices (${response.status})`);
    }
    return response.json();
};

export const getInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        headers: { ...getAuthHeaders() }
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load invoice (${response.status})`);
    }
    return response.json();
};

export const createInvoice = async (invoiceData) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(invoiceData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to create invoice (${response.status})`);
    }
    return response.json();
};

export const addPayment = async (id, amount) => {
    const response = await fetch(`${BASE_URL}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to add payment (${response.status})`);
    }
    return response.json();
};

export const archiveInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/archive`, {
        method: 'POST',
        headers: { ...getAuthHeaders() }
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to archive invoice (${response.status})`);
    }
    return response.json();
};

export const restoreInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/restore`, {
        method: 'POST',
        headers: { ...getAuthHeaders() }
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to restore invoice (${response.status})`);
    }
    return response.json();
};
