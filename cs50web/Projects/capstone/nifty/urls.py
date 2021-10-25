from django.urls import path

from . import views

urlpatterns = [
    # Default routes
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Course routes
    path("course/<int:id>", views.course, name="course"),
    path("enroll/<int:id>", views.enroll, name="enroll"),
    path("course/<int:id>/progress", views.progress, name="progress"),
    path("edit/course/<int:id>", views.edit_course, name="edit"),
    path("new", views.new, name="new"),

    # Other routes
    path("user/<str:username>", views.profile, name="profile"),
    path("certificate/<int:id>", views.load_certificate, name="load_certificate"),

    # API routes
    path("API/user", views.api_user_info, name="API_user_info"),
    path("API/courses/<str:filter>", views.api_courses_all, name="API_courses_all"),
    path("API/new/<str:filter>", views.api_new, name="API_new"),
    path("API/edit/<str:filter>/<int:id>", views.api_edit, name="API_edit"),
    path("API/read/<int:id>", views.api_read_scores, name="API_read"),
    path("API/certificate/<int:course_id>", views.api_generate_certificate, name="API_generate_certificate"),
]