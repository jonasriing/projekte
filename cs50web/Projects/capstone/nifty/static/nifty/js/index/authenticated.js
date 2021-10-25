/* This js file is only availiable to authenticated users */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#course-view-button').onclick = () => {
        loadCourseView();
    };
});

function loadCourseView() {
    const contents = document.querySelector('#contents');
    contents.innerHTML = '';

    const wrapper = document.createElement('div');
    const heading = document.createElement('h3');
    heading.innerHTML = 'Your Courses';

    wrapper.append(heading)

    fetch(`/API/courses/all`)
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
                const heading = document.createElement('h3');
                heading.innerHTML = element.name;

                const description = document.createElement('p');
                description.innerHTML = element.description;

                courseWrapper.append(heading, description);
                wrapper.append(courseWrapper);
            });
        }
        
    })
    contents.append(wrapper);
}