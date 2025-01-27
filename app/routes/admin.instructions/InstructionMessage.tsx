import { format } from 'date-fns';
import type { ModPanelMessage } from '~/types/types';
import ShowHideBox from '~/ui-components/ShowHideBox/ShowHideBox';

export default function InstructionMessage({
  instruction,
  onRead,
}: {
  instruction: ModPanelMessage;
  onRead: () => void;
}) {
  const title = instruction.isRead
    ? instruction.title
    : `❗${instruction.title} (unread)`;

  return (
    <ShowHideBox
      showButtonText={title}
      border={false}
      underline={false}
      onExpand={onRead}
      openClassName="mb-2"
    >
      <p className="text-xs">{format(instruction.timestamp, 'PPPP')}</p>
      <p>{instruction.message}</p>
    </ShowHideBox>
  );
}
