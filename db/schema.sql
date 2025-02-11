------------------------------------------------------
-- USER
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
`id` INTEGER  NOT NULL ,
`username` TEXT NOT NULL,
`password` TEXT NULL DEFAULT NULL,
`email` TEXT NULL DEFAULT NULL,
`userType` TEXT CHECK( `userType` IN ('normal', 'moderator', 'admin') ) NOT NULL DEFAULT 'normal',
`donator` TINYINTEGER NOT NULL DEFAULT '0',
`createdTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`isBanned` TINYINTEGER  NOT NULL DEFAULT '0',
`banReason` TEXT NULL DEFAULT NULL,
`banTimestamp` TIMESTAMP NULL DEFAULT NULL,
`lastActionTimestamp` TIMESTAMP NULL DEFAULT NULL,
`modNotes` TEXT NULL DEFAULT NULL,
`hasCompletedConversion` TINYINTEGER NOT NULL DEFAULT '1',
`patreonDollars` INTEGER NULL DEFAULT NULL,
`patreonEmail` TEXT NULL DEFAULT NULL,
PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_user_unique_username` ON `user` (`Username`);
CREATE INDEX IF NOT EXISTS `idx_user_patreonDollars` ON `user` (`patreonDollars`) WHERE `patreonDollars` IS NOT NULL;

------------------------------------------------------
-- ADVERTISEMENT
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisement` (
`id` TEXT  NOT NULL,
`adType` TEXT CHECK( `adType` IN ('card', 'banner', 'topSmall') ) NOT NULL,
`mediaType` TEXT CHECK( `mediaType` IN ('image', 'video', 'gif') ) NOT NULL,
`adName` TEXT NOT NULL,
`status` TEXT CHECK( `status` IN ('PENDING', 'ACTIVE', 'ENDED', 'NEEDS CORRECTION', 'AWAITING PAYMENT') ) NOT NULL DEFAULT 'PENDING',
`link` TEXT  NOT NULL,
`mainText` TEXT   NULL DEFAULT NULL,
`secondaryText` TEXT   NULL DEFAULT NULL,
`userId` INTEGER  NULL DEFAULT NULL,
`isAnimated` TEXT TINYINTEGER  NOT NULL,
`expiryDate` DATE NULL DEFAULT NULL,
`createdDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`advertiserNotes` TEXT  NULL DEFAULT NULL,
`adminNotes` TEXT   NULL DEFAULT NULL,
`correctionNote` TEXT   NULL DEFAULT NULL,
`isConverted` TINYINTEGER  NOT NULL DEFAULT '0',
`freeTrialState` TEXT CHECK( `freeTrialState` IN ('requested', 'granted', 'denied') ) NULL DEFAULT NULL,
`lastActivationDate` TIMESTAMP NULL DEFAULT NULL,
`numDaysActive` INTEGER NOT NULL DEFAULT '0',
`isChangedWhileActive` TINYINTEGER  NOT NULL DEFAULT '0',
`videoSpecificFileType` TEXT NULL DEFAULT NULL,
`isFromOldSystem` TINYINTEGER  NOT NULL DEFAULT '0',
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`));

CREATE INDEX idx_advertisement_active_adType ON advertisement(adType) WHERE status = 'ACTIVE';

------------------------------------------------------
-- ADVERTISEMENT DAY CLICK
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisementdayclick` (
`adId` TEXT NOT NULL,
`date` DATE NOT NULL,
`clicks` INTEGER  NOT NULL DEFAULT '0',
`impressions` INTEGER  NOT NULL DEFAULT '0',
`impressionsSrv` INTEGER  NOT NULL DEFAULT '0',
PRIMARY KEY (`adId`, `date`),
FOREIGN KEY (`adId`)
REFERENCES `advertisement` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- ADVERTISEMENT PAYMENT
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisementpayment` (
`id` INTEGER  NOT NULL ,
`amount` INTEGER  NOT NULL,
`registeredDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`adId` TEXT NOT NULL,
PRIMARY KEY (`id`),
FOREIGN KEY (`adId`)
REFERENCES `advertisement` (`id`)
ON DELETE RESTRICT
ON UPDATE CASCADE);

