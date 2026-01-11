import { APIPlugin } from './types';
import { PollinationsPlugin } from './pollinations';

export class PluginManager {
  private plugins: Map<string, APIPlugin> = new Map();

  constructor() {
    this.initializePlugins();
  }

  private initializePlugins() {
    this.registerPlugin('pollinations', new PollinationsPlugin());
  }

  registerPlugin(id: string, plugin: APIPlugin) {
    this.plugins.set(id, plugin);
  }

  getPlugin(id: string): APIPlugin | undefined {
    return this.plugins.get(id);
  }

  getAvailablePlugins() {
    return Array.from(this.plugins.entries()).map(([id, plugin]) => ({
      id,
      name: plugin.name,
      type: plugin.type,
    }));
  }
}

export const pluginManager = new PluginManager();
