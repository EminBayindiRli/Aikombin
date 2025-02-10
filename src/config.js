const config = {
    development: {
        apiUrl: 'http://192.168.1.100:8080',
    },
    production: {
        apiUrl: process.env.REACT_APP_API_URL || 'https://api.aikombin.com',
    }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
