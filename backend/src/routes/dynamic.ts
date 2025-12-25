import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Plugin } from '../plugin-loader';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

export function createDynamicRoutes(plugins: Plugin[]): Router {
  const router = Router();

  for (const plugin of plugins) {
    const { category, slug } = plugin.config;

    if (!plugin.handler) {
      console.warn(`No handler for plugin: ${slug}`);
      continue;
    }

    const handlerFn = plugin.handler.handler || plugin.handler.default?.handler || plugin.handler;
    const analyzeFn = plugin.handler.analyze || plugin.handler.default?.analyze;

    // POST /api/{category}/{slug} - main handler
    if (typeof handlerFn === 'function') {
      router.post(`/${category}/${slug}`, upload.array('files', 20), handlerFn);
      console.log(`Registered route: POST /api/${category}/${slug}`);
    }

    // POST /api/{category}/{slug}/analyze - analyze endpoint
    if (typeof analyzeFn === 'function') {
      router.post(`/${category}/${slug}/analyze`, upload.single('file'), analyzeFn);
      console.log(`Registered route: POST /api/${category}/${slug}/analyze`);
    }
  }

  return router;
}
