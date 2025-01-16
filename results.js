// Initialize pie chart
function initPieChart() {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Happy', 'Neutral'],
            datasets: [{
                data: [75, 25],
                backgroundColor: [
                    '#4CAF50',
                    '#45a049'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: 0
            }
        }
    });
}

// Set metrics values
function setMetrics(metrics) {
    const values = metrics || {
        confidence: 3,
        language: 3,
        factual: 2.5,
        sentiment: 3
    };

    document.querySelectorAll('.slider').forEach((slider, index) => {
        const track = slider.querySelector('.slider-track');
        const thumb = slider.querySelector('.slider-thumb');
        let value;
        
        switch(index) {
            case 0: value = values.confidence; break;
            case 1: value = values.language; break;
            case 2: value = values.factual; break;
            case 3: value = values.sentiment; break;
        }

        const percentage = ((value - 1) / 4) * 100;
        track.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initPieChart();
    setMetrics();
    
    // Get interview data from session storage
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Set current date
    const now = new Date();
    document.getElementById('interviewDate').value = now.toLocaleDateString();
});

// Handle date navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Add date navigation logic here
    });
});

// Update results when choosing different interview
document.querySelector('.choose-btn').addEventListener('click', () => {
    setMetrics({
        confidence: 2 + Math.random() * 3,
        language: 2 + Math.random() * 3,
        factual: 2 + Math.random() * 3,
        sentiment: 2 + Math.random() * 3
    });
    initPieChart();
});
