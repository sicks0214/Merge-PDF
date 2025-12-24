import fs from 'fs';
import path from 'path';

export interface PluginConfig {
  name: string;
  slug: string;
  category: string;
  apiPath: string;
  order: number;
}

export interface PluginUI {
  [key: string]: any;
}

export interface PluginSchema {
  upload: {
    multiple: boolean;
    types: string[];
    maxSize: number;
    maxFiles: number;
  };
  options: Array<{
    name: string;
    type: string;
    default: any;
    label: { [lang: string]: string };
  }>;
  features: { [key: string]: boolean };
  output: {
    type: string;
    mimeType: string;
    filename: string;
  };
}

export interface Plugin {
  config: PluginConfig;
  ui: PluginUI;
  schema: PluginSchema;
  handler: any;
}

const PLUGINS_DIR = path.join(__dirname, '../../plugins');

export function loadPlugins(): Plugin[] {
  const plugins: Plugin[] = [];

  if (!fs.existsSync(PLUGINS_DIR)) {
    console.warn('Plugins directory not found:', PLUGINS_DIR);
    return plugins;
  }

  const dirs = fs.readdirSync(PLUGINS_DIR);

  for (const dir of dirs) {
    const pluginPath = path.join(PLUGINS_DIR, dir);
    const stat = fs.statSync(pluginPath);

    if (!stat.isDirectory()) continue;

    try {
      const configPath = path.join(pluginPath, 'plugin.json');
      const uiPath = path.join(pluginPath, 'ui.json');
      const schemaPath = path.join(pluginPath, 'schema.json');
      const handlerPath = path.join(pluginPath, 'handler');

      if (!fs.existsSync(configPath)) {
        console.warn(`Missing plugin.json in ${dir}`);
        continue;
      }

      const config: PluginConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const ui: PluginUI = fs.existsSync(uiPath) ? JSON.parse(fs.readFileSync(uiPath, 'utf-8')) : {};
      const schema: PluginSchema = fs.existsSync(schemaPath) ? JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) : {};

      let handler = null;
      try {
        handler = require(handlerPath);
      } catch (e) {
        console.warn(`Failed to load handler for ${dir}:`, e);
      }

      plugins.push({ config, ui, schema, handler });
      console.log(`Loaded plugin: ${config.name} (${config.slug})`);
    } catch (error) {
      console.error(`Failed to load plugin ${dir}:`, error);
    }
  }

  return plugins.sort((a, b) => a.config.order - b.config.order);
}

export function getPluginBySlug(plugins: Plugin[], slug: string): Plugin | undefined {
  return plugins.find(p => p.config.slug === slug);
}

export function getPluginsByCategory(plugins: Plugin[], category: string): Plugin[] {
  return plugins.filter(p => p.config.category === category);
}

export function getLocalizedUI(ui: PluginUI, lang: string): any {
  const result: any = {};

  for (const key in ui) {
    const value = ui[key];
    if (typeof value === 'object' && value !== null) {
      if (value[lang] !== undefined) {
        result[key] = value[lang];
      } else if (value['en'] !== undefined) {
        result[key] = value['en'];
      } else {
        result[key] = getLocalizedUI(value, lang);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
