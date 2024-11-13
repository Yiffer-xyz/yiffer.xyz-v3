export const CONTRIBUTION_POINTS = {
  tagSuggestion: {
    points: 5,
    description: 'Add/remove tag suggestion approved',
  },
  comicProblem: {
    points: 10,
    description: 'Comic problem reported',
  },
  comicSuggestion: {
    good: {
      points: 30,
      description: 'Accepted, excellent information',
    },
    bad: {
      points: 15,
      description: 'Accepted, but lacking links/info',
    },
  },
  comicUpload: {
    excellent: {
      points: 200,
      description: undefined,
      scoreListDescription: 'Uploaded comic, excellent info',
      actionDashboardDescription: 'Excellent info',
      modPanelDescription: 'No issues found',
    },
    'minor-issues': {
      points: 150,
      description: 'Minor issues',
      scoreListDescription:
        'Uploaded comic, minor issues found (incorrect category, wrong name)',
      actionDashboardDescription: 'Minor issues',
      modPanelDescription: 'Minor issues (e.g. incorrect category, name spelling error)',
    },
    'major-issues': {
      points: 100,
      description: 'Major issues',
      scoreListDescription:
        'Uploaded comic, major issues found (lacking artist links, poor tagging, bad thumbnail)',
      actionDashboardDescription: 'Major issues',
      modPanelDescription:
        'Major issues (e.g. lacking artist links, poor tagging, bad thumbnail)',
    },
    'page-issues': {
      points: 50,
      description: 'Page issues',
      scoreListDescription:
        'Uploaded comic, page issues (resolution, ordering, some premium pages uploaded)',
      actionDashboardDescription: 'Page issues',
      modPanelDescription:
        'Page issues (poor resolution, wrong ordering, some premium pages uploaded)',
    },
    terrible: {
      points: 15,
      description: 'Major page issues',
      scoreListDescription:
        'Uploaded comic, major page issues (most/all pages needed replacing)',
      actionDashboardDescription: 'Major page issues',
      modPanelDescription: 'Major page issues (most/all pages needs replacing)',
    },
    'rejected-list': {
      points: 0,
      description: undefined,
      scoreListDescription: '',
      actionDashboardDescription: 'Rejected, added to ban list',
      modPanelDescription:
        'Reject submission due to the nature of the comic - add to ban list (click to read more)',
    },
    rejected: {
      points: 0,
      description: undefined,
      scoreListDescription: '',
      actionDashboardDescription: 'Rejected',
      modPanelDescription:
        'Reject submission due to poorly provided info in the submission (click to read more)',
    },
  },
};
