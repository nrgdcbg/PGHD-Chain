from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class AuthUser(AbstractUser):
    USER_TYPE_CHOICES = {
        (1, 'Doctor'),
        (2, 'Patient'),
    }

    email = models.EmailField(unique = True)
    user_type = models.PositiveSmallIntegerField(choices = USER_TYPE_CHOICES, null = True)
    address = models.CharField(max_length=42, blank = True, null = True, unique= True)

class Patient(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name="p",null=True)

    def __str__(self):
        return self.user.first_name

class Doctor(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='d', null=True)

    def __str__(self):
        return self.user.first_name