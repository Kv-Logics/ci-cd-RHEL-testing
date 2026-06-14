# Multi-Hosting GitHub Actions Runner Architecture & Security Guide

This document outlines a standardized, secure architecture for running **100+ automated deployment pipelines** on a single shared Red Hat Enterprise Linux (RHEL) server using GitHub Actions Self-Hosted Runners and Docker.

---

## 1. Directory Structure

To avoid downloading the runner package multiple times (which wastes disk space and complicates upgrades), install the runner binaries once in a shared directory (`bin`) and separate the project keys and configurations into dedicated subdirectories.

```text
/opt/github-runner/
├── bin/                          # Shared GitHub Runner binaries (config.sh, run.sh, etc.)
│   ├── config.sh
│   ├── run.sh
│   └── ... (other runner binaries)
│
├── project-a/                    # Keys and logs for Project A (x.nitt.edu)
│   ├── .runner                   # Unique project connection keys (auto-generated)
│   ├── .credentials              # Unique project credentials (auto-generated)
│   └── runner.log                # Execution logs for Project A
│
└── project-b/                    # Keys and logs for Project B (y.nitt.edu)
    ├── .runner
    ├── .credentials
    └── runner.log
```

---

## 2. Configuration & Initialization (First-Time Setup)

To configure a new project runner:

1. **Create the shared directory and install the binaries:**
   ```bash
   sudo mkdir -p /opt/github-runner/bin
   cd /opt/github-runner/bin
   
   # Download the latest runner package
   curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
   tar xzf ./actions-runner-linux-x64.tar.gz
   ```

2. **Create the folder for Project A's configuration keys:**
   ```bash
   mkdir -p /opt/github-runner/project-a
   ```

3. **Register the keys for Project A:**
   Navigate into Project A's directory and execute the configuration script located in the shared `bin` directory:
   ```bash
   cd /opt/github-runner/project-a
   ../bin/config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_GITHUB_TOKEN --work _work
   ```
   *This automatically generates the `.runner` and `.credentials` files inside `/opt/github-runner/project-a/`.*

---

## 3. Running & Stopping Projects

### Option A: Interactive Mode (Terminal Open)
To run the runner interactively to view logs live on screen:
```bash
cd /opt/github-runner/project-a
../bin/run.sh
```
*Note: If you close the terminal or disconnect the SSH session, the runner will stop.*

### Option B: Background Mode (Terminal Closed)
To start the runner in the background so that it continues running after you log out:
```bash
cd /opt/github-runner/project-a
nohup ../bin/run.sh > runner.log 2>&1 &
```

To stop a running background runner:
```bash
pkill -f "project-a"
```

---

## 4. Multi-Hosting Routing (Subdomains & Space Isolation)

To map incoming subdomains (e.g., `project-a.nitt.edu`) to the correct running Docker container port without open external port configurations, use **Nginx** as a reverse proxy:

```text
User Request (x.nitt.edu) ──> [ Nginx (Reverse Proxy on Port 80/443) ]
                                          │
                                          └──> Forwards to localhost:3000 (Internal Container Port)
```

### Nginx Vhost Configuration Example (`/etc/nginx/conf.d/project-a.nitt.edu.conf`):
```nginx
server {
    listen 80;
    server_name project-a.nitt.edu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Security & Isolation Guidelines for NITT Server

1. **Do Not Run as Root**: Create a dedicated `github-runner` user account on RHEL. Run all commands under this restricted user to ensure that any execution from a repository workflow is isolated from system files.
2. **Docker Port Isolation**: Do not map ports publicly in `docker-compose.yml` (e.g., avoid `- "3000:3000"` mapping directly to public interfaces). Keep container ports bound internally (e.g., `- "127.0.0.1:3000:3000"`) so only the Nginx reverse proxy on the host can communicate with the application container.
3. **Runner Scope for Forks**: When a repository is forked, GitHub disables run privileges on your self-hosted runner to prevent external pull requests from executing malicious code on your private RHEL server.
4. **Environment Secrets**: Store API tokens, database keys, and configuration passwords in a `.env` file within the deployment workspace directory on the server instead of hardcoding them into the repository.
