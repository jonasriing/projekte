document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#admin-view-participants').onclick = () => {
        loadUsers(document.querySelector('#display'));
    }

    document.querySelector('#admin-import-scores').onclick = () => {
        loadImportScores(document.querySelector('#display'));
    }
});

function loadUsers(element) {
    element.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('table');

    const th = document.createElement('thead');
    const h_tr = document.createElement('tr');
    
    const number = document.createElement('th');
    number.innerHTML = '#';

    const name = document.createElement('th');
    name.innerHTML = 'Username';

    const progress = document.createElement('th');
    progress.innerHTML = 'Progress';

    const enrolled = document.createElement('th');
    enrolled.innerHTML = 'Enrolled';

    const more = document.createElement('th');
    more.innerHTML = 'View more';

    const tb = document.createElement('tbody');

    h_tr.append(number, name, progress, enrolled, more);
    th.append(h_tr);
    table.append(th, tb);

    element.append(table);

    let counter = 0;

    fetch(`/API/courses/${course_id}`)
    .then(response => response.json())
    .then(data => {
        data.course.participants.forEach(e => {
            const total_topics = data.course.topics.length;
            let completed_topics = 0;
            data.course.topics.forEach(topic => {
                if (topic.assignment == null || topic.assignment.completed.includes(e)) completed_topics++;
            });
            counter++;
            const tr = document.createElement('tr');

            const number = document.createElement('th');
            number.innerHTML = counter;

            const username = document.createElement('td');
            username.innerHTML = e;

            const user_progress = document.createElement('td');
            if (total_topics === completed_topics) user_progress.classList.add('text-success')
            user_progress.innerHTML = completed_topics === total_topics ? 'Completed' : `${completed_topics} out of ${total_topics} topics completed`;

            const user_enrolled = document.createElement('td');
            user_enrolled.innerHTML = 'Not availiable';

            const user_more = document.createElement('td');
            user_more.innerHTML = 'Not availiable';

            tr.append(number, username, user_progress, user_enrolled, user_more);
            tb.append(tr);
        });
    })
}

function loadImportScores(element) {
    element.innerHTML = '';

    const heading = document.createElement('p');
    heading.innerHTML = `1. Select the assignment you want to import scores for. <i class="fas fa-question-circle fa-xs"data-bs-toggle="tooltip" data-bs-placement="top" title="Select the topic you want to import scores for."></i>`
    heading.classList.add('fs-4', 'fw-light');

    const selectWrapper = document.createElement('div');
    selectWrapper.id = 'AssignmentRadioSelect'

    fetch(`/API/courses/${course_id}`)
    .then(response => response.json())
    .then(data => {
        if (data.course.topics.length == 0) {
            return heading.innerHTML = "This course does not have any topics yet."
        }
        data.course.topics.forEach(e => {
            if (e.assignment) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('form-check')
                wrapper.innerHTML = `<input class="form-check-input" value="${e.assignment.id}" type="radio" name="assignmentRadio">
                <label class="form-check-label fw-light">
                  ${e.assignment.name}
                </label>`
              selectWrapper.append(wrapper)
            }
        });
    })

    selectWrapper.addEventListener('change', function handler(){
        const el = document.createElement('div');
        el.innerHTML = `<div class="mb-3">
        <label for="formFile" class="m-t-2vh form-label"><div class="alert alert-warning" role="alert">
        <strong>Warning!</strong> Make sure that you're only uploading a single csv file! Open your csv file and make sure it is structured as follows:
        <ul>
        <li>The first field is a timestamp</li>
        <li>The second field is the Google-Username</li>
        <li>The third field is the <strong>total score</strong>.</li>
        <li>The fourth field is the <strong>Nifty-Username</strong>.</li>
        <li>Also, make sure that a satisfying submission has exactly <strong>1.00</strong> credits and an unsatisfying submission <strong>0.00</strong> credits!</li>
        </ul>
        </div></label>
        <input class="form-control" id="files" type="file" id="formFile">
        </div> 
        <button id="upload-file" class="btn btn-outline-success">Submit</button>`
        this.removeEventListener('change', handler);
        element.append(el);

        document.querySelector('#upload-file').onclick = () => {
            
            const formData = new FormData();
            const fileField = document.querySelector('#files');
            formData.append('file', fileField.files[0]);
    
            const csrftoken = getCookie('csrftoken');
            const request = new Request(
                `/API/read/${document.querySelector('input[name="assignmentRadio"]:checked').value}`,
                {headers: {'X-CSRFToken': csrftoken}}
            );
            fetch(request, {
                method: 'POST',
                mode: 'same-origin',
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                if (result.error) {
                    return alert(result.error);
                }
                element.innerHTML = '';
                successAnimation(element);
                const success_message = document.createElement('p');
                success_message.innerHTML = `Successfully imported the scores.`
                success_message.classList.add('text-center', 'fw-light', 'fs-4', 'fade-in')
                
                const whatsNextWrapper = document.createElement('div');
                whatsNextWrapper.classList.add('fade-in')
                const message = document.createElement('p');
                message.innerHTML = `Summary:`;
                message.classList.add('text-center', 'fw-light', 'fs-5');
                
                const sat = document.createElement('p');
                sat.innerHTML = `Satisfying submissions: ${result.sat.length}`
                sat.classList.add('text-center', 'fw-light', 'fs-6', 'text-success');
                sat.style.marginBottom = '0';
                
                const uns = document.createElement('p');
                uns.innerHTML = `Unsatisfying submissions: ${result.uns.length}`
                uns.classList.add('text-center', 'fw-light', 'fs-6');
                uns.style.marginBottom = '0';
                
                const inv = document.createElement('p');
                inv.innerHTML = `Invalid submissions: ${result.invalid.length}`
                inv.classList.add('text-center', 'fw-light', 'fs-6');

                whatsNextWrapper.append(document.createElement('hr'), message, sat, uns, inv)
                element.append(success_message);

                setTimeout(() => {
                    element.append(whatsNextWrapper);
                }, 800);

            });
        }
    });

    element.append(heading, selectWrapper);
    updateToolTips();
}