document.addEventListener('DOMContentLoaded', loadEventDetail);

async function loadEventDetail() {
    const container = document.getElementById('eventDetailContainer');
    
    // Get event ID from URL query string
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (!eventId) {
        container.innerHTML = '<p style="text-align:center; padding:2rem; color:#c0392b;">Invalid event ID</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await response.json();
        
        if (!result.success) {
            container.innerHTML = `<p style="text-align:center; padding:2rem; color:#c0392b;">${result.message || 'Failed to load event'}</p>`;
            return;
        }
        
        const event = result.data;
        const progress = getProgress(event.current_funds, event.fundraising_goal);
        
        container.innerHTML = `
            <div class="detail-img" style="background: linear-gradient(135deg, #667eea, #764ba2); display:flex; align-items:center; justify-content:center; color:white; font-size:5rem;">
                🎗️
            </div>
            <div class="detail-body">
                <span class="event-category">${event.category_name}</span>
                <h1>${event.event_name}</h1>
                <p style="color:#666; margin-bottom:1rem;">Hosted by ${event.org_name}</p>
                
                <div class="detail-info-grid">
                    <div class="info-item">
                        <h4>Date & Time</h4>
                        <p>${formatDate(event.event_date)}</p>
                    </div>
                    <div class="info-item">
                        <h4>Location</h4>
                        <p>${event.location}</p>
                    </div>
                    <div class="info-item">
                        <h4>Ticket Price</h4>
                        <p>${event.ticket_price > 0 ? '$' + event.ticket_price.toFixed(2) : 'Free Entry'}</p>
                    </div>
                    <div class="info-item">
                        <h4>Status</h4>
                        <p style="color: ${event.status === 'upcoming' ? '#27ae60' : '#f39c12'};">
                            ${event.status === 'upcoming' ? 'Upcoming' : 'Ongoing'}
                        </p>
                    </div>
                </div>
                
                <div class="fundraising-section">
                    <h3>Fundraising Progress</h3>
                    <div class="fundraising-numbers">
                        <span>Raised: $${event.current_funds.toFixed(2)}</span>
                        <span>Goal: $${event.fundraising_goal.toFixed(2)}</span>
                    </div>
                    <div class="progress-bar" style="height: 12px;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p style="text-align:right; margin-top:0.5rem; font-weight:600;">${progress}% Complete</p>
                </div>
                
                <h3 style="margin: 1.5rem 0 0.8rem; color:#2c3e50;">About This Event</h3>
                <p style="white-space: pre-line;">${event.full_desc}</p>
                
                <button class="btn btn-primary register-btn" onclick="showRegisterModal()">Register Now</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading event details:', error);
        container.innerHTML = '<p style="text-align:center; padding:2rem; color:#c0392b;">Connection error. Please ensure the API server is running.</p>';
    }
}