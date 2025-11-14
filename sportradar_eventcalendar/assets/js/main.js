const API_BASE_URL = 'api';

const eventsContainer = document.getElementById('events-container');
const eventForm = document.getElementById('event-form');
const sportSelect = document.getElementById('sport-select');
const homeTeamSelect = document.getElementById('home-team-select');
const awayTeamSelect = document.getElementById('away-team-select');
const venueSelect = document.getElementById('venue-select');
const filterSport = document.getElementById('filter-sport');
const filterDate = document.getElementById('filter-date');
const clearFiltersBtn = document.getElementById('clear-filters');

let allEvents = [];
let sports = [];
let teams = [];
let venues = [];
let editingEventId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [sportsData, teamsData, venuesData, eventsData] = await Promise.all([
      fetchJSON(`${API_BASE_URL}/get_sports.php`),
      fetchJSON(`${API_BASE_URL}/get_teams.php`),
      fetchJSON(`${API_BASE_URL}/get_venues.php`),
      fetchJSON(`${API_BASE_URL}/get_events.php`)
    ]);

    if (sportsData?.error) throw new Error(`Sports API: ${sportsData.error}`);
    if (teamsData?.error) throw new Error(`Teams API: ${teamsData.error}`);
    if (venuesData?.error) throw new Error(`Venues API: ${venuesData.error}`);
    if (eventsData?.error) throw new Error(`Events API: ${eventsData.error}`);

    sports = Array.isArray(sportsData) ? sportsData : [];
    teams = Array.isArray(teamsData) ? teamsData : [];
    venues = Array.isArray(venuesData) ? venuesData : [];
    allEvents = Array.isArray(eventsData) ? eventsData : [];

    populateDropdowns();
    displayEvents(allEvents);
    setupEventListeners();
    filterTeamsBySport(sportSelect.value);
    filterVenuesBySport(sportSelect.value);
    enforceDifferentTeams();
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('danger', String(error.message || error));
    eventsContainer.innerHTML = `
      <div class="col-12 alert alert-danger">
        ${String(error.message || 'Error loading data')}
      </div>
    `;
  }
});

function populateDropdowns() {
  const sportsOptions = sports.map(sport =>
    `<option value="${sport.sport_id}">${sport.sport_name}</option>`
  ).join('');

  sportSelect.innerHTML = '<option value="">Select Sport</option>' + sportsOptions;
  filterSport.innerHTML = '<option value="">All Sports</option>' + sportsOptions;

  const teamsOptions = teams.map(team =>
    `<option value="${team.team_id}" data-sport="${team.sport_id}">${team.team_name}</option>`
  ).join('');

  homeTeamSelect.innerHTML = '<option value="">Select Home Team</option>' + teamsOptions;
  awayTeamSelect.innerHTML = '<option value="">Select Away Team</option>' + teamsOptions;

  venueSelect.innerHTML = '<option value="">Select Venue</option>' +
    venues.map(venue =>
      `<option value="${venue.venue_id}" data-sport="${venue.sport_id}">${venue.name} (${venue.city}, ${venue.country})</option>`
    ).join('');
}

function filterTeamsBySport(sportId) {
  const filteredTeams = sportId ? teams.filter(team => team.sport_id == sportId) : teams;

  homeTeamSelect.innerHTML = '<option value="">Select Home Team</option>' +
    filteredTeams.map(team => `<option value="${team.team_id}">${team.team_name}</option>`).join('');

  awayTeamSelect.innerHTML = '<option value="">Select Away Team</option>' +
    filteredTeams.map(team => `<option value="${team.team_id}">${team.team_name}</option>`).join('');

  enforceDifferentTeams();
}

function filterVenuesBySport(sportId) {
  const filtered = sportId ? venues.filter(v => v.sport_id == sportId) : venues;
  venueSelect.innerHTML = '<option value="">Select Venue</option>' +
    filtered.map(venue => `<option value="${venue.venue_id}">${venue.name} (${venue.city}, ${venue.country})</option>`).join('');
}

function enforceDifferentTeams() {
  const home = homeTeamSelect.value;
  const away = awayTeamSelect.value;

  [...awayTeamSelect.options].forEach(opt => { opt.disabled = home && opt.value === home; });
  [...homeTeamSelect.options].forEach(opt => { opt.disabled = away && opt.value === away; });
}

