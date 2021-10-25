/* This file is only availiable to superuser */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#admin-view-button').onclick = () => {
        loadAdminView();
    };
});

function loadAdminView() {
    const contents = document.querySelector('#contents');
    contents.innerHTML = '';

    const wrapper = document.createElement('div');
    const heading = document.createElement('h3');
    heading.innerHTML = 'Admin Tools';

    const subtitle = document.createElement('p');
    subtitle.innerHTML = 'What do you want to do?';

    const allCourses = document.createElement('button');
    allCourses.innerHTML = 'All Courses';
    allCourses.classList.add('btn', 'btn-outline-secondary', 'm-r-2vh')
    
    const createCourse = document.createElement('a');
    createCourse.href = '/new';
    createCourse.innerHTML = 'Create Course';
    createCourse.classList.add('btn', 'btn-outline-secondary', 'm-r-2vh')
    
    const editCourse = document.createElement('button');
    editCourse.innerHTML = 'Edit Course';
    editCourse.classList.add('btn', 'btn-outline-secondary', 'm-r-2vh')
    
    const content = document.createElement('div');
    content.id = 'admin-inner-contents'
    
    allCourses.onclick = () => {
        loadCourses(content);
    };

    editCourse.onclick = () => {
        loadEditView(content);
    };

    wrapper.append(heading, subtitle, allCourses, createCourse, editCourse, content);

    contents.append(wrapper);
}

function loadCourses(wrapper) {
    wrapper.innerHTML = '';
    fetch(`/API/courses/global_all`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.courses.length == 0) {
            const noCourses = document.createElement('p');
            noCourses.innerHTML = 'You have no courses.';
            wrapper.append(noCourses)
        } else {
            data.courses.forEach(element => {
                const courseWrapper = document.createElement('div');
                courseWrapper.classList.add('admin-course-wrapper');
                
                const heading = document.createElement('h3');
                heading.innerHTML = element.name;
                heading.classList.add('admin-course-title');

                const description = document.createElement('p');
                description.innerHTML = element.description;
                description.classList.add('admin-course-description');

                const information = document.createElement('p');
                information.innerHTML = `<i class="fas fa-book"></i> ${element.topics.length} <i class="fas fa-user"></i> ${element.participants.length} ID: ${element.id}`;
                information.classList.add('text-muted');

                courseWrapper.append(heading, description, information);
                wrapper.append(courseWrapper);
            });
        }
        
    }) 
}

function loadEditView(wrapper) {
    wrapper.innerHTML = '<h3>Select the course you want to edit:</h3>';
    fetch(`/API/courses/global_all`)
    .then(response => response.json())
    .then(data => {
        data.courses.forEach(element => {
            const courseWrapper = document.createElement('div');
            const a = document.createElement('a');
            courseWrapper.classList.add('admin-edit-select-wrapper');
            a.href = `edit/course/${element.id}`;


            const heading = document.createElement('h3');
            heading.innerHTML = element.name;
            heading.classList.add('admin-edit-select-title');

            const information = document.createElement('p');
            information.innerHTML = `<i class="fas fa-book"></i> ${element.topics.length} <i class="fas fa-user"></i> ${element.participants.length}`;
            information.classList.add('text-muted');

            a.append(heading, information);
            courseWrapper.append(a);
            wrapper.append(courseWrapper);
        });
    });
}