export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '--');
};
