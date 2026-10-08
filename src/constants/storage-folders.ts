/**
 * Centralized Storage Folder Taxonomy for Fin2u LMS (Client-side)
 * Organizes uploaded media cleanly across all cloud storage engines
 */

export const StorageFolders = {
  // User & Profile
  USERS_AVATARS: 'users/avatars',
  USERS_COVERS: 'users/covers',
  USERS_DOCUMENTS: 'users/documents',

  // Courses & Learning Modules
  COURSES_THUMBNAILS: 'courses/thumbnails',
  COURSES_PROMOS: 'courses/promos',
  COURSES_LESSONS: 'courses/lessons',
  COURSES_RESOURCES: 'courses/resources',

  // Community Circles & Groups
  GROUPS_AVATARS: 'groups/avatars',
  GROUPS_COVERS: 'groups/covers',
  GROUPS_POSTS: 'groups/posts',

  // Direct & Group Messaging
  MESSAGES_ATTACHMENTS: 'messages/attachments',
  MESSAGES_IMAGES: 'messages/images',

  // Mentorship Applications & Faculty
  MENTORS_RESUMES: 'mentors/resumes',
  MENTORS_CERTIFICATES: 'mentors/certificates',
  MENTORS_MATERIALS: 'mentors/materials',

  // Certificates & Accreditations
  CERTIFICATES_TEMPLATES: 'certificates/templates',
  CERTIFICATES_ISSUED: 'certificates/issued',

  // CMS, Marketing & Site Assets
  CMS_BRANDING: 'cms/branding',
  CMS_BANNERS: 'cms/banners',
  CMS_PARTNERS: 'cms/partners',
  CMS_TESTIMONIALS: 'cms/testimonials',

  // General Fallback
  GENERAL_UPLOADS: 'general/uploads',
} as const;

export type StorageFolder = (typeof StorageFolders)[keyof typeof StorageFolders] | string;

/**
 * Dynamic entity folder path generators
 */
export const getEntityFolder = {
  userAvatar: (userId?: string) =>
    userId ? `users/${userId}/avatar` : StorageFolders.USERS_AVATARS,
  userCover: (userId?: string) =>
    userId ? `users/${userId}/cover` : StorageFolders.USERS_COVERS,
  userDocument: (userId?: string) =>
    userId ? `users/${userId}/documents` : StorageFolders.USERS_DOCUMENTS,

  courseThumbnail: (courseId?: string) =>
    courseId ? `courses/${courseId}/thumbnails` : StorageFolders.COURSES_THUMBNAILS,
  courseLesson: (courseId?: string) =>
    courseId ? `courses/${courseId}/lessons` : StorageFolders.COURSES_LESSONS,
  courseResource: (courseId?: string) =>
    courseId ? `courses/${courseId}/resources` : StorageFolders.COURSES_RESOURCES,

  groupAvatar: (groupId?: string) =>
    groupId ? `groups/${groupId}/avatar` : StorageFolders.GROUPS_AVATARS,
  groupCover: (groupId?: string) =>
    groupId ? `groups/${groupId}/cover` : StorageFolders.GROUPS_COVERS,
  groupPost: (groupId?: string) =>
    groupId ? `groups/${groupId}/posts` : StorageFolders.GROUPS_POSTS,

  messageAttachment: (chatId?: string) =>
    chatId ? `messages/${chatId}/attachments` : StorageFolders.MESSAGES_ATTACHMENTS,

  mentorResume: (mentorId?: string) =>
    mentorId ? `mentors/${mentorId}/resumes` : StorageFolders.MENTORS_RESUMES,
  mentorCertificate: (mentorId?: string) =>
    mentorId ? `mentors/${mentorId}/certificates` : StorageFolders.MENTORS_CERTIFICATES,
};
