// Fetch live visitor count from API
function fetchVisitorCount() {
    fetch('https://membership.cam-skate.co.uk/api/current_visitors')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('live_visitor_count');

            if (data.status === 'in_session' && data.visitor_count !== undefined) {
                container.innerHTML = `
                    <div class="live-visitor-count">
                        <span class="blinking-light"></span>
                        <span>${data.visitor_count} signed in this session</span>
                    </div>
                `;
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching visitor count:', error);
            document.getElementById('live_visitor_count').style.display = 'none';
        });
}

// Fetch immediately and then every 30 seconds
document.addEventListener('DOMContentLoaded', function() {
    fetchVisitorCount();
    setInterval(fetchVisitorCount, 30000);
});
