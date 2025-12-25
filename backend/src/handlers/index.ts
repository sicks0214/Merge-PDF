import { registerHandler } from '../plugin-loader';
import pdfMergeHandler from './pdf-merge';

// Register all handlers
registerHandler('merge', pdfMergeHandler);

export { pdfMergeHandler };
