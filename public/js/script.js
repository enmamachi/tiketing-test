document.getElementById('helpdeskForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/create-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Tampilkan notifikasi
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notification-text');
            
            notificationText.innerHTML = result.message;
            notification.style.display = 'block';
            notification.style.background = '#10b981';
            
            // Sembunyikan notifikasi setelah 5 detik
            setTimeout(function() {
                notification.style.display = 'none';
            }, 5000);
            
            // Reset form
            document.getElementById('helpdeskForm').reset();
            
            // Reload halaman setelah 2 detik untuk update statistik
            setTimeout(function() {
                window.location.reload();
            }, 2000);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengirim tiket.');
    }
});
