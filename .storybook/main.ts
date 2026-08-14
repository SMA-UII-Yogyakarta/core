import type { StorybookConfig } from '@storybook/react-vite';
import type { PluginOption } from 'vite';
import path from 'path';

const config: StorybookConfig = {
    stories: [
        '../resources/js/**/*.mdx',
        '../resources/js/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    typescript: {
        reactDocgen: 'react-docgen',
    },
    viteFinal: async (viteConfig) => {
        // Filter out checker plugin in Storybook to prevent hanging background worker processes
        const plugins = (viteConfig.plugins || []).filter((plugin: PluginOption) => {
            if (!plugin) return false;
            if (typeof plugin === 'object' && 'name' in plugin && typeof plugin.name === 'string') {
                return !plugin.name.includes('checker');
            }
            return true;
        });

        return {
            ...viteConfig,
            plugins,
            resolve: {
                ...viteConfig.resolve,
                alias: {
                    ...viteConfig.resolve?.alias,
                    '@': path.resolve(__dirname, '../resources/js'),
                },
            },
        };
    },
};

export default config;
