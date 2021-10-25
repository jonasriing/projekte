const course_id = parseInt(document.querySelector('#course_id').innerHTML) 
let editedCourse = {}

document.addEventListener('DOMContentLoaded', () => {
    refreshCourse(true);
});

function refreshCourse(open=false) {
    const element = document.querySelector('#content');
    fetch(`/API/courses/${course_id}`)
    .then(response => response.json())
    .then(course => {
        editedCourse = course.course;
        document.querySelector('#edit-course').focus();

        document.querySelector('#new-topic').onclick = () => {
            loadNewTopic(element, editedCourse);
        }

        document.querySelector('#edit-course').onclick = () => {
            loadEditContent(element, editedCourse);
        }

        document.querySelector('#edit-topic').onclick = () => {
            loadEditTopic(element, editedCourse);
        }

        if (open) loadEditContent(element, editedCourse);
        console.log(JSON.stringify(editedCourse, null, 4));
    });
}

function loadEditContent(element, course) {
    element.classList.add('fade-out');

    const heading = document.createElement('p');
    heading.innerHTML = '1. Change the title of this course. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Change the title. If you want to keep the title, leave this field as it is right now."></i>';
    heading.classList.add('fs-4', 'fw-light');

    const title_form = document.createElement('div');
    title_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" class="form-control" value="${course.name}" id="title">
    <label for="title">Title</label>
    </div>`;

    const description = document.createElement('p');
    description.innerHTML = '2. Change the description of this course. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Change the description. If you want to keep the description, leave this field as it is right now."></i>';
    description.classList.add('fs-4', 'fw-light');

    const error_message = document.createElement('div');
    error_message.id = 'desc_error';
    error_message.classList.add('m-b-2vh', 'text-danger');

    const description_form = document.createElement('textarea');
    description_form.style.resize = false;
    description_form.style.height = '60vh';
    description_form.id = 'description_form';
    description_form.innerHTML = `${course.description}`;

    const next_w = document.createElement('div');
    next_w.classList.add('text-center', 'm-b-2vh');

    const next = document.createElement('button');
    next.innerHTML = 'Save';
    next.classList.add('btn', 'btn-success', 'm-t-2vh', 'm-b-2vh');
    next_w.append(next);

    next.onclick = () => {
        validateCourseEdits(element, course);
    }

    setTimeout(() => {
        element.classList.remove('fade-out');
        element.innerHTML = '';
        element.append(heading, title_form, description, error_message, description_form, next_w);
        element.classList.add('fade-in');
        updateToolTips();

        tinymce.remove("#description_form");
        tinymce.init({
            selector: '#description_form',
            resize: false,
            plugins: 'lists link',
            toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
            lists_indent_on_tab: true,
        });
    }, 500);
}

function validateCourseEdits(element, course) {
    const name = document.querySelector('#title').value;
    const description = tinymce.get('description_form').getContent();

    if (!name || name.length <= 5) return document.querySelector('#title').classList.add('is-invalid');
    if (!description || description.length <= 20) return document.querySelector('#desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.';

    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        `/API/edit/course/${course.id}`,
        {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            name: name,
            description: description,
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            success(element, result.course, 'Successfully edited the course.');
        }
    });
}

function loadEditTopic(element, course) {
    element.classList.add('fade-out');

    const heading = document.createElement('p');
    heading.classList.add('fs-3', 'fw-light');
    heading.innerHTML = 'Which topic do you want to change?';
    
    const topics = document.createElement('div');
    const topic_view = document.createElement('div'); 

    if (course.topics.length == 0) {
        topic_view.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No topics yet.'
    }

    course.topics.forEach(e => {
        const topic = document.createElement('button');
        topic.innerHTML = e.name;
        topic.classList.add('btn', 'btn-outline-secondary', 'm-r-2vh', 'm-b-2vh')
        topics.append(topic);

        topic.onclick = () => {
            loadEditTopicView(topic_view, e, element);
        };
    });


    setTimeout(() => {
        element.classList.remove('fade-out');
        element.innerHTML = '';
        
        element.append(heading, topics, document.createElement('hr'), topic_view)

        element.classList.add('fade-in');
        updateToolTips();
    }, 500);
}

function loadEditTopicView(topic_view, topic, element) {
    topic_view.innerHTML = '';
    
    const heading = document.createElement('p');
    heading.innerHTML = `1. Edit the title of this topic. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Edit the title of this topic. If you don't want to change it, leave this field as it is."></i>`
    heading.classList.add('fs-4', 'fw-light');

    const title_form = document.createElement('div');
    title_form.innerHTML = `<div class="form-floating mb-3">
    <input value="${topic.name}" type="text" class="form-control" id="topic-title">
    <label for="topic-title">Title</label>
    </div>`;

    const desc = document.createElement('p');
    desc.innerHTML = `2. Edit the description of this topic. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Edit the description of this topic. If you don't want to change it, leave this field as it is."></i>`
    desc.classList.add('fs-4', 'fw-light');

    const error_message = document.createElement('div');
    error_message.id = 'desc_error';
    error_message.classList.add('m-b-2vh', 'text-danger');

    const topic_desc_form = document.createElement('textarea');
    topic_desc_form.style.resize = false;
    topic_desc_form.style.height = '60vh';
    topic_desc_form.id = 'topic_desc_form';
    topic_desc_form.innerHTML = topic.description;

    const lecture = document.createElement('p');
    lecture.innerHTML = `3. Edit the lecture of this topic. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Edit the lecture of this topic. If you don't want to change it, leave this field as it is."></i>`
    lecture.classList.add('fs-4', 'fw-light', 'm-t-2vh');

    const lecture_form = document.createElement('div');
    lecture_form.innerHTML = `<div class="form-floating mb-3">
    <input value="${topic.lecture===null?"":topic.lecture}" type="text" class="form-control" id="lecture-url">
    <label for="lecture-url">Lecture Url</label>
    </div>`;

    const assignment = document.createElement('div');
    if (!topic.assignment) {
        const createAssignment = document.createElement('button');
        createAssignment.innerHTML = 'Create Assignment';
        createAssignment.classList.add('btn', 'btn-outline-primary', 'm-b-2vh')
        const assignment_view = document.createElement('div');
        assignment_view.id = 'assignment-area'
        assignment.append(createAssignment, assignment_view);

        createAssignment.onclick = () => {
            loadNewAssignment(assignment_view);
        }
    } else {
        const createAssignment = document.createElement('button');
        createAssignment.innerHTML = 'Edit Assignment';
        createAssignment.classList.add('btn', 'btn-outline-primary', 'm-b-2vh')
        const assignment_view = document.createElement('div');
        assignment_view.id = 'assignment-area'
        assignment.append(createAssignment, assignment_view);

        createAssignment.onclick = () => {
            loadNewAssignment(assignment_view, topic.assignment, true);
        }
    }

    const btn = document.createElement('div');
    btn.classList.add('text-center', 'm-b-2vh');

    const save = document.createElement('button');
    save.innerHTML = 'Save';
    save.classList.add('btn', 'btn-success', 'm-b-2vh');

    save.onclick = () => verifyTopicEdits(element, topic);
    btn.append(save);

    topic_view.append(heading, title_form, desc, error_message, topic_desc_form, lecture, lecture_form, assignment, document.createElement('hr'), btn);
    updateToolTips();

    tinymce.remove('#topic_desc_form');
    tinymce.init({
        selector: '#topic_desc_form',
        resize: false,
        plugins: 'lists link',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
        lists_indent_on_tab: true,
    });
}

