const ctx = document.getElementById('networkChart').getContext('2d');

// init arry
const timeLabels = [];
const downloadData = [];
const uploadData = [];

// Initialize Chart.js line graph
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [
            {
                label: 'Download (KB/s)',
                data: downloadData,
                borderColor: '#238636',
                backgroundColor: 'rgba(35, 134, 54, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Upload (KB/s)',
                data: uploadData,
                borderColor: '#d73a49',
                backgroundColor: 'rgba(215, 58, 73, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { ticks: { color: '#8b949e' } },
            y: { 
                beginAtZero: true, 
                ticks: { color: '#8b949e' },
                title: { display: true, text: 'KB/s', color: '#8b949e' }
            }
        },
        plugins: {
            legend: { labels: { color: 'white' } }
        }
    }
});

//get bandwith data
 
async function fetchData() {
    try {
        const response = await fetch('http://localhost:8000/metrics');
        const data = await response.json();

        const now = new Date().toLocaleTimeString();

        // data into array
        timeLabels.push(now);
        downloadData.push(data.download_speed);
        uploadData.push(data.upload_speed);

        // Keep only the last 20 seconds of data to prevent lag
        if (timeLabels.length > 20) {
            timeLabels.shift();
            downloadData.shift();
            uploadData.shift();
        }

        // Redraw the chart with new data
        chart.update();
    } catch (error) {
        console.error("Connection Error: Make sure main.py is running!");
    }
}

// active connections table
async function fetchConnections() {
    try {
        const response = await fetch('http://localhost:8000/connections');
        const data = await response.json();
        const tableBody = document.getElementById('connBody');

        // clear table before adding new data
        tableBody.innerHTML = ''; 

        data.forEach(conn => {
            // Set a color for the status (Green for active, Grey for listening)
            const statusColor = conn.status === 'ESTABLISHED' ? '#3fb950' : '#8b949e';
            
            const row = `<tr>
                <td><strong>${conn.app}</strong> <small>(${conn.pid})</small></td>
                <td>${conn.type}</td>
                <td>${conn.laddr}</td>
                <td>${conn.raddr}</td>
                <td style="color: ${statusColor}; font-weight: bold;">${conn.status}</td>
            </tr>`;

             // Add the row to the table
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching connection data");
    }
}

// fetch bandwith data every 1 second
setInterval(fetchData, 1000);

// update connections table every 2 second
setInterval(fetchConnections, 2000);