import type { MetaFunction } from '@remix-run/cloudflare';
import ThumbnailGuidelines from '~/page-components/ThumbnailGuidelines';

export const meta: MetaFunction = () => {
  return [{ title: `Thumbnail guidelines | Yiffer.xyz` }];
};

export default function ThumbnailInstructions() {
  return (
    <div className="container mx-auto">
      <h1>Thumbnail Guidelines</h1>
      <ThumbnailGuidelines isModPanel={false} />
    </div>
  );
}
