from json.decoder import JSONDecodeError
from django.db.utils import Error
from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse, FileResponse
from django.core.files.storage import default_storage
from django.urls import reverse

from .certificate import new_certificate

import json
import csv
import io
import random

from .models import *

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "nifty/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        if request.user.is_authenticated: return HttpResponseRedirect(reverse("index"))
        return render(request, "nifty/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "nifty/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "nifty/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        if request.user.is_authenticated: return HttpResponseRedirect(reverse("index"))
        return render(request, "nifty/register.html", {
            "active": False
        })


def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    return render(request, 'nifty/index.html', {
        "index": True,
    })


def course(request, id):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    try:
        course = Course.objects.get(pk=id)
    except:
        return HttpResponseRedirect(reverse("index"))

    if not request.user in course.participants.all() and not request.user.is_superuser:
        return HttpResponseRedirect(reverse("index"))

    return render(request, 'nifty/course_landing.html', {
        "course": course,
        "landing": True
    })


def edit_course(request, id):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('index'))
    try:
        course = Course.objects.get(pk=id)
    except:
        return HttpResponse("No such course")
    return render(request, 'nifty/edit_course.html', {
        "course": course,
        "edit": True
    })


def progress(request, id):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    try:
        course = Course.objects.get(pk=id)
    except:
        return HttpResponseRedirect(reverse("index"))

    if not request.user in course.participants.all() and not request.user.is_superuser:
        return HttpResponseRedirect(reverse("index"))
    
    return render(request, 'nifty/progress.html', {
        "course": course,
        "progress": True,
    })


def profile(request, username): 
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('index'))
    return render(request, "nifty/profile.html", {
        "profile": True
    })


def new(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('index'))
    return render(request, 'nifty/new.html', {
        "new": True,
    })


def enroll(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse("course", kwargs={"id": id}))
    try:
        course = Course.objects.get(pk=id)
    except:
        return HttpResponseRedirect(reverse("index"))

    if request.user in course.participants.all():
        return HttpResponseRedirect(reverse("course", kwargs={"id": id}))

    course.participants.add(request.user)
    course.save()
    return HttpResponseRedirect(reverse("course", kwargs={"id": id}))

def load_certificate(request, id):
    try:
        return FileResponse(default_storage.open(f'certificates/{id}.pdf'))
    except Exception as e:
        print (e)
        return render(request, 'nifty/invalid_certificate.html', {
            "message": "Certificate not found."
        })


