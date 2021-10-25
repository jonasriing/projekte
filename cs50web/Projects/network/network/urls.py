
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:name>", views.user_page, name="user_page"),
    path("following", views.following, name="following"),

    # API Routes
    path("API/user", views.user_info, name="user_info"),
    path("API/user/<str:name>", views.user_info, name="user_info"),
    path("API/post", views.post_new_post, name="post_new_post"),
    path("API/load/<str:filter>", views.load_posts, name="load_posts"),
    path("API/edit/<int:id>", views.edit, name="edit"),
    path("API/like/<int:id>", views.like, name="like"),
    path("API/follow", views.follow, name="follow"),
    path("API/post/<int:id>", views.post, name="post"),
]
