const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav_link');

navToggle?.addEventListener('click', () => {
    nav.classList.toggle('open')
});

document.querySelectorAll('.nav_link a').forEach(a => {
    a.addEventListener('click', () => {
        nav.classList.remove('open');
    });
});


const observer = new IntersectionObserver(
    entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('show');
            }
        });
    },
    { threshold: .10 }
);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});


const toast = document.querySelector('.toast');

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}


// Timetable filtering
document.querySelectorAll('.table-filter').forEach(btn => {
    btn.addEventListener('click', () => {

        // Update active button
        document.querySelectorAll('.table-filter').forEach(b => {
            b.classList.remove('active');
        });

        btn.classList.add('active');

        const value = btn.dataset.filter;

        document.querySelectorAll('tbody tr').forEach(row => {

            const cells = row.querySelectorAll('td');
            let hasMatch = false;

            cells.forEach((cell, index) => {

                // Always keep the Time column visible
                if (index === 0) {
                    cell.style.visibility = 'visible';
                    return;
                }

                const className = cell.textContent.trim();

                // Show everything when "All" is selected
                if (value === 'all') {
                    cell.style.visibility = 'visible';
                    hasMatch = true;
                }

                // Kids filter
                else if (
                    value === 'Kids' &&
                    className.toLowerCase().includes('kids')
                ) {
                    cell.style.visibility = 'visible';
                    hasMatch = true;
                }

                // Private tuition filter
                else if (
                    value === 'Private tuition' &&
                    className.toLowerCase() === 'private tuition'
                ) {
                    cell.style.visibility = 'visible';
                    hasMatch = true;
                }

                // Other class filters
                else if (
                    className.toLowerCase() === value.toLowerCase()
                ) {
                    cell.style.visibility = 'visible';
                    hasMatch = true;
                }

                // Hide the content but KEEP the cell space
                else {
                    cell.style.visibility = 'hidden';
                }
            });

            // Hide the entire row if there is no matching class
            row.style.display = hasMatch ? '' : 'none';
        });
    });
});


// Generic demo forms.
document.querySelectorAll('form.demo-form').forEach(form => {
    form.addEventListener('submit', e => {
        e.preventDefault();

        showToast('Thank you — your request has been received.');
        form.reset()
    });
});


// Registration/login demo using localStorage.
const registerForm = document.querySelector('#registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', e => {
        e.preventDefault();

        const user = {
            name: document.querySelector('#regName').value,
            phone: document.querySelector('#regPhone').value,
            email: document.querySelector('#regEmail').value,
            password: document.querySelector('#regPassword').value,
            plan: document.querySelector('#regPlan').value
        };

        localStorage.setItem('dobuUser', JSON.stringify(user));
        localStorage.setItem('dobuCurrentUser', user.email);

        showToast('Account created. Redirecting to login...');

        setTimeout(() => {
            location.href = 'login.html';
        }, 900);
    });
}


const loginForm = document.querySelector('#loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const saved = JSON.parse(
            localStorage.getItem('dobuUser') || 'null'
        );

        const email = document.querySelector('#loginEmail').value;
        const password = document.querySelector('#loginPassword').value;
        if (
            saved &&
            saved.email === email &&
            saved.password === password
        ) {
            localStorage.setItem('dobuCurrentUser', email);

            showToast('Login successful.');

            setTimeout(() => {
                location.href = 'dashboard.html';
            }, 700);
        } else {
            showToast(
                'Demo login failed. Register first or check your details.'
            );
        }
    });
}


// Dashboard.
const dashboardContent = document.querySelector('#dashboardContent');

