# Optimized RHEL GitHub Runner Setup (Multi-Hosting & Full-Stack Docker)

This setup uses **only one base runner installation** (saving 100+ GB of server space) while deploying full-stack React/Node/PostgreSQL Docker applications into isolated domain folders.

---

## 1. Directory Structure

```text
/opt/github-runner-base/
├── bin/                          # ONE shared installation of runner binaries (~200MB)
│   ├── config.sh
│   ├── run.sh
│   └── ...
│
├── project-a/                    # Keys for Project A (Uses ~10KB)
│   ├── .runner                   # Instructs deployment to go to: /var/www/domain-x/
│   └── .credentials
│
└── project-b/                    # Keys for Project B (Uses ~10KB)
    ├── .runner                   # Instructs deployment to go to: /var/www/domain-y/
    └── .credentials
```

---

## 2. Server Installation (Run Once)
Download and extract the shared runner binaries:
```bash
mkdir -p /opt/github-runner-base/bin
cd /opt/github-runner-base/bin
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
tar xzf ./actions-runner.tar.gz
```

---

## 3. Registering a New Project
To set up a new project (e.g., Project A targeting `/var/www/domain-x/`):

1. **Create the config folder:**
   ```bash
   mkdir -p /opt/github-runner-base/project-a && cd /opt/github-runner-base/project-a
   ```

2. **Configure the keys and point the output space to the domain directory:**
   ```bash
   ../bin/config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_TOKEN --work /var/www/domain-x/
   ```

---

## 4. Run & Stop Commands

Execute the commands from inside the project's key folder:

### To Start the Runner (Background):
```bash
cd /opt/github-runner-base/project-a
nohup ../bin/run.sh &
```

### To Stop the Runner:
```bash
pkill -f "project-a"
```

---

## 5. How Full-Stack Projects Deploy (React / Node / PostgreSQL)

Because the runner checks the code out directly into `/var/www/domain-x/`, your GitHub workflow file (`deploy.yml`) simply commands Docker to rebuild and run the containers inside that folder:

```yaml
# Example workflow deployment steps (.github/workflows/deploy.yml)
steps:
  - name: Checkout Repository
    uses: actions/checkout@v4

  - name: Deploy application via Docker Compose
    run: |
      docker compose down
      docker compose up --build -d
```
Docker Compose manages the React frontend, Node backend, and PostgreSQL database locally inside the domain's network boundary, mapped to the correct port.
