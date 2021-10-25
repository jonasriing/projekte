document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.user-span').forEach(element => {
        fetch(`/API/user/${element.dataset.username}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                displayUserInfo(data);
            } else {
                return;
            }
        })
    })
})

function displayUserInfo(user) {
    let user_span = document.querySelectorAll(`.user-span[data-username="${user.username}"]`);
    switch(true) {
        case user.score == 0:
            break;
        case user.score > 0 && user.score < 201:
            user_span.forEach(element => element.innerHTML = '&nbsp;<i style="color: lightgreen;" class="fas fa-angle-up"></i>');
            break;
        case user.score < 0 && user.score > -100:
            user_span.forEach(element => element.innerHTML = '&nbsp;<i style="color: orange;" class="fas fa-angle-down"></i>');
            break;
        case user.score > 200 && user.score < 501:
            user_span.forEach(element => element.innerHTML = '&nbsp;<i style="color: green;" class="fas fa-angle-double-up"></i>');
            break;
        case user.score > 500:
            user_span.forEach(element => element.innerHTML = '&nbsp;<i style="color: #ffba08;" class="fas fa-trophy"></i>');
            break;
        default:  
            user_span.forEach(element => element.innerHTML = '&nbsp;<i style="color: red;" class="fas fa-angle-double-down"></i>');
            break;
    }
}

function follow_btn() {
    button = document.getElementById('follow-btn');
    if (username === requested_username) {
        button.disabled = true;
        return;
    } 
    if (username === "") {
        button.disabled = true;
        return;
    }
    button.disabled = false;
    fetch(`/API/user/${requested_username}`)
    .then(response => response.json())
    .then(data => {
        data.followers_all.forEach(element => {
            if (element.username === username) {
                button.innerHTML = "Unfollow";
                button.onclick = () => {
                    const csrftoken = getCookie('csrftoken');
        const request = new Request(
            `/API/follow`,
            {headers: {'X-CSRFToken': csrftoken}}
        );
        fetch(request, {
            method: 'PUT',
            mode: 'same-origin',
            body: JSON.stringify({
            username: requested_username,
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) return message('error', result.error)
            
            return location.reload();
        });
                };
            }
        })
    })
    if (button.innerHTML === "Unfollow") return;
    button.innerHTML = "Follow";
    button.onclick = () => {
        const csrftoken = getCookie('csrftoken');
        const request = new Request(
            `/API/follow`,
            {headers: {'X-CSRFToken': csrftoken}}
            );
            fetch(request, {
                method: 'PUT',
                mode: 'same-origin',
                body: JSON.stringify({
                    username: requested_username,
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) return message('error', result.error)
                return location.reload();
        });
    };
}
