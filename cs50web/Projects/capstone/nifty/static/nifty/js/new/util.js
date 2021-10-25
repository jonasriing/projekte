// Util functions for creating courses, topic and assignments

function loadSettings(element) {
    const title = document.createElement('p');
    title.innerHTML = '1. Select the title of your course. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="This will be the title of your course."></i>';
    title.classList.add('fw-light', 'fs-4');

    const title_form = document.createElement('div');
    title_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" class="form-control" id="course-title">
    <label for="course-title">Title</label>
    </div>`;

    const desc = document.createElement('p');
    desc.innerHTML = '2. Add a description. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Describe your course in detail. What will the user learn? Are there any prerequisites?"></i>';
    desc.classList.add('fw-light', 'fs-4');

    const desc_form = document.createElement('textarea');
    desc_form.id = 'course_description';
    desc_form.style.resize = false;
    desc_form.style.height = '40vh';
    desc_form.classList.add('editor')

    const error_message = document.createElement('div');
    error_message.id = 'desc_error';
    error_message.classList.add('m-b-2vh', 'text-danger');

    const next_w = document.createElement('div');
    next_w.classList.add('text-center');

    const next = document.createElement('button');
    next.innerHTML = 'Next';
    next.classList.add('btn', 'btn-success', 'm-t-2vh');
    next_w.append(next);
    
    element.append(title, title_form, desc, error_message, desc_form, next_w);
    
    tinymce.init({
        selector: '#course_description',
        resize: false,
        plugins: 'lists link',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
        lists_indent_on_tab: true,
        });

    next.onclick = () => {
        verifyCourseContents(element);
    }
    
    updateToolTips();
}

function verifyCourseContents(element) {
    const title = document.querySelector('#course-title').value;
    const desc = tinymce.get("course_description").getContent();
    
    if (title.length < 5) return document.querySelector('#course-title').classList.add('is-invalid');
    if (desc.length < 25) return document.querySelector('#desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.'

    // Make API Call, Post data
    // If successful, next step
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        '/API/new/course',
        {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            title: title,
            description: desc
          })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            return success(element, result.course, 'Successfully created the course.');
        } 
        // Not successful
        alert("Something went wrong (Server responded with error)");
        // Redo
    })
}

function loadNewTopic(element, course) {
    element.classList.add('fade-out');
    const info = document.createElement('p');
    info.innerHTML = `You are creating a topic for <strong>${course.name}</strong>.`;
    info.classList.add('fw-light', 'fs-6', 'm-b-2vh');
    const title = document.createElement('p');
    title.innerHTML = '1. Select the title of your topic. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="What is this topic about? What does it cover? Find a fitting title."></i>';
    title.classList.add('fw-light', 'fs-4');

    const title_form = document.createElement('div');
    title_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" class="form-control" id="topic-title">
    <label for="topic-title">Title</label>
    </div>`;

    const desc = document.createElement('p');
    desc.innerHTML = '2. Add a description. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Describe this topic in detail. If you do not have a video lecture, use the description as your written lecture."></i>';
    desc.classList.add('fw-light', 'fs-4');

    const error_message = document.createElement('div');
    error_message.id = 'desc_error';
    error_message.classList.add('m-b-2vh', 'text-danger');

    const topic_desc_form = document.createElement('textarea');
    topic_desc_form.classList.add('topic-editor');
    topic_desc_form.style.resize = false;
    topic_desc_form.style.height = '60vh';
    topic_desc_form.id = 'topic_desc_form';
    
    const lecture = document.createElement('p');
    lecture.innerHTML = '3. Link to your lecture. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Add a YouTube URL to your lecture. If you do not have a video lecutre, leave this field empty."></i>';
    lecture.classList.add('fw-light', 'fs-4', 'm-t-2vh');

    const lecture_form = document.createElement('div');
    lecture_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" class="form-control" id="lecture-url">
    <label for="lecture-url">Lecture Url</label>
    </div>`;

    const assignment = document.createElement('p');
    assignment.innerHTML = '4. Create an assignment. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Create an assignment for this lecture. If you do not have an assignment, leave this field empty. You can add an assignment later, if you prefer."></i>';
    assignment.classList.add('fw-light', 'fs-4', 'm-t-2vh');

    const assignment_btn = document.createElement('button');
    assignment_btn.classList.add('btn', 'btn-outline-primary', 'm-r-2vh');
    assignment_btn.innerHTML = 'New Assignemnt';

    const assignment_area = document.createElement('div');
    assignment_area.id = 'assignment-area';

    assignment_btn.onclick = () => {
        loadNewAssignment(assignment_area);
    };

    const next_w = document.createElement('div');
    next_w.classList.add('text-center', 'm-b-2vh');

    const next = document.createElement('button');
    next.innerHTML = 'Next';
    next.classList.add('btn', 'btn-success', 'm-t-2vh', 'm-b-2vh');
    next_w.append(next);

    next.onclick = () => {
        verifyTopicContents(element, course);
    }

    setTimeout(() => {
        element.innerHTML = '';
        element.classList.remove('fade-out');
        element.classList.add('fade-in');
        element.append(info, title, title_form, desc, error_message, topic_desc_form, lecture, lecture_form, assignment, assignment_btn, assignment_area, document.createElement('hr'), next_w);
        updateToolTips();
        tinymce.remove('#topic_desc_form');
        tinymce.init({
            selector: '#topic_desc_form',
            resize: false,
            plugins: 'lists link',
            toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
            lists_indent_on_tab: true,
        });
    }, 1000);

}

function loadNewAssignment(element, content=null, edit=false) {
    element.innerHTML = '';
    const info = document.createElement('p');
    info.innerHTML = `You are ${edit?"editing":"creating"} an assignment.`;
    info.classList.add('fw-light', 'fs-7', 'm-b-2vh', 'm-t-2vh');

    const title = document.createElement('p');
    title.innerHTML = '1. Select the title of your assignment. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Find a fitting, short title for your assignment. Idealy one a single word."></i>';
    title.classList.add('fw-light', 'fs-5');

    const title_form = document.createElement('div');
    title_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" value="${content===null?"":content.name}" class="form-control" id="assignment-title">
    <label for="assignment-title">Title</label>
    </div>`;

    const desc = document.createElement('p');
    desc.innerHTML = '2. Add a description. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="The description should include all the specifications of your assignment."></i>';
    desc.classList.add('fw-light', 'fs-5');

    const error_message = document.createElement('div');
    error_message.id = 'assignment_desc_error';
    error_message.classList.add('m-b-2vh', 'text-danger');

    const assignment_form = document.createElement('textarea');
    assignment_form.classList.add('assignment-editor');
    assignment_form.style.resize = false;
    assignment_form.style.height = '30vh';
    assignment_form.innerHTML = content===null?"":content.description;
    assignment_form.id = 'assignment_desc_form';

    const form = document.createElement('p');
    form.innerHTML = `3. Link to your form. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Users will submit their assignment through a Google form. Add the link to this form here."></i> 
    <div class="alert alert-warning m-t-2vh m-b-2vh fs-6 fw-normal" role="alert"><strong>Hold on!</strong> Make sure that your form is structured as follows: <ul>
    <li>The first input field (after the Email-address) <b>must</b> be the Nifty-Username.</li>
    <li>The form must be a quiz with 1 credit. 1/1 means satisfactory, 0/1 means unsatisfactory.</li></ul></div>`;
    form.classList.add('fw-light', 'fs-5', 'm-t-2vh');

    const form_form = document.createElement('div');
    form_form.innerHTML = `<div class="form-floating mb-3">
    <input type="text" value="${content===null?"":content.form}" class="form-control" id="form-title">
    <label for="form-title">Link to your form</label>
    </div>`;

    const comments = document.createElement('p');
    comments.innerHTML = '4. Comments. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Add any comments here."></i>';
    comments.classList.add('fw-light', 'fs-5');

    const comments_form = document.createElement('textarea');
    comments_form.classList.add('comments-editor');
    comments_form.style.resize = false;
    comments_form.style.height = '20vh';
    comments_form.innerHTML = content===null?"":content.comments;
    comments_form.id = 'comments_form';

    const buttons = document.createElement('div');
    buttons.classList.add('text-center', 'm-t-2vh', 'm-b-2vh');

    const cancel = document.createElement('button');
    cancel.classList.add('btn', 'btn-outline-danger', 'm-r-2vh');
    cancel.innerHTML = 'Cancel';

    buttons.append(cancel)
    element.append(info, title, title_form, desc, error_message, assignment_form, form, form_form, comments, comments_form);
    element.append(buttons);
    updateToolTips();
    tinymce.remove("#assignment_desc_form");
    tinymce.init({
        selector: '#assignment_desc_form',
        resize: false,
        plugins: 'lists link',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
        lists_indent_on_tab: true,
    });
    
    tinymce.remove("#comments_form");
    tinymce.init({
        selector: '#comments_form',
        resize: false,
        plugins: 'lists link',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist link | forecolor backcolor | outdent indent',
        lists_indent_on_tab: true,
    });

    cancel.onclick = () => {
        element.classList.add('fade-out');

        setTimeout(() => {
            element.innerHTML = '';
            element.classList.remove('fade-out');
        }, 1000);
    }   
}

