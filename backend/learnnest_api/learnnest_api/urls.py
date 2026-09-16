from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from courses.views import CourseViewSet, MaterialViewSet, AssignmentViewSet
from profiles.views import (
    signup, me, student_stats, mentor_stats,
    mentor_courses, mentor_course_detail, recommended_courses, all_mentor_courses,
    enroll_course, my_enrollments, unenroll_course, public_courses,
    course_videos, delete_video, publish_video, publish_all_videos,
    mark_video_watched, unmark_video_watched, course_progress,
    tasks, update_task,
    students_list, student_detail,
    student_course_assignments, student_course_exams,
    messages,
    exams, exam_detail, add_exam_question,
    submit_exam, exam_submissions, my_exam_submission, my_exam_attempts, all_exams,
    publish_exam, public_exams,
    mentor_submissions,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Auth
    path('api/auth/signup/', signup, name='signup'),
    path('api/auth/me/', me, name='me'),

    # Stats
    path('api/auth/student-stats/', student_stats, name='student-stats'),
    path('api/auth/mentor-stats/', mentor_stats, name='mentor-stats'),

    # Mentor courses
    path('api/auth/mentor-courses/', mentor_courses, name='mentor-courses'),
    path('api/auth/mentor-courses/<int:course_id>/', mentor_course_detail, name='mentor-course-detail'),
    path('api/auth/recommended/', recommended_courses, name='recommended'),
    path('api/auth/all-mentor-courses/', all_mentor_courses, name='all-mentor-courses'),
    path('api/auth/public-courses/', public_courses, name='public-courses'),

    # Enrollment
    path('api/auth/courses/<int:course_id>/enroll/', enroll_course, name='enroll-course'),
    path('api/auth/courses/<int:course_id>/unenroll/', unenroll_course, name='unenroll-course'),
    path('api/auth/my-enrollments/', my_enrollments, name='my-enrollments'),

    # Videos
    path('api/auth/courses/<int:course_id>/videos/', course_videos, name='course-videos'),
    path('api/auth/courses/<int:course_id>/videos/publish-all/', publish_all_videos, name='publish-all-videos'),
    path('api/auth/videos/<int:video_id>/', delete_video, name='delete-video'),
    path('api/auth/videos/<int:video_id>/publish/', publish_video, name='publish-video'),
    path('api/auth/videos/<int:video_id>/mark-watched/', mark_video_watched, name='mark-video-watched'),
    path('api/auth/videos/<int:video_id>/unmark-watched/', unmark_video_watched, name='unmark-video-watched'),
    path('api/auth/courses/<int:course_id>/progress/', course_progress, name='course-progress'),

    # Student course content
    path('api/auth/courses/<int:course_id>/my-assignments/', student_course_assignments, name='student-course-assignments'),
    path('api/auth/courses/<int:course_id>/my-exams/', student_course_exams, name='student-course-exams'),

    # Exams
    path('api/auth/courses/<int:course_id>/exams/', exams, name='exams'),
    path('api/auth/exams/', all_exams, name='all-exams'),
    path('api/auth/public-exams/', public_exams, name='public-exams'),
    path('api/auth/exams/<int:exam_id>/', exam_detail, name='exam-detail'),
    path('api/auth/exams/<int:exam_id>/questions/', add_exam_question, name='add-exam-question'),
    path('api/auth/exams/<int:exam_id>/publish/', publish_exam, name='publish-exam'),
    path('api/auth/exams/<int:exam_id>/submit/', submit_exam, name='submit-exam'),
    path('api/auth/exams/<int:exam_id>/submissions/', exam_submissions, name='exam-submissions'),
    path('api/auth/exams/<int:exam_id>/my-submission/', my_exam_submission, name='my-exam-submission'),
    path('api/auth/exams/<int:exam_id>/my-attempts/', my_exam_attempts, name='my-exam-attempts'),

    # Tasks (student view + mentor create) — existing
    path('api/auth/tasks/', tasks, name='tasks'),
    path('api/auth/tasks/<int:pk>/', update_task, name='update-task'),

    # ✅ Mentor aliases used by MentorDashboard.jsx
    path('api/auth/mentor-tasks/', tasks, name='mentor-tasks'),
    path('api/auth/mentor-tasks/<int:pk>/', update_task, name='mentor-task-detail'),   # ✅ NEW — for Edit / Delete
    path('api/auth/mentor-exams/', all_exams, name='mentor-exams'),
    path('api/auth/mentor-exams/<int:exam_id>/', exam_detail, name='mentor-exam-detail'),  # ✅ NEW — for Edit exam
    path('api/auth/mentor-submissions/', mentor_submissions, name='mentor-submissions'),
    path('api/auth/mentor-students/', students_list, name='mentor-students'),              # ✅ NEW — for Students tab

    # Students
    path('api/auth/students/', students_list, name='students-list'),
    path('api/auth/students/<int:student_id>/detail/', student_detail, name='student-detail'),

    # Messages
    path('api/auth/messages/', messages, name='messages'),
    path('api/auth/messages/<int:user_id>/', messages, name='messages-thread'),
    # ✅ Alias used by MessagesPanel in MentorDashboard.jsx
    path('api/auth/mentor-conversations/', messages, name='mentor-conversations'),

    path('api/auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)