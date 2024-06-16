import { MdCheck, MdClose } from 'react-icons/md';
import type { Tag } from '~/types/types';

type TagProps = {
  tag: Tag | { name: string };
  isActive?: boolean;
  disableHoverEffects?: boolean;
  approvalState?: boolean | undefined;
  onClick?: (id: number) => void;
};

function isTagFullTag(tag: Tag | { name: string }): tag is Tag {
  return (tag as Tag).id !== undefined;
}

export default function TagElement({
  tag,
  isActive,
  disableHoverEffects,
  approvalState,
  onClick,
}: TagProps) {
  const colorsClassName = isActive
    ? `text-theme1-darker dark:text-theme1-dark dark:border-theme1-dark hover:shadow-none hover:border-gray-900`
    : 'text-gray-500 dark:text-gray-900 dark:border-gray-500 border-gray-900';

  const hoverEffectsClassName = disableHoverEffects
    ? 'cursor-default'
    : `dark:hover:text-theme1-dark hover:text-theme1-darker hover:shadow
      hover:border-transparent dark:hover:border-theme1-dark cursor-pointer `;

  return (
    <div
      key={tag.name}
      onClick={() => isTagFullTag(tag) && onClick && onClick(tag.id)}
      role="button"
      className={`px-1.5 py-[1px] pb-[2px] rounded-full leading-0 
                border border-gray-900  transition-all duration-75 dark:duration-0
                w-fit text-gray-500 dark:border-gray-500 dark:text-gray-900 h-fit
                ${hoverEffectsClassName}
                ${colorsClassName}`}
    >
      {approvalState === true && (
        <MdCheck
          size={14}
          className="mt-[3px] mr-0.5 text-theme1-darker dark:text-theme1-dark"
        />
      )}
      {approvalState === false && (
        <MdClose size={14} className="mt-[3px] mr-0.5 text-red-strong-200" />
      )}
      <span className="text-xs">{tag.name}</span>
    </div>
  );
}
