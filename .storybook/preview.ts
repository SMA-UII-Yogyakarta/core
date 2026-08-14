import type { Preview } from '@storybook/react';
import '../resources/css/app.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            config: {},
            options: {
                checks: { 'color-contrast': { options: { noScroll: true } } },
                restoreScroll: true,
            },
        },
        backgrounds: {
            default: 'app-background',
            values: [
                {
                    name: 'app-background',
                    value: '#F1F5F9',
                },
                {
                    name: 'surface-white',
                    value: '#FFFFFF',
                },
                {
                    name: 'brand-primary',
                    value: '#2E3391',
                },
            ],
        },
    },
};

export default preview;