# API Routes
def api_user_info(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"})
    return JsonResponse(request.user.serialize())


def api_courses_all(request, filter="all"):
    # All Courses the requesting user is a participant
    if filter == "all":
        courses = Course.objects.filter(participants__id=request.user.id)
        
        return JsonResponse({
                "courses": [course.serialize() for course in courses],
                "username": request.user.username,
            })
    # All Courses (Superuser only)
    if filter == "global_all":
        if not request.user.is_superuser:
            return HttpResponseRedirect(reverse('index'))
        courses = Course.objects.all()

        return JsonResponse({
                "courses": [course.serialize() for course in courses],
            })
    # Course with filter=id
    try:
        course = Course.objects.get(pk=int(filter))
    except:
        return JsonResponse({
            "error": "Not found."
        })
    return JsonResponse({
            "course": course.serialize(),
            "username": request.user.username,
        })


def api_new(request, filter="course"):
    if not request.user.is_authenticated:
        return JsonResponse({
            "Denied": "Access denied"
        })
    if not request.user.is_superuser:
        return JsonResponse({
            "Denied": "Access denied"
        })
    if request.method != "POST":
        return JsonResponse({
            "Denied": "Only POST requests."
        })
    if filter == "course":
        # Retrieve data from post request
        data = json.loads(request.body)
        heading = data.get("title")
        description = data.get("description")

        if not heading or not description:
            return JsonResponse({
                "error": "Missing the title or the description."
            })
        # Attempt to create the course
        try:
            course = Course(name=heading, description=description)
            course.save()
        except:
            return JsonResponse({
                "error": "Unable to create the course."
            })
        # If successful, return 'success' & the course
        return JsonResponse({
            "success": "Successfully created the course.",
            "course": course.serialize()
        })
    if filter == "topic":
        # Retrieve data from post request
        data = json.loads(request.body)
        heading = data.get("title")
        description = data.get("description")

        assignment_data = data.get("assignment")

        if assignment_data:
            try:
                assignment = Assignment(name=assignment_data["name"], description=assignment_data["description"], comments=assignment_data["comments"], form=assignment_data["form"])
                assignment.save()
            except Exception as e:
                print(e)
                return JsonResponse({
                    "error": "Unable to create assignment."
                })

        lecture = data.get("lecture")

        # Find the course 
        try:
            course = Course.objects.get(pk=data.get("id"))
        except:
            return JsonResponse({
                "error": "Invalid course"
            })

        if not lecture:
            try:
                topic = Topic(name=heading, description=description)
                topic.save()
            except Exception as e:
                return JsonResponse({
                "error": "Unable to create the topic."
                })
        else: 
            try:
                topic = Topic(name=heading, description=description, lecture=lecture)
                topic.save()
            except Exception as e:
                return JsonResponse({
                "error": "Unable to create the topic."
                })

        course.topics.add(topic)

        if assignment_data:
            topic.assignment = assignment
            topic.save()

        return JsonResponse({
            "success": "Successfully created and added the topic",
            "topic": topic.serialize()
        })
    return JsonResponse({
        "error": "Invalid filter.",
    })


def api_edit(request, filter, id):
    # Only Superuser, only POST request
    if not request.user.is_authenticated: return JsonResponse({"Denied": "Access denied"})
    if not request.user.is_superuser: return JsonResponse({"Denied": "Access denied"})
    if request.method != "POST": return JsonResponse({"Denied": "Only POST requests."})
    if not filter: return JsonResponse({"error": "Invalid request"})

    if filter == 'course':
        try:
            course = Course.objects.get(pk=id)
        except Exception as e:
            return JsonResponse({"error": "Invalid course"})

        data = json.loads(request.body)

        name = data.get('name')
        description = data.get('description')
        
        if not name or not description or len(name) < 5 or len(description) < 20: return JsonResponse({"error": "Inalid contents"})

        try:
            course.name = name
            course.description = description
            course.save()
        except Exception as e:
            print(e)
            return JsonResponse({"error": "Unable to edit the course"})
        return JsonResponse({
            "success": "Successfully edited the course",
            "course": course.serialize()
        })

    if filter == 'topic':
        try:
            topic = Topic(pk=id)
        except Exception as e:
            return JsonResponse({"error": "Invalid course"})

        data = json.loads(request.body)
        print(topic.serialize())
        print (data)

        name = data.get('name')
        topic_description = data.get('topic_description')
        lecture = data.get('lecture')
        assignment_data = data.get('assignment')

        if not name or not topic_description or len(name) < 5 or len(topic_description) < 20: return JsonResponse({"error": "Name and/or description invalud"})

        if assignment_data:
            if not assignment_data["name"] or not assignment_data["description"] or not assignment_data["form"]: return JsonResponse({"error": "Name and/or description and/or form are missing"})

            if len(assignment_data["name"]) < 5 or len(assignment_data["description"]) < 20 or len(assignment_data["form"]) < 20: return JsonResponse({"error": "Name and/or description and/or form are invalid"})
            
            if assignment_data["id"] != None:
                # Edit assignment
                try:
                    assignmentmodel = Assignment.objects.get(pk=id)
                except Exception as e:
                    print(assignment_data["id"])
                    print (e)
                    return JsonResponse({"error": "Invalid assignment"})
                try: 
                    assignmentmodel.name = assignment_data["name"]
                    assignmentmodel.description = assignment_data["description"]
                    assignmentmodel.form = assignment_data["form"]
                    assignmentmodel.comments = assignment_data["comments"]

                    assignmentmodel.save()
                except Exception as e:
                    print(e)
                    return JsonResponse({"error": "An error occured. Please contact an administrator."})
            else:
                try:
                    assignmentmodel = Assignment(name=assignment_data["name"], description=assignment_data["description"], form=assignment_data["form"], comments=assignment_data["comments"])
                    assignmentmodel.save()
                except Exception as e:
                    print(e)
                    return JsonResponse({"error": "An error occured. Please contact an administrator."})
        
        try:
            topic.name = name
            topic.description = topic_description
            topic.lecture = lecture
            if assignment_data:
                print("THIS")
                topic.assignment = assignmentmodel
            else:
                print("NO ASSIGNMENT")
                # topic.assignment = topic.assignment
            topic.save()
            print(topic.serialize())
        except Exception as e:
            print(e)
            return JsonResponse({"error": "An error occured. Please contact an administrator."})

        return JsonResponse({
            "success": "Successfully saved the topic.",
            "topic": topic.serialize()
        })


def api_read_scores(request, id):
    # Only Superuser, only POST request
    if not request.user.is_authenticated: return JsonResponse({"Denied": "Access denied"})
    if not request.user.is_superuser: return JsonResponse({"Denied": "Access denied"})
    # if request.method != "POST": return JsonResponse({"Denied": "Only POST requests."})
    
    if request.method == "GET":
        return render(request, 'nifty/file_upload.html')

    try:
        assignment = Assignment.objects.get(pk=id)
    except Exception as e:
        return JsonResponse({"error": "Invalid Assignment"})

    passed = []
    invalid = []
    not_passed = []

    csv_file = request.FILES["file"]
    decoded_file = csv_file.read().decode('utf-8')
    io_string = io.StringIO(decoded_file)
    lines = csv.reader(io_string)
    next(lines)
    for line in lines:
        try:
            successful_user = User.objects.filter(username=line[3])[0]
        except Exception as e:
            invalid.append(line[3])
            continue
        if line[2][0] == '1':
                assignment.completed.add(successful_user)
                assignment.save()
                passed.append(successful_user)
        else:
            not_passed.append(successful_user)
    
    return JsonResponse({
        "sat": [user.serialize() for user in passed],
        "uns": [user.serialize() for user in not_passed],
        "invalid": [user for user in invalid]})


def api_generate_certificate(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except:
        return JsonResponse({"error": "Invalid course"})
    
    assignments = 0

    # Check wheter user has completed the course
    for topic in course.topics.all():
       if topic.assignment != None:
           assignments += 1
           if request.user not in topic.assignment.completed.all():
               return JsonResponse({"error": "Not completed"})
    
    if assignments == 0:
        return JsonResponse({"error": "This course does not have any assignments."})

    for certificate in request.user.certificates.all():
        if certificate.course.id == course_id:
            return JsonResponse({"error": "You already have a certificate for this course.", "certificate": True})
    
    if not request.user.first_name or not request.user.last_name:
        return JsonResponse({"error": "Please update your personal data. Missing first or last name."})

    # generate a certificate-id
    id = "".join(random.choices("1234567890", k=12))
    while len(Certificate.objects.all().filter(identifier=id)) != 0:
        id = "".join(random.choices("1234567890", k=12))
    
    new_certificate(f"{request.user.first_name} {request.user.last_name}", course.name, id)

    certificate = Certificate(identifier=id, course=course)
    certificate.save()

    request.user.certificates.add(certificate)
    request.user.save()


    return JsonResponse({
        "success": "Success",
        "certificate": certificate.serialize()
        })