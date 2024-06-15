import MultiSelect from '~/ui-components/MultiSelect/MultiSelect';
import type { Tag } from '~/types/types';

type TagsEditorProps = {
  allTags: Tag[];
  tags: Tag[];
  onUpdate: (newTags: Tag[]) => void;
  includeClearAll?: boolean;
  className?: string;
};

export default function TagsEditor({
  allTags,
  tags,
  onUpdate,
  includeClearAll,
  className = '',
}: TagsEditorProps) {
  const tagOptions = allTags.map(tag => ({ value: tag, text: tag.name }));

  return (
    <div className={className}>
      <MultiSelect
        name="tags"
        title="Tags"
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