if (dashboardContent) {
    const saved = JSON.parse(
        localStorage.getItem('dobuUser') || 'null'
    );

    const current = localStorage.getItem('dobuCurrentUser');

    if (saved && current === saved.email) {
        document.querySelector('#dashboardGate').style.display = 'none';
        dashboardContent.style.display = 'block';

        document.querySelector('#memberName').textContent = saved.name;
        document.querySelector('#memberPlan').textContent = saved.plan;

        document.querySelector('#dashDetails').textContent =
            saved.plan + ' • ' + saved.email;
        const phone = document.querySelector('#memberPhone');
        if (phone) phone.textContent = 'Contact: ' + (saved.phone || 'Not provided');
        const planSelect = document.querySelector('#dashboardPlan');
        if (planSelect) {
            [...planSelect.options].forEach(o => { o.selected = o.textContent === saved.plan; });
        }
        document.querySelector('#changePlanBtn')?.addEventListener('click', () => {
            const selected = document.querySelector('#dashboardPlan')?.value;
            if (!selected) return;
            saved.plan = selected;
            localStorage.setItem('dobuUser', JSON.stringify(saved));
            document.querySelector('#memberPlan').textContent = saved.plan;
            document.querySelector('#dashDetails').textContent = saved.plan + ' • ' + saved.email;
            showToast('Membership updated.');
        });

        const bookings = JSON.parse(
            localStorage.getItem('dobuBookings') || '[]'
        ).filter(b => b.email === saved.email);

        const list = document.querySelector('#bookingList');

        list.innerHTML = bookings.length
            ? bookings
                .map(
                    b => `
            <div class="feature-list" style="margin-top:0">
            <div>
            <span class="icon">
            <i class="fa-solid fa-calendar-check"></i>
            </span>
            <div>
            <strong>${b.className}</strong>
            <span>${b.date} • ${b.time}</span>
            </div>
            </div>
            </div>
            `
                )
                .join('')
            : 'No bookings yet.';
    }

    document.querySelector('#logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('dobuCurrentUser');
        location.href = 'login.html';
    });
}


// Forgot password demo.
document.querySelector('#forgotPassword')?.addEventListener('click', e => {
    e.preventDefault();
    showToast('Password reset is a demo feature. Please contact DoBu for help.');
});

// Community topic demo. Posting requires an active login.
const topicForm = document.querySelector('#topicForm');
if (topicForm) {
    topicForm.addEventListener('submit', e => {
        e.preventDefault();
        const saved = JSON.parse(localStorage.getItem('dobuUser') || 'null');
        const current = localStorage.getItem('dobuCurrentUser');
        if (!saved || current !== saved.email) {
            showToast('Please login before creating a discussion.');
            setTimeout(() => { location.href = 'login.html'; }, 800);
            return;
        }
        const topics = JSON.parse(localStorage.getItem('dobuTopics') || '[]');
        topics.unshift({
            title: document.querySelector('#topicTitle').value,
            category: document.querySelector('#topicCategory').value,
            message: document.querySelector('#topicMessage').value
        });
        localStorage.setItem('dobuTopics', JSON.stringify(topics.slice(0, 5)));
        showToast('Discussion topic posted.');
        topicForm.reset();
        renderRecentTopics();
    });
}

function renderRecentTopics() {
    const box = document.querySelector('#recentTopics');
    if (!box) return;
    const topics = JSON.parse(localStorage.getItem('dobuTopics') || '[]');
    if (!topics.length) return;
    box.innerHTML = topics.map(t => `
        <div><span class="icon"><i class="fa-solid fa-comments"></i></span><div><strong>${t.title}</strong><span>${t.category} • Recent</span></div></div>
    `).join('');
}
renderRecentTopics();


// Booking demo.
const bookingForm = document.querySelector('#bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
        e.preventDefault();

        const saved = JSON.parse(
            localStorage.getItem('dobuUser') || 'null'
        );

        if (
            !saved ||
            localStorage.getItem('dobuCurrentUser') !== saved.email
        ) {
            showToast('Please login before booking a class.');

            setTimeout(() => {
                location.href = 'login.html';
            }, 800);

            return;
        }

        const bookings = JSON.parse(
            localStorage.getItem('dobuBookings') || '[]'
        );

        bookings.push({
            email: saved.email,
            className: document.querySelector('#bookClass').value,
            date: document.querySelector('#bookDate').value,
            time: document.querySelector('#bookTime').value
        });

        localStorage.setItem(
            'dobuBookings',
            JSON.stringify(bookings)
        );

        showToast('Demo booking confirmed.');
        bookingForm.reset();
    });
}
