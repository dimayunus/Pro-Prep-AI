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


function setMetrics(metrics) {
    if (!metrics) return; 
    document.querySelectorAll('.slider').forEach((slider, index) => {
    const track = slider.querySelector('.slider-track');
    const thumb = slider.querySelector('.slider-thumb');
    const valueSpan = slider.querySelector('.slider-value'); // Get the value span

    if (!valueSpan) {
        valueSpan = document.createElement('span');
        valueSpan.classList.add('slider-value');
        container.appendChild(valueSpan); // Append the value element
    }

    let value = 0;
    switch (index) {
        case 0: value = metrics.confidence; break;
        case 1: value = metrics.languageProficiency; break;
        case 2: value = metrics.factualAccuracy; break;
        case 3: value = metrics.sentiment.positive - metrics.sentiment.negative; break; 

    }
    const percentage = ((value - 1) / 4) * 100;
    track.style.width = `${percentage}%`;
    thumb.style.left = `${percentage}%`;
    valueSpan.textContent = value.toFixed(1); // Display value

});
}

async function fetchPastMetrics() {
    try {
        const response = await fetch('/api/past_results');
        const data = await response.json();

        if (data.error || !data.past_scores.length) {
            console.warn("No past results found.");
      

            document.querySelector(".results-container").innerHTML = `
                <div class="no-results">
                    <div class="welcome-card">
                        <h2>You haven't attempted any interviews yet.</h2>
                    </div>
                    <div class="interview-controls">      
                        <a href="/dashboard" class="btn-primary">Start Interview</a>
                    </div>
                </div>
            `;
            return;
        }

        const pastScores = data.past_scores;
        const dateSelect = document.getElementById("interviewDate");
        const timeSelect = document.getElementById("interviewTime");

        dateSelect.innerHTML = "";
        timeSelect.innerHTML = "";

        const uniqueDates = new Set();
        const uniqueTimes = new Set();

        pastScores.forEach((score, index) => {
            const dateString = new Date(score.timestamp).toLocaleDateString("en-GB");
            const timeString = new Date(score.timestamp).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });

            if (!uniqueDates.has(dateString)) {
                uniqueDates.add(dateString);
                const dateOption = document.createElement("option");
                dateOption.value = index;
                dateOption.textContent = dateString;
                dateSelect.appendChild(dateOption);
            }

            if (!uniqueTimes.has(timeString)) {
                uniqueTimes.add(timeString);
                const timeOption = document.createElement("option");
                timeOption.value = index;
                timeOption.textContent = timeString;
                timeSelect.appendChild(timeOption);
            }
        });

        setMetrics(pastScores[0]);
        initPieChart(pastScores[0].sentiment);

        dateSelect.addEventListener("change", () => {
            const selectedIndex = dateSelect.value;
            setMetrics(pastScores[selectedIndex]);
            initPieChart(pastScores[selectedIndex].sentiment);
        });

        timeSelect.addEventListener("change", () => {
            const selectedIndex = timeSelect.value;
            setMetrics(pastScores[selectedIndex]);
            initPieChart(pastScores[selectedIndex].sentiment);
        });

    } catch (error) {
        console.error("Error fetching past results:", error);
    }
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/user_info');
        const data = await response.json();
        
        if (!data.error) {
            const userNameElement = document.getElementById("userName");
            userNameElement.textContent = data.fullname;
            userNameElement.style.display = "inline"; // Show when data is available
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const userNameElement = document.getElementById("userName");
    userNameElement.style.display = "none"; // Hide until data is loaded
    await fetchPastMetrics();
    await fetchUserInfo()
});
