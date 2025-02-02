import Link from './Link';
import ShowHideBox from './ShowHideBox/ShowHideBox';

export default function BetaBox() {
  return (
    <div
      className={`fixed bottom-4 right-4 border-theme1-primary dark:border-4 p-3 md:p-4 
    bg-gray-100 rounded max-w-90p md:max-w-[400px] shadow-lg z-[1000] text-white`}
    >
      <p className="text-sm md:text-lg font-semibold">Yiffer.xyz v3 beta 👀</p>
      <p className="text-sm md:text-base hidden md:block">
        You're testing the new version of Yiffer.xyz,
        <br />
        which will go live soon.
      </p>
      <ShowHideBox
        showButtonText="Read more"
        border={false}
        hideButtonText="Hide"
        className="md:mt-2"
        showHideClassName="text-sm md:text-base"
        showHideColorClassName="!text-blue-strong-300"
      >
        <div className="text-sm md:text-base">
          <p className="md:hidden mt-2">
            You're testing the new version of Yiffer.xyz, which will go live soon.
          </p>

          <p className="mt-4 md:mt-2">
            <b>Please report any bugs</b>{' '}
            <Link
              href="/contribute/feedback"
              text="HERE"
              isInsideParagraph
              showRightArrow
              className="!text-blue-strong-300"
            />{' '}
            (we'll read everything). <i>Suggestions</i> can wait, we're mainly looking for
            bugs at the moment. Include your device and browser when reporting bugs.
          </p>
          <p className="mt-4">
            <b>Changes</b> made to this version of the site are inconsequential; fool
            around with submissions and edits as much as you'd like. The more, the better.
          </p>
          <p className="mt-4">
            Do NOT spend time uploading <b>quality content correctly</b>! It'll all be
            reset when we go live. Feel free to upload whatever random files you have
            lying around.
          </p>
          <p className="mt-4">
            Try submitting stuff in the new <b>Contribute section</b>! You can also try
            applying as an advertiser, or a moderator. We want to test the mod panel, so
            we might make you a mod here in the beta - though this does <i>not</i> mean
            you'll become a mod once we go live. Do not pay for any advertisements you
            apply for, naturally.
          </p>
        </div>
      </ShowHideBox>
    </div>
  );
}
