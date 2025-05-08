import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Bell, Info } from 'lucide-react';
import './Home.css';

const HomePage = () => {
  const [stats, setStats] = useState([
    { id: 'users', label: 'Users', value: '2,345', change: '+12%', icon: <Users />, color: '#3b82f6' },
    { id: 'events', label: 'Events', value: '42', change: '+5%', icon: <Calendar />, color: '#f97316' },
    { id: 'services', label: 'Services', value: '18', change: '+2', icon: <BarChart3 />, color: '#10b981' }
  ]);

  const [activities, setActivities] = useState([
    { id: 1, user: 'Ahmed', action: 'added a new event', time: '15 min' },
    { id: 2, user: 'Sofia', action: 'updated their profile', time: '1 h' },
    { id: 3, user: 'Karim', action: 'commented on a post', time: '2 h' }
  ]);

  const [newFeatures, setNewFeatures] = useState([
    'New enhanced search feature',
    'Dark mode available',
    'Redesigned UI for better simplicity',
    'Added real-time geolocation'
  ]);

  const [notification, setNotification] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Entry animation effect
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className={`home-page ${isAnimated ? 'animated' : ''}`}>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-actions">
          <button 
            className="action-button"
            onClick={() => showNotification('Report downloaded successfully!', 'success')}
          >
            <BarChart3 size={18} />
            <span>Reports</span>
          </button>
        </div>
      </header>
      
      <div className="dashboard-grid">
        {/* Statistics */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div 
                key={stat.id} 
                className="stat-card" 
                style={{'--delay': `${index * 0.1}s`, '--color': stat.color}}
              >
                <div className="stat-icon-wrapper">
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-change">
                    <TrendingUp size={14} />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Welcome message */}
        <section className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to AJI App</h2>
              <p className="welcome-text">
                Explore our various services and features. Navigate through the
                menu to discover everything. Our application is optimized to offer you
                the best experience possible.
              </p>
              
              <div className="whats-new">
                <h3 className="whats-new-title">
                  <Info size={16} />
                  What's new?
                </h3>
                <ul className="features-list">
                  {newFeatures.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-bullet"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="welcome-illustration">
              <div className="illustration-image">
                {/* Use a styled div as a placeholder for an image */}
              </div>
            </div>
          </div>
        </section>
        
        {/* Recent Activities */}
        <section className="activities-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activities</h2>
            <button className="view-all-button">View All</button>
          </div>
          
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">{activity.user.charAt(0)}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-user">{activity.user}</span> {activity.action}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' ? '✓' : 'ℹ'}
          </div>
          <div className="notification-message">{notification.message}</div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
