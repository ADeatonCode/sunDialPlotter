# sunDialPlotter — Local HTTPS Development

This project includes a small static HTML/JS sundial plotter. The repository contains a helper batch script that starts a local HTTPS static server (recommended) so browser features that require a secure context (File System Access API) work correctly.

## Prerequisites
- Node.js and npm (npx available)
- mkcert (for locally-trusted HTTPS certificate)
  - Recommended install on Windows: `choco install mkcert` (requires Chocolatey)
- Windows PowerShell (default on Windows)

## Files of interest
- `start_https_localhost.bat` — batch script to generate certs (with mkcert) and start the HTTPS static server on https://localhost:5500
- `index.html`, `scripts/sundial.js`, `styles/sundial.css` — application files

## Start the server (recommended)
1. Open PowerShell.
2. (Optional) If you haven't already, install and trust mkcert's CA:
   - `choco install mkcert -y`
   - `mkcert -install`  (run elevated if required)
3. Run the batch from the project root:
   ```powershell
   cd "C:\Users\acdel\VS Projects\sunDialPlotter"
   .\start_https_localhost.bat
   ```
   The script will:
   - detect mkcert (or use Chocolatey's installation)
   - generate `./certs/localhost.pem` and `./certs/localhost-key.pem`
   - start the static HTTPS server using http-server

## Manual start (if you prefer)
1. Generate certs (from the project root):
   ```powershell
   mkdir .\certs
   & 'C:\ProgramData\chocolatey\bin\mkcert.exe' -cert-file .\certs\localhost.pem -key-file .\certs\localhost-key.pem localhost 127.0.0.1 ::1
   ```
2. Start the HTTPS static server:
   - Use cmd to avoid PowerShell script execution policy issues with npx:
   ```powershell
   cmd /c "npx --yes http-server -S --cert .\certs\localhost.pem --key .\certs\localhost-key.pem -p 5500 -a localhost"
   ```
3. Open the app: https://localhost:5500

## Troubleshooting
- If the browser does not show the native Save dialog for settings, ensure you open the site at `https://localhost:5500` (secure context). Some APIs (showSaveFilePicker) require a secure origin and are supported best in Chromium-based browsers.
- If `npx` fails in PowerShell with an execution policy error, the batch uses `cmd /c` to invoke `npx` to avoid that restriction. You can also run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force` for the session.
- If mkcert cannot be found by the batch, confirm its location with `where mkcert` and add its folder to PATH or edit `start_https_localhost.bat` to reference the full path.

## Notes
- The `.gss` format used by the app is JSON of the sundial settings. No sensitive data is stored.

If you want the server launched as a PowerShell script instead of a batch file, or prefer the batch to always run with elevated privileges, open an issue or ask and a helper script can be added.

https://adeatoncode.github.io/sunDialPlotter/