function displayEvents(events) {
  if (events.length === 0) {
    eventsContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">No events found.</div>
      </div>
    `;
    return;
  }

  eventsContainer.innerHTML = events.map(event => {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit'
    });

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card event-card">
          <div class="card-header event-header ${getSportClass(event.sport_name)}">
            <h5 class="card-title text-white mb-0">${event.sport_name}</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">${formattedDate} at ${event.event_time}</h6>
            <p class="card-text">
              <strong>${event.home_team_name}</strong> vs <strong>${event.away_team_name}</strong><br>
              <small>Venue: ${event.venue_name}, ${event.venue_city}</small>
            </p>
            ${event.description ? `<p class="card-text">${event.description}</p>` : ''}
            <div class="d-flex justify-content-between mt-3">
              <button class="btn__primary --gray btn-sm edit-event" data-event-id="${event.event_id}">Edit</button>
              <button class="btn__primary --red btn-sm delete-event" data-event-id="${event.event_id}">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.edit-event').forEach(button => {
    button.addEventListener('click', async (e) => {
      const eventId = e.currentTarget.getAttribute('data-event-id');
      try {
        const data = await fetchJSON(`${API_BASE_URL}/get_event.php?event_id=${encodeURIComponent(eventId)}`);
        if (!data.success || !data.event) {
          showToast('danger', data.error || 'Failed to load event');
          return;
        }
        const ev = data.event;
        document.getElementById('event-date').value = ev.event_date;
        document.getElementById('event-time').value = ev.event_time;
        sportSelect.value = String(ev.sport_id);
        filterTeamsBySport(ev.sport_id);
        homeTeamSelect.value = String(ev.home_team_id);
        awayTeamSelect.value = String(ev.away_team_id);
        filterVenuesBySport(ev.sport_id);
        venueSelect.value = String(ev.venue_id);
        document.getElementById('event-description').value = ev.description || '';

        editingEventId = Number(ev.event_id);
        eventForm.querySelector('button[type="submit"]').textContent = 'Save Changes';

        // Apply background according to loaded event sport before showing
        applyOffcanvasSportBg();

        const offcanvasEl = document.getElementById('addEventOffcanvas');
        const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        off.show();
      } catch (err) {
        console.error(err);
        showToast('danger', 'Could not load event for editing.');
      }
    });
  });

  document.querySelectorAll('.delete-event').forEach(button => {
    button.addEventListener('click', async (e) => {
      const eventId = e.target.getAttribute('data-event-id');
      const ok = await showConfirm('Do you really want to delete the event?');
      if (ok) deleteEvent(eventId);
    });
  });
}


function getSportClass(name) {
  switch (name) {
    case 'Football': return 'event-header-football';
    case 'Ice Hockey': return 'event-header-icehockey';
    case 'Basketball': return 'event-header-basketball';
    case 'Tennis': return 'event-header-tennis';
    default: return 'event-header-generic';
  }
}

function getOffcanvasSportClassByName(name) {
  switch (name) {
    case 'Football': return 'form-sport-football';
    case 'Ice Hockey': return 'form-sport-icehockey';
    case 'Basketball': return 'form-sport-basketball';
    case 'Tennis': return 'form-sport-tennis';
    default: return '';
  }
}

function applyOffcanvasSportBg() {
  const formContainer = document.querySelector('#addEventOffcanvas .form-container');
  if (!formContainer) return;
  // Determine selected sport name from sportSelect using sports list
  const sid = sportSelect && sportSelect.value ? String(sportSelect.value) : '';
  const sportObj = sid ? sports.find(s => String(s.sport_id) === sid) : null;
  const sportName = sportObj ? sportObj.sport_name : '';
  const cls = getOffcanvasSportClassByName(sportName);

  // Clear previous sport classes first
  clearOffcanvasSportBg();

  if (cls) {
    formContainer.classList.add('has-sport-bg');
    formContainer.classList.add(cls);
  }
}

function clearOffcanvasSportBg() {
  const formContainer = document.querySelector('#addEventOffcanvas .form-container');
  if (!formContainer) return;
  formContainer.classList.remove('has-sport-bg');
  // Remove any class that starts with 'form-sport-'
  const toRemove = [];
  formContainer.classList.forEach(c => { if (c.indexOf('form-sport-') === 0) toRemove.push(c); });
  toRemove.forEach(c => formContainer.classList.remove(c));
}

function setupEventListeners() {
  sportSelect.addEventListener('change', () => {
    const sportId = sportSelect.value;
    filterTeamsBySport(sportId);
    filterVenuesBySport(sportId);
    enforceDifferentTeams();
    homeTeamSelect.value = '';
    awayTeamSelect.value = '';
    venueSelect.value = '';
    applyOffcanvasSportBg();
  });

  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (homeTeamSelect.value === awayTeamSelect.value) {
      showToast('warning', 'Home and away team must be different.');
      return;
    }
    const sid = sportSelect.value;
    const vid = venueSelect.value;
    if (!isVenueValidForSport(sid, vid)) {
      showToast('warning', 'Please select a venue that matches the chosen sport.');
      return;
    }
    if (editingEventId) updateEvent(); else addNewEvent();
  });

  filterSport.addEventListener('change', applyFilters);
  filterDate.addEventListener('change', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);

  homeTeamSelect.addEventListener('change', enforceDifferentTeams);
  awayTeamSelect.addEventListener('change', enforceDifferentTeams);

  const offcanvasEl = document.getElementById('addEventOffcanvas');
  // When opening, apply current selection background
  offcanvasEl.addEventListener('show.bs.offcanvas', () => {
    applyOffcanvasSportBg();
  });
  offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
    editingEventId = null;
    eventForm.reset();
    eventForm.querySelector('button[type="submit"]').textContent = 'Add Event';
    clearOffcanvasSportBg();
  });
}

function isVenueValidForSport(sportId, venueId) {
  if (!sportId || !venueId) return false;
  const v = venues.find(v => String(v.venue_id) === String(venueId));
  return v ? String(v.sport_id) === String(sportId) : false;
}

async function addNewEvent() {
  const eventData = {
    event_date: document.getElementById('event-date').value,
    event_time: document.getElementById('event-time').value,
    sport_id: parseInt(sportSelect.value),
    home_team_id: parseInt(homeTeamSelect.value),
    away_team_id: parseInt(awayTeamSelect.value),
    venue_id: parseInt(venueSelect.value),
    description: document.getElementById('event-description').value
  };

  try {
    const result = await fetchJSON(`${API_BASE_URL}/create_event.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventData)
    });

    if (result.success) {
      showToast('success', 'Event added successfully!');
      eventForm.reset();
      await reloadEvents();
    } else {
      showToast('danger', `Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error adding event:', error);
    showToast('danger', 'Failed to add event. Please try again.');
  }
}

async function updateEvent() {
  const payload = {
    event_id: editingEventId,
    event_date: document.getElementById('event-date').value,
    event_time: document.getElementById('event-time').value,
    sport_id: parseInt(sportSelect.value),
    home_team_id: parseInt(homeTeamSelect.value),
    away_team_id: parseInt(awayTeamSelect.value),
    venue_id: parseInt(venueSelect.value),
    description: document.getElementById('event-description').value
  };

  try {
    const result = await fetchJSON(`${API_BASE_URL}/update_event.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });

    if (result.success) {
      showToast('success', 'Event updated successfully!');
      const off = bootstrap.Offcanvas.getInstance(document.getElementById('addEventOffcanvas'))
        || bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('addEventOffcanvas'));
      off.hide();
      editingEventId = null;
      eventForm.querySelector('button[type=\"submit\"]').textContent = 'Add Event';
      await reloadEvents();
    } else {
      showToast('danger', `Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error updating event:', error);
    showToast('danger', 'Failed to update event. Please try again.');
  }
}

async function deleteEvent(eventId) {
  try {
    const result = await fetchJSON(`${API_BASE_URL}/delete_event.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: eventId })
    });

    if (result.success) {
      showToast('success', 'Event deleted successfully!');
      await reloadEvents();
    } else {
      showToast('danger', `Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    showToast('danger', 'Failed to delete event. Please try again.');
  }
}

function applyFilters() {
  const sportId = filterSport.value;
  const dateFilter = filterDate.value;
  let filteredEvents = [...allEvents];
  if (sportId) filteredEvents = filteredEvents.filter(event => event.sport_id == sportId);
  if (dateFilter) filteredEvents = filteredEvents.filter(event => event.event_date === dateFilter);
  displayEvents(filteredEvents);
}

function clearFilters() {
  filterSport.value = '';
  filterDate.value = '';
  displayEvents(allEvents);
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  try {
    return await res.json();
  } catch (e) {
    const text = await res.text();
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 200)}`);
  }
}

