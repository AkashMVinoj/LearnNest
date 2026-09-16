from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


ROLE_CHOICES = [
    ('student', 'Student'),
    ('mentor', 'Mentor'),
    ('admin', 'Admin'),
]


# ============================================
# PROFILE
# ============================================
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True)
    expertise = models.CharField(max_length=255, blank=True)
    interests = models.TextField(blank=True, help_text='Courses the student wants to study')
    teaching_subjects = models.TextField(blank=True, help_text='Courses the mentor wants to teach')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


# ============================================
# MENTOR COURSE
# ============================================
class MentorCourse(models.Model):
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_courses')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    image = models.URLField(blank=True, null=True)
    image_file = models.ImageField(upload_to='course_covers/', blank=True, null=True)
    duration_weeks = models.IntegerField(default=4)
    price = models.CharField(max_length=50, blank=True, default='Free')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.mentor.username}"


# ============================================
# COURSE VIDEO
# ============================================
class CourseVideo(models.Model):
    course = models.ForeignKey(MentorCourse, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='course_videos/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    duration_minutes = models.IntegerField(default=0)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.course.title})"


# ============================================
# ENROLLMENT
# ============================================
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(MentorCourse, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"


# ============================================
# VIDEO PROGRESS
# ============================================
class VideoProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(CourseVideo, on_delete=models.CASCADE, related_name='progress_records')
    watched_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'video')
        ordering = ['-watched_at']

    def __str__(self):
        return f"{self.student.username} -> {self.video.title} ({self.watched_seconds}s)"


# ============================================
# TASK
# ============================================
class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks_assigned')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks_received')
    video = models.ForeignKey(
        CourseVideo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submission = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    grade = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.student.username}"


# ============================================
# MESSAGE
# ============================================
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}"


# ============================================
# EXAM
# ============================================
class Exam(models.Model):
    course = models.ForeignKey(MentorCourse, on_delete=models.CASCADE, related_name='exams')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams_created')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=30)
    total_marks = models.IntegerField(default=100)
    due_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)   # ← ADDED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.course.title})"


class ExamQuestion(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
    )
    marks = models.IntegerField(default=10)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q: {self.question_text[:50]}"


class ExamSubmission(models.Model):
    """A student's attempt at an exam. Multiple attempts allowed."""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_submissions')
    attempt_number = models.IntegerField(default=1)
    answers = models.JSONField(default=dict)
    score = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} -> {self.exam.title} (Attempt {self.attempt_number})"


# ============================================
# SIGNAL
# ============================================
@receiver(post_save, sender=User)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()