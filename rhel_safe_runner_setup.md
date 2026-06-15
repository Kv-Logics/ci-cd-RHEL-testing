# Simple GitHub Runner Setup (For RHEL Server)

This guide shows how to set up automatic deployment for your website.

---

## 👥 Roles (Who does what?)

* **Developer**: Pushes their project files to Git. The server gets it automatically.
* **Admin**: Sets up the keys once, and turns the CI/CD runner ON or OFF when requested.

---

## 📂 Folder Structure (Inside RHEL Server)

```text
/var/www/[YOUR_DOMAIN]/               # Your domain space
├── .env                              # You upload this file (contains passwords/secrets)
├── github-runner/                    # Folder for connection keys
└── [YOUR_PROJECT_NAME]/              # Folder where your code goes automatically
```

---

## 💻 Developer Steps (Using FileZilla)

1. Create a folder named `github-runner` inside your domain folder.
2. Upload your `.env` file containing database passwords/secrets into your domain folder.

---

## ⚙️ Admin Steps (Using Terminal)

### One-Time Setup (Download the runner to the server):
```bash
sudo mkdir -p /opt/github-runner-base/bin
cd /opt/github-runner-base/bin
sudo curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
sudo tar xzf ./actions-runner.tar.gz
sudo chown -R $USER:$USER /opt/github-runner-base
```

### The Only 3 Commands You Need:

#### 1. Setup Keys (Run once per project):
```bash
cd /var/www/[YOUR_DOMAIN]/github-runner
/opt/github-runner-base/bin/config.sh --url https://github.com/Kv-Logics/geofence-engine --token GITHUB_RUNNER_TOKEN --work ../[YOUR_PROJECT_NAME]
```

#### 2. Turn ON (Start Deployment):
*Establishes a connection from GitHub to [YOUR_DOMAIN] and pulls code.*
```bash
cd /var/www/[YOUR_DOMAIN]/github-runner
nohup /opt/github-runner-base/bin/run.sh &
```

#### 3. Turn OFF (Stop Deployment):
```bash
pkill -f "[YOUR_DOMAIN]/github-runner"
```

---

## 🚀 How the Deployment Works (Behind the Scenes)

1. **You Push Code**: The Developer makes updates locally (such as backend fixes or UI changes) and pushes the commits to GitHub.
2. **GitHub Action Workflow Runs**: Because the runner is **ON**, the server instantly picks up the push event. The runner downloads your repository files directly to the `/var/www/[YOUR_DOMAIN]/[YOUR_PROJECT_NAME]/` directory.
3. **Automatic Docker Execution**: Inside the repository, a deployment workflow config file (located at `.github/workflows/deploy.yml`) tells the runner to execute the Docker commands:
   ```bash
   docker compose down
   docker compose up --build -d
   ```
   *No one has to log into the server or type commands to start Docker. The workflow triggers Docker automatically using the `docker-compose.yml` you pushed. It reads your database keys from the safe `/var/www/[YOUR_DOMAIN]/.env` file and boots the React/Node/PostgreSQL containers instantly.*