function verifyTopicEdits(element, topic) {
    console.log("Yes")
    // Mandatory 
    const name = document.querySelector('#topic-title').value;
    const description = tinymce.get('topic_desc_form').getContent();

    const lecture = document.querySelector('#lecture-url').value==""?null:document.querySelector('#lecture-url').value

    if (!name || name.length <= 5) return document.querySelector('#topic-title').classList.add('is-invalid');
    if (!description || description.length <= 20) return document.querySelector('#desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.';

    // Check for assignment
    const assignment = document.getElementById('assignment-area').hasChildNodes();

    let assignmentContents = {};
    // Verify assignment
    if (assignment) {
        const assignmentTitle = document.querySelector('#assignment-title').value;
        console.log(assignmentTitle.length)
        const assignmentDesc = tinymce.get('assignment_desc_form').getContent();
        const form = document.querySelector('#form-title').value;
        const comments = tinymce.get('comments_form').getContent();

        if (assignmentTitle.length < 5) return document.querySelector('#assignment-title').classList.add('is-invalid');
        if (assignmentDesc.length < 5) return document.querySelector('#assignment_desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.';
        if (form.length < 20) return document.querySelector('#from-title').classList.add('is-invalid');
        
        assignmentContents.id = topic.assignment?topic.assignment.id:null;
        assignmentContents.name = assignmentTitle;
        assignmentContents.description = assignmentDesc;
        assignmentContents.form = form;
        assignmentContents.comments = comments;
    }
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        `/API/edit/topic/${topic.id}`,
        {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            name: name,
            topic_description: description,
            lecture: lecture,
            assignment: assignment?assignmentContents:false
        })
    })
    .then(response => response.json())
    .then(result => {
        if (!result.success) return alert("Something went wrong. Please contanct a developer.")
        success(element, editedCourse, "Successfully edited the topic.")
        refreshCourse();
    });
}