from django.db import models
from django.contrib.auth.models import User


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)
    faculty = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses_taught'
    )
    students = models.ManyToManyField(
        User,
        related_name='courses_enrolled',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Classroom(models.Model):
    """Represents a classroom/live class session."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='classrooms')
    title = models.CharField(max_length=200)
    scheduled_at = models.DateTimeField()
    meeting_link = models.URLField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Material(models.Model):
    TYPE_CHOICES = [
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('link', 'Link'),
        ('doc', 'Document'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    url = models.URLField()
    duration_minutes = models.IntegerField(default=0)
    completed_by = models.ManyToManyField(
        User,
        related_name='completed_materials',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Assignment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('evaluated', 'Evaluated'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    max_score = models.IntegerField(default=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completed_by = models.ManyToManyField(
        User,
        related_name='completed_assignments',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return self.title