// Filter tiket
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const unitFilter = document.getElementById('unitFilter');
    const tickets = document.querySelectorAll('.ticket-item');
    
    function applyFilters() {
        const statusValue = statusFilter.value;
        const priorityValue = priorityFilter.value;
        const unitValue = unitFilter.value;
        
        tickets.forEach(ticket => {
            const status = ticket.querySelector('.ticket-status').textContent;
            const priority = ticket.classList.contains('priority-tinggi') ? 'Tinggi' : 
                           ticket.classList.contains('priority-sedang') ? 'Sedang' : 'Rendah';
            const unit = ticket.classList.contains('unit-cafe') ? 'Cafe' : 'Waserda';
            
            const statusMatch = statusValue === 'all' || status === statusValue;
            const priorityMatch = priorityValue === 'all' || priority === priorityValue;
            const unitMatch = unitValue === 'all' || unit === unitValue;
            
            if (statusMatch && priorityMatch && unitMatch) {
                ticket.style.display = 'block';
            } else {
                ticket.style.display = 'none';
            }
        });
    }
    
    statusFilter.addEventListener('change', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);
    unitFilter.addEventListener('change', applyFilters);
    
    // Tombol update status
    document.querySelectorAll('.btn-status').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-id');
            const newStatus = this.getAttribute('data-status');
            
            updateTicketStatus(ticketId, newStatus);
        });
    });
    
    // Tombol kirim tanggapan
    document.querySelectorAll('.btn-send-response').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-id');
            const responseText = document.querySelector(`.response-text[data-id="${ticketId}"]`).value;
            
            if (responseText.trim() === '') {
                alert('Silakan isi tanggapan sebelum mengirim.');
                return;
            }
            
            sendResponse(ticketId, responseText);
        });
    });
    
    // Tombol hapus tiket
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-id');
            
            if (confirm('Apakah Anda yakin ingin menghapus tiket ini?')) {
                deleteTicket(ticketId);
            }
        });
    });
});

// Fungsi update status tiket
async function updateTicketStatus(ticketId, status) {
    try {
        const response = await fetch(`/update-ticket/${ticketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Status tiket #${ticketId} berhasil diubah menjadi "${status}"`);
            // Reload halaman setelah 2 detik
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengupdate status tiket.');
    }
}

// Fungsi kirim tanggapan
async function sendResponse(ticketId, response) {
    try {
        const responseApi = await fetch(`/update-ticket/${ticketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ response })
        });
        
        const result = await responseApi.json();
        
        if (result.success) {
            showNotification(`Tanggapan untuk tiket #${ticketId} berhasil dikirim`);
            // Reload halaman setelah 2 detik
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengirim tanggapan.');
    }
}

// Fungsi hapus tiket
async function deleteTicket(ticketId) {
    try {
        const response = await fetch(`/delete-ticket/${ticketId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Tiket #${ticketId} berhasil dihapus`);
            // Reload halaman setelah 2 detik
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghapus tiket.');
    }
}

// Fungsi tampilkan notifikasi
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.innerHTML = message;
    notification.style.display = 'block';
    notification.style.background = '#10b981';
    
    // Sembunyikan notifikasi setelah 5 detik
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}