------------------------------------------------------
-- ARTIST
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `artist` (
`id` INTEGER  NOT NULL ,
`name` TEXT NOT NULL,
`e621Name` TEXT NULL DEFAULT NULL,
`patreonName` TEXT NULL DEFAULT NULL,
`isPending` TINYINTEGER  NOT NULL DEFAULT '0',
`isBanned` TINYINTEGER  NOT NULL DEFAULT '0',
`isRejected` TINYINTEGER  NOT NULL DEFAULT '0',
PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_artist_unique_name` ON `artist` (`name`);

------------------------------------------------------
-- ARTIST LINK
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `artistlink` (
`linkUrl` TEXT NOT NULL,
`artistId` INTEGER  NOT NULL,
PRIMARY KEY (`artistId`, `linkUrl`),
FOREIGN KEY (`artistId`)
REFERENCES `artist` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- BLOG
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog` (
`id` INTEGER  NOT NULL ,
`title` TEXT  NOT NULL,
`author` INTEGER  NOT NULL,
`content` TEXT  NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`author`)
REFERENCES `user` (`id`));

------------------------------------------------------
-- COMIC
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comic` (
`id` INTEGER  NOT NULL ,
`name` TEXT NOT NULL,
`category` TEXT CHECK( `category` IN ('M', 'F', 'MF', 'MM', 'FF', 'MF+', 'I') ) NOT NULL,
`numberOfPages` INTEGER NOT NULL,
`published` TIMESTAMP NULL DEFAULT NULL,
`updated` TIMESTAMP NULL DEFAULT NULL,
`state` TEXT CHECK( `state` IN ( 'wip', 'cancelled', 'finished' )) NOT NULL DEFAULT 'wip',
`artist` INTEGER  NOT NULL,
`publishStatus` TEXT CHECK( `publishStatus` IN ( 'published', 'pending', 'uploaded', 'rejected', 'rejected-list', 'scheduled', 'unlisted') ) NOT NULL DEFAULT 'pending',
`hasHighresThumbnail` TINYINTEGER  NOT NULL DEFAULT '1',
PRIMARY KEY (`id`),
FOREIGN KEY (`artist`)
REFERENCES `artist` (`id`)
ON UPDATE CASCADE);

CREATE INDEX IF NOT EXISTS idx_comicName ON comic (name);
CREATE INDEX IF NOT EXISTS idx_comic_artist ON comic(artist);
CREATE INDEX IF NOT EXISTS idx_comic_updated ON comic(updated);

------------------------------------------------------
-- KEYWORD 👀
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `keyword` (
`id` INTEGER  NOT NULL ,
`keywordName` TEXT NOT NULL,
PRIMARY KEY (`id`));

CREATE UNIQUE INDEX IF NOT EXISTS `idx_keyword_unique_keywordname` ON `keyword` (`KeywordName`);

------------------------------------------------------
-- COMIC KEYWORD 👀
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comickeyword` (
`comicId` INTEGER  NOT NULL,
`keywordId` INTEGER  NOT NULL,
PRIMARY KEY (`comicId`, `keywordId`),
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`keywordId`)
REFERENCES `keyword` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- COMIC LINK 👀
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comiclink` (
`firstComic` INTEGER  NULL DEFAULT NULL,
`lastComic` INTEGER  NULL DEFAULT NULL,
`id` INTEGER  NOT NULL ,
PRIMARY KEY (`id`),
FOREIGN KEY (`firstComic`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`lastComic`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE INDEX IF NOT EXISTS idx_comiclink_firstComic ON comiclink(firstComic);
CREATE INDEX IF NOT EXISTS idx_comiclink_lastComic ON comiclink(lastComic);

------------------------------------------------------
-- COMIC METADATA
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicmetadata` (
`id` INTEGER  NOT NULL ,
`comicId` INTEGER  NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`errorText` TEXT NULL DEFAULT NULL,
`publishDate` DATE NULL DEFAULT NULL,
`modId` INTEGER  NULL DEFAULT NULL,
`modComment` TEXT NULL DEFAULT NULL,
`verdict` TEXT CHECK( `verdict` IN ('excellent', 'minor-issues', 'major-issues', 'page-issues', 'terrible', 'rejected', 'rejected-list')) NULL DEFAULT NULL,
`uploadUserId` INTEGER  NULL DEFAULT NULL,
`uploadUserIP` TEXT NULL DEFAULT NULL,
`uploadId` TEXT NULL DEFAULT NULL,
`originalNameIfRejected` TEXT NULL DEFAULT NULL,
`originalArtistIfRejected` TEXT NULL DEFAULT NULL,
`scheduleModId` INTEGER  NULL DEFAULT NULL,
`publishingQueuePos` INTEGER NULL DEFAULT NULL,
`unlistComment` TEXT NULL DEFAULT NULL,
`pendingProblemModId` INTEGER  NULL DEFAULT NULL,
`hasHighresThumbnail` TINYINTEGER  NOT NULL DEFAULT '1',
`source` TEXT NULL DEFAULT NULL,
PRIMARY KEY (`id`)
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`modId`)
REFERENCES `user` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE,
FOREIGN KEY (`scheduleModId`)
REFERENCES `user` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE,
FOREIGN KEY (`pendingProblemModId`)
REFERENCES `user` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE);

