import { type RouteConfig, index, route } from '@react-router/dev/routes';

const pageRoutes = [
  index('routes/pages/home.tsx'),
  route('/artist/:name', 'routes/pages/artist/ArtistPage.tsx'),
  route('/blogs', 'routes/pages/blogs/BlogsPage.tsx'),
  route('/blogs/:blogId', 'routes/pages/blogs/SingleBlogPage.tsx'),
  route('/browse', 'routes/pages/browse/BrowsePage.tsx'),
  route('/c/:comicName', 'routes/pages/comic/ComicPage.tsx'),
  route('/patreon', 'routes/pages/patreon/PatreonPage.tsx'),
  route('/thumbnail-guidelines', 'routes/pages/ThumbnailGuidelinesPage.tsx'),
  route('/user/:username', 'routes/pages/UserProfilePage.tsx'),

  // Me
  route('/me', 'routes/pages/me/MePage.tsx'),
  route('/me/account', 'routes/pages/me/AccountPage.tsx'),
  route('/me/patreon', 'routes/pages/me/PatreonPage.tsx'),
  route('/me/messages', 'routes/pages/me/MessagesPage.tsx', [
    route('/me/messages/:token', 'routes/pages/me/SingleChatPage.tsx'),
    route('/me/messages/new', 'routes/pages/me/NewMessagePage.tsx'),
  ]),

  // Auth
  route('/logout', 'routes/pages/authentication/LogoutPage.tsx'),
  route('/login', 'routes/pages/authentication/LoginPage.tsx'),
  route('/signup', 'routes/pages/authentication/SignupPage.tsx'),
  route('/forgotten-password', 'routes/pages/authentication/ForgottenPasswordPage.tsx'),
  route('/change-email/:token', 'routes/pages/authentication/ChangeEmailLandingPage.tsx'),
  route(
    '/reset-password/:token',
    'routes/pages/authentication/ResetPasswordTokenPage.tsx'
  ),

  // Contributions
  route('/contribute', 'routes/pages/contribute/ContributePage.tsx'),
  route('/contribute/feedback', 'routes/pages/contribute/FeedbackPage.tsx'),
  route('/contribute/join-us', 'routes/pages/contribute/JoinUsPage.tsx'),
  route('/contribute/join-us/apply', 'routes/pages/contribute/JoinUsApplyPage.tsx'),
  route(
    '/contribute/scoreboard',
    'routes/pages/contribute/ContributionsScoreboardPage.tsx'
  ),
  route('/contribute/suggest-comic', 'routes/pages/contribute/SuggestComicPage.tsx'),
  route('/contribute/upload', 'routes/pages/contribute/upload/UploadPage.tsx'),
  route(
    '/contribute/your-contributions',
    'routes/pages/contribute/your-contributions/YourContributionsPage.tsx'
  ),

  // About pages
  route('/about', 'routes/pages/about/AboutPage.tsx'),
  route('/about/about-yiffer', 'routes/pages/about/AboutYifferPage.tsx'),
  route('/about/changelog', 'routes/pages/about/ChangelogPage.tsx'),
  route('/about/contact', 'routes/pages/about/ContactPage.tsx'),
  route('/about/privacy', 'routes/pages/about/PrivacyPage.tsx'),

  // Advertising
  route('/advertising', 'routes/pages/advertising/AdvertisingPage.tsx'),
  route('/advertising/apply', 'routes/pages/advertising/apply/AdvertisingApplyPage.tsx'),
  route(
    '/advertising/dashboard',
    'routes/pages/advertising/AdvertisingDashboardPage.tsx'
  ),
  route('/advertising/dashboard/:adId', 'routes/pages/advertising/DashboardAdPage.tsx'),
] satisfies RouteConfig;

