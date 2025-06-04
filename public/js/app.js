// Main application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initializeComponents();
    
    // Add event listeners
    const demoButton = document.getElementById('demoButton');
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            alert('Framework is working!');
        });
    }
});

function initializeComponents() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}
