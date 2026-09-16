from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from courses.models import Course, Material, Assignment, Classroom
from profiles.models import Profile, MentorCourse, Enrollment
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed sample data for LearnNest LMS'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding sample data...')

        # --- Mentor 1 ---
        faculty1, _ = User.objects.get_or_create(
            username='faculty1',
            defaults={
                'first_name': 'Dr. Smith',
                'last_name': 'Johnson',
                'email': 'smith@learnnest.com',
            }
        )
        faculty1.set_password('faculty123')
        faculty1.save()
        faculty1.profile.role = 'mentor'
        faculty1.profile.expertise = 'Python, Data Science'
        faculty1.profile.save()

        # --- Mentor 2 ---
        faculty2, _ = User.objects.get_or_create(
            username='faculty2',
            defaults={
                'first_name': 'Prof. Meera',
                'last_name': 'Nair',
                'email': 'meera@learnnest.com',
            }
        )
        faculty2.set_password('faculty123')
        faculty2.save()
        faculty2.profile.role = 'mentor'
        faculty2.profile.expertise = 'Web Development'
        faculty2.profile.save()

        # --- Student ---
        student, _ = User.objects.get_or_create(
            username='student1',
            defaults={
                'first_name': 'Alex',
                'last_name': 'Kumar',
                'email': 'alex@learnnest.com',
            }
        )
        student.set_password('student123')
        student.save()
        student.profile.role = 'student'
        student.profile.interests = 'Python, Web Development'
        student.profile.save()

        # --- Mentor Courses ---
        c1, _ = MentorCourse.objects.get_or_create(
            title='PYTHON DEVELOPER',
            defaults={
                'description': 'Python is a high-level, easy-to-learn programming language used for web development, automation, data analysis, AI/ML, and software development.',
                'image': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
                'category': 'Programming',
                'mentor': faculty1,
                'duration_weeks': 3,
                'price': '1000',
            }
        )

        c2, _ = MentorCourse.objects.get_or_create(
            title='Data Science Foundations',
            defaults={
                'description': 'Statistics and ML concepts. Materials coming soon.',
                'image': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
                'category': 'Data Science',
                'mentor': faculty2,
                'duration_weeks': 4,
                'price': 'Free',
            }
        )

        c3, _ = MentorCourse.objects.get_or_create(
            title='Web Development Bootcamp',
            defaults={
                'description': 'Full-stack web dev from scratch.',
                'image': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
                'category': 'Web Dev',
                'mentor': faculty2,
                'duration_weeks': 6,
                'price': 'Free',
            }
        )

        # --- Old courses (for backwards compat) ---
        old_c1, _ = Course.objects.get_or_create(
            title='Python for Beginners',
            defaults={
                'description': 'Master Python fundamentals.',
                'image': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
                'faculty': faculty1,
            }
        )
        old_c1.students.add(student)

        # --- Done ---
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 50))
        self.stdout.write(self.style.SUCCESS('Sample data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('\nTest credentials:')
        self.stdout.write('  Admin   -> admin     / admin123')
        self.stdout.write('  Faculty -> faculty1  / faculty123')
        self.stdout.write('  Faculty -> faculty2  / faculty123')
        self.stdout.write('  Student -> student1  / student123')
        self.stdout.write('=' * 50 + '\n')