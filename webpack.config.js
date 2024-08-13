import path from 'path';

export default () => {
    return {
        devtool: false,
        mode: 'development',
        entry: {
            CookieConsent: ['./index'],
            CookieConsentTagManager: ['./src/scripts/CookieConsentTagManager']
        },
        output: {
            path: path.resolve('./dist'),
            filename: '[name].js',
            library: {
                type: 'module',
            }
        },
        experiments: {
            outputModule: true
        }
    };
};
