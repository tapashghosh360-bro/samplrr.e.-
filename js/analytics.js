// Real-time Analytics Tracker matching PRD Section 21
class AnalyticsTracker {
  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    this.events = this.isBrowser ? JSON.parse(localStorage.getItem('the_real_estate_events') || '[]') : [];
    this.leads = this.isBrowser ? JSON.parse(localStorage.getItem('the_real_estate_leads') || '[]') : [];
    this.subscribers = [];
    this.scrollDepthsTracked = { 25: false, 50: false, 75: false };
    this.filmEvents = { started: false, completed: false, rewound: false };
    if (this.isBrowser) {
      this.initScrollTracking();
    }
  }

  track(eventName, properties = {}) {
    const event = {
      event_name: eventName,
      properties: {
        ...properties,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      },
      timeFormatted: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    this.events.unshift(event);
    if (this.events.length > 200) {
      this.events.pop();
    }
    
    if (this.isBrowser) {
      try {
        localStorage.setItem('the_real_estate_events', JSON.stringify(this.events.slice(0, 50)));
      } catch (e) {}
    }

    this.notifySubscribers(event);
    console.log(`[PRD Event] %c${eventName}`, 'color: #A77E4B; font-weight: bold;', event.properties);
  }

  recordLead(leadData) {
    const lead = {
      id: 'TR-' + Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'Assigned to Advisor',
      ...leadData
    };

    this.leads.unshift(lead);
    if (this.isBrowser) {
      try {
        localStorage.setItem('the_real_estate_leads', JSON.stringify(this.leads));
      } catch (e) {}
    }

    this.track('lead_submitted', {
      lead_type: lead.lead_type,
      lead_id: lead.id,
      property_id: lead.property_id || 'N/A',
      property_name: lead.property_name || 'General Inquiry',
      phone: lead.phone
    });

    return lead;
  }

  getLeads() {
    return this.leads;
  }

  getEvents() {
    return this.events;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(event) {
    this.subscribers.forEach(cb => {
      try { cb(event); } catch (e) {}
    });
  }

  initScrollTracking() {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

      [25, 50, 75].forEach(depth => {
        if (scrollPercent >= depth && !this.scrollDepthsTracked[depth]) {
          this.scrollDepthsTracked[depth] = true;
          this.track(`scroll_depth_${depth}`, { scroll_depth: depth });
        }
      });
    }, { passive: true });
  }
}

export const analytics = new AnalyticsTracker();
