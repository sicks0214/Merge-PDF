import { Router } from 'express';
import { loadPlugins, getPluginBySlug, getLocalizedUI, Plugin } from '../plugin-loader';

const router = Router();
let plugins: Plugin[] = [];

// Initialize plugins
export function initPlugins() {
  plugins = loadPlugins();
  return plugins;
}

// GET /api/plugins - Get all plugins list
router.get('/', (req, res) => {
  const lang = (req.query.lang as string) || 'en';

  const result = plugins.map(plugin => ({
    name: plugin.config.name,
    slug: plugin.config.slug,
    category: plugin.config.category,
    apiPath: plugin.config.apiPath,
    order: plugin.config.order,
    ui: getLocalizedUI(plugin.ui, lang),
  }));

  res.json(result);
});

// GET /api/plugins/:slug - Get single plugin config
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const lang = (req.query.lang as string) || 'en';

  const plugin = getPluginBySlug(plugins, slug);

  if (!plugin) {
    return res.status(404).json({ error: true, message: 'Plugin not found' });
  }

  res.json({
    config: plugin.config,
    ui: getLocalizedUI(plugin.ui, lang),
    schema: plugin.schema,
  });
});

export default router;
