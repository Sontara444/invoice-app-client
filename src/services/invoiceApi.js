const BASE_URL = '/api/invoices';

export const getAllInvoices = async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load invoices (${response.status})`);
    }
    return response.json();
};

export const getInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load invoice (${response.status})`);
    }
    return response.json();
};

export const addPayment = async (id, amount) => {
    const response = await fetch(`${BASE_URL}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to add payment (${response.status})`);
    }
    return response.json();
};

export const archiveInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/archive`, { method: 'POST' });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to archive invoice (${response.status})`);
    }
    return response.json();
};

export const restoreInvoice = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/restore`, { method: 'POST' });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to restore invoice (${response.status})`);
    }
    return response.json();
};
