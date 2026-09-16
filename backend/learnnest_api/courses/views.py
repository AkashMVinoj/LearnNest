from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Course, Material, Assignment
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    MaterialSerializer,
    AssignmentSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only courses the logged-in student is enrolled in
        return Course.objects.filter(students=self.request.user).prefetch_related(
            'materials', 'assignments', 'classrooms'
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MaterialSerializer

    def get_queryset(self):
        # Only materials in courses the student is enrolled in
        return Material.objects.filter(course__students=self.request.user)

    @action(detail=True, methods=['post'], url_path='toggle-complete')
    def toggle_complete(self, request, pk=None):
        material = self.get_object()
        user = request.user

        if material.completed_by.filter(id=user.id).exists():
            material.completed_by.remove(user)
            return Response({
                'status': 'unmarked',
                'is_completed': False
            })
        else:
            material.completed_by.add(user)
            return Response({
                'status': 'completed',
                'is_completed': True
            })


class AssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.filter(course__students=self.request.user)

    @action(detail=True, methods=['post'], url_path='toggle-complete')
    def toggle_complete(self, request, pk=None):
        assignment = self.get_object()
        user = request.user

        if assignment.completed_by.filter(id=user.id).exists():
            assignment.completed_by.remove(user)
            return Response({'status': 'unmarked', 'is_completed': False})
        else:
            assignment.completed_by.add(user)
            return Response({'status': 'completed', 'is_completed': True})