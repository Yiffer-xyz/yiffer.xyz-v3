import type { Comic } from '~/types/types';
import RecalculateNumPages from './RecalculateNumPages';
import { useState } from 'react';
import Button from '~/ui-components/Buttons/Button';
import PurgeComicCache from './PurgeComicCache';
import ComicFileManager from './ComicFileManager';

export default function AdvancedPageManagement({
  comic,
  imagesServerUrl,
  blockActions,
}: {
  comic: Comic;
  imagesServerUrl: string;
  blockActions: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} text="Show advanced page management" />
    );
  }

  return (
    <div className="border-2 border-theme1-primary p-3 pt-2">
      <h3>Advanced page management</h3>
      <Button text="Hide" variant="naked" onClick={() => setIsOpen(false)} noPadding />

      <h4 className="mt-1">Purge cache</h4>
      <p>
        If pages are not showing up correctly, this will purge the Cloudflare CDN cache.
        To verify whether this fixed the pages, open the comic in a private browser window
        and check - your browser might still have the broken pages locally saved.
      </p>

      <PurgeComicCache
        comic={comic}
        imagesServerUrl={imagesServerUrl}
        blockActions={blockActions}
      />

      <h4 className="mt-4">Recalculate number of pages</h4>
      <p>
        If there are pages not showing up, or seemingly broken pages at some spot in the
        comic, this could fix it.
      </p>
      <RecalculateNumPages
        comic={comic}
        imagesServerUrl={imagesServerUrl}
        blockActions={blockActions}
      />

      <h4 className="mt-4">Comic files</h4>
      <p>Show the stored files in the comic's folder, and make changes to them.</p>
      <ComicFileManager comic={comic} imagesServerUrl={imagesServerUrl} />
    </div>
  );
}
