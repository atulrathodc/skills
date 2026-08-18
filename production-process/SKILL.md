---
name: production-process
description: Keep an app RUNNING persistently beyond the dev loop — nohup/pm2/systemd, background supervision, logs, and restart on crash.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Production Process

"Runs now" is not "stays running". Supervise the process so it survives the session.

1. **Run it detached** — `nohup <start-command> > app.log 2>&1 &` (record the PID), or a supervisor:
   - **pm2** (Node) — `pm2 start server.js --name app`, `pm2 logs app`, `pm2 restart app`.
   - **systemd** (service) — a unit file `[Service] ExecStart=... WorkingDirectory=... Restart=on-failure`, then `systemctl start`.
2. **Capture logs** — redirect output to a file (`app.log`). To debug later, read the log TAIL — it has the startup and runtime errors.
3. **Confirm it actually stays up** — after 5-10s, check the process is alive (`ps -p <pid>` / `pm2 status` / `systemctl status`) AND the port still responds (`curl`).
4. **Restart on crash** — pm2/systemd do this automatically; for `nohup` note you must re-run on crash. When a fix needs a restart: kill the OLD process first (the port stays bound), then start fresh.
5. **Stop cleanly** — `pm2 stop app` / `systemctl stop` / `kill <pid>` (not `kill -9` unless stuck).
6. Only `done()` when the process is supervised, the log is captured, and the port responds after a restart test.
