import 'dotenv/config';
import AdapterRegistry from "./configs/AdapterRegistry";
import TransportRegistry from "./configs/TransportRegistry";
import { registerDependencies } from "./core/di/bindings";
import { registerEventListeners } from "./core/events/EventListeners";

// Initialize all design patterns
console.log('[STARTUP] Registering dependencies (DI Container)...');
registerDependencies();

console.log('[STARTUP] Registering event listeners (Observer Pattern)...');
registerEventListeners();

console.log('[STARTUP] Loading adapters...');
(new AdapterRegistry()).loadAdapters();

console.log('[STARTUP] Loading transports...');
(new TransportRegistry()).loadTransports();

console.log('[STARTUP] Application started successfully!');

