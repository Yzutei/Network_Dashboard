# init
import time
import psutil
import socket
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Cache for DNS lookups
hostname_cache = {}

# allow website to access the api
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Simple DNS lookup
def get_hostname(ip):
    if ip in ["127.0.0.1", "localhost", "::1"]:
        return "localhost"

    # If ip is in cache, return it
    if ip in hostname_cache:
        return hostname_cache[ip]

    try:
        # Set a timeout for the DNS lookup to avoid lag
        socket.setdefaulttimeout(0.2)
        name = socket.gethostbyaddr(ip)[0]
        hostname_cache[ip] = name
        return name
    except:
        # If it takes too long or fails, just store the IP
        hostname_cache[ip] = ip
        return ip


# read network speed
@app.get("/metrics")
def metrics():
    net_stat1 = psutil.net_io_counters()
    time.sleep(1)
    net_stat2 = psutil.net_io_counters()

    download_speed = (net_stat2.bytes_recv - net_stat1.bytes_recv) / 1024
    upload_speed = (net_stat2.bytes_sent - net_stat1.bytes_sent) / 1024

    return {
        "download_speed": round(download_speed, 2),
        "upload_speed": round(upload_speed, 2),
    }


# check network connections
@app.get("/connections")
def connections():
    conn_list = []

    # Get all connections
    all_conns = psutil.net_connections(kind="inet")

    # Sort them so active ones are at the top
    all_conns.sort(key=lambda x: x.status != "ESTABLISHED")

    # Only look at the top 10
    for conn in all_conns[:10]:
        appname = "Unknown"
        if conn.pid:
            try:
                appname = psutil.Process(conn.pid).name()
            except:
                appname = "Access Denied"

        if conn.raddr:
            # Simple DNS call
            name = get_hostname(conn.raddr.ip)
            hostname = f"{name}:{conn.raddr.port}"
        else:
            hostname = "Listening"

        conn_list.append(
            {
                "app": appname,
                "pid": conn.pid,
                "family": "IPV4" if "INET" in str(conn.family) else "IPV6",
                "type": "TCP" if conn.type == socket.SOCK_STREAM else "UDP",
                "laddr": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "None",
                "raddr": hostname,
                "status": conn.status,
            }
        )

    return conn_list


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
