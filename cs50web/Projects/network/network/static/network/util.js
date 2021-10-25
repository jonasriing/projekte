let username;
let requested_username;

document.addEventListener('DOMContentLoaded', () => {
  username = JSON.parse(document.getElementById('username').textContent);   
  requested_username = JSON.parse(document.getElementById('requested_username').textContent);
});

function message(type, message) {
    switch (type) {
      case 'error':
        return document.getElementById('message').innerHTML = `<div class="alert alert-danger d-flex align-items-center alert-dismissible fade show" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button><div><strong>Error: </strong> ${message}</div></div>`
      case 'success':
        return document.getElementById('message').innerHTML = `<div class="alert alert-success d-flex align-items-center alert-dismissible fade show" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg><use xlink:href="#exclamation-triangle-fill"/></svg><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button><div><strong>Success: </strong> ${message}</div></div>`
      case 'warning':
        return document.getElementById('message').innerHTML = `<div class="alert alert-warning d-flex align-items-center alert-dismissible fade show" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg><use xlink:href="#exclamation-triangle-fill"/></svg><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button><div><strong>Warning: </strong> ${message}</div></div>`
      case 'primary':
        return document.getElementById('message').innerHTML = `<div class="alert alert-primary d-flex align-items-center alert-dismissible fade show" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button><div><strong>Info: </strong> ${message}</div></div>`
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function edit_post(element) {
  console.log(element.children[0].children)
  const post_id = element.children[0].children[4].children[0].innerHTML;
  let copy = element.innerHTML;
  const new_post_content = document.createElement('textarea');
  new_post_content.classList.add('form-control');
  new_post_content.innerHTML = element.children[0].children[1].innerHTML;
  element.children[0].innerHTML = '<h6>You are editing this post.</h6>';
  const submit = document.createElement('button');
  submit.innerHTML = 'Post changes'
  submit.classList.add('btn', 'btn-success');
  submit.style.marginTop = '1%';

  const abort = document.createElement('button');
  abort.innerHTML = 'Abort'
  abort.classList.add('btn', 'btn-danger');
  abort.style.marginTop = '1%';
  abort.style.marginLeft = '1%';
  
  element.children[0].append(new_post_content, submit, abort);

  submit.onclick = () => {
    element.innerHTML = copy;
    element.children[0].children[1].innerHTML = new_post_content.value;

    const csrftoken = getCookie('csrftoken');
    const request = new Request(
      `/API/edit/${post_id}`,
      {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'PUT',
        mode: 'same-origin',
        body: JSON.stringify({
            content: new_post_content.value,
          })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) return message('error', result.error)
        return message('success', result.success)
    });
  }
  
  abort.onclick = () => {
    message('warning', 'Aborted the editing of the post. No changes were made.');
    element.innerHTML = copy;
  } 
  
}

function like(post_id) {
  const csrftoken = getCookie('csrftoken');
    const request = new Request(
      `/API/like/${post_id}`,
      {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'PUT',
        mode: 'same-origin'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) return message('error', result.error)
      });
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('like-b')) {
    const element = e.target;
    const id = element.dataset.id;
    like(element.dataset.id);
    setTimeout( () => {
        fetch(`/API/post/${element.dataset.id}`)
        .then(response => response.json())
        .then(info => {
            if(info.post.likes.includes(username)) {
                element.parentElement.parentElement.innerHTML = `<span class='liked'><i data-id="${id}" class="fas like-b fa-heart"></i></span>&nbsp; ${info.post.likes.length}`;
              } else {
                element.parentElement.parentElement.innerHTML = `<span class='like'><i data-id="${id}" class="far like-b fa-heart"></i></span>&nbsp; ${info.post.likes.length}`;
              }
        });
    }, 200);
  }
});