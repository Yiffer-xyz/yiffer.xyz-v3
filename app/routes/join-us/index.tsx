import { useLoaderData } from '@remix-run/react';
import { MdArrowBack, MdArrowForward, MdLogin } from 'react-icons/md';
import Link from '~/components/Link';

export { loader } from '~/routes';

export default function JoinUs() {
  return (
    <div className="container mx-auto">
      <h1>Becoming a mod</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      <p className="mb-4">
        Yiffer.xyz would not be what it is without our wonderful mods. Being a mod is
        voluntary work - in addition to getting the feeling of helping our comic-loving
        community, a reward is the ability to <u>download any comic</u> at the click of a
        button; it&apos;s the least we could do.
      </p>
      <p className="mb-4">
        If we feel satisfied with the amount of mods we currently have, you may be put on
        a waiting list. While it might be the case that more is better, we believe it wise
        to keep the number from being too high.
      </p>
      <ApplyLink />

      <h3 className="font-bold">What are a mod&apos;s tasks?</h3>
      <p>
        In short, helping out with keeping comics up to date, adding new ones, and
        processing user suggestions. We have built a very well functioning admin panel
        which should make this as comfortable as possible, you should even be able to do
        the last part - processing user suggestions - on your phone comfortably. Longer
        and more comprehensive list of the tasks:
      </p>
      <ul className="pl-4 mb-4">
        <li className="mt-3">
          - Processing comic suggestions from others (rejecting them, or uploading the
          comic with pages, information, and tags)
        </li>
        <li className="mt-3">
          - Adding pages to existing comics as they are updated. Additionally swap,
          replace, insert pages, and update thumbnails as needed
        </li>
        <li className="mt-3">
          - Processing tag suggestions from other users (suggestions of adding/removing
          tags to a comic)
        </li>
        <li className="mt-3">- Adding tags to comics where needed</li>
        <li className="mt-3">- Keeping artist information up to date</li>
        <li className="mt-3">
          - You&apos;ll be able to see visitor statistics (numbers per day, and per route
          and comic) if you&apos;re interested
        </li>
        <li className="mt-3">
          - If we decide to re-implement comments at some point, moderating these will
          also be a mod&apos;s job
        </li>
      </ul>
      <p className="mb-6">
        There are some tasks that only the admin(s) of Yiffer.xyz do: Giving final
        approval of comics added by mods, dealing with ads, and writing &quot;blog&quot;
        posts.
      </p>

      <h3 className="font-bold">How much do I have to &quot;work&quot;?</h3>
      <p className="mb-4">
        There is no defined lower requirement for how much a mod should contribute. In the
        admin panel, there is a &quot;Mod scoreboard&quot; that we hope might motivate
        people to do more, but you should not feel bad for not being far up. If we notice
        that someone is really slacking off, and see no activity for months, we will
        always message the person in question before taking any action. If you at any
        point wish to stop being a mod, please do say so instead of simply going inactive.
      </p>
      <ApplyLink />
    </div>
  );
}

const ApplyLink = () => {
  const { user } = useLoaderData();

  return user ? (
    <p className="mb-6">
      <Link href="/join-us/apply" text="Apply as a mod here" IconRight={MdArrowForward} />
    </p>
  ) : (
    <p className="mb-6">
      <b>To apply as a mod, </b>
      <Link href="/login" text="Log in" Icon={MdLogin} />
    </p>
  );
};
