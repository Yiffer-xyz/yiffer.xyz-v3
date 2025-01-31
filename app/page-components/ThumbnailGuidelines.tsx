import cinderfrost from '~/assets/modpanel-instructions/cinderfrost.webp';
import daddys1 from '~/assets/modpanel-instructions/daddys-1.webp';
import daddys2 from '~/assets/modpanel-instructions/daddys-2.webp';
import daddys3 from '~/assets/modpanel-instructions/daddys-3.webp';
import a609_1 from '~/assets/modpanel-instructions/609-1.webp';
import a609_2 from '~/assets/modpanel-instructions/609-2.webp';
import sizeplay1 from '~/assets/modpanel-instructions/sizeplay-1.webp';
import sizeplay2 from '~/assets/modpanel-instructions/sizeplay-2.webp';
import pridefest1 from '~/assets/modpanel-instructions/pridefest-1.webp';
import pridefest2 from '~/assets/modpanel-instructions/pridefest-2.webp';
import bifurcation from '~/assets/modpanel-instructions/bifurcation.webp';
import interned from '~/assets/modpanel-instructions/interned-1.webp';
import interned2 from '~/assets/modpanel-instructions/interned-2.webp';
import Link from '~/ui-components/Link';

export default function ThumbnailGuidelines({ isModPanel }: { isModPanel: boolean }) {
  return (
    <div className="flex flex-col gap-6 md:gap-4 pb-8">
      {isModPanel && (
        <p>
          These rules apply when adding comics yourself, but also when you review comics
          uploaded by users. If a thumbnail is not good according to these rules, you
          should change it.
        </p>
      )}
      <p>
        Make sure there are no borders included in thumbnails. Many comics have white or
        black borders around their pages, but these look bad in thumbnails.
      </p>
      <p>
        If the comic has a cover page, this should naturally be used. Otherwise, the best
        thumbnail is <i>not</i> necessarily the first page. Pick a page that represents
        the comic well, without spoiling and preferably without too explicit content. If a
        page has the comic title on it, that's probably the best choice.
      </p>
      <p>
        The thumbnail doesn't have to be a full page. Sometimes it's better to use only a
        few panels if characters become too small using the full page (examples below). A
        full page is still often the best choice - don't overdo the cropping.
      </p>

      {!isModPanel && (
        <p className="-mb-4 md:-mb-2">
          Please scroll through the examples below to get a feel for the guidelines in
          practice:
        </p>
      )}
      <div className="flex flex-row gap-4 flex-wrap text-sm">
        <ThumbnailExample
          imageSrc={cinderfrost}
          comicName="CinderFrost"
          comicUrl="/c/CinderFrost"
        >
          ✅Good: When a cover page exists, use this regardless of all other instructions.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={daddys1}
          comicName="Daddy's Little Secrets"
          comicUrl="/c/Daddy's%20Little%20Secrets"
        >
          ❌Very bad: White border included (view site in dark mode to see what we mean).
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={daddys2}
          comicName="Daddy's Little Secrets"
          comicUrl="/c/Daddy's%20Little%20Secrets"
        >
          🤷Okay-ish: Crop is fine, but page 1 doesn't necessarily give the best
          indication of what the comic is about.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={daddys3}
          comicName="Daddy's Little Secrets"
          comicUrl="/c/Daddy's%20Little%20Secrets"
        >
          ✅Good: Main characters present and easily visible. Comic is recognizable
          immediately by this thumbnail.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={pridefest1}
          comicName="Pride Fest"
          comicUrl="/c/Pride%20Fest"
        >
          ❌Bad: Needlessly many panels included, hard to see things.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={pridefest2}
          comicName="Pride Fest"
          comicUrl="/c/Pride%20Fest"
        >
          ✅Good: Main characters are visible, easily recognizable.
        </ThumbnailExample>
        <ThumbnailExample imageSrc={a609_1} comicName="609" comicUrl="/c/609">
          ❌Bad: Page 1 is not the one best representing the comic. Main char is not in
          it.
        </ThumbnailExample>
        <ThumbnailExample imageSrc={a609_2} comicName="609" comicUrl="/c/609">
          ✅Good: This page (2) better represents the comic.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={sizeplay1}
          comicName="Size Play"
          comicUrl="/c/Size%20Play"
        >
          ❌Bad: Needlessly explicit, when...
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={sizeplay2}
          comicName="Size Play"
          comicUrl="/c/Size%20Play"
        >
          ✅Good: The page can be cropped instead, making it more recognizable and less
          explicit.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={bifurcation}
          comicName="Bifurcation"
          comicUrl="/c/Bifurcation"
        >
          ✅Good: In this case, page 5 is the one with the title in it.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={interned2}
          comicName="Interned: Vol. 4"
          comicUrl="/c/Interned:%20Vol%204"
        >
          ✅Good: This is okay - the full page is still recognizable, panels not too
          small.
        </ThumbnailExample>
        <ThumbnailExample
          imageSrc={interned}
          comicName="Interned: Vol. 4"
          comicUrl="/c/Interned:%20Vol%204"
        >
          ✅Good: The closer crop also works well. Slightly better.
        </ThumbnailExample>
      </div>
    </div>
  );
}

function ThumbnailExample({
  imageSrc,
  comicName,
  comicUrl,
  children,
}: {
  imageSrc: string;
  comicName: string;
  comicUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[160px]">
      <img src={imageSrc} alt="Thumbnail 7" className="mb-1" />
      <p>{children}</p>
      <Link href={comicUrl} text={comicName} showRightArrow />
    </div>
  );
}
