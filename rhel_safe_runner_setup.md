# RHEL GitHub Actions Runner Setup Guide

Use one of the two options below to run isolated runners for multiple projects under a non-root user (e.g., `nitt-user`).

---

## Shared Initialization (Run Once)
Download and extract the runner software in a single shared directory:
```bash
mkdir -p ~/github-runner && cd ~/github-runner
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
tar xzf ./actions-runner.tar.gz
```

Create folders to hold config keys for each project (e.g., Project A and Project B):
```bash
mkdir -p ~/github-runner/project-a
mkdir -p ~/github-runner/project-b
```

---

## Option A: The System Service Way (Requires Sudo/Admin Access)
*Best for production. Automatically starts when the server reboots.*

### 1. First-Time Setup
Link the repository and install the service:
```bash
cd ~/github-runner/project-a
../config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_TOKEN
sudo ./svc.sh install
```

### 2. Everyday Control Commands
```bash
# Start the runner
sudo ./svc.sh start

# Stop the runner
sudo ./svc.sh stop
```

---

## Option B: The Background Way (No Sudo/Admin Access Required)
*Use if you do not have admin permissions on the server.*

### 1. First-Time Setup
Link the repository:
```bash
cd ~/github-runner/project-a
../config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_TOKEN
```

### 2. Everyday Control Commands
```bash
# Start the runner in the background
nohup ../run.sh &

# Stop the runner
pkill -f "project-a"
```
