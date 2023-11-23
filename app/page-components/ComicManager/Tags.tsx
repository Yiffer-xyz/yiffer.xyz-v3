import MultiSelect from '~/ui-components/MultiSelect/MultiSelect';
import type { Tag } from '~/types/types';
import type { NewComicData } from '~/routes/contribute_.upload/route';

type TagsEditorProps = {
  allTags: Tag[];
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  className?: string;
};

export default function TagsEditor({
  allTags,
  comicData,
  onUpdate,
  className = '',
}: TagsEditorProps) {
  const tagOptions = allTags.map(tag => ({ value: tag, text: tag.name }));

  return (
    <div className={className}>
      <h4>Tags</h4>

      <MultiSelect
        name="tags"
        title="Tags"
        options={tagOptions}
        value={comicData.tags}
        onChange={newTags => onUpdate({ ...comicData, tags: newTags })}
        equalSingleItemValueFunc={(a, b) => a.id === b?.id}
      />
    </div>
  );
}
