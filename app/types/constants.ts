export const COMIC_PROBLEM_CATEGORIES = [
  {
    title: 'Update missing',
    description:
      'The comic has been updated elsewhere, but not on Yiffer.xyz. Please provide a link to the page(s)!',
  },
  {
    title: 'Page order wrong',
    description: 'Please describe which pages are incorrectly ordered.',
  },
  {
    title: 'Middle pages missing',
    description: 'Please describe which pages are missing.',
  },
  {
    title: 'Low page resolution',
    description: `The comic exists in a greater resolution AVAILABLE TO THE PUBLIC. If only some pages are in a lower resolution, please describe which ones. Please provide a link to the higher res version of the comic. Note: Yiffer.xyz has a maximum page height of 2200 pixels, so there's no use in reporting this for comics that already have their pages 2200px tall.`,
  },
  {
    title: 'Comic info wrong',
    description: `The comic's name, tag (MF/etc), wip/done state, or prev/next comic is wrong or missing. Please describe what is incorrect.`,
  },
  {
    title: 'Artist issue',
    description: `The comic's artist is wrong, or the artist is missing links. Please include the missing links, or the correct artist name.`,
  },
  {
    title: 'Other',
    description: `Please describe the issue.`,
  },
];
