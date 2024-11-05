import MultiSelect from '~/ui-components/MultiSelect/MultiSelect';
import type { Tag } from '~/types/types';
import type { HTMLAttributes } from 'react';

type TagsEditorProps = {
  allTags: Tag[];
  tags: Tag[];
  onUpdate: (newTags: Tag[]) => void;
  includeClearAll?: boolean;
  title?: string;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function TagsEditor({
  allTags,
  tags,
  onUpdate,
  includeClearAll,
  title,
  className = '',
}: TagsEditorProps) {
  const tagOptions = allTags.map(tag => ({ value: tag, text: tag.name }));

  return (
    <div className={className}>
      <MultiSelect
        name="tags"
        title={title}
        options={tagOptions}
        value={tags}
        onChange={newTags => onUpdate(newTags)}
        equalSingleItemValueFunc={(a, b) => a.id === b?.id}
        includeClearAll={includeClearAll}
        placeholder="Find tag"
      />
    </div>
  );
}
