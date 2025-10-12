import type { Artist } from '~/types/types';
import Link from '~/ui-components/Link';

const websiteImgPath = 'website-images';

export default function ArtistLinks({
  artist,
  pagesPath,
}: {
  artist: Artist;
  pagesPath: string;
}) {
  return (
    <div className="mt-4">
      {(artist.e621Name || artist.patreonName) && (
        <div className="mb-4 flex flex-col gap-1">
          {artist.e621Name && (
            <div className="flex flex-row items-center">
              <img
                src={`${pagesPath}/${websiteImgPath}/e621.png`}
                alt="E621 icon"
                className="w-5 h-5 mb-0.5"
              />
              <Link
                newTab
                href={`https://e621.net/posts?tags=${artist.e621Name}`}
                text={`E621: ${artist.e621Name}`}
                className="text-lg whitespace-pre-wrap break-all"
              />
            </div>
          )}
          {artist.patreonName && (
            <div className="flex flex-row items-center gap-1">
              <img
                src={`${pagesPath}/${websiteImgPath}/patreon.png`}
                alt="Patreon icon"
                className="w-4 h-4 mb-0.5"
              />
              <Link
                newTab
                href={`https://patreon.com/${artist.patreonName}`}
                text={`Patreon: ${artist.patreonName}`}
                className="text-lg whitespace-pre-wrap break-all"
              />
            </div>
          )}
        </div>
      )}

      {artist.links.map(link => {
        const siteImgPath = linkToSiteIcon(link);

        return (
          <div className="flex flex-row items-center gap-1 mb-1" key={link}>
            {siteImgPath && (
              <img
                src={`${pagesPath}/${siteImgPath}`}
                alt="Site icon"
                className="w-4 h-4"
              />
            )}
            <Link
              newTab
              href={link}
              text={link}
              className="whitespace-pre-wrap break-all"
            />
          </div>
        );
      })}
    </div>
  );
}

function linkToSiteIcon(link: string): string | null {
  if (link.includes('e621.net')) return `${websiteImgPath}/e621.png`;
  if (link.includes('patreon.com')) return `${websiteImgPath}/patreon.png`;
  if (link.includes('twitter') || link.includes('://x.com/') || link.startsWith('x.com'))
    return `${websiteImgPath}/twitter.png`;
  if (link.includes('furaffinity.net')) return `${websiteImgPath}/furaffinity.png`;
  if (link.includes('deviantart.com')) return `${websiteImgPath}/deviantart.png`;
  if (link.includes('furrynetwork')) return `${websiteImgPath}/furrynetwork.png`;
  if (link.includes('hentaifoundry')) return `${websiteImgPath}/hentaifoundry.png`;
  if (link.includes('inkbunny')) return `${websiteImgPath}/inkbunny.png`;
  if (link.includes('pixiv')) return `${websiteImgPath}/pixiv.png`;
  if (link.includes('sofurry')) return `${websiteImgPath}/sofurry.png`;
  if (link.includes('tumblr')) return `${websiteImgPath}/tumblr.png`;
  if (link.includes('weasyl')) return `${websiteImgPath}/weasyl.png`;
  if (link.includes('bsky.app')) return `${websiteImgPath}/bluesky.png`;

  return null;
}
