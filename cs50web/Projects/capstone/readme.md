# Introduction
For my final project, I decided to create a web app to create courses and complete them.
The website is similar in spirit to CS50's own website.
A course is made up of different topics. If you're the creator of the course, you can add the following things to a topic
* a written lecture (description of the topic),
* a video lecture (youtube video),
* different files,
* an assignment, consisting of
    * title,
    * description,
    * comments,
    * submission-form (google form).

If you decide to add assignments to your course, the students will receive an automatically generated certificate with their name and the name of the course. The certificate will always be availiable under the url /certificate/{certificate_id}. That way, people can verify the certificate is authentic.

In order for the grading to work, students will have to submit a google form. The course creator then grades their work and decides whether the work was satisfactory or not.
If it was satisfactory, they'll grade the submission 1/1, otherwise 0/1. After that, the creator is able to import the scores to the database.

To do this, they'll have to complete the following steps:
1. download the csv file
2. visit the course they want to import the scores to under the url /course/{course_id}
3. Click **Import scores** and upload the file after selecting the assignment.

The students will always be able to see their progress of a course under the url /course/{course_id}/course_id.

Superusers will always be able to edit the course under the url /edit/{course_id}.
There, they can add topics, assignments or change already existing ones.

# Distinctiveness and Complexity
I believe that my finalproject satisfies the destinctiveness requirement as there was nothing exactly like this during cs50web. This project ties everything I've learned together and goes even further, implementing things on the backend that haven't been covered during class.
One one these things is the generation of a pdf-certificate after the course is completed.
Most contents of the website are generated dynamically using plain vanilla JavaScript.
Looking back at this now, it would have probably been smarter to choose a JavaScript Framework like React to implement this.

# Files
My project is structured as follows:
* The Django-project capstone has one app: Nifty.
* The directory capstone/c contains all the assets for the certificates, meaning the template and the font.
* The directroy captstone/certificates contains all the certificates generated.
* The directory capstone/nifty contains all the files of the nifty-app.
    * The static files of this project are sorted into two sub-directories:
        1. js
            * This directory contains all the javascript files, contained in subdirectories for every part of the website.
            * The util.js file contains functions needed throughout every file of the web-app.
            * By way of example, when visiting a course-page, the user will receive the files /static/nifty/js/course/landing/user.js and /static/nifty/js/util.js.

        2. css
            * As I've used Bootstrap for this project, there was no need for me to write a lot of css myself.
            * A couple of classes I added myself are styled in styles.css
            * The file animation.css was extracted from SweetAlert and modified by Istiak Tridip. I did not write it myself. It is responsible for animating the success-icon.
            * The subidrectory /static/nifty/css/index contains a single file called superuser.css. This file styles a couple of things on the index page.

    * The file certificate.py contains the function needed for generating the certificate.

# How to run nifty
```python3 manage.py runserver```

## Closing words
I just wanted to add this short passage to thank everyone who helped make this course the great experience it was.
Thanks to the person reading this! I really appreciate everyone's effords! I especially want to thank the people who always remained behind the scenes. Thank you! Really looking forward to taking other cs50 courses. Thanks for introducing me to Web Development!