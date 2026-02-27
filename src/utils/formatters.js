export const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    } catch (e) {
        // Fallback safety catch
        return `$${Number(amount).toFixed(2)}`;
    }
};
