from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Classroom, Material, Assignment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'title', 'scheduled_at', 'meeting_link', 'is_completed']


class MaterialSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'description', 'type', 'url',
            'duration_minutes', 'is_completed'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.completed_by.filter(id=request.user.id).exists()
        return False


class AssignmentSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'due_date',
            'max_score', 'status', 'status_label', 'is_completed'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.completed_by.filter(id=request.user.id).exists()
        return False

    def get_status_label(self, obj):
        labels = {
            'pending': 'Pending',
            'submitted': 'Submitted',
            'evaluated': 'Evaluated',
        }
        return labels.get(obj.status, obj.status)


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view."""
    total_materials = serializers.SerializerMethodField()
    completed_materials = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'image',
            'faculty_name', 'total_materials', 'completed_materials',
            'progress_percent'
        ]

    def get_faculty_name(self, obj):
        if obj.faculty:
            return obj.faculty.get_full_name() or obj.faculty.username
        return None

    def get_total_materials(self, obj):
        return obj.materials.count()

    def get_completed_materials(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.materials.filter(completed_by=request.user).count()
        return 0

    def get_progress_percent(self, obj):
        total = obj.materials.count()
        if total == 0:
            return 0
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            completed = obj.materials.filter(completed_by=request.user).count()
            return round((completed / total) * 100)
        return 0


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full detail with nested data."""
    materials = MaterialSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    classrooms = ClassroomSerializer(many=True, read_only=True)
    faculty = UserSerializer(read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'image',
            'faculty', 'materials', 'assignments',
            'classrooms', 'progress_percent'
        ]

    def get_progress_percent(self, obj):
        total = obj.materials.count()
        if total == 0:
            return 0
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            completed = obj.materials.filter(completed_by=request.user).count()
            return round((completed / total) * 100)
        return 0