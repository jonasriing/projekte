from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE

class User(AbstractUser):

    certificates = models.ManyToManyField('Certificate', blank=True, related_name='certificates')

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "certificates": [certificate.serialize() for certificate in self.certificates.all()]
        }
    


class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, blank=True)

    participants = models.ManyToManyField('User', blank=True, related_name='participants')
    topics = models.ManyToManyField('Topic', blank=True, related_name='topics')

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "participants": [participant.username for participant in self.participants.all()],
            "topics": [topic.serialize() for topic in self.topics.all()],
        }


class Topic(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, blank=True)

    assignment = models.ForeignKey('Assignment', blank=True, null=True, on_delete=CASCADE)

    lecture = models.CharField(max_length=1000, blank=True, null=True)

    files = models.ManyToManyField('File', blank=True, related_name="files")

    def __str__(self):
        return self.name

    def serialize(self):
        if self.assignment:
            return {
                "id": self.id,
                "name": self.name,
                "description": self.description,
                "assignment": self.assignment.serialize(),
                "lecture": self.lecture,
                "files": [file.serialize() for file in self.files.all()]
            }
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "assignment": None,
            "lecture": self.lecture,
            "files": [file.serialize() for file in self.files.all()]
        }


class Assignment(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, blank=True)

    submitted = models.ManyToManyField('User', blank=True, related_name='submitted')
    completed = models.ManyToManyField('User', blank=True, related_name='completed')

    comments = models.CharField(max_length=1000, blank=True, null=True)
    form = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "submitted": [user.username for user in self.submitted.all()],
            "completed": [user.username for user in self.completed.all()],
            "comments": self.comments,
            "form": self.form
        }


class File(models.Model):
    name = models.CharField(max_length=100)
    path = models.CharField(max_length=1000)

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
        }


class Certificate(models.Model):
    identifier = models.IntegerField()
    course = models.ForeignKey('Course', blank=True, null=True, on_delete=CASCADE)

    def serialize(self):
        return {
            "id": self.id,
            "identifier": self.identifier,
            "course": self.course.serialize()
        }


    def __str__(self):
        return f"{self.identifier}: {self.course.name}"