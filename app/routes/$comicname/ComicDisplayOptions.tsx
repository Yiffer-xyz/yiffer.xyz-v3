import { useMemo, useState } from 'react';
import { MdClear } from 'react-icons/md';
import type { PageDisplay } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import IconButton from '~/ui-components/Buttons/IconButton';
import SwitchToggle from '~/ui-components/Buttons/SwitchToggle';
import { useUIPreferences } from '~/utils/theme-provider';

const pageDisplays: PageDisplay[] = ['Fit width', 'Fit height', 'Full size', 'Tiny'];

type ComicDisplayOptionsProps = {
  isReverseOrder: boolean;
  setIsReverseOrder: (isReverseOrder: boolean) => void;
  display: PageDisplay;
  setDisplay: (display: PageDisplay) => void;
};

export default function ComicDisplayOptions({
  isReverseOrder,
  setIsReverseOrder,
  display,
  setDisplay,
}: ComicDisplayOptionsProps) {
  const { comicPageDisplay, comicPageReverseOrder, setPageDisplayAndReverseOrder } =
    useUIPreferences();

  const [isSetDefaultHidden, setIsSetDefaultHidden] = useState(false);

  const hasChanged = useMemo(() => {
    return display !== comicPageDisplay || isReverseOrder !== comicPageReverseOrder;
  }, [display, isReverseOrder, comicPageDisplay, comicPageReverseOrder]);

  function setDefault() {
    setPageDisplayAndReverseOrder({ isReversed: isReverseOrder, newDisplay: display });
  }

  function onChangeReverseOrder() {
    setIsSetDefaultHidden(false);
    setIsReverseOrder(!isReverseOrder);
  }

  function onChangeDisplay(newDisplay: PageDisplay) {
    setIsSetDefaultHidden(false);
    setDisplay(newDisplay);
  }

  return (
    <div className="flex flex-col gap-1.5 mt-6 mb-7 md:mt-5 md:mb-4 md:w-[728px]">
      <p className="font-semibold">Display options</p>

      <div className="flex flex-row gap-2 flex-wrap items-center">
        {pageDisplays.map(display => (
          <Button
            key={display}
            onClick={() => onChangeDisplay(display)}
            text={display}
            className="!py-1 !px-2 font-normal"
          />
        ))}
      </div>

      <SwitchToggle
        label="Reverse page order"
        onChange={onChangeReverseOrder}
        checked={isReverseOrder}
        className="mt-1"
      />

      {hasChanged && !isSetDefaultHidden && (
        <div className="mt-1 flex flex-row items-center">
          <Button
            text="Set as default display"
            className="!py-1 !px-2 font-normal"
            onClick={setDefault}
          />
          <IconButton
            variant="naked"
            icon={MdClear}
            className="ml-0 text-gray-700 dark:text-gray-600"
            onClick={() => setIsSetDefaultHidden(true)}
          />
        </div>
      )}
    </div>
  );
}