function verifyTopicContents(element, course) {
    // Determine whether an assignment was created
    const assignment = document.getElementById('assignment-area').hasChildNodes();

    // Required fields
    const topicTitle = document.querySelector('#topic-title').value;
    const topicDesc = tinymce.get('topic_desc_form').getContent();
    
    // Optional fields
    const lecture = document.querySelector('#lecture-url').value;

    if (topicTitle.length < 4) return document.querySelector('#topic-title').classList.add('is-invalid');
    if (topicDesc.length < 25) return document.querySelector('#desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.'

    if (!assignment) {
        const csrftoken = getCookie('csrftoken');
        const request = new Request(
            '/API/new/topic',
            {headers: {'X-CSRFToken': csrftoken}}
        );
        fetch(request, {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({
                id: course.id,
                title: topicTitle,
                description: topicDesc,
                lecture: lecture,
                assignment: false
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                success(element, course, 'Successfully created the topic.');
            }
        });
        return;
    }
    // There is an assignment: Verify it.
    const assignmentTitle = document.querySelector('#assignment-title').value;
    const assignmentDesc = tinymce.get('assignment_desc_form').getContent();
    const form = document.querySelector('#form-title').value;
    const comments = tinymce.get('comments_form').getContent();

    if (assignmentTitle.length < 5) return document.querySelector('#assignment-title').classList.add('is-invalid');
    if (assignmentDesc.length < 5) return document.querySelector('#assignment_desc_error').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your description is too short.';
    if (form.length < 20) return document.querySelector('#assignment-title').classList.add('is-invalid');

    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        '/API/new/topic',
        {headers: {'X-CSRFToken': csrftoken}}
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            id: course.id,
            title: topicTitle,
            description: topicDesc,
            lecture: lecture,

            assignment: {
                name: assignmentTitle,
                description: assignmentDesc,
                form: form,
                comments: comments.length != 0 ? comments : null
            }
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            success(element, course, 'Successfully created the topic.');
        }
    });
    return;
    
}