async function reloadEvents() {
  const eventsData = await fetchJSON(`${API_BASE_URL}/get_events.php`);
  if (eventsData?.error) throw new Error(`Events API: ${eventsData.error}`);
  allEvents = Array.isArray(eventsData) ? eventsData : [];
  displayEvents(allEvents);
}

function showToast(variant, message) {
  const container = document.getElementById('toastContainer');
  const wrapper = document.createElement('div');
  const colorClass = getToastColorClass(variant);
  wrapper.className = `toast align-items-center text-bg-${colorClass} border-0`;
  wrapper.setAttribute('role', 'alert');
  wrapper.setAttribute('aria-live', 'assertive');
  wrapper.setAttribute('aria-atomic', 'true');
  wrapper.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  container.appendChild(wrapper);
  const toast = new bootstrap.Toast(wrapper, { delay: 3000 });
  wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
  toast.show();
}

function getToastColorClass(variant) {
  switch (variant) {
    case 'success': return 'success';
    case 'danger': return 'danger';
    case 'warning': return 'warning';
    case 'info': return 'info';
    default: return 'secondary';
  }
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const modalEl = document.getElementById('confirmModal');
    modalEl.querySelector('#confirmMessage').textContent = message;
    const okBtn = modalEl.querySelector('#confirmOkBtn');
    const bsModal = new bootstrap.Modal(modalEl);

    const cleanup = () => {
      okBtn.removeEventListener('click', onOk);
      modalEl.removeEventListener('hidden.bs.modal', onHide);
    };
    const onOk = () => { cleanup(); bsModal.hide(); resolve(true); };
    const onHide = () => { cleanup(); resolve(false); };
    okBtn.addEventListener('click', onOk);
    modalEl.addEventListener('hidden.bs.modal', onHide);
    bsModal.show();
  });
}
