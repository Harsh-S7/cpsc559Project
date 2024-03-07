## Setup

- To install and run client
```
cd client && pnpm i && pnpm dev
```

- To install and run proxy
```
cd proxy && pnpm i && pnpm build && pnpm dev
```

- To install and run server
```
cd server && pnpm i && pnpm build && pnpm dev
```

## Workflow

> Note: Curently, only /api/mstring has been implemented

- Client hits Get String
- Frontend send endpoint to Proxy
- Proxy checks if primary server is running
+ Case running then forward to Primary Server
+ Case down then check Secondary Server running and forward to it.
- If both case down, then send server down endpoint

## Architecture

- Proxy is a messager broker that will decide where the destination of an request. This ensures transparency
- However, proxy will be our bottleneck because if it crashed, the whole system is down.
- Correctness: Integrate Docker Swarm - automatic fault tolerance to the proxy. If it crashes, Docker Engine will detect and its backup replication will replace and spawn new replication.