function success(element, course, displayMessage) {
    successAnimation(element);
    const success_message = document.createElement('p');
    success_message.innerHTML = displayMessage;
    success_message.classList.add('text-center', 'fw-light', 'fs-4', 'fade-in')
    
    const whatsNextWrapper = document.createElement('div');
    const message = document.createElement('p');
    message.innerHTML = `What's next?`;
    message.classList.add('text-center', 'fw-light', 'fs-5');

    const buttons = document.createElement('div');
    buttons.classList.add('text-center');

    const newTopic = document.createElement('button');
    newTopic.classList.add('btn', 'btn-outline-primary', 'm-r-2vh');
    newTopic.innerHTML = 'New Topic';

    newTopic.onclick = () => {
        loadNewTopic(element, course);
    };
    
    const viewCourse = document.createElement('a');
    viewCourse.classList.add('btn', 'btn-outline-primary', 'm-r-2vh');
    viewCourse.innerHTML = 'View Course';
    viewCourse.href = `/course/${course.id}`

    buttons.append(newTopic, viewCourse)
    whatsNextWrapper.append(message, buttons);
    whatsNextWrapper.classList.add('fade-in');

    element.append(success_message);

    setTimeout(() => {
        element.append(whatsNextWrapper);
    }, 800);
    return;
}