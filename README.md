## Setup

### Run without Docker
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
cd server && pnpm i && pnpm dev
```

### Run with Docker
Rerequisite: docker
- To run all containers with compose:
```
docker compose up --build
```
- To bring down all containers:
```
docker compose down --volumes
```

- To initialize the Docker Swarm
- To deploy stack
```
sudo docker stack deploy --compose-file docker-compose.yml stackdemo
```
- To list running stack
```
docker stack ls
```
```
docker stack ps stackdemo
```

### How to run app for EC2 instances

- Before running docker, you must make sure all the .env and setup file is available for each layer

#### Client (**1 instance required**)

Frontend

- Change to urls for this file to the according DNS
- .env
```
VITE_WEBSOCKET_URL=ws://localhost:3000
```
- vite.config.js
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            },
        },
    },
});

```

- Compose up the frontend
```sudo docker compose-up frontend```

- To make sure only frontend is running, run this
```sudo docker ps```

#### Proxy ( **1 instance required**)

- .env

```
PORT=3000
WS_PRIMARY_URL=ws://backend-editor:3001
WS_SECONDARY_URL=ws://backend-editor:3002
HTTP_PRIMARY_URL=http://backend-user:3003
```

```sudo docker compose-up proxy```
- To make sure only proxy is running, run this
```sudo docker ps```

#### Combined Server ( **3 instances required***)

##### http-server

- .env
```
PORT=3003
MONGO_CONN="mongodb://root:example@database:27017"
MONGO_DB="cpsc559"
```
##### server
- .env
```
PORT=3001
MONGO_URL="mongodb://root:example@database:27017/cpsc559"
GC="true
```

- To compose up necessary containers
```sudo docker compose-up backend-user backend-editor mongodb```

- To make sure user server, editor server and mongo database running,

```sudo docker ps```



## Workflow

> Note: Curently, only /api/mstring has been implemented

- Client hits Get String
- Frontend send endpoint to Proxy
- Proxy checks if primary server is running
+ Case running then forward to Primary Server
+ Case down then check Secondary Server running and forward to it.
- If both case down, then send server-down endpoint

## Architecture

- Proxy is a messager broker that will decide where the destination of an request. This ensures transparency
- However, proxy will be our bottleneck because if it crashed, the whole system is down.
- Correctness: Integrate Docker Swarm - automatic fault tolerance to the proxy. If it crashes, Docker Engine will detect and its backup replication will replace and spawn new replication.
![image](https://github.com/Harsh-S7/cpsc559Project/assets/65211251/2ea7745f-d341-41ab-8c37-13dceaf9f48c)

- On production, we should not run server replications and proxy on the same machine. Eventually, everything must be distributed.
![image](https://github.com/Harsh-S7/cpsc559Project/assets/65211251/1f80d766-3b7b-4183-9e19-2faafe37066b)



