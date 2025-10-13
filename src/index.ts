import AdapterRegistry from "./configs/AdapterRegistry";
import TransportRegistry from "./configs/TransportRegistry";
(new AdapterRegistry()).loadAdapters();
(new TransportRegistry()).loadTransports();
