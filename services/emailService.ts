import { Material } from '../types';

export const emailService = {
    /**
     * Simulates sending an email alert for low stock items.
     * In a real application, this would call a backend API or a service like EmailJS.
     */
    sendLowStockAlert: (items: Material[]) => {
        if (items.length === 0) return;

        console.group('📧 MOCK EMAIL SENT: Low Stock Alert');
        console.log(`To: admin@joinerypro.com`);
        console.log(`Subject: ALERTE STOCK - ${items.length} articles bas`);
        console.log('Body:');
        console.log('--------------------------------------------------');
        console.log('Bonjour,');
        console.log('Les articles suivants sont en rupture de stock ou niveau bas :');
        items.forEach(item => {
            console.log(`- ${item.name}: Stock actuel ${item.currentStock} ${item.unit} (Min: ${item.minStockLevel})`);
        });
        console.log('--------------------------------------------------');
        console.groupEnd();

        // Here you would integrate EmailJS:
        // emailjs.send('service_id', 'template_id', { items: ... })
    }
};