const adminRoutes = [
  route('/admin', 'routes/pages/admin/AdminPage.tsx', [
    route('/admin/dashboard', 'routes/pages/admin/dashboard/DashboardPage.tsx'),
    route(
      '/admin/actions-and-points',
      'routes/pages/admin/actions-and-points/ActionsAndPointsPage.tsx'
    ),
    route('/admin/advertising', 'routes/pages/admin/advertising/AdvertisingPage.tsx', [
      route(
        '/admin/advertising/:adId',
        'routes/pages/admin/advertising/AdvertisingAdPage.tsx'
      ),
    ]),
    route('/admin/artists', 'routes/pages/admin/artist/ArtistsPage.tsx', [
      route('/admin/artists/:id', 'routes/pages/admin/artist/SingleArtistPage.tsx'),
    ]),
    route('/admin/blogs', 'routes/pages/admin/blogs/BlogsPage.tsx', [
      route('/admin/blogs/new', 'routes/pages/admin/blogs/NewBlogPage.tsx'),
      route('/admin/blogs/:id', 'routes/pages/admin/blogs/SingleBlogPage.tsx'),
    ]),
    route('/admin/more', 'routes/pages/admin/more/MorePage.tsx'),
    route('/admin/more/comment-list', 'routes/pages/admin/more/CommentListPage.tsx'),
    route('/admin/more/ip-ban', 'routes/pages/admin/more/IPBanListPage.tsx'),
    route(
      '/admin/more/restricted-users',
      'routes/pages/admin/more/RestrictedUsersPage.tsx'
    ),
    route('/admin/more/chat-list', 'routes/pages/admin/more/ChatListPage.tsx'),
    route('/admin/chats/:token', 'routes/pages/admin/more/SingleChatPage.tsx'),
    route('/admin/comics', 'routes/pages/admin/comic/ComicListPage.tsx', [
      route('/admin/comics/:comic', 'routes/pages/admin/comic/SingleComicPage.tsx'),
    ]),
    route(
      '/admin/feedback-support',
      'routes/pages/admin/feedback-support/FeedbackSupportPage.tsx'
    ),
    route('/admin/instructions', 'routes/pages/admin/instructions/InstructionsPage.tsx'),
    route(
      '/admin/instructions/comics',
      'routes/pages/admin/instructions/ComicInstructionsPage.tsx'
    ),
    route(
      '/admin/instructions/modpanel',
      'routes/pages/admin/instructions/ModPanelInstructionsPage.tsx'
    ),
    route(
      '/admin/instructions/tagging',
      'routes/pages/admin/instructions/TaggingInstructionsPage.tsx'
    ),
    route(
      '/admin/mod-applications',
      'routes/pages/admin/mod-applications/ModApplicationsPage.tsx'
    ),
    route(
      '/admin/pending-comics',
      'routes/pages/admin/pending-comics/PendingComicsPage.tsx'
    ),
    route('/admin/stats', 'routes/pages/admin/stats/StatsPage.tsx'),
    route('/admin/system-chats', 'routes/pages/admin/system-chats/SystemChatsPage.tsx', [
      route(
        '/admin/system-chats/new',
        'routes/pages/admin/system-chats/NewSystemChat.tsx'
      ),
      route(
        '/admin/system-chats/:token',
        'routes/pages/admin/system-chats/SingleSystemChat.tsx'
      ),
    ]),
    route('/admin/tags', 'routes/pages/admin/tags/TagsPage.tsx', [
      route('/admin/tags/new', 'routes/pages/admin/tags/NewTag.tsx'),
      route('/admin/tags/:tag', 'routes/pages/admin/tags/SingleTag.tsx'),
    ]),

    route('/admin/users', 'routes/pages/admin/users/UserManagerPage.tsx', [
      route('/admin/users/:userId', 'routes/pages/admin/users/ManageSingleUser.tsx'),
    ]),
  ]),
];

