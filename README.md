# Network Monitoring System

A lightweight network monitoring system that provides real time bandwidth usage and active network sockets.

## Features
- **Real time bandwith tracking:** Visualizes upload and download speeds with Chart.js.
- **Process Correlation:** Maps active network sockets to specific system processes (PID) and application names.
- **Privacy Mode:** masks data to hide IP addresses during demonstrations
- **Reverse DNS Integration:** Resolves remote IP addresses to hostnames for easier traffic analysis.

## Tech stack
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **System Metrics:** psutil
- **Data Visualization:** Chart.js
- **Frontend:** Javascript, HTML, CSS

## Installation and setup
1. Clone the repo
2. Install dependencies:
- pip install fastapi uvicorn psutil
3. Run the api:
py main.py
4. Launch the Dashboard:
open index.html
(Note: Ensure main.py is running to see live data)