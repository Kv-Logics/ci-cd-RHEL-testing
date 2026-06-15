# Minimal & Secure RHEL GitHub Runner Setup

This guide provides a 200% safe, clean, and minimal setup for running multiple isolated GitHub Action runners on a shared RHEL server using official, built-in features (no custom scripts, no `nohup` hacks).

---

## 1. Safety Measures (First Things First)
To keep the server secure:
1. **Never run actions as root**: Run everything under a regular user account (e.g., `nitt-user`).
2. **Path Isolation**: Keep the runner directory inside the user's home folder or `/opt/` with ownership restricted to that user.

---

## 2. Download the Runner (Once in Root Space)
Create a single root folder for the GitHub runner software:

```bash
# Create the directory
mkdir -p ~/github-runner
cd ~/github-runner

# Download the official GitHub Runner package
curl -o actions-runner-linux-x64-2.316.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz

# Extract it
tar xzf ./actions-runner-linux-x64-2.316.1.tar.gz
```

---

## 3. How to Manage Projects (Separate Keys)
To support multiple projects safely, create empty directories inside your runner root to hold each project's unique configuration keys:

```bash
# Create folders for Project A and Project B
mkdir -p ~/github-runner/project-a
mkdir -p ~/github-runner/project-b
```

---

## 4. First-Time Project Configuration (Setting the Token)
To link a project, navigate to its folder and run the configuration script pointing back to the root folder:

```bash
# 1. Move to Project A folder
cd ~/github-runner/project-a

# 2. Run config pointing to the root runner setup
../config.sh --url https://github.com/Kv-Logics/geofence-engine --token YOUR_GITHUB_TOKEN
```
*This safely saves the `.runner` configuration keys only inside `project-a`.*

---

## 5. Starting and Stopping Safely (The Standard Service Way)
Rather than using active terminals or complex background commands, use the official built-in service manager (`systemd`). This is clean, safe, and restarts automatically if the server reboots.

Run these commands from inside the project directory:

### To Install the Service:
```bash
cd ~/github-runner/project-a
sudo ./svc.sh install
```

### To Start:
```bash
sudo ./svc.sh start
```

### To Stop:
```bash
sudo ./svc.sh stop
```

### To Uninstall the Service:
```bash
sudo ./svc.sh uninstall
```
*(Repeat the same steps inside `~/github-runner/project-b` to configure and manage Project B separately.)*
