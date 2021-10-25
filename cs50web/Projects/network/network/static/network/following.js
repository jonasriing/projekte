let CURRENT_PAGE = 1;
let FILTER = 'following';

document.addEventListener('DOMContentLoaded', () => {
    // JS After the content is loaded
    show_all_posts();
});

function hide_all() {
    // Hide all the divs
    document.getElementById('following').style.display = 'None';
}

function show_all_posts() {
    hide_all();
    const postswrapper = document.getElementById('following')
    postswrapper.style.display = 'Block';
    
    const dropdown = document.createElement('div')
    dropdown.innerHTML = `<div class="btn-group">
    <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
      Sort results
    </button>
    <ul class="dropdown-menu">
      <li class="dropdown-item" onclick="query_posts('newest-first', 1); FILTER = 'newest-first'; CURRENT_PAGE=1;">Newest first</li>
      <li class="dropdown-item" onclick="query_posts('oldest-first', 1); FILTER = 'oldest-first'; CURRENT_PAGE=1;">Oldest first</li>
    </ul>
    </div>`;

    postswrapper.innerHTML = '<h3>All posts</h3>';

    const all_posts = document.createElement('div');
    all_posts.id = 'all-posts';
    
    fetch(`/API/user`)
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                let new_post = document.createElement('div')
                new_post.innerHTML = `<form action="" id="new-post-form"><input name="csrfmiddlewaretoken" type="hidden" value="{% csrf_token %}"><div class="input-group margin-t-b">
                <span class="input-group-text"><button id="post_post" type="submit" class="btn btn-success">Post now!</button></span>
                <textarea class="form-control" id="new_post_content" aria-label="Create a new post:"></textarea>
                </div></form>`;
                postswrapper.append(new_post);
                document.getElementById('new-post-form').onsubmit = () => {
                    post_new_post();
                    return false;
                }
            } 
            postswrapper.append(document.createElement('hr'), dropdown, all_posts);
        })
        
    query_posts('following', 1);
}

function query_posts(args, page) {
    setTimeout(() => {
        document.getElementById('following').innerHTML = '';
        const queryParams = new URLSearchParams({
            page: page
          }).toString()
        fetch(`/API/load/${args}?${queryParams}`,)
        .then(respone => respone.json())
        .then(data => {
            data.all_posts.forEach(element => {
                
                const post = document.createElement('div');
                const postw = document.createElement('div');
                postw.classList.add('border-bottom', 'border-2', 'border-light', 'margin-t-b', 'post');
                post.append(postw);
                const heading = document.createElement('h6');
                if (element.creator === username) {
                    heading.innerHTML = `<a class='a-no-styling' href='/user/${element.creator}'>@${element.creator}</a>&nbsp;`;
                    const edit = document.createElement('span');
                    edit.innerHTML = `<i style="color: grey; cursor:pointer;" class="fas fa-pen"></i>`;
                    heading.append(edit);

                    edit.onclick = () => {
                        edit_post(post);
                    }
                } else {           
                    heading.innerHTML = `<a class='a-no-styling' href='/user/${element.creator}'>@${element.creator}</a>`;
                }
                const content = document.createElement('p');
                content.innerHTML = element.content;
                const likes = document.createElement('p');
                likes.classList.add('likes')
                if (element.likes.includes(username)) {
                    likes.innerHTML = `<span class='liked'><i data-id="${element.id}" class="like-b fas fa-heart"></i></span>&nbsp; ${element.likes.length}`;
                } else {
                    likes.innerHTML = `<span class='like'><i data-id="${element.id}" class="like-b far fa-heart"></i></span>&nbsp; ${element.likes.length}</p>`;
                }
                const timestamp = document.createElement('p');
                timestamp.classList.add('timestamp');
                if (element.edited) {
                    timestamp.innerHTML = `Posted ${element.timestamp}, Edited`;
                } else {
                    timestamp.innerHTML = `Posted ${element.timestamp}`;
                }
                const id_text = document.createElement('p');
                id_text.innerHTML = `Post-ID:&nbsp;`;
                id_text.classList.add('id');

                const id = document.createElement('span');
                id.innerHTML = element.id;
                id_text.append(id);

                postw.append(heading, content, likes, timestamp, id_text);
                document.getElementById('following').append(post);
            })
            const paginator = document.createElement('div');
            const ul = document.createElement('ul');
            ul.classList.add('pagination', 'justify-content-center');
            ul.id = 'paginator-list';

            const previous = document.createElement('li');
            previous.classList.add('page-item');
            previous.innerHTML = '<p class="page-link">Previous</p>';

            const next = document.createElement('li');
            next.classList.add('page-item');
            next.innerHTML = '<p class="page-link">Next</p>';

            ul.append(previous);
            ul.append(next);

            if (data.page_obj.has_next) {
                next.onclick = () => {
                    CURRENT_PAGE++;
                    query_posts(FILTER, CURRENT_PAGE)
                }
            } else {
                next.classList.add('disabled')
            }

            if (data.page_obj.has_prev) {
                previous.onclick =  () => {
                    CURRENT_PAGE--;
                    query_posts(FILTER, CURRENT_PAGE)
                }
            } else {
                previous.classList.add('disabled')
            }
            paginator.append(ul);
            document.getElementById('following').append(paginator);
        })
    }, 30);
}
