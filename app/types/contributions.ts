export type ComicSuggestionVerdict = 'good' | 'bad';
export type ComicUploadVerdict =
  | 'excellent'
  | 'minor-issues'
  | 'major-issues'
  | 'page-issues';

export const CONTRIBUTION_POINTS = {
  comicSuggestion: {
    good: {
      points: 30,
      description: undefined,
    },
    bad: {
      points: 15,
      description: 'Lacking links/info',
    },
  },
  comicUpload: {
    excellent: {
      points: 200,
      description: undefined,
    },
    'minor-issues': {
      points: 150,
      description: 'Minor issues',
    },
    'major-issues': {
      points: 100,
      description: 'Major issues',
    },
    'page-issues': {
      points: 50,
      description: 'Page issues',
    },
  },
};
