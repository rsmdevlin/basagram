export const formatDate = (date: Date) => date.toLocaleDateString('ru-RU');
export const formatTime = (date: Date) => date.toLocaleTimeString('ru-RU');
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export default {};
