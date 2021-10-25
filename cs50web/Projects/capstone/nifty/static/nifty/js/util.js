document.addEventListener('DOMContentLoaded', () => {
    updateToolTips();
});

function updateToolTips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function sendNotification(type, content) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('flex', 'notification', 'align-center', 'row', 'space-around', 'fade-in');
    const notificationContent = document.createElement('p');
    notificationContent.innerHTML = content;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.classList.add('close-btn');

    closeBtn.onclick = () => {
        removeElement(wrapper, true);
    }

    wrapper.append(notificationContent, closeBtn);

    document.querySelector('.notification-display').append(wrapper);
    setTimeout(() => removeElement(wrapper, true), 10000);
}

function removeElement(element, fade=false) {
    if (fade) {
        element.classList.add('fade-out')
        setTimeout(() => element.remove(), 1000);
    } else return element.remove();
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function successAnimation(element) {
    const icon_wrapper = document.createElement('div');
    icon_wrapper.classList.add('success-checkmark');

    const check_icon = document.createElement('div');
    check_icon.classList.add('check-icon');

    const inner1 = document.createElement('span');
    inner1.classList.add('icon-line', 'line-tip');

    const inner2 = document.createElement('span');
    inner2.classList.add('icon-line', 'line-long');

    const inner3 = document.createElement('div');
    inner3.classList.add('icon-circle');

    const inner4 = document.createElement('div');
    inner4.classList.add('icon-fix');

    check_icon.append(inner1, inner2, inner3, inner4);
    icon_wrapper.append(check_icon);
    element.innerHTML = '';
    element.append(icon_wrapper);
}
