import express from 'express';
import cors from 'cors';
// Import handlers first to register them before loading plugins
import './handlers';
import pluginsRoutes, { initPlugins, getPlugins } from './routes/plugins';
import { createDynamicRoutes } from './routes/dynamic';

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

// Dynamic plugin routes
app.use('/api', createDynamicRoutes(plugins));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
