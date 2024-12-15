import Link from '~/ui-components/Link';

export const loader = () => {
  return Response.json(null, { status: 404 });
};

export default function NotFoundPage() {
  return (
    <div className="container mx-auto pt-0 md:pt-6">
      <h1>404</h1>
      <p className="mb-1 mt-1">No page with this URL.</p>
      <Link href="/" text="Go home" showRightArrow />
    </div>
  );
}
