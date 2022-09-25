// TABLEs for tag suggestion, comic problems, and comic suggestions already exist,
// as does the functionality for adding them. First step will be to modify the api
// logic there to add a couple of fields to indicate status and points.
// Then, in this call (to get your contributions), fetch from all these sources,
// to get all contributions. In addition to fetching from the new ComicUpload table,
// of course.

// comicUpload table:
// comicName
// artistId  - will be NULL if the artist didn't exist. Then, and only then, will the other artist fields be populated.
// cat
// tag (yeah, bad names, but they're what we use in the existing ones as well, let's keep it consisten)
// state (wip, finished, cancelled)
// numberOfPages
// timestamp
// status (pending, approved, rejected, rejected-list)  // the last one should be fetched and checked for when adding a new comic
// points (nullable)
// pointDescription (nullable)
// modComment (nullable)
// newArtistName (nullable)
// newArtistPatreonName (nullable)
// newArtistE621Name (nullable)
// See the 3 below tables as well

// pendingUploadKeyword table:
// keywordId, comicId

// uploadComicLink table:
// firstComic, lastComic                (IDs referring to LIVE comics)
// firstPendingComic, lastPendingComic  (IDs referring to PENDING comics)
// firstUploadComic, lastUploadComic    (IDs referring to UPLOADED comics - these ones)
//     So, each row will have 2 of these 6 set, where at least one will be firstUploadComic or lastUploadComic
//     It's not very pretty, but the alternative is a biig rewrite going from having
//     3 tables (comic, pendingcomic, comicUpload) to just having one table for all of them
//     I like this approach better. Only with links does this ugly problem arise.
//     Otherwise, we just have to copy data over when a comic goes from one of these "states" to another.
//     And that's easy.
//     Regardless, if we ever want that rewrite, it'll be after ALL of yiffer is on the edge.

// newArtistLink table:
// comicUploadId
// linkType (furaffinity, inkbunny, etc - autocomputed on the server from link url)
// linkUrl

// Result of query that gets the basic stats of your contributions,
// also fetching artist name, and some counts of keywords:
const uploadedComicsQueryRes = [
  {
    comicName: 'Outside the Box',
    artistName: 'Wolfy-Nail',
    status: 'Pending',
    timestamp: '2022-01-01T13:13:13',
    points: null,
    pointDescription: null,
    modComment: null,
    numberOfPages: 14,
    numberOfKeywords: 3,
  },
  {
    comicName: 'Comic comic',
    artistName: 'Tokifuji',
    status: 'Approved',
    timestamp: '2021-12-12T13:13:13',
    points: 150,
    pointDescription: 'Minor issues found',
    modComment: 'Comic name incorrect',
    numberOfPages: 11,
    numberOfKeywords: 34,
  },
  {
    comicName: 'Third comic',
    artistName: 'Third artist',
    status: 'Rejected',
    timestamp: '2021-11-04T13:13:13',
    points: 0,
    pointDescription: null,
    modComment: 'Comic quality is too low',
    numberOfPages: 5,
    numberOfKeywords: 0,
  },
];

// Result of a query
const comicSuggestionsQueryRes = [
  {
    comicName: 'Suggestive comic',
    status: 'Approved',
    timestamp: '2022-05-04T13:13:13',
    points: 15,
    pointDescription: 'Minor issues found',
    modComment: 'Some linked pages have a low res',
  },
  {
    comicName: 'Some bad comic',
    status: 'Rejected',
    timestamp: '2021-01-04T13:13:13',
    points: 0,
    pointDescription: null,
    modComment: 'Bad link',
  },
];

const comicProblemsQueryRes = [
  {
    comicName: 'Comic comic',
    status: 'Approved',
    timestamp: '2022-10-12T13:13:13',
    points: 10,
    pointDescription: null,
    modComment: null,
    problemCategory: 'Page order wrong',
  },
  {
    comicName: 'Comic comic',
    status: 'Rejected',
    timestamp: '2018-05-20T13:13:13',
    points: 0,
    pointDescription: null,
    modComment: null,
    problemCategory: 'Update missing',
  },
];

const keywordSuggestionQueryRes = [
  {
    comicName: 'Cats Can Fetch',
    status: 'Approved',
    timestamp: '2022-03-12T13:13:13',
    points: 5,
    pointDescription: null,
    modComment: null,
    suggestion: 'Add anal',
  },
  {
    comicName: 'Weekend 3',
    status: 'Rejected',
    timestamp: '2022-02-12T13:13:13',
    points: 0,
    pointDescription: null,
    modComment: null,
    suggestion: 'Remove anthro',
  },
];

export {
  uploadedComicsQueryRes,
  comicSuggestionsQueryRes,
  comicProblemsQueryRes,
  keywordSuggestionQueryRes,
};