------------------------------------------------------
-- COMIC PROBLEM
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicproblem` (
`id` INTEGER  NOT NULL ,
`description` TEXT NOT NULL,
`comicId` INTEGER  NOT NULL,
`problemCategory` TEXT NOT NULL,
`modId` INTEGER  NULL DEFAULT NULL,
`userIP` TEXT NULL DEFAULT NULL,
`userId` INTEGER  NULL DEFAULT NULL,
`status` TEXT CHECK( `status` IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`modId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- COMIC SUGGESTION
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicsuggestion` (
`id` INTEGER  NOT NULL ,
`name` TEXT NOT NULL,
`artistName` TEXT NULL DEFAULT NULL,
`description` TEXT NULL DEFAULT NULL,
`userId` INTEGER  NULL DEFAULT NULL ,
`userIP` TEXT NULL DEFAULT NULL,
`status` TEXT CHECK( `status` IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
`verdict` TEXT CHECK( `verdict` IN ('good', 'bad') ) NULL DEFAULT NULL,
`modComment` TEXT NULL DEFAULT NULL,
`modId` INTEGER  NULL DEFAULT NULL,
`timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`));

------------------------------------------------------
-- CONTRIBUTION POINTS
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contributionpoints` (
`id` INTEGER  NOT NULL ,
`yearMonth` TEXT NOT NULL,
`userId` INTEGER  NULL DEFAULT NULL,
`tagSuggestion` INTEGER  NOT NULL DEFAULT '0',
`comicProblem` INTEGER  NOT NULL DEFAULT '0',
`comicSuggestiongood` INTEGER  NOT NULL DEFAULT '0',
`comicSuggestionbad` INTEGER  NOT NULL DEFAULT '0',
`comicUploadexcellent` INTEGER  NOT NULL DEFAULT '0',
`comicUploadminorissues` INTEGER  NOT NULL DEFAULT '0',
`comicUploadmajorissues` INTEGER  NOT NULL DEFAULT '0',
`comicUploadpageissues` INTEGER  NOT NULL DEFAULT '0',
`comicUploadterrible` INTEGER  NOT NULL DEFAULT '0',
`tagSuggestionRejected` INTEGER  NOT NULL DEFAULT '0',
`comicProblemRejected` INTEGER  NOT NULL DEFAULT '0',
`comicUploadRejected` INTEGER  NOT NULL DEFAULT '0',
`comicSuggestionRejected` INTEGER  NOT NULL DEFAULT '0',
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- FEEDBACK 👀
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedback` (
`id` INTEGER  NOT NULL ,
`text` TEXT NOT NULL,
`userId` INTEGER  NULL DEFAULT NULL,
`userIP` TEXT NULL DEFAULT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`type` TEXT CHECK( type IN ('bug', 'general', 'support') ) NOT NULL DEFAULT 'general',
`isArchived` TINYINTEGER  NOT NULL DEFAULT '0',
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- MOD APPLICATION
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modapplication` (
`id` INTEGER  NOT NULL ,
`userId` INTEGER  NOT NULL,
`telegramUsername` TEXT NOT NULL,
`notes` TEXT NOT NULL,
`status` TEXT CHECK( status IN ('pending', 'approved', 'rejected', 'on-hold') ) NULL DEFAULT 'pending',
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- RESET TOKEN
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resettoken` (
`token` TEXT NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`isUsed` TINYINTEGER NOT NULL DEFAULT '0',
`userId` INTEGER  NOT NULL,
PRIMARY KEY (`token`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- EMAIL CHANGE CODE
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `emailchangecode` (
`code` TEXT NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`isUsed` TINYINTEGER NOT NULL DEFAULT '0',
`userId` INTEGER  NOT NULL,
`newEmail` TEXT NOT NULL,
PRIMARY KEY (`code`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- SPAMMABLE ACTION
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `spammableaction` (
`id` INTEGER  NOT NULL ,
`ip` TEXT NOT NULL,
`email` TEXT   NULL DEFAULT NULL,
`username` TEXT   NULL DEFAULT NULL,
`actionType` TEXT NOT NULL,
PRIMARY KEY (`id`));

------------------------------------------------------
-- COMIC RATING
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicrating` (
`userId` INTEGER  NOT NULL,
`comicId` INTEGER  NOT NULL,
`rating` INTEGER  NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`userId`, `comicId`),
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_comicrating_unique_user_comic` ON `comicrating` (`userId`, `comicId`);
CREATE INDEX IF NOT EXISTS idx_comicrating_comicId ON comicrating(comicId);

------------------------------------------------------
-- COMIC BOOKMARK
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicbookmark` (
  `userId` INTEGER  NOT NULL,
  `comicId` INTEGER  NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`, `comicId`),
  FOREIGN KEY (`comicId`)
  REFERENCES `comic` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (`userId`)
  REFERENCES `user` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_comicbookmark_unique_user_comic` ON `comicbookmark` (`userId`, `comicId`);

------------------------------------------------------
-- TAG SUGGESTION GROUP
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tagsuggestiongroup` (
`id` INTEGER  NOT NULL,
`comicId` INTEGER  NOT NULL,
`userId` INTEGER  NULL DEFAULT NULL,
`userIP` TEXT NULL DEFAULT NULL,
`isProcessed` TINYINTEGER  NOT NULL DEFAULT '0',
`modId` INTEGER  NULL DEFAULT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
FOREIGN KEY (`modId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- TAG SUGGESTION ITEM
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tagsuggestionitem` (
`id` INTEGER  NOT NULL,
`tagSuggestionGroupId` INTEGER  NOT NULL,
`keywordId` INTEGER  NOT NULL,
`isAdding` TINYINTEGER NOT NULL,
`isApproved` TINYINTEGER NULL DEFAULT NULL,
PRIMARY KEY (`id`),
FOREIGN KEY (`tagSuggestionGroupId`)
REFERENCES `tagsuggestiongroup` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`keywordId`)
REFERENCES `keyword` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- OLD COMIC RATING
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `oldcomicrating` (
`comicId` INTEGER  NOT NULL,
`userId` INTEGER  NOT NULL,
`rating` INTEGER  NOT NULL,
PRIMARY KEY (`comicId`, `userId`),
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE INDEX IF NOT EXISTS idx_userId ON oldcomicrating(userId);

------------------------------------------------------
-- DB QUERY LOGS
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbquerylogs` (
`id` INTEGER NOT NULL,
`queryName` TEXT NOT NULL,
`extraInfo` TEXT NULL,
`rowsRead` INTEGER NOT NULL,
`queryType` TEXT NOT NULL CHECK( queryType IN ('read', 'write') ),
`time` REAL NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`));

------------------------------------------------------
-- COMICS PAGINATED CACHE
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comicspaginatedcache` (
`id` INTEGER NOT NULL,
`comicsJson` TEXT NOT NULL,
`page` INTEGER NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`));

CREATE UNIQUE INDEX IF NOT EXISTS idx_comicspaginatedcache_unique_page ON comicspaginatedcache (page);

------------------------------------------------------
-- MOD MESSAGES
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modmessage` (
`id` INTEGER NOT NULL,
`title` TEXT NOT NULL,
`message` TEXT NOT NULL,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`));

------------------------------------------------------
-- MOD MESSAGE READ RECEIPT
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modmessagereadreceipt` (
`userId` INTEGER NOT NULL,
`messageId` INTEGER NOT NULL,
PRIMARY KEY (`userId`, `messageId`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`messageId`)
REFERENCES `modmessage` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- MOD INSTRUCTIONS READ RECEIPT
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modinstructionsreadreceipt` (
`userId` INTEGER NOT NULL,
`instructionId` TEXT NOT NULL,
PRIMARY KEY (`userId`, `instructionId`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

------------------------------------------------------
-- MOD ACTIONS
------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modaction` (
`id` INTEGER NOT NULL,
`userId` INTEGER NOT NULL,
`comicId` INTEGER NULL DEFAULT NULL,
`artistId` INTEGER NULL DEFAULT NULL,
`dashboardActionId` INTEGER NULL DEFAULT NULL,
`text` TEXT NULL DEFAULT NULL,
`actionType` TEXT NOT NULL,
`points` INTEGER NOT NULL DEFAULT 0,
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
FOREIGN KEY (`userId`)
REFERENCES `user` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`comicId`)
REFERENCES `comic` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (`artistId`)
REFERENCES `artist` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE INDEX IF NOT EXISTS idx_modaction_userId ON modaction(userId);
