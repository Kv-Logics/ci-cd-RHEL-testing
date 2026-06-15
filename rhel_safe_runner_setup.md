# Domain-Isolated GitHub Actions Runner Setup Guide

This guide describes how to configure independent, self-contained GitHub Actions runners inside individual domain spaces (e.g., `/var/www/domain-x/`). This allows files to deploy directly to the correct domain space while keeping setups isolated.

---

## Step 1: Download & Extract Runner (Do inside the Domain Folder)
The server admin navigates to the domain's allocated space, creates a runner directory, and extracts the runner software:

```bash
# Go to the domain space
cd /var/www/domain-x

# Create the runner directory
mkdir -p github-runner && cd github-runner

# Download and extract the official package
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
tar xzf ./actions-runner.tar.gz
```

---

## Step 2: Configure Repository Token & Target Work Directory
Run the configuration script. Use the `--work` flag to direct the checked-out code straight to the domain's web deployment folder (e.g., `/var/www/domain-x/public_html`):

```bash
./config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_GITHUB_TOKEN --work ../public_html
```

---

## Step 3: Run & Stop Commands

To control the runner, execute the commands from inside the domain's runner directory:

### To Start the Runner (Background):
```bash
cd /var/www/domain-x/github-runner
nohup ./run.sh &
```

### To Stop the Runner:
```bash
pkill -f "domain-x/github-runner"
```
*(Repeat the steps for any other domain like `/var/www/domain-y/` to create a fully isolated environment.)*
