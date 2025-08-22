const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Data file path
const dataPath = path.join(__dirname, 'data', 'tickets.json');

// Helper functions untuk membaca/menulis data
const readTickets = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeTickets = (tickets) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(tickets, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing tickets:', error);
    return false;
  }
};

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.get('/', (req, res) => {
  const tickets = readTickets();
  
  // Hitung statistik
  const stats = {
    total: tickets.length,
    inProgress: tickets.filter(t => t.status === 'Dalam Proses').length,
    resolved: tickets.filter(t => t.status === 'Selesai').length,
    highPriority: tickets.filter(t => t.priority === 'Tinggi').length,
    cafe: tickets.filter(t => t.unit === 'Cafe').length,
    waserda: tickets.filter(t => t.unit === 'Waserda').length,
    it: tickets.filter(t => t.issueType === 'IT dan Jaringan').length,
    pos: tickets.filter(t => t.issueType === 'Aplikasi POS').length,
    sdm: tickets.filter(t => t.issueType === 'SDM').length,
    umum: tickets.filter(t => t.issueType === 'Umum').length
  };
  
  res.render('index', { 
    tickets: tickets.slice(0, 3), // Hanya ambil 3 tiket terbaru
    stats 
  });
});

app.get('/tickets', (req, res) => {
  const tickets = readTickets();
  res.render('ticket-list', { tickets });
});

app.post('/create-ticket', (req, res) => {
  const { name, email, branch, unit, issueType, priority, subject, description } = req.body;
  
  const newTicket = {
    id: Date.now().toString(),
    name,
    email,
    branch,
    unit,
    issueType,
    priority,
    subject,
    description,
    status: 'Open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const tickets = readTickets();
  tickets.unshift(newTicket); // Tambahkan di awal array
  writeTickets(tickets);
  
  // Kirim email konfirmasi
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Konfirmasi Tiket #${newTicket.id} - ${subject}`,
    html: `
      <h2>Terima kasih telah melaporkan kendala</h2>
      <p>Halo ${name},</p>
      <p>Tiket Anda telah berhasil dibuat dengan detail sebagai berikut:</p>
      <ul>
        <li><strong>ID Tiket:</strong> ${newTicket.id}</li>
        <li><strong>Subjek:</strong> ${subject}</li>
        <li><strong>Cabang:</strong> ${branch}</li>
        <li><strong>Unit Usaha:</strong> ${unit}</li>
        <li><strong>Jenis Kendala:</strong> ${issueType}</li>
        <li><strong>Prioritas:</strong> ${priority}</li>
        <li><strong>Status:</strong> ${newTicket.status}</li>
      </ul>
      <p>Tim support kami akan segera menindaklanjuti tiket ini. Anda akan menerima update melalui email ini.</p>
      <br>
      <p>Salam,<br>Tim Support</p>
    `
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
  
  res.json({ 
    success: true, 
    message: `Tiket berhasil dibuat! Konfirmasi telah dikirim ke ${email}`,
    ticketId: newTicket.id
  });
});

app.post('/update-ticket/:id', (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;
  
  const tickets = readTickets();
  const ticketIndex = tickets.findIndex(t => t.id === id);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex].status = status;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    
    if (response) {
      tickets[ticketIndex].response = response;
      tickets[ticketIndex].respondedAt = new Date().toISOString();
      
      // Kirim email balasan ke pengguna
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: tickets[ticketIndex].email,
        subject: `Update Tiket #${id} - ${tickets[ticketIndex].subject}`,
        html: `
          <h2>Update Tiket Support</h2>
          <p>Halo ${tickets[ticketIndex].name},</p>
          <p>Tim support telah memberikan tanggapan untuk tiket Anda:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            ${response}
          </div>
          <p><strong>Status Tiket:</strong> ${status}</p>
          <br>
          <p>Salam,<br>Tim Support</p>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending response email:', error);
        } else {
          console.log('Response email sent:', info.response);
        }
      });
    }
    
    writeTickets(tickets);
    res.json({ success: true, message: 'Tiket berhasil diupdate' });
  } else {
    res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
