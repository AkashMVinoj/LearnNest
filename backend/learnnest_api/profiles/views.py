from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    SignupSerializer, ProfileSerializer, MentorCourseSerializer,
    TaskSerializer, MessageSerializer, CourseVideoSerializer,
    EnrollmentSerializer, VideoProgressSerializer,
    ExamSerializer, ExamQuestionSerializer, ExamQuestionAnswerSerializer,
    ExamSubmissionSerializer,
)
from .models import (
    MentorCourse, CourseVideo, Task, Message, Enrollment, VideoProgress,
    Exam, ExamQuestion, ExamSubmission,
)


# ============================================
# SIGNUP
# ============================================
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "role": user.profile.role,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# CURRENT USER
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(ProfileSerializer(request.user.profile).data)


# ============================================
# STATS
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_stats(request):
    if request.user.profile.role != "student":
        return Response({"error": "Only students."}, status=403)

    enrollments = Enrollment.objects.filter(student=request.user)
    total_courses = enrollments.count()

    avg_progress = 0
    if total_courses > 0:
        avg_progress = round(sum(e.progress for e in enrollments) / total_courses)

    completed_videos = VideoProgress.objects.filter(
        student=request.user,
        completed=True,
    ).count()

    completed_tasks = Task.objects.filter(
        student=request.user,
        status="completed",
    ).count()

    return Response({
        "enrolled_courses": total_courses,
        "average_progress": avg_progress,
        "items_completed": completed_videos + completed_tasks,
        "completed_videos": completed_videos,
        "completed_tasks": completed_tasks,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_stats(request):
    if request.user.profile.role != "mentor":
        return Response({"error": "Only mentors."}, status=403)

    total_courses = MentorCourse.objects.filter(mentor=request.user).count()

    student_ids = Enrollment.objects.filter(
        course__mentor=request.user,
    ).values_list("student_id", flat=True).distinct()
    active_students = len(set(student_ids))

    pending_reviews = Task.objects.filter(
        mentor=request.user,
        status="submitted",
    ).count()

    return Response({
        "courses_registered": total_courses,
        "active_students": active_students,
        "pending_reviews": pending_reviews,
    })


# ============================================
# MENTOR COURSES
# ============================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def mentor_courses(request):
    if request.user.profile.role != "mentor":
        return Response({"error": "Only mentors."}, status=403)

    if request.method == "GET":
        qs = MentorCourse.objects.filter(mentor=request.user)
        return Response(
            MentorCourseSerializer(qs, many=True, context={"request": request}).data
        )

    serializer = MentorCourseSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(mentor=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def mentor_course_detail(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    if request.user != course.mentor:
        return Response({"error": "Not allowed."}, status=403)

    if request.method == "DELETE":
        course.delete()
        return Response({"status": "deleted"}, status=204)

    serializer = MentorCourseSerializer(
        course, data=request.data, partial=True, context={"request": request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# ============================================
# PUBLIC / RECOMMENDED COURSES
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_courses(request):
    try:
        profile = request.user.profile
    except Exception:
        return Response([])

    all_courses = MentorCourse.objects.select_related("mentor", "mentor__profile").all()

    if profile.role == "student" and profile.interests:
        interests = [i.strip().lower() for i in profile.interests.split(",") if i.strip()]
        matched = [
            c for c in all_courses
            if any(
                interest in c.title.lower() or interest in (c.category or "").lower()
                for interest in interests
            )
        ]
        if len(matched) < 3:
            seen_ids = {c.id for c in matched}
            for c in all_courses:
                if c.id not in seen_ids:
                    matched.append(c)
                if len(matched) >= 6:
                    break
        return Response(
            MentorCourseSerializer(matched[:6], many=True, context={"request": request}).data
        )

    return Response(
        MentorCourseSerializer(all_courses[:6], many=True, context={"request": request}).data
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def all_mentor_courses(request):
    courses = MentorCourse.objects.select_related("mentor", "mentor__profile")[:24]
    return Response(
        MentorCourseSerializer(courses, many=True, context={"request": request}).data
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def public_courses(request):
    courses = MentorCourse.objects.select_related("mentor", "mentor__profile").all()
    return Response(
        MentorCourseSerializer(courses, many=True, context={"request": request}).data
    )


# ============================================
# ENROLLMENT
# ============================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    if request.user.profile.role != "student":
        return Response(
            {"error": "Only students can enroll in courses."},
            status=403,
        )

    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    enrollment, created = Enrollment.objects.get_or_create(
        student=request.user,
        course=course,
    )

    if not created:
        return Response({"error": "Already enrolled."}, status=400)

    return Response(
        EnrollmentSerializer(enrollment, context={"request": request}).data,
        status=201
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_enrollments(request):
    if request.user.profile.role != "student":
        return Response([])

    enrollments = Enrollment.objects.filter(student=request.user).select_related("course")
    return Response(
        EnrollmentSerializer(enrollments, many=True, context={"request": request}).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unenroll_course(request, course_id):
    try:
        enrollment = Enrollment.objects.get(
            student=request.user,
            course_id=course_id,
        )
    except Enrollment.DoesNotExist:
        return Response({"error": "Not enrolled."}, status=404)

    enrollment.delete()
    return Response({"status": "unenrolled"}, status=204)


# ============================================
# COURSE VIDEOS
# ============================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def course_videos(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    if request.method == "GET":
        if request.user == course.mentor:
            videos = CourseVideo.objects.filter(course=course)
        else:
            videos = CourseVideo.objects.filter(course=course, is_published=True)
        return Response(
            CourseVideoSerializer(videos, many=True, context={"request": request}).data
        )

    if request.user != course.mentor:
        return Response({"error": "Only the course owner can add videos."}, status=403)

    serializer = CourseVideoSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_video(request, video_id):
    try:
        video = CourseVideo.objects.get(pk=video_id)
    except CourseVideo.DoesNotExist:
        return Response({"error": "Video not found."}, status=404)

    if request.user != video.course.mentor:
        return Response({"error": "Not allowed."}, status=403)

    video.delete()
    return Response({"status": "deleted"}, status=204)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publish_video(request, video_id):
    try:
        video = CourseVideo.objects.get(pk=video_id)
    except CourseVideo.DoesNotExist:
        return Response({"error": "Video not found."}, status=404)

    if request.user != video.course.mentor:
        return Response({"error": "Not allowed."}, status=403)

    publish = request.data.get("is_published", True)
    video.is_published = bool(publish)
    video.save()

    return Response({
        "id": video.id,
        "is_published": video.is_published,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publish_all_videos(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    if request.user != course.mentor:
        return Response({"error": "Not allowed."}, status=403)

    publish = request.data.get("is_published", True)
    count = CourseVideo.objects.filter(course=course).update(is_published=bool(publish))

    return Response({
        "status": "published" if publish else "unpublished",
        "affected_count": count,
    })


# ============================================
# VIDEO PROGRESS
# ============================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_video_watched(request, video_id):
    if request.user.profile.role != "student":
        return Response({"error": "Only students."}, status=403)

    try:
        video = CourseVideo.objects.get(pk=video_id)
    except CourseVideo.DoesNotExist:
        return Response({"error": "Video not found."}, status=404)

    enrollment = Enrollment.objects.filter(
        student=request.user,
        course=video.course,
    ).first()

    if not enrollment:
        return Response({"error": "Not enrolled."}, status=403)

    progress, _ = VideoProgress.objects.get_or_create(
        student=request.user,
        video=video,
    )
    progress.watched_seconds = (video.duration_minutes or 1) * 60
    progress.completed = True
    progress.save()

    total_videos = CourseVideo.objects.filter(course=video.course).count()
    completed_count = VideoProgress.objects.filter(
        student=request.user,
        video__course=video.course,
        completed=True,
    ).count()

    progress_percent = round((completed_count / total_videos) * 100) if total_videos > 0 else 0

    enrollment.progress = progress_percent
    enrollment.save()

    return Response({
        "video_completed": True,
        "watched_seconds": progress.watched_seconds,
        "completed_count": completed_count,
        "total_videos": total_videos,
        "progress_percent": progress_percent,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unmark_video_watched(request, video_id):
    try:
        progress = VideoProgress.objects.get(
            student=request.user,
            video_id=video_id,
        )
    except VideoProgress.DoesNotExist:
        return Response({"error": "Not marked."}, status=404)

    video = progress.video
    progress.delete()

    total_videos = CourseVideo.objects.filter(course=video.course).count()
    completed_count = VideoProgress.objects.filter(
        student=request.user,
        video__course=video.course,
        completed=True,
    ).count()

    progress_percent = round((completed_count / total_videos) * 100) if total_videos > 0 else 0

    enrollment = Enrollment.objects.get(student=request.user, course=video.course)
    enrollment.progress = progress_percent
    enrollment.save()

    return Response({
        "video_completed": False,
        "completed_count": completed_count,
        "total_videos": total_videos,
        "progress_percent": progress_percent,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    try:
        enrollment = Enrollment.objects.get(
            student=request.user,
            course_id=course_id,
        )
    except Enrollment.DoesNotExist:
        return Response({"error": "Not enrolled."}, status=404)

    records = VideoProgress.objects.filter(
        student=request.user,
        video__course_id=course_id,
    )

    progress_map = {
        r.video_id: {
            "watched_seconds": r.watched_seconds,
            "completed": r.completed,
        }
        for r in records
    }

    return Response({
        "progress_map": progress_map,
        "completed_video_ids": [r.video_id for r in records if r.completed],
        "progress_percent": enrollment.progress,
    })


# ============================================
# TASKS
# ============================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def tasks(request):
    user = request.user

    if request.method == "GET":
        if user.profile.role == "mentor":
            qs = Task.objects.filter(mentor=user)
        else:
            qs = Task.objects.filter(student=user)
        return Response(TaskSerializer(qs, many=True).data)

    if user.profile.role != "mentor":
        return Response({"error": "Only mentors can create tasks."}, status=403)

    course_id = request.data.get("course")
    explicit_student_id = request.data.get("student")

    # ── Case A: fan out to every enrolled student in a course ──
    if course_id:
        try:
            course = MentorCourse.objects.get(pk=course_id, mentor=user)
        except MentorCourse.DoesNotExist:
            return Response({"error": "Course not found."}, status=404)

        students = User.objects.filter(
            enrollments__course=course,
            profile__role="student",
        ).distinct()

        if not students.exists():
            return Response(
                {"error": "No students are enrolled in this course yet."},
                status=400,
            )

        created = []
        for s in students:
            payload = {**request.data, "student": s.id}
            serializer = TaskSerializer(data=payload)
            if serializer.is_valid():
                serializer.save(mentor=user, student=s, course=course)
                created.append(serializer.data)
            else:
                return Response(serializer.errors, status=400)

        return Response(created, status=201)

    # ── Case B: single student explicitly targeted ──
    if explicit_student_id:
        try:
            student = User.objects.get(pk=explicit_student_id, profile__role="student")
        except User.DoesNotExist:
            return Response({"error": "Student not found."}, status=404)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(mentor=user, student=student)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # ── Case C: refuse to create an orphan task ──
    return Response(
        {"error": "Provide 'course' to assign to all enrolled students, "
                  "or 'student' to assign to one student."},
        status=400,
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def update_task(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=404)

    user = request.user
    is_mentor = user == task.mentor

    if request.method == "DELETE":
        if not is_mentor:
            return Response({"error": "Only the task owner can delete it."}, status=403)
        task.delete()
        return Response({"status": "deleted"}, status=204)

    is_student = False
    if not is_mentor:
        if task.student_id == user.id:
            is_student = True
        elif task.course_id:
            is_student = Enrollment.objects.filter(
                student=user, course_id=task.course_id
            ).exists()
        elif task.video_id:
            is_student = Enrollment.objects.filter(
                student=user, course__videos__id=task.video_id
            ).exists()

    if not is_mentor and not is_student:
        return Response({"error": "Not allowed."}, status=403)

    if is_student and not is_mentor:
        allowed = {"status", "submission"}
    else:
        allowed = {
            "status", "feedback", "grade", "priority", "due_date",
            "title", "description", "video", "course", "max_score",
        }

    data = {k: v for k, v in request.data.items() if k in allowed}

    for key, value in data.items():
        try:
            if key == "course":
                if not value:
                    task.course = None
                else:
                    task.course = MentorCourse.objects.get(pk=value)
            elif key == "video":
                if not value:
                    task.video = None
                else:
                    task.video = CourseVideo.objects.get(pk=value)
            elif key == "max_score":
                task.max_score = int(value) if value not in (None, "") else 100
            elif key == "due_date":
                if not value:
                    task.due_date = None
                else:
                    from django.utils.dateparse import parse_datetime, parse_date
                    parsed = parse_datetime(value)
                    if not parsed:
                        d = parse_date(value)
                        if d:
                            from datetime import datetime, time
                            parsed = datetime.combine(d, time.min)
                    task.due_date = parsed
            else:
                setattr(task, key, value)
        except (MentorCourse.DoesNotExist, CourseVideo.DoesNotExist):
            return Response(
                {"error": f"Invalid {key}: object not found."},
                status=400,
            )
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid value for '{key}': {value!r} ({e})"},
                status=400,
            )

    if is_student and not is_mentor and "submission" in data and task.student_id is None:
        task.student = user

    task.save()
    return Response(TaskSerializer(task).data)


# ============================================
# MENTOR SUBMISSIONS
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_submissions(request):
    if request.user.profile.role != "mentor":
        return Response({"error": "Only mentors."}, status=403)

    subs = (
        Task.objects
        .filter(mentor=request.user)
        .exclude(submission="")
        .exclude(submission__isnull=True)
        .select_related("student", "video", "course")
        .order_by("-created_at")
    )

    data = [
        {
            "id": t.id,
            "task_title": t.title,
            "title": t.title,
            "description": t.description,
            "student_name": (
                f"{t.student.first_name} {t.student.last_name}".strip()
                or t.student.username
            ) if t.student else "Unassigned",
            "student": t.student_id,
            "course_title": t.course.title if getattr(t, "course", None) else None,
            "content": t.submission or "",
            "file": None,
            "score": t.grade,
            "feedback": t.feedback,
            "status": t.status,
            "video_title": t.video.title if t.video else None,
            "created_at": t.created_at,
        }
        for t in subs
    ]
    return Response(data)


# ============================================
# STUDENTS
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def students_list(request):
    if request.user.profile.role != "mentor":
        return Response({"error": "Only mentors."}, status=403)

    student_ids = Enrollment.objects.filter(
        course__mentor=request.user
    ).values_list("student_id", flat=True).distinct()

    students = User.objects.filter(
        id__in=student_ids, profile__role="student"
    ).select_related("profile")

    data = []
    for s in students:
        enrollments = Enrollment.objects.filter(
            student=s, course__mentor=request.user
        ).select_related("course")

        enrolled_courses = [
            {
                "course_id": e.course.id,
                "course_title": e.course.title,
                "progress": e.progress,
            }
            for e in enrollments
        ]

        student_tasks = Task.objects.filter(mentor=request.user, student=s)
        task_counts = {
            "pending":     student_tasks.filter(status="pending").count(),
            "in_progress": student_tasks.filter(status="in_progress").count(),
            "submitted":   student_tasks.filter(status="submitted").count(),
            "completed":   student_tasks.filter(status="completed").count(),
            "total":       student_tasks.count(),
        }

        data.append({
            "id": s.id,
            "username": s.username,
            "name": f"{s.first_name} {s.last_name}".strip() or s.username,
            "email": s.email,
            "avatar": getattr(s.profile, "avatar", None),
            "interests": getattr(s.profile, "interests", ""),
            "joined": s.date_joined,
            "courses": enrolled_courses,
            "tasks": task_counts,
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_detail(request, student_id):
    if request.user.profile.role != "mentor":
        return Response({"error": "Only mentors."}, status=403)

    try:
        student = User.objects.get(pk=student_id, profile__role="student")
    except User.DoesNotExist:
        return Response({"error": "Student not found."}, status=404)

    enrollments = Enrollment.objects.filter(
        student=student,
        course__mentor=request.user,
    ).select_related("course")

    courses_data = []
    for e in enrollments:
        course = e.course
        total_videos = CourseVideo.objects.filter(course=course).count()
        completed_videos = VideoProgress.objects.filter(
            student=student,
            video__course=course,
            completed=True,
        ).count()

        all_course_tasks = Task.objects.filter(
            mentor=request.user,
            student=student,
        )

        courses_data.append({
            "enrollment_id": e.id,
            "course_id": course.id,
            "course_title": course.title,
            "course_image": request.build_absolute_uri(course.image_file.url) if course.image_file else course.image,
            "progress": e.progress,
            "enrolled_at": e.enrolled_at,
            "total_videos": total_videos,
            "completed_videos": completed_videos,
            "tasks": {
                "pending": all_course_tasks.filter(status="pending").count(),
                "in_progress": all_course_tasks.filter(status="in_progress").count(),
                "submitted": all_course_tasks.filter(status="submitted").count(),
                "completed": all_course_tasks.filter(status="completed").count(),
                "total": all_course_tasks.count(),
            },
        })

    tasks = Task.objects.filter(mentor=request.user, student=student).select_related("video")
    tasks_data = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date,
            "submission": t.submission,
            "feedback": t.feedback,
            "grade": t.grade,
            "video_title": t.video.title if t.video else None,
            "created_at": t.created_at,
        }
        for t in tasks
    ]

    exam_subs = ExamSubmission.objects.filter(
        student=student,
        exam__mentor=request.user,
    ).select_related("exam")
    exams_data = [
        {
            "id": s.id,
            "exam_id": s.exam.id,
            "exam_title": s.exam.title,
            "score": s.score,
            "total_marks": s.exam.total_marks,
            "passed": s.passed,
            "attempt_number": s.attempt_number,
            "submitted_at": s.submitted_at,
        }
        for s in exam_subs
    ]

    return Response({
        "student": {
            "id": student.id,
            "username": student.username,
            "name": f"{student.first_name} {student.last_name}".strip() or student.username,
            "email": student.email,
            "avatar": getattr(student.profile, "avatar", None),
            "interests": getattr(student.profile, "interests", ""),
            "joined": student.date_joined,
        },
        "courses": courses_data,
        "tasks": tasks_data,
        "exams": exams_data,
    })


# ============================================
# STUDENT COURSE ASSIGNMENTS & EXAMS
# ============================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_course_assignments(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    is_enrolled = Enrollment.objects.filter(
        student=request.user,
        course=course,
    ).exists()

    if not is_enrolled and request.user != course.mentor:
        return Response({"error": "Not enrolled."}, status=403)

    if request.user == course.mentor:
        tasks = Task.objects.filter(course=course).select_related("video", "mentor", "course")
    else:
        # Show the student's own tasks, PLUS any course-wide tasks not assigned to
        # a specific student (in case the mentor created it before fan-out).
        tasks = Task.objects.filter(
            Q(student=request.user) |
            Q(course=course, student__isnull=True)
        ).filter(course=course).select_related("video", "mentor", "course").order_by("-created_at")

    data = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "due_date": t.due_date,
            "priority": t.priority,
            "status": t.status,
            "submission": t.submission,
            "feedback": t.feedback,
            "grade": t.grade,
            "max_score": t.max_score,
            "course_id": t.course_id,
            "course_title": t.course.title if t.course else None,
            "video_id": t.video.id if t.video else None,
            "video_title": t.video.title if t.video else None,
            "mentor_name": (
                f"{t.mentor.first_name} {t.mentor.last_name}".strip() or t.mentor.username
            ),
            "created_at": t.created_at,
        }
        for t in tasks
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_course_exams(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    # Mentors see every exam on their own course (published or not)
    if request.user == course.mentor:
        exams = Exam.objects.filter(course=course)
    else:
        exams = Exam.objects.filter(course=course, is_published=True)

    data = []
    for e in exams:
        my_attempts = ExamSubmission.objects.filter(
            exam=e, student=request.user
        ).order_by("-attempt_number")
        best = my_attempts.first()

        data.append({
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "duration_minutes": e.duration_minutes,
            "total_marks": e.total_marks,
            "question_count": e.questions.count(),
            "attempts_made": my_attempts.count(),
            "best_score": best.score if best else None,
            "passed": best.passed if best else False,
            "is_published": e.is_published,
        })

    return Response(data)


# ============================================
# MESSAGES — only between connected student + mentor
# ============================================
def _can_message(me, other):
    if me.id == other.id:
        return False

    if me.profile.role == "student" and other.profile.role == "mentor":
        return Enrollment.objects.filter(
            student=me,
            course__mentor=other,
        ).exists()

    if me.profile.role == "mentor" and other.profile.role == "student":
        return Enrollment.objects.filter(
            student=other,
            course__mentor=me,
        ).exists()

    return False


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def messages(request, user_id=None):
    user = request.user

    # ── SEND ──
    if request.method == "POST":
        recipient_id = user_id or request.data.get("recipient")
        content = request.data.get("content", "").strip()

        if not recipient_id or not content:
            return Response({"error": "recipient and content required."}, status=400)

        try:
            recipient = User.objects.get(pk=recipient_id)
        except User.DoesNotExist:
            return Response({"error": "Recipient not found."}, status=404)

        if not _can_message(user, recipient):
            return Response(
                {"error": "You can only message users you are connected to through a course."},
                status=403,
            )

        msg = Message.objects.create(sender=user, recipient=recipient, content=content)
        return Response(MessageSerializer(msg).data, status=201)

    # ── LIST CONVERSATIONS ──
    if not user_id:
        if user.profile.role == "student":
            allowed_ids = Enrollment.objects.filter(
                student=user
            ).values_list("course__mentor_id", flat=True).distinct()
        else:  # mentor
            allowed_ids = Enrollment.objects.filter(
                course__mentor=user
            ).values_list("student_id", flat=True).distinct()

        partners = User.objects.filter(id__in=allowed_ids).select_related("profile")

        return Response([
            {
                "id": p.id,
                "username": p.username,
                "name": f"{p.first_name} {p.last_name}".strip() or p.username,
                "avatar": getattr(p.profile, "avatar", None),
                "role": p.profile.role,
                "last_message": (
                    Message.objects.filter(
                        models.Q(sender=user, recipient=p) |
                        models.Q(sender=p, recipient=user)
                    ).last().content
                    if Message.objects.filter(
                        models.Q(sender=user, recipient=p) |
                        models.Q(sender=p, recipient=user)
                    ).exists()
                    else ""
                ),
            }
            for p in partners
        ])

    # ── LOAD A THREAD ──
    try:
        other = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    if not _can_message(user, other):
        return Response(
            {"error": "Not allowed to view this conversation."},
            status=403,
        )

    thread = Message.objects.filter(
        models.Q(sender=user, recipient=other) |
        models.Q(sender=other, recipient=user)
    ).order_by("created_at")

    Message.objects.filter(
        sender=other, recipient=user, is_read=False
    ).update(is_read=True)

    return Response(MessageSerializer(thread, many=True).data)


# ============================================
# EXAMS — course-scoped create/list
# ============================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def exams(request, course_id):
    try:
        course = MentorCourse.objects.get(pk=course_id)
    except MentorCourse.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    if request.method == "GET":
        qs = Exam.objects.filter(course=course)
        return Response(
            ExamSerializer(qs, many=True, context={"request": request}).data
        )

    if request.user != course.mentor:
        return Response({"error": "Only course owner."}, status=403)

    title = (request.data.get("title") or "").strip()
    if not title:
        return Response({"error": "Title is required."}, status=400)

    try:
        duration = int(request.data.get("duration_minutes") or 30)
    except (ValueError, TypeError):
        duration = 30

    try:
        marks = int(request.data.get("total_marks") or 100)
    except (ValueError, TypeError):
        marks = 100

    # ✅ auto-publish so students see it immediately
    exam = Exam.objects.create(
        course=course,
        mentor=request.user,
        title=title,
        description=request.data.get("description", ""),
        duration_minutes=duration,
        total_marks=marks,
        is_published=True,
    )

    return Response(
        ExamSerializer(exam, context={"request": request}).data,
        status=201,
    )


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def exam_detail(request, exam_id):
    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found."}, status=404)

    user = request.user
    is_mentor = user == exam.mentor

    if request.method in ("PATCH", "DELETE"):
        if not is_mentor:
            return Response({"error": "Not allowed."}, status=403)

        if request.method == "DELETE":
            exam.delete()
            return Response({"status": "deleted"}, status=204)

        data = request.data
        if "title" in data:       exam.title = data["title"]
        if "description" in data: exam.description = data["description"]
        if "duration_minutes" in data:
            try: exam.duration_minutes = int(data["duration_minutes"])
            except (ValueError, TypeError): pass
        if "total_marks" in data:
            try: exam.total_marks = int(data["total_marks"])
            except (ValueError, TypeError): pass
        if "course" in data and data["course"]:
            try:
                course = MentorCourse.objects.get(pk=data["course"], mentor=request.user)
                exam.course = course
            except MentorCourse.DoesNotExist:
                pass
        if "is_published" in data:
            exam.is_published = bool(data["is_published"])
        exam.save()
        return Response(ExamSerializer(exam, context={"request": request}).data)

    # GET
    if not is_mentor:
        enrolled = Enrollment.objects.filter(
            student=user, course=exam.course
        ).exists()
        if not enrolled:
            return Response({"error": "Not enrolled."}, status=403)
        if not exam.is_published:
            return Response({"error": "This exam is not yet published."}, status=403)

    questions = exam.questions.all()

    if is_mentor:
        q_data = ExamQuestionAnswerSerializer(questions, many=True).data
    else:
        q_data = ExamQuestionSerializer(questions, many=True).data

    return Response({
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "duration_minutes": exam.duration_minutes,
        "total_marks": exam.total_marks,
        "due_date": getattr(exam, "due_date", None),
        "is_published": exam.is_published,
        "course": exam.course_id,
        "course_title": exam.course.title,
        "questions": q_data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_exam_question(request, exam_id):
    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found."}, status=404)

    if request.user != exam.mentor:
        return Response({"error": "Not allowed."}, status=403)

    serializer = ExamQuestionAnswerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(exam=exam)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    if request.user.profile.role != "student":
        return Response({"error": "Only students."}, status=403)

    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found."}, status=404)

    if not exam.is_published:
        return Response({"error": "This exam is not yet published."}, status=403)

    previous_attempts = ExamSubmission.objects.filter(
        exam=exam, student=request.user
    ).order_by('-attempt_number')

    if previous_attempts.filter(passed=True).exists():
        return Response({"error": "You already passed this exam."}, status=400)

    attempt_number = (previous_attempts.first().attempt_number if previous_attempts.exists() else 0) + 1

    answers = request.data.get("answers", {})

    score = 0
    for q in exam.questions.all():
        ans = answers.get(str(q.id))
        if ans == q.correct_option:
            score += q.marks

    total_possible = sum(q.marks for q in exam.questions.all()) or exam.total_marks
    passed = score >= (total_possible * 0.6)

    submission = ExamSubmission.objects.create(
        exam=exam,
        student=request.user,
        attempt_number=attempt_number,
        answers=answers,
        score=score,
        passed=passed,
    )

    return Response({
        **ExamSubmissionSerializer(submission).data,
        'total_possible': total_possible,
        'attempt_number': attempt_number,
        'passed': passed,
        'can_retake': not passed,
    }, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exam_submissions(request, exam_id):
    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found."}, status=404)

    if request.user != exam.mentor:
        return Response({"error": "Not allowed."}, status=403)

    subs = exam.submissions.all()
    return Response(ExamSubmissionSerializer(subs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_exam_submission(request, exam_id):
    try:
        sub = ExamSubmission.objects.get(exam_id=exam_id, student=request.user)
    except ExamSubmission.DoesNotExist:
        return Response({"error": "Not submitted."}, status=404)
    return Response(ExamSubmissionSerializer(sub).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_exam_attempts(request, exam_id):
    attempts = ExamSubmission.objects.filter(
        exam_id=exam_id, student=request.user
    ).order_by('-attempt_number')
    return Response(ExamSubmissionSerializer(attempts, many=True).data)


# ============================================
# ALL EXAMS — accepts GET (list) and POST (create)
# ============================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def all_exams(request):
    user = request.user

    # ── POST: mentor schedules a new exam ──
    if request.method == "POST":
        if user.profile.role != "mentor":
            return Response({"error": "Only mentors can schedule exams."}, status=403)

        title = (request.data.get("title") or "").strip()
        if not title:
            return Response({"error": "Title is required."}, status=400)

        course_id = request.data.get("course")
        if not course_id:
            return Response({"error": "Course is required."}, status=400)

        try:
            course = MentorCourse.objects.get(pk=course_id, mentor=user)
        except MentorCourse.DoesNotExist:
            return Response({"error": "Course not found."}, status=404)

        try:
            duration = int(request.data.get("duration_minutes") or 30)
        except (ValueError, TypeError):
            duration = 30

        try:
            marks = int(request.data.get("total_marks") or 100)
        except (ValueError, TypeError):
            marks = 100

        # ✅ auto-publish so students see it right away
        exam = Exam.objects.create(
            course=course,
            mentor=user,
            title=title,
            description=request.data.get("description", ""),
            duration_minutes=duration,
            total_marks=marks,
            is_published=True,
        )

        return Response(
            ExamSerializer(exam, context={"request": request}).data,
            status=201,
        )

    # ── GET: list exams ──
    if user.profile.role == "mentor":
        exams = Exam.objects.filter(mentor=user)
    else:
        enrolled_course_ids = Enrollment.objects.filter(
            student=user
        ).values_list("course_id", flat=True)
        exams = Exam.objects.filter(
            course_id__in=enrolled_course_ids,
            is_published=True,
        )
    return Response(
        ExamSerializer(exams, many=True, context={"request": request}).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publish_exam(request, exam_id):
    try:
        exam = Exam.objects.get(pk=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found."}, status=404)

    if request.user != exam.mentor:
        return Response({"error": "Not allowed."}, status=403)

    publish = request.data.get("is_published", True)

    if publish and exam.questions.count() == 0:
        return Response(
            {"error": "Add at least one question before publishing."},
            status=400,
        )

    exam.is_published = bool(publish)
    exam.save()
    return Response(ExamSerializer(exam, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_exams(request):
    if request.user.is_authenticated and request.user.profile.role == "mentor":
        exams = Exam.objects.filter(mentor=request.user)
    elif request.user.is_authenticated:
        enrolled_course_ids = Enrollment.objects.filter(
            student=request.user
        ).values_list("course_id", flat=True)
        exams = Exam.objects.filter(
            course_id__in=enrolled_course_ids,
            is_published=True,
        )
    else:
        exams = Exam.objects.filter(is_published=True)
    return Response(
        ExamSerializer(exams, many=True, context={"request": request}).data
    )