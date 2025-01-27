import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import type { ModPanelMessage } from '~/types/types';
import InstructionMessage from './InstructionMessage';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import { ADMIN_INSTRUCTIONS } from '~/types/constants';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { getUnreadInstructions } from '~/route-funcs/get-read-instructions';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Instructions | Yiffer.xyz` }];
};

type DbModMessage = Omit<ModPanelMessage, 'isRead' | 'timestamp'> & {
  timestamp: string;
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const db = args.context.cloudflare.env.DB;

  const messagesQuery = `SELECT modmessage.id, modmessage.title, modmessage.message, modmessage.timestamp
    FROM modmessage
    ORDER BY modmessage.timestamp DESC`;

  const messagesRes = await queryDb<DbModMessage[]>(
    db,
    messagesQuery,
    null,
    'Mod messages'
  );

  if (messagesRes.isError) {
    return processApiError('Error getting mod messages', {
      ...messagesRes,
      logMessage: '',
    });
  }

  const readContents = await getUnreadInstructions(db, user.userId);
  if (readContents.err) {
    return processApiError('Error getting unread instructions', readContents.err);
  }

  const messages: ModPanelMessage[] = messagesRes.result.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
    isRead: !readContents.result.unreadMessages.includes(msg.id),
  }));

  const detailedInstructions = ADMIN_INSTRUCTIONS.map(instruction => ({
    ...instruction,
    isRead: !readContents.result.unreadInstructions.includes(instruction.id),
  }));

  return { messages, detailedInstructions };
}

export default function AdminInstructions() {
  const { messages, detailedInstructions } = useLoaderData<typeof loader>();

  const markMessageReadFetcher = useGoodFetcher({
    url: '/api/admin/mark-mod-message-read',
    method: 'post',
  });

  function onReadInstruction(message: ModPanelMessage) {
    if (message.isRead) return;
    const formData = new FormData();
    formData.append('messageId', message.id.toString());
    markMessageReadFetcher.submit(formData);
  }

  return (
    <div className="max-w-6xl">
      <h1>Mod instructions</h1>

      <h2 className="mt-2">Messages</h2>
      <div className="flex flex-col gap-y-2 mt-1">
        {messages.map(instruction => (
          <InstructionMessage
            key={instruction.id}
            instruction={instruction}
            onRead={() => onReadInstruction(instruction)}
          />
        ))}
      </div>

      <h2 className="mt-4">Detailed instructions</h2>
      <p>
        These must all be read before you can start doing your mod duties. It won't take
        many minutes, but it's <u>absolutely crucial</u> that you read them. We cannot
        have mods who don't know what they're doing causing admins to have to do clean-up,
        and we will not be very tolerant towards mods who repeatedly don't act in
        accordance with these instructions.
      </p>
      <div className="flex flex-col gap-y-2 mt-2 w-fit">
        {detailedInstructions.map(instruction => (
          <LinkCard
            key={instruction.id}
            href={`/admin/instructions/${instruction.id}`}
            title={`${instruction.isRead ? '' : '❗'}${instruction.title}${instruction.isRead ? '' : ' (unread)'}`}
            description={instruction.message}
            includeRightArrow
          />
        ))}
      </div>
    </div>
  );
}
