export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime());
};
