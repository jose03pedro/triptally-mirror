import { TextEncoder, TextDecoder } from 'util';

// Polyfill Request for Node environment (API routes)
global.Request = class Request {
    url: string;
    method: string;
    headers: Map<string, string>;

    constructor(url: string, init?: { method?: string; headers?: Record<string, string> }) {
        this.url = url;
        this.method = init?.method || 'GET';
        this.headers = new Map(Object.entries(init?.headers || {}));
    }
} as any;

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.EXCHANGE_API_KEY = 'test-api-key';