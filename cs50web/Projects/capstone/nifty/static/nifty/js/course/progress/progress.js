const course_id = parseInt(document.querySelector('#course_id').innerHTML);

fetch(`/API/courses/${course_id}`)
.then(response => response.json())
.then(data => {
    if (!data.course.participants.includes(data.username)) return document.querySelector('.status').innerHTML = "<strong>Not enrolled.</strong>";;

    const total_topics = data.course.topics.length;
    let completed_topics = 0;

    if (total_topics == 0) return document.querySelector('.status').innerHTML = "<strong>This course does not have any topics.</strong>";
    
    data.course.topics.forEach(element => {
        const wrapper = document.createElement('li');
        const heading = document.createElement('strong')
        heading.innerHTML = `<strong>${element.name}</strong>`;
        const desc = document.createElement('p');
        if (!element.assignment) {
            completed_topics++;
            heading.style.color = "green";
            desc.innerHTML = "You have completed this topic."
        } else if (element.assignment.completed.includes(data.username)) {
            completed_topics++;
            heading.style.color = "green";
            desc.innerHTML = "You have completed this topic."
        } else if (element.assignment.submitted.includes(data.username)) {
            desc.innerHTML = "You have submitted the assignment for this topic. It might take a couple of days until it's graded."
        } else {
            desc.innerHTML = "Submit the assignment of this topic in order for the topic to be marked completed."
        }  
        wrapper.append(heading, desc)
        document.querySelector('#topics').append(wrapper)
    });
    const progress = completed_topics / total_topics * 100;
    document.querySelector('#progress-bar').setAttribute("style",`width:${progress}%`);

    if (completed_topics === total_topics) {
        // The user has completed the course
        const alert = document.createElement('div');
        alert.id = 'course-finished';
        alert.classList.add('alert', 'fs-6', 'fw-normal', 'alert-success');
        alert.innerHTML = `<strong>Congratulations!</strong> You have completed this course.`
        
        // Check whether the user has a certificate
        fetch(`/API/user`)
        .then(response => response.json())
        .then(info => {
            info.certificates.forEach(element => {
                if (element.course.id === course_id) {
                    // The user has a certificate
                    const viewCertificate = document.createElement('div');
                    viewCertificate.classList.add('viewCertificate')
                    viewCertificate.innerHTML = `View your certificate <a href="/certificate/${element.identifier}">here</a>.`;
                    alert.append(viewCertificate);
                    return;
                }
            })
            // The user has no certificate
            if (document.querySelectorAll('.viewCertificate').length === 0) {
                console.log(document.querySelectorAll('.viewCertificate').length)
                const createCertificate = document.createElement('div');
                createCertificate.innerHTML = `Claim your certificate <span class="link-primary a" onclick="generateCertificate()"><u>here</u></span>.`;
                alert.append(createCertificate);
            }
        })
        document.querySelector('.status').append(alert);
    } else {
        document.querySelector('.status').innerHTML = `<strong>You have completed ${completed_topics} out of ${total_topics} topics.</strong>`
    }
}) 

function generateCertificate() {
    const loading = document.createElement('div');
    loading.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    document.getElementById('course-finished').innerHTML = '';
    loading.innerHTML = `<div class="spinner-border text-success" role="status">
    <span class="sr-only">Loading...</span>
    </div><div class="m-l-2vh">Generating your certificate...</div>`;
    
    document.getElementById('course-finished').append(loading);
    
    fetch(`/API/certificate/${course_id}`)
    .then(response => response.json())
    .then(info => {
        if (info.success) {
            document.getElementById('course-finished').innerHTML = '';
            const viewCertificate = document.createElement('div');
            viewCertificate.classList.add('viewCertificate')
            viewCertificate.innerHTML = `<strong>Success!</strong> View your certificate <a href="/certificate/${info.certificate.identifier}">here</a>.`;
            document.getElementById('course-finished').append(viewCertificate);
        } else {
            document.getElementById('course-finished').innerHTML = '';
            document.getElementById('course-finished').classList.replace('alert-success', 'alert-danger');
            const viewCertificate = document.createElement('div');
            viewCertificate.classList.add('viewCertificate')
            viewCertificate.innerHTML = `<strong>Error!</strong> ${info.error}`;
            document.getElementById('course-finished').append(viewCertificate);
        }
    })
}