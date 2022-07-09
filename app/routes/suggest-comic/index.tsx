import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Suggest a comic</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      <p>
        TODO: Basically just recreate the existing one. TopGradientBox to wrap the form.
      </p>
      <p>I don't think we need the previously rejected comics list to be honest.</p>
      <br />

      <p>
        <b>Avoiding duplicates</b>
      </p>
      <p>
        HOWEVER, an addition to the prototype: Whenever a user has typed a comic name
        (maybe wait 3-5 sec after typing is finished, "debounce"), do a check to see if
        there exist comics with a similar name that are either live, or in some kind of
        pending state in either comicSuggestions or uploadedComics. If so, display a
        warning with a checkbox beneath the name input:
      </p>
      <br />
      <ul>
        <li>
          "The following comics with similar names already exists in our system. If the
          comic you are suggesting is the same as one of these, please do not suggest it.
          If the comics are not available on Yiffer.xyz, they are most likely in a pending
          state from someone else's submission."
        </li>
        <li>- Comic name A</li>
        <li>- Comic name B</li>
        <li>
          Then, a checkbox with the text "The suggested comic is not one of the above"
        </li>
      </ul>
      <br />
      <p>
        Submission is to be prevented unless the checkbox is checked. The name comparison
        logic will need to be invented, of course. Some kind of edit distance should do.
        This will mean that comic chapters will be considered similar to other chapters,
        but that's all right.
      </p>
      <br />
      <p>
        <b>Avoiding "banned" artists</b>
      </p>
      <p>
        We should also add a new table containing names of artists who have requested not
        to be hosted. Same thing here - after the user has typed an artist name, debounce,
        do a check to see if an artist with a similar name (edit distance) exists in that
        table - choose the most similar one. If so "An artist with the name XXXXX has
        requested we do not hos their comics." and checkbox with the text "This is a
        different artist".
      </p>
    </div>
  );
}
