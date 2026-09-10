<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Feedback & Action Messages (English)
    |--------------------------------------------------------------------------
    */

    'settings_updated' => 'System settings updated successfully.',
    'location_updated' => 'School location & geofence settings updated successfully.',

    // Teachers
    'teacher_added' => 'Teacher added successfully.',
    'teacher_updated' => 'Teacher data updated successfully.',
    'teacher_deleted' => 'Teacher deleted successfully.',
    'teacher_not_found' => 'Teacher data not found.',

    // Students
    'student_added' => 'Student added successfully.',
    'student_updated' => 'Student data updated successfully.',
    'student_deleted' => 'Student deleted successfully.',
    'student_status_updated' => 'Student status updated successfully.',
    'student_not_found' => 'Student data not found.',

    // Classes & Enrolment
    'class_added' => 'Class added successfully.',
    'class_updated' => 'Class data updated successfully.',
    'class_deleted' => 'Class deleted successfully.',
    'student_enrolled' => 'Student added to class successfully.',
    'student_unenrolled' => 'Student removed from class successfully.',
    'students_enrolled_bulk' => ':count students added to class successfully.',
    'students_unenrolled_bulk' => ':count students removed from class successfully.',

    // Guardians
    'guardian_added' => 'Guardian added successfully.',
    'guardian_updated' => 'Guardian data updated successfully.',
    'guardian_deleted' => 'Guardian deleted successfully.',
    'guardian_not_found' => 'Guardian data not found.',
    'guardian_assigned' => 'Student successfully linked with guardian.',
    'guardian_unassigned' => 'Student unlinked from guardian successfully.',
    'guardian_already_linked' => 'Student is already linked to a guardian and cannot be linked again.',

    // Attendance & Schedule
    'holiday_added' => 'Academic holiday added successfully.',
    'holiday_deleted' => 'Academic holiday deleted successfully.',
    'schedule_updated' => 'Operating schedule updated successfully.',
    'checkin_success' => 'Check-in successful.',
    'attendance_updated' => 'Attendance status updated successfully.',
    'override_deleted' => 'Attendance override deleted successfully.',

    // Leave Requests
    'leave_submitted' => 'Leave request submitted to homeroom teacher successfully.',
    'leave_bulk_verified' => ':count leave requests :status successfully.',
    'leave_status_approved' => 'approved',
    'leave_status_rejected' => 'rejected',

    // Profile & Authentication
    'profile_updated' => 'Profile updated successfully.',
    'avatar_updated' => 'Profile picture updated successfully.',
    'avatar_deleted' => 'Profile picture deleted successfully.',
    'session_revoked' => 'Session revoked successfully.',
    'role_switched' => 'Role successfully switched to :role.',
    'invalid_current_password' => 'Current password does not match.',
    'role_switch_forbidden' => 'Only teachers can switch active role.',
    'role_not_assigned' => 'You do not have permission for this role.',

    // Notifications
    'notification_sent' => 'Notification sent successfully.',
    'notification_read' => 'Notification marked as read.',
    'all_notifications_read' => 'All notifications marked as read.',
    'notification_deleted' => 'Notification deleted successfully.',

];
