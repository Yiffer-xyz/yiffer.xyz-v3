import ShowHideBox from './ShowHideBox/ShowHideBox';

export default function ModContributionPointInfo() {
  return (
    <ShowHideBox
      showButtonText="Show point info"
      hideButtonText="Hide point info"
      className="w-fit"
    >
      <>
        <p className="text-sm font-semibold mt-1">Mod dashboard processing</p>

        <div
          className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
          style={{ gridTemplateColumns: 'auto auto' }}
        >
          <p className="text-sm">
            <b>20</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Uploaded comic processed
          </p>
          <p className="text-sm">
            <b>5</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic suggestion processed
          </p>
          <p className="text-sm">
            <b>5</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Tag suggestion processed
          </p>
          <p className="text-sm">
            <b>5</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic problem processed
          </p>
        </div>
        <p className="text-sm mt-0.5 italic text-text-weakLight dark:text-text-weakDark">
          Note: Edits made in relation to processing dashboard items (like comic changes)
          award their own points.
        </p>
        <p className="text-sm italic text-text-weakLight dark:text-text-weakDark">
          The above points are just for the dashboard item processing itself.
        </p>

        <p className="text-sm font-semibold mt-2">Comic changes</p>

        <div
          className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
          style={{ gridTemplateColumns: 'auto auto' }}
        >
          <p className="text-sm">
            <b>150</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic uploaded
          </p>
          <p className="text-sm">
            <b>10</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic data updated
          </p>
          <p className="text-sm">
            <b>15</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic tags updated
          </p>
          <p className="text-sm">
            <b>30</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic thumbnail changed
          </p>
          <p className="text-sm">
            <b>30</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Comic pages added, removed, or changed
          </p>
        </div>

        <p className="text-sm font-semibold mt-2">Other</p>

        <div
          className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
          style={{ gridTemplateColumns: 'auto auto' }}
        >
          <p className="text-sm">
            <b>10</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Artist data updated
          </p>
          <p className="text-sm">
            <b>20</b>
          </p>
          <p className="text-sm text-text-weakLight dark:text-text-weakDark">
            Tag updated or created
          </p>
        </div>
      </>
    </ShowHideBox>
  );
}
