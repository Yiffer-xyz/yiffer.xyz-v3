import { useState } from 'react';
import MultiSelect from '~/components/MultiSelect/MultiSelect';
import { Tag } from '~/types/types';
import { NewComicData } from '../../routes/contribute/upload';

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
