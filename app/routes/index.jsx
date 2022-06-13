import React from 'react';

export default function Index() {
  return (
    <div>
      <h1 className="text-center">Contribute</h1>
      <div className="max-w-4xl mx-auto mt p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-8 sm:p-8">
        <ContributionCard
          title="Upload a comic yourself"
          description="Add files yourself, in addition to specifying artist, tags, and more"
          href="upload"
        />
        <ContributionCard
          title="Suggest a comic"
          description="Suggest a comic for the mod team to upload, providing links and what information you can"
          href="suggest"
        />
        <ContributionCard
          title="Your contributions"
          description="See the status and history of your previous contributions"
          href="your-contributions"
        />
        <ContributionCard
          title="Contributions scoreboard"
          description="See the monthly and all-time top contributors"
          href="scoreboard"
        />
        <ContributionCard
          title="Become a mod"
          description="Be a part of the incredible team that keeps this site running!"
          href="join-us"
        />
        <ContributionCard
          title="Feedback"
          description="Have any tips for how Yiffer.xyz could be better? Let us know!"
          href="feedback"
        />
      </div>
    </div>
  );
}

function ContributionCard({ title, description, href, disabled }) {
  return (
    <a href={'/' + href}>
      <div
        className="rounded-lg shadow-md p-4 hover:shadow-lg h-full flex flex-col 
          justify-evenly bg-white dark:bg-gray-400"
      >
        <h2 className="text-theme2-darker dark:text-theme2-dark text-xl text-center">{title}</h2>
        <p className="text-black font-light text-center">{description}</p>
      </div>
    </a>
  );
}
