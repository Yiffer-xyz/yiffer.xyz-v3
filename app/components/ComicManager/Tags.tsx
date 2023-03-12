import { useState } from 'react';
import MultiSelect from '~/components/MultiSelect/MultiSelect';
import { Tag } from '~/types/types';
import { NewComicData } from '../../routes/contribute/upload';

type TagsEditorProps = {
  allTags: Tag[];
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

export default function TagsEditor({ allTags, comicData, onUpdate }: TagsEditorProps) {
  const tagOptions = allTags.map(tag => ({ value: tag, text: tag.name }));
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  function onTagsUpdate(newVal: Tag[]) {
    setSelectedTags(newVal);
    const newTagIds = newVal.map(tag => tag.id);
    onUpdate({ ...comicData, tagIds: newTagIds });
  }

  return (
    <>
      <h4 className="mt-8">Tags</h4>

      <MultiSelect
        name="tags"
        title="Tags"
        options={tagOptions}
        value={selectedTags}
        onChange={onTagsUpdate}
      />
    </>
  );
}
