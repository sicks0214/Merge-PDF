import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdf';
import pluginsRoutes, { initPlugins } from './routes/plugins';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize plugins
const plugins = initPlugins();
console.log(`Loaded ${plugins.length} plugins`);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Plugins API
app.use('/api/plugins', pluginsRoutes);

// PDF routes
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
