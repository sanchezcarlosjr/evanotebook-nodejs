import {createLibp2p} from "libp2p";
import {webSockets} from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import {noise} from "@chainsafe/libp2p-noise";
import {mplex} from "@libp2p/mplex";
import { kadDHT } from '@libp2p/kad-dht'
import {circuitRelayServer} from "libp2p/circuit-relay";
import os from "os";

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const networkInterface in networkInterfaces) {
    for (const details of networkInterfaces[networkInterface]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to loopback address if no local IP address is found
}

async function spawnRelay() {
  const server = await createLibp2p({
    addresses: {
      listen: [
        `/ip4/${getLocalIPAddress()}/tcp/0/ws`,
        `/ip4/127.0.0.1/tcp/0/ws`
      ]
    },
    transports: [
      webSockets({
        filter: filters.all
      })
    ],
    dht: kadDHT(),
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    relay: circuitRelayServer({}),
  });
  return server.getMultiaddrs().map(x => x.toString());
}

spawnRelay().then(console.log);
