import json
from json.encoder import JSONEncoder

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils import tree
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html", {
            "register": True
        })


def user_info(request, name=None):
    if not name:
        if request.user.is_authenticated:
            return JsonResponse({
                "logged_in": True,
                "username": request.user.username,
                "score": request.user.score,
                "email": request.user.email,
                "following": [usr.serialize() for usr in request.user.following.all()]
            })
        return JsonResponse({
            "logged_in": False
        })
    if User.objects.filter(username=name):
        return JsonResponse({
                "exists": True,
                "username": User.objects.filter(username=name)[0].username,
                "score": User.objects.filter(username=name)[0].score,
                "email": User.objects.filter(username=name)[0].email,
                "followers": User.objects.filter(following=User.objects.filter(username=name)[0]).count(),
                "following": User.objects.filter(username=name)[0].following.count(),
                "followers_all": [usr.serialize() for usr in User.objects.filter(following=User.objects.filter(username=name)[0])]
            })
    return JsonResponse({
        "exists": False
    })

def user_page(request, name):
    if User.objects.filter(username=name):
        return render(request, "network/profile.html", {
            "username": name,
            "req_user": User.objects.filter(username=name)[0],
            "followers": User.objects.filter(following=User.objects.filter(username=name)[0]).count(),
            "following": User.objects.filter(username=name)[0].following.count(),
        })

    return render(request, "network/profile.html", {
            "error": f"User <strong>{name}</strong> not found",
            "username": name
        })

@login_required
def post_new_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")

        if len(content) > 500:
            return JsonResponse({
                "error": "Your post must not exceed 500 characters in length."
            })

        if len(content) < 5:
            return JsonResponse({
                "error": "Your post must be a minimum of five characters in length."
            })
        
        try:
            post = Post(content=content, creator=request.user)
            post.save()
        except:
            return JsonResponse({
                "error": "Unable to create post."
            })

        return JsonResponse({
                "success": "Successfully created the new post."
            })

def load_posts(request, filter=None):
    if not(request.GET.get("page")):
        page = 1
    else: 
        page = int(request.GET.get("page"))

     
    if not filter:
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        paginator = Paginator(posts, 10)
        page_obj = paginator.get_page(page)
        return JsonResponse({
            "all_posts": [post.serialize() for post in page_obj.object_list],
            "page_obj": {
                "has_next": page_obj.has_next(),
                "has_prev": page_obj.has_previous(),
                }})

    if filter == "newest-first":
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()
        paginator = Paginator(posts, 10)
        page_obj = paginator.get_page(page)
        return JsonResponse({
            "all_posts": [post.serialize() for post in page_obj.object_list],
            "page_obj": {
                "has_next": page_obj.has_next(),
                "has_prev": page_obj.has_previous(),
                }})

    if filter == "oldest-first":
        posts = Post.objects.all()
        posts = posts.order_by("timestamp").all()  
        paginator = Paginator(posts, 10)
        page_obj = paginator.get_page(page)
        return JsonResponse({
            "all_posts": [post.serialize() for post in page_obj.object_list],
            "page_obj": {
                "has_next": page_obj.has_next(),
                "has_prev": page_obj.has_previous(),
                }})
    if filter == "following":
        posts = Post.objects.filter(creator__in=request.user.following.all())
        posts = posts.order_by("-timestamp").all()  
        paginator = Paginator(posts, 10)
        page_obj = paginator.get_page(page)
        return JsonResponse({
            "all_posts": [post.serialize() for post in page_obj.object_list],
            "page_obj": {
                "has_next": page_obj.has_next(),
                "has_prev": page_obj.has_previous(),
                }})
    else:
        try:
            posts = Post.objects.filter(creator=User.objects.filter(username=filter)[0])
        except:
            return JsonResponse({"error": "Couldn't find this user."})

        posts = posts.order_by("-timestamp").all() 
        
        paginator = Paginator(posts, 10)
        page_obj = paginator.get_page(page)
        return JsonResponse({
            "all_posts": [post.serialize() for post in page_obj.object_list],
            "page_obj": {
                "has_next": page_obj.has_next(),
                "has_prev": page_obj.has_previous(),
                }})

@login_required
def follow(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        print(data.get("username"))
        try:
            followed_user = User.objects.filter(username=data.get("username"))[0]
        except:
            return JsonResponse({
                "error": "This user was not found."
            })
        
        if followed_user == request.user:
            return JsonResponse({
                "error": "You can't follow yourself."
            })

        if followed_user in request.user.following.all():
            request.user.following.remove(followed_user)
            return JsonResponse({
                "success": f"You are not following {data.get('username')} anymore."
            })
        else:
            request.user.following.add(followed_user)
            return JsonResponse({
                "success": f"Successfully followed {data.get('username')}."
            })

@login_required
def edit(request, id):
    try:
        post = Post.objects.filter(id=id)[0]
    except:
        return JsonResponse({
            "error": "An error occured. The post you're trying to edit wasnt found."
        })
    if request.method == "PUT":
        data = json.loads(request.body)
        post.edited = True
        post.content = data.get("content")
        post.save()
        return JsonResponse({
            "success": "Successfully edited the post."
        })
    pass

@login_required
def like(request, id):
    if request.method == "PUT":
        try:
            post = Post.objects.get(id=id)
        except:
            return JsonResponse({
                "error": "Unable to find this post."
            })
        
        if request.user in post.post_likes.all():
            post.post_likes.remove(request.user)
            return JsonResponse({
                "success": "You are not liking this post anymore"
            })
        else:
            post.post_likes.add(request.user)
            return JsonResponse({
                "success": "You have liked this post successfully."
            })

    return JsonResponse({
        "error": "Invalid request."
    })

def post(request, id):
    try:
        post = Post.objects.get(id=id)
    except:
        return JsonResponse({
            "error": "This post couldnt be found."
        })
    return JsonResponse({
        "post": post.serialize()
    })

@login_required
def following(request):
    return render(request, "network/following.html")