const apiRoutes = [
  // Root level things
  route('/api/get-message-notifications', './routes/api/get-message-notifications.ts'),
  route('/api/get-notifications', './routes/api/get-notifications.ts'),
  route('/api/latest-blog', './routes/api/latest-blog.ts'),
  route('/api/set-theme', './routes/api/set-theme.ts'),
  route('/api/log-click', './routes/api/log-click.ts'),
  route('/api/reset-fetcher', './routes/api/reset-fetcher.ts'),

  // Advertising
  route('/api/edit-ad', './routes/api/edit-ad.ts'),
  route('/api/submit-ad', './routes/api/submit-ad.ts'),
  route('/api/activate-ad', './routes/api/activate-ad.ts'),
  route('/api/deactivate-ad', './routes/api/deactivate-ad.ts'),
  route('/api/delete-ad', './routes/api/delete-ad.ts'),
  route('/api/register-ad-payment', './routes/api/register-ad-payment.ts'),
  route('/api/set-ad-video-converted', './routes/api/set-ad-video-converted.ts'),

  // Comic stuff
  route('/api/comics/:id/tags', './routes/api/comics.id.tags.ts'),
  route('/api/submit-comic-problem', './routes/api/submit-comic-problem.ts'),
  route('/api/submit-tag-changes', './routes/api/submit-tag-changes.ts'),
  route('/api/toggle-bookmark', './routes/api/toggle-bookmark.ts'),
  route('/api/update-your-stars', './routes/api/update-your-stars.ts'),
  route('/api/tags', './routes/api/tags.ts'),

  // Comments stuff
  route('/api/add-comment-vote', './routes/api/add-comment-vote.ts'),
  route('/api/add-comment', './routes/api/add-comment.ts'),
  route('/api/edit-comment', './routes/api/edit-comment.ts'),
  route('/api/report-comment', './routes/api/report-comment.ts'),

  // User account stuff
  route('/api/users/:id', './routes/api/users.id.ts'),
  route('/api/change-email', './routes/api/change-email.ts'),
  route('/api/change-password', './routes/api/change-password.ts'),
  route('/api/change-username', './routes/api/change-username.ts'),
  route('/api/edit-public-profile', './routes/api/edit-public-profile.ts'),
  route('/api/update-profile-photo', './routes/api/update-profile-photo.ts'),
  route('/api/remove-profile-photo', './routes/api/remove-profile-photo.ts'),
  route('/api/update-thumbnail', './routes/api/update-thumbnail.ts'),
  route('/api/block-user', './routes/api/block-user.ts'),
  route('/api/get-block-status', './routes/api/get-block-status.ts'),
  route('/api/set-allow-messages', './routes/api/set-allow-messages.ts'),
  route('/api/patreon-callback', './routes/api/patreon-callback.ts'),
  route('/api/unlink-patreon-email', './routes/api/unlink-patreon-email.ts'),
  route('/api/sync-patrons', './routes/api/sync-patrons.ts'),

  // Messaging stuff
  route('/api/send-chat-message', './routes/api/send-chat-message.ts'),
  route('/api/get-messages-paginated', './routes/api/get-messages-paginated.ts'),

  // Notifications
  route(
    '/api/mark-single-notification-read',
    './routes/api/mark-single-notification-read.ts'
  ),
  route(
    '/api/mark-all-notifications-read',
    './routes/api/mark-all-notifications-read.ts'
  ),

  // Search stuff
  route('/api/search-users', './routes/api/search-users.ts'),
  route('/api/search-similar-artist', './routes/api/search-similar-artist.ts'),
  route(
    '/api/search-similarly-named-comic',
    './routes/api/search-similarly-named-comic.ts'
  ),

  // Admin routes
  route('/api/admin/archive-feedback', './routes/api/admin/archive-feedback.ts'),
  route('/api/admin/assign-action', './routes/api/admin/assign-action.ts'),
  route('/api/admin/ban-ip', './routes/api/admin/ban-ip.ts'),
  route(
    '/api/admin/clear-spammable-actions',
    './routes/api/admin/clear-spammable-actions.ts'
  ),
  route('/api/admin/dashboard-data', './routes/api/admin/dashboard-data.ts'),
  route('/api/admin/delete-blog', './routes/api/admin/delete-blog.ts'),
  route('/api/admin/delete-comic', './routes/api/admin/delete-comic.ts'),
  route('/api/admin/delete-feedback', './routes/api/admin/delete-feedback.ts'),
  route('/api/admin/get-ads', './routes/api/admin/get-ads.ts'),
  route('/api/admin/list-comic-files', './routes/api/admin/list-comic-files.ts'),
  route(
    '/api/admin/mark-mod-instruction-read',
    './routes/api/admin/mark-mod-instruction-read.ts'
  ),
  route(
    '/api/admin/mark-mod-message-read',
    './routes/api/admin/mark-mod-message-read.ts'
  ),
  route('/api/admin/move-queued-comic', './routes/api/admin/move-queued-comic.ts'),
  route('/api/admin/process-anon-upload', './routes/api/admin/process-anon-upload.ts'),
  route(
    '/api/admin/process-comic-comment-report',
    './routes/api/admin/process-comic-comment-report.ts'
  ),
  route(
    '/api/admin/process-comic-problem',
    './routes/api/admin/process-comic-problem.ts'
  ),
  route(
    '/api/admin/process-comic-suggestion',
    './routes/api/admin/process-comic-suggestion.ts'
  ),
  route(
    '/api/admin/process-tag-suggestion',
    './routes/api/admin/process-tag-suggestion.ts'
  ),
  route('/api/admin/process-user-upload', './routes/api/admin/process-user-upload.ts'),
  route('/api/admin/publish-comic', './routes/api/admin/publish-comic.ts'),
  route('/api/admin/publish-comics-cron', './routes/api/admin/publish-comics-cron.ts'),
  route(
    '/api/admin/recalculate-publishing-queue',
    './routes/api/admin/recalculate-publishing-queue.ts'
  ),
  route(
    '/api/admin/reject-all-action-items',
    './routes/api/admin/reject-all-action-items.ts'
  ),
  route('/api/admin/reject-pending-comic', './routes/api/admin/reject-pending-comic.ts'),
  route('/api/admin/relist-comic', './routes/api/admin/relist-comic.ts'),
  route('/api/admin/restrict-user', './routes/api/admin/restrict-user.ts'),
  route('/api/admin/schedule-comic', './routes/api/admin/schedule-comic.ts'),
  route(
    '/api/admin/schedule-comic-to-queue',
    './routes/api/admin/schedule-comic-to-queue.ts'
  ),
  route('/api/admin/set-comic-error', './routes/api/admin/set-comic-error.ts'),
  route('/api/admin/toggle-artist-ban', './routes/api/admin/toggle-artist-ban.ts'),
  route('/api/admin/unassign-action', './routes/api/admin/unassign-action.ts'),
  route('/api/admin/unban-ip', './routes/api/admin/unban-ip.ts'),
  route('/api/admin/unlist-comic', './routes/api/admin/unlist-comic.ts'),
  route('/api/admin/unrestrict-user', './routes/api/admin/unrestrict-user.ts'),
  route('/api/admin/unschedule-comic', './routes/api/admin/unschedule-comic.ts'),
  route('/api/admin/update-artist-data', './routes/api/admin/update-artist-data.ts'),
  route('/api/admin/update-comic-data', './routes/api/admin/update-comic-data.ts'),
  route('/api/admin/update-comic-pages', './routes/api/admin/update-comic-pages.ts'),
  route('/api/admin/update-expired-ads', './routes/api/admin/update-expired-ads.ts'),
  route('/api/admin/update-user', './routes/api/admin/update-user.ts'),
] satisfies RouteConfig;

// Catch-all route for 404 - must be last
const catchAllRoute = route('*', 'routes/pages/NotFoundPage.tsx');

export default [
  ...pageRoutes,
  ...apiRoutes,
  ...adminRoutes,
  catchAllRoute,
] satisfies RouteConfig;
