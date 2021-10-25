const course_id = parseInt(document.querySelector('#course_id').innerHTML);

document.addEventListener('DOMContentLoaded', () => {
    // Make API Call, get course info
    // Generate topic overview
    // Create topic interface

    fetch(`/API/courses/${course_id}`)
    .then(response => response.json())
    .then(data => {
        data.course.topics.forEach(topic => {
            const topic_btn = document.createElement('button');
            topic_btn.innerHTML = topic.name;
            topic_btn.classList.add('btn', 'btn-outline-success', 'm-t-2vh', 'm-r-2vh', 'm-b-2vh');
            document.querySelector('.navigation').append(topic_btn);
            topic_btn.onclick = () => {
                loadTopicView(topic);
            };
        });
        loadTopicView(data.course.topics[0]);
    });
});


function loadTopicView(topic) {
    const element = document.querySelector('#display');
    element.innerHTML = '';

    const heading = document.createElement('p');
    heading.innerHTML = topic.name;
    heading.classList.add('fw-light', 'fs-2');

    const description = document.createElement('div');
    description.innerHTML = topic.description;

    const wrapper = document.createElement('div');

    if (topic.lecture) {
        const lecture_heading = document.createElement('p');
        lecture_heading.innerHTML = '<i class="fab fa-youtube"></i> Lecture';
        lecture_heading.classList.add('fw-light', 'fs-2');

        const iframe = document.createElement('iframe');
        iframe.src = topic.lecture;
        iframe.width = '50%';
        iframe.height = '50%';

        const warning = document.createElement('div');
        warning.classList.add('alert', 'alert-warning');
        warning.innerHTML = "This feature is still under development and may occaisionally not work."
        warning.setAttribute('width', '35%');

        wrapper.append(lecture_heading, warning, iframe);
    }
    
    const files = document.createElement('div');
    if (topic.files.length != 0) {
        console.log(topic.files)
        files.innerHTML = '<i class="fas fa-book"></i> Files';
        files.classList.add('fw-light', 'fs-3');
        const all_files = document.createElement('ul');
        topic.files.forEach(element => {
            file = document.createElement('li');
            file.classList.add('fs-5')
            file.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="${element.path}">${element.name}</a>`
            all_files.append(file);
        });
        files.append(all_files);
    }

    const wrapper2 = document.createElement('div');

    if (topic.assignment) {
        const assignment_heading = document.createElement('p');
        assignment_heading.innerHTML = `<i class="fas fa-tasks"></i> Assignment: ${topic.assignment.name}`;
        assignment_heading.classList.add('fw-light', 'fs-2');
        
        const assignment_sub = document.createElement('div');
        assignment_sub.innerHTML = topic.assignment.description;
        
        const how_to_submit = document.createElement('p');
        how_to_submit.innerHTML = '<i class="fas fa-check-square"></i> How to submit';
        how_to_submit.classList.add('fw-light', 'fs-4');

        
        const how_to_submit_desc = document.createElement('p');
        how_to_submit_desc.innerHTML = `After completing the assignment, fill out <a href="${topic.assignment.form}">this</a> form.
        <p>After submitting, your submission will be graded and you'll receive a score via email. Shortly after this, the score will be imported into the system and you'll be able to see your progress.</p>
        <div class="alert alert-success" role="alert">Note that a submission can either be satisfactory or unsatisfactory. Receiving a score of <b>1/1</b> means that your submission was <b>satisfactory</b>. A score of <b>0/1</b> means that your submission was <b>unsatisfactory</b>. If you receive an unsatisfactory grade, feel free to resubmit.</div>`;
        
        const comments = document.createElement('div');

        if (topic.assignment.comments) {
            const comment_heading = document.createElement('p');
    
            comment_heading.innerHTML = '<i class="fas fa-comments"></i> Comments';
            comment_heading.classList.add('fw-light', 'fs-4');

            const comments_body = document.createElement('div');
            comments_body.innerHTML = topic.assignment.comments;
            comments.append(comment_heading, comments_body);
        }   
        wrapper2.append(assignment_heading, assignment_sub, comments, how_to_submit, how_to_submit_desc);
    }
    
    
    element.append(heading, description, files, wrapper, wrapper2)
}