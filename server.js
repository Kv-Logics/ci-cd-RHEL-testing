const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Simple JSON API endpoint to show status & metadata
app.get('/api/info', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Red Hat Auto-Deploy Demo',
    version: '1.0.0',
    platform: os.platform(),
    release: os.release(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
