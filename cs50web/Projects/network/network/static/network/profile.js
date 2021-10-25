
let CURRENT_PAGE = 1;
let FILTER = 'oldest-first';

document.addEventListener('DOMContentLoaded', () => {

    query_posts(FILTER, CURRENT_PAGE);
    
    follow_btn();
})

function query_posts(filter, page) {
    setTimeout(() => {
        document.getElementById('all-posts').innerHTML = '';
        const queryParams = new URLSearchParams({
            page: CURRENT_PAGE
          }).toString()
        fetch(`/API/load/${document.querySelector("h3").dataset.username}?${queryParams}`,)
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
                    edit.innerHTML = `<i style="color: grey; cursor: pointer;" class="fas fa-pen"></i>`;
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
                    likes.innerHTML = `<span class='like'><i data-id="${element.id}" class="like-b far fa-heart"></i></span>&nbsp; ${element.likes.length}`;
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
                document.getElementById('all-posts').append(post);
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
                    query_posts(FILTER, CURRENT_PAGE+1)
                    CURRENT_PAGE++;
                }
            } else {
                next.classList.add('disabled')
            }

            if (data.page_obj.has_prev) {
                previous.onclick =  () => {
                    query_posts(FILTER, CURRENT_PAGE-1)
                    CURRENT_PAGE--;
                }
            } else {
                previous.classList.add('disabled')
            }
            paginator.append(ul);
            document.getElementById('all-posts').append(paginator);
        })
    }, 30);
}
