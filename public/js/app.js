// AI Lead Finder - Frontend JavaScript

class LeadFinderApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.currentLeads = [];
        this.currentPage = 1;
        this.totalPages = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Discover form
        document.getElementById('discover-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.discoverLeads();
        });

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Filter changes
        document.getElementById('filter-industry').addEventListener('change', () => {
            this.loadLeads();
        });

        document.getElementById('filter-status').addEventListener('change', () => {
            this.loadLeads();
        });

        document.getElementById('filter-priority').addEventListener('change', () => {
            this.loadLeads();
        });

        document.getElementById('search-leads').addEventListener('input', 
            this.debounce(() => this.loadLeads(), 500)
        );
    }

    checkAuth() {
        if (this.token) {
            this.getProfile();
        } else {
            this.showLogin();
        }
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showApp();
                this.loadDashboard();
            } else {
                this.showAlert('Login failed: ' + data.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Login failed: ' + error.message, 'danger');
        }
    }

    async register() {
        const formData = {
            firstName: document.getElementById('reg-firstName').value,
            lastName: document.getElementById('reg-lastName').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            company: document.getElementById('reg-company').value,
            industry: document.getElementById('reg-industry').value
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showApp();
                this.loadDashboard();
            } else {
                this.showAlert('Registration failed: ' + data.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Registration failed: ' + error.message, 'danger');
        }
    }

    async getProfile() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.showApp();
                this.loadDashboard();
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    async discoverLeads() {
        const industry = document.getElementById('discover-industry').value;
        const location = document.getElementById('discover-location').value;
        const companySize = document.getElementById('discover-company-size').value;
        const keywords = document.getElementById('discover-keywords').value.split(',').map(k => k.trim());
        
        const sources = [];
        if (document.getElementById('source-linkedin').checked) sources.push('linkedin');
        if (document.getElementById('source-apollo').checked) sources.push('apollo');
        if (document.getElementById('source-websites').checked) sources.push('websites');
        if (document.getElementById('source-news').checked) sources.push('news');

        const searchParams = {
            industry,
            location,
            companySize,
            keywords,
            sources
        };

        const statusDiv = document.getElementById('discovery-status');
        statusDiv.innerHTML = '<div class="loading"></div> Discovering leads...';

        try {
            const response = await fetch(`${this.apiBaseUrl}/leads/discover`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(searchParams)
            });

            const data = await response.json();

            if (data.success) {
                statusDiv.innerHTML = `
                    <div class="discovery-status success">
                        <i class="fas fa-check-circle me-2"></i>
                        Successfully discovered ${data.total} leads!
                    </div>
                `;
                this.loadLeads();
            } else {
                statusDiv.innerHTML = `
                    <div class="discovery-status error">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Discovery failed: ${data.message}
                    </div>
                `;
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="discovery-status error">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Discovery failed: ${error.message}
                </div>
            `;
        }
    }

    async loadLeads() {
        const industry = document.getElementById('filter-industry').value;
        const status = document.getElementById('filter-status').value;
        const priority = document.getElementById('filter-priority').value;
        const search = document.getElementById('search-leads').value;

        const params = new URLSearchParams({
            page: this.currentPage,
            limit: 20
        });

        if (industry) params.append('industry', industry);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (search) params.append('search', search);

        try {
            const response = await fetch(`${this.apiBaseUrl}/leads?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.currentLeads = data.leads;
                this.totalPages = data.pagination.pages;
                this.renderLeads();
                this.renderPagination();
            }
        } catch (error) {
            this.showAlert('Failed to load leads: ' + error.message, 'danger');
        }
    }

    renderLeads() {
        const tbody = document.getElementById('leads-tbody');
        tbody.innerHTML = '';

        this.currentLeads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.name}</td>
                <td>${lead.company}</td>
                <td><span class="badge bg-info">${lead.industry}</span></td>
                <td><span class="lead-score ${this.getScoreClass(lead.leadScore)}">${lead.leadScore}</span></td>
                <td><span class="badge bg-${this.getStatusClass(lead.status)}">${lead.status}</span></td>
                <td><span class="badge bg-${this.getPriorityClass(lead.priority)}">${lead.priority}</span></td>
                <td>${lead.source}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.viewLead('${lead._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="app.analyzeLead('${lead._id}')">
                        <i class="fas fa-brain"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderPagination() {
        const pagination = document.getElementById('leads-pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="app.goToPage(${i})">${i}</a>`;
            pagination.appendChild(li);
        }
    }

    async viewLead(leadId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leads/${leadId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showLeadModal(data.lead);
            }
        } catch (error) {
            this.showAlert('Failed to load lead details: ' + error.message, 'danger');
        }
    }

    showLeadModal(lead) {
        const modalBody = document.getElementById('lead-modal-body');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Contact Information</h6>
                    <p><strong>Name:</strong> ${lead.name}</p>
                    <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
                    <p><strong>Job Title:</strong> ${lead.jobTitle || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Company Information</h6>
                    <p><strong>Company:</strong> ${lead.company}</p>
                    <p><strong>Industry:</strong> ${lead.industry}</p>
                    <p><strong>Size:</strong> ${lead.companySize || 'N/A'}</p>
                    <p><strong>Website:</strong> ${lead.companyWebsite ? `<a href="${lead.companyWebsite}" target="_blank">${lead.companyWebsite}</a>` : 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6>Lead Analysis</h6>
                    <div class="ai-analysis">
                        <div class="analysis-item">
                            <span class="analysis-label">Lead Score:</span>
                            <span class="analysis-value">${lead.leadScore}/100</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Intent Level:</span>
                            <span class="analysis-value">${lead.aiAnalysis?.intent || 'Unknown'}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Budget:</span>
                            <span class="analysis-value">${lead.aiAnalysis?.budget || 'Unknown'}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Timeline:</span>
                            <span class="analysis-value">${lead.aiAnalysis?.timeline || 'Unknown'}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Decision Maker:</span>
                            <span class="analysis-value">${lead.aiAnalysis?.decisionMaker ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('leadModal'));
        modal.show();
    }

    async analyzeLead(leadId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leads/${leadId}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showAnalysisModal(data.analysis, data.outreachMessage);
            }
        } catch (error) {
            this.showAlert('Failed to analyze lead: ' + error.message, 'danger');
        }
    }

    showAnalysisModal(analysis, outreachMessage) {
        const modalBody = document.getElementById('lead-modal-body');
        modalBody.innerHTML = `
            <div class="ai-analysis">
                <h6><i class="fas fa-brain me-2"></i>AI Analysis Results</h6>
                <div class="analysis-item">
                    <span class="analysis-label">Intent Level:</span>
                    <span class="analysis-value">${analysis.intent}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Pain Points:</span>
                    <span class="analysis-value">${analysis.painPoints.join(', ') || 'None identified'}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Budget Level:</span>
                    <span class="analysis-value">${analysis.budget}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Timeline:</span>
                    <span class="analysis-value">${analysis.timeline}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Decision Maker:</span>
                    <span class="analysis-value">${analysis.decisionMaker ? 'Yes' : 'No'}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Sentiment:</span>
                    <span class="analysis-value">${analysis.sentiment}</span>
                </div>
            </div>
            <div class="mt-3">
                <h6><i class="fas fa-envelope me-2"></i>Suggested Outreach Message</h6>
                <div class="alert alert-info">
                    ${outreachMessage}
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('leadModal'));
        modal.show();
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderDashboard(data.analytics);
            }
        } catch (error) {
            this.showAlert('Failed to load dashboard: ' + error.message, 'danger');
        }
    }

    renderDashboard(analytics) {
        const statsContainer = document.getElementById('dashboard-stats');
        statsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <p class="stats-number">${analytics.overview.totalLeads}</p>
                        <p class="stats-label">Total Leads</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <p class="stats-number">${analytics.overview.qualifiedLeads}</p>
                        <p class="stats-label">Qualified Leads</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <p class="stats-number">${analytics.overview.qualificationRate}%</p>
                        <p class="stats-label">Qualification Rate</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <p class="stats-number">${analytics.overview.contactRate}%</p>
                        <p class="stats-label">Contact Rate</p>
                    </div>
                </div>
            </div>
        `;

        this.renderCharts(analytics);
    }

    renderCharts(analytics) {
        // Source Chart
        const sourceCtx = document.getElementById('sourceChart').getContext('2d');
        new Chart(sourceCtx, {
            type: 'doughnut',
            data: {
                labels: analytics.sourcePerformance.map(s => s._id),
                datasets: [{
                    data: analytics.sourcePerformance.map(s => s.count),
                    backgroundColor: [
                        '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Industry Chart
        const industryCtx = document.getElementById('industryChart').getContext('2d');
        new Chart(industryCtx, {
            type: 'bar',
            data: {
                labels: analytics.industryPerformance.map(i => i._id),
                datasets: [{
                    label: 'Leads',
                    data: analytics.industryPerformance.map(i => i.count),
                    backgroundColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async loadAnalytics() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderAnalytics(data.analytics);
            }
        } catch (error) {
            this.showAlert('Failed to load analytics: ' + error.message, 'danger');
        }
    }

    renderAnalytics(analytics) {
        const analyticsContent = document.getElementById('analytics-content');
        analyticsContent.innerHTML = `
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-line me-2"></i>Performance Overview</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h3 class="text-primary">${analytics.overview.totalLeads}</h3>
                                    <p class="text-muted">Total Leads</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h3 class="text-success">${analytics.overview.qualifiedLeads}</h3>
                                    <p class="text-muted">Qualified</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h3 class="text-info">${analytics.overview.qualificationRate}%</h3>
                                    <p class="text-muted">Qualification Rate</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h3 class="text-warning">${analytics.overview.contactRate}%</h3>
                                    <p class="text-muted">Contact Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async updateProfile() {
        const formData = {
            firstName: document.getElementById('profile-firstName').value,
            lastName: document.getElementById('profile-lastName').value,
            company: document.getElementById('profile-company').value,
            industry: document.getElementById('profile-industry').value
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.showAlert('Profile updated successfully!', 'success');
            } else {
                this.showAlert('Failed to update profile: ' + data.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Failed to update profile: ' + error.message, 'danger');
        }
    }

    async exportLeads() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export/leads/csv`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leads-export-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                this.showAlert('Failed to export leads', 'danger');
            }
        } catch (error) {
            this.showAlert('Failed to export leads: ' + error.message, 'danger');
        }
    }

    // Utility methods
    getScoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    getStatusClass(status) {
        const statusClasses = {
            'New': 'primary',
            'Contacted': 'info',
            'Qualified': 'success',
            'Proposal': 'warning',
            'Negotiation': 'warning',
            'Closed Won': 'success',
            'Closed Lost': 'danger'
        };
        return statusClasses[status] || 'secondary';
    }

    getPriorityClass(priority) {
        const priorityClasses = {
            'High': 'danger',
            'Medium': 'warning',
            'Low': 'info'
        };
        return priorityClasses[priority] || 'secondary';
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('app-content').style.display = 'none';
    }

    showRegister() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
        document.getElementById('app-content').style.display = 'none';
    }

    showApp() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.showLogin();
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadLeads();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).style.display = 'block';

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load section data
    switch (sectionName) {
        case 'dashboard':
            app.loadDashboard();
            break;
        case 'leads':
            app.loadLeads();
            break;
        case 'analytics':
            app.loadAnalytics();
            break;
    }
}

function showLogin() {
    app.showLogin();
}

function showRegister() {
    app.showRegister();
}

function logout() {
    app.logout();
}

function exportLeads() {
    app.exportLeads();
}

// Initialize the app
const app = new LeadFinderApp();
