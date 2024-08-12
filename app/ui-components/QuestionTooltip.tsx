import type { HTMLAttributes } from 'react';
import { MdQuestionMark } from 'react-icons/md';

type Props = {
  text: string;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function QuestionTooltip({ text, className }: Props) {
  return (
    <div className={`has-tooltip rounded-full cursor-pointer ${className ?? ''}`}>
      <span className="tooltip rounded shadow-lg px-2.5 py-1.5 text-sm bg-white dark:bg-gray-300 -mt-1.5 ml-5">
        {text}
      </span>
      <div className="w-[18px] h-[18px]">
        <MdQuestionMark className="text-sm text-gray-600 dark:text-gray-750 mb-2.5 ml-[2px]" />
      </div>
    </div>
  );
}
