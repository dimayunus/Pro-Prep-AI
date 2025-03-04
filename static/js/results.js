function initPieChart(sentimentData) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');


    if (window.sentimentChart instanceof Chart) {
        window.sentimentChart.destroy();
    }

    window.sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative'],
            datasets: [{
                data: [sentimentData.positive, sentimentData.negative],
                backgroundColor: ['#4CAF50', '#E74C3C'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}


// Update sliders dynamically
function setMetrics(metrics) {
    document.querySelectorAll('.slider').forEach((slider, index) => {
    const track = slider.querySelector('.slider-track');
    const thumb = slider.querySelector('.slider-thumb');
    const valueSpan = slider.querySelector('.slider-value'); // Get the value span

    let value;
    switch (index) {
        case 0: value = metrics.confidence; break;
        case 1: value = metrics.languageProficiency; break;
        case 2: value = metrics.factualAccuracy; break;
        case 3: value = metrics.sentiment.positive - metrics.sentiment.negative; break; // Single Sentiment Slider

    }
    const percentage = ((value - 1) / 4) * 100;
    track.style.width = `${percentage}%`;
    thumb.style.left = `${percentage}%`;
    valueSpan.textContent = value.toFixed(1); // Show value

});
}

async function fetchMetrics() {
    try {
        const response = await fetch('/api/results');
        const data = await response.json();

        if (data.error) {
            console.error("Error fetching metrics:", data.error);
            return;
        }
        setMetrics(data);
        
        initPieChart(data.sentiment);
        // Hide loading animation & show results
        document.getElementById("loading-animation").classList.add("hidden");
        document.getElementById("metrics-container").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error fetching metrics:", error);
    }
}
async function fetchUserInfo() {
    try {
        const response = await fetch('/api/user_info');
        const data = await response.json();
        
        if (!data.error) {
            const userNameElement = document.getElementById("userName");
            userNameElement.textContent = data.fullname;
            userNameElement.classList.remove("loading"); // Remove loading effect
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchMetrics(); 
    await fetchUserInfo()
});
