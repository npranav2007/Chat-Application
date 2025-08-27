export function formatMessageTime(date){
    if (!date) return '';
    
    try {
        const messageDate = new Date(date);
        if (isNaN(messageDate.getTime())) {
            return '';
        }
        
        // Format as 12-hour time without AM/PM, e.g., 12:31
        let hours = messageDate.getHours();
        const minutes = String(messageDate.getMinutes()).padStart(2, '0');
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}