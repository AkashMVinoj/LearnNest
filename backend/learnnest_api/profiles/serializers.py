from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, MentorCourse, CourseVideo, Task, Message,
    Enrollment, VideoProgress,
    Exam, ExamQuestion, ExamSubmission,
)


# ============================================
# SIGNUP
# ============================================
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['student', 'mentor'])
    expertise = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.CharField(required=False, allow_blank=True)
    teaching_subjects = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'expertise', 'bio', 'interests', 'teaching_subjects', 'avatar'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        expertise = validated_data.pop('expertise', '')
        bio = validated_data.pop('bio', '')
        interests = validated_data.pop('interests', '')
        teaching_subjects = validated_data.pop('teaching_subjects', '')
        avatar = validated_data.pop('avatar', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        user.profile.role = role
        user.profile.expertise = expertise
        user.profile.bio = bio
        user.profile.interests = interests
        user.profile.teaching_subjects = teaching_subjects
        user.profile.avatar = avatar or None
        user.profile.save()

        return user


# ============================================
# PROFILE
# ============================================
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'username', 'email', 'first_name', 'last_name', 'role',
            'bio', 'expertise', 'interests', 'teaching_subjects',
            'phone', 'avatar'
        ]


# ============================================
# MENTOR COURSE — now includes student_count
# ============================================
class MentorCourseSerializer(serializers.ModelSerializer):
    mentor_name = serializers.SerializerMethodField()
    mentor_avatar = serializers.SerializerMethodField()
    mentor_id = serializers.IntegerField(source='mentor.id', read_only=True)
    display_image = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()   # ✅ NEW

    class Meta:
        model = MentorCourse
        fields = [
            'id', 'title', 'description', 'category', 'image', 'image_file',
            'display_image', 'duration_weeks', 'price', 'created_at',
            'mentor_name', 'mentor_avatar', 'mentor_id',
            'student_count',   # ✅ NEW
        ]
        extra_kwargs = {
            'image_file': {'write_only': True, 'required': False},
            'image': {'required': False},
        }

    def get_display_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image or None

    def get_mentor_name(self, obj):
        full = f"{obj.mentor.first_name} {obj.mentor.last_name}".strip()
        return full or obj.mentor.username

    def get_mentor_avatar(self, obj):
        try:
            return obj.mentor.profile.avatar
        except Exception:
            return None

    def get_student_count(self, obj):
        """Number of distinct students enrolled in this course."""
        return obj.enrollments.values('student').distinct().count()


# ============================================
# COURSE VIDEO — with is_published
# ============================================
class CourseVideoSerializer(serializers.ModelSerializer):
    display_video = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseVideo
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'video_file', 'video_url', 'display_video',
            'duration_minutes', 'order', 'is_published', 'created_at'
        ]
        read_only_fields = ['course', 'created_at']
        extra_kwargs = {
            'video_file': {'write_only': True, 'required': False},
            'video_url': {'required': False},
            'is_published': {'required': False},
        }

    def get_display_video(self, obj):
        if obj.video_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return obj.video_url or None


# ============================================
# TASK — full rewrite for course-wide tasks
# ============================================
class TaskSerializer(serializers.ModelSerializer):
    mentor_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    video_title = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'due_date', 'priority', 'status',
            'submission', 'feedback', 'grade', 'max_score', 'created_at',
            'mentor', 'student', 'video', 'course',
            'mentor_name', 'student_name', 'video_title', 'course_title',
        ]
        read_only_fields = ['mentor', 'created_at']
        extra_kwargs = {
            'student': {'required': False, 'allow_null': True},
            'course':  {'required': False, 'allow_null': True},
            'video':   {'required': False, 'allow_null': True},
            'due_date':{'required': False, 'allow_null': True},
            'max_score': {'required': False},
            'priority': {'required': False},
            'status': {'required': False},
            'submission': {'required': False, 'allow_blank': True},
            'feedback': {'required': False, 'allow_blank': True},
            'grade': {'required': False, 'allow_blank': True},
        }

    def get_mentor_name(self, obj):
        if not obj.mentor:
            return None
        full = f"{obj.mentor.first_name} {obj.mentor.last_name}".strip()
        return full or obj.mentor.username

    def get_student_name(self, obj):
        if not obj.student:
            return None
        full = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return full or obj.student.username

    def get_video_title(self, obj):
        return obj.video.title if obj.video else None

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None


# ============================================
# MESSAGE
# ============================================
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'content', 'sender', 'recipient', 'is_read',
            'created_at', 'sender_name', 'sender_avatar'
        ]
        read_only_fields = ['sender', 'created_at']

    def get_sender_name(self, obj):
        full = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        return full or obj.sender.username

    def get_sender_avatar(self, obj):
        try:
            return obj.sender.profile.avatar
        except Exception:
            return None


# ============================================
# ENROLLMENT
# ============================================
class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = MentorCourseSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_details', 'enrolled_at', 'progress']
        read_only_fields = ['student', 'enrolled_at', 'progress']


# ============================================
# VIDEO PROGRESS
# ============================================
class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['id', 'video', 'watched_seconds', 'completed', 'watched_at']
        read_only_fields = ['watched_at']


# ============================================
# EXAM
# ============================================
class ExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = [
            'id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
            'marks', 'order'
        ]


class ExamQuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = [
            'id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
            'correct_option', 'marks', 'order'
        ]


class ExamSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(read_only=True)
    course_title = serializers.SerializerMethodField()
    questions = ExamQuestionSerializer(many=True, read_only=True)
    submission_count = serializers.SerializerMethodField()
    my_submission_id = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'duration_minutes', 'total_marks', 'date', 'due_date', 'created_at',
            'is_published',
            'questions', 'submission_count', 'my_submission_id'
        ]
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': False, 'allow_blank': True},
            'duration_minutes': {'required': False},
            'total_marks': {'required': False},
            'date': {'required': False, 'allow_null': True},
            'due_date': {'required': False, 'allow_null': True},
            'is_published': {'required': False},
        }

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_my_submission_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            sub = obj.submissions.filter(student=request.user).first()
            return sub.id if sub else None
        return None


class ExamSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_avatar = serializers.SerializerMethodField()
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    total_marks = serializers.IntegerField(source='exam.total_marks', read_only=True)

    class Meta:
        model = ExamSubmission
        fields = [
            'id', 'exam', 'exam_title', 'total_marks', 'student',
            'student_name', 'student_avatar',
            'answers', 'score', 'passed', 'attempt_number', 'submitted_at',
        ]
        read_only_fields = ['student', 'score', 'submitted_at', 'attempt_number', 'passed']

    def get_student_name(self, obj):
        full = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return full or obj.student.username

    def get_student_avatar(self, obj):
        try:
            return obj.student.profile.avatar
        except Exception:
            return None