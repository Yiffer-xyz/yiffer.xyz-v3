import type { Tag } from '~/types/types';

type TagProps = {
  tag: Tag;
  isActive?: boolean;
  onClick?: (id: number) => void;
};

export default function TagElement({ tag, isActive, onClick }: TagProps) {
  const colorsStyle = isActive
    ? 'text-theme1-darker dark:text-theme1-dark dark:border-theme1-dark hover:shadow-none hover:border-gray-900'
    : 'text-gray-500 dark:text-gray-900 dark:border-gray-500 border-gray-900';

  return (
    <div
      key={tag.id}
      onClick={() => onClick && onClick(tag.id)}
      role="button"
      className={`px-1.5 py-[1px] rounded-full leading-0 cursor-pointer hover:shadow
                border border-gray-900  transition-all duration-75 dark:duration-0
                w-fit text-gray-500 hover:text-theme1-darker
                dark:text-gray-900 dark:hover:text-theme1-dark dark:border-gray-500
                hover:border-transparent dark:hover:border-theme1-dark
                ${colorsStyle}`}
    >
      <span className="text-xs">{tag.name}</span>
    </div>
  );
}
