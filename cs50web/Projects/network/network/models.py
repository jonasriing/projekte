from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE


class User(AbstractUser):
    following = models.ManyToManyField('User', blank=True)
    score = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.username}"

    def serialize(self):
        return {
            "username": self.username,
            "email": self.email,
        }

class Post(models.Model):
    content = models.TextField(max_length=500)
    creator = models.ForeignKey('User', on_delete=CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    post_likes = models.ManyToManyField('User', blank=True, related_name='post_likes')
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.content}"

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "likes": [like.username for like in self.post_likes.all()],
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "edited": self.edited
        }