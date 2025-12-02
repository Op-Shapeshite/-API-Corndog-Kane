import 'dotenv/config';
import { VercelRequest, VercelResponse } from '@vercel/node';
import AdapterRegistry from '../src/configs/AdapterRegistry';
import RestApiTransport from '../src/transports/api/instance';

// Initialize adapters
(new AdapterRegistry()).loadAdapters();

// Configure the app
RestApiTransport.registerAppsUsed();

// Health check for root route
RestApiTransport.app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Corndog Kane API is running on Vercel',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

export default (req: VercelRequest, res: VercelResponse) => {
  return RestApiTransport.app(req, res);
};