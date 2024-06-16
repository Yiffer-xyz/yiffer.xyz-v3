import { useEffect, useState } from 'react';
import { MdAdd, MdCheck, MdClose, MdRemove } from 'react-icons/md';
import type { TagSuggestionAction } from '~/routes/admin.dashboard/TagSuggestion';
import type { TagSuggestionItem } from '~/types/types';
import VerdictToggleButton from '~/ui-components/Buttons/VerdictToggleButton';
import Button from '~/ui-components/Buttons/Button';

type TagSuggestionProcessorProps = {
  tagSuggestionItem: TagSuggestionAction;
  onUpdate: (verdicts: TagSuggestionItem[], completed: boolean) => void;
  disableActions?: boolean;
};

export default function TagSuggestionProcessor({
  tagSuggestionItem,
  onUpdate,
  disableActions,
}: TagSuggestionProcessorProps) {
  const [suggestionsWithVerdicts, setSuggestionsWithVerdicts] = useState<
    TagSuggestionItem[]
  >([...tagSuggestionItem.addTags, ...tagSuggestionItem.removeTags]);

  function onVerdictChange(tagId: number, isApproved: boolean) {
    setSuggestionsWithVerdicts(
      suggestionsWithVerdicts.map(suggestionItem => {
        if (suggestionItem.id === tagId) {
          return { ...suggestionItem, isApproved };
        }
        return suggestionItem;
      })
    );
  }

  useEffect(() => {
    const completed = suggestionsWithVerdicts.every(
      suggestion => suggestion.isApproved !== null
    );
    onUpdate(suggestionsWithVerdicts, completed);
  }, [onUpdate, suggestionsWithVerdicts]);

  return (
    <div>
      {suggestionsWithVerdicts.length > 1 && !disableActions && (
        <div className="flex flex-row gap-2 mb-2">
          <Button
            variant="outlined"
            color="primary"
            text="All"
            startIcon={MdCheck}
            onClick={() => {
              setSuggestionsWithVerdicts(
                suggestionsWithVerdicts.map(suggestion => {
                  return { ...suggestion, isApproved: true };
                })
              );
            }}
          />

          <Button
            variant="outlined"
            color="error"
            text="None"
            startIcon={MdClose}
            onClick={() => {
              setSuggestionsWithVerdicts(
                suggestionsWithVerdicts.map(suggestion => {
                  return { ...suggestion, isApproved: false };
                })
              );
            }}
          />
        </div>
      )}

      {suggestionsWithVerdicts.map(suggestionItem => (
        <div key={suggestionItem.id} className="flex flex-row items-center my-1">
          {!disableActions && (
            <VerdictToggleButton
              value={suggestionItem.isApproved}
              onChange={value => onVerdictChange(suggestionItem.id, value)}
              disableElevation
            />
          )}
          <span className="w-[84px] flex flex-row items-center ml-2">
            {suggestionItem.isAdding ? (
              <MdAdd className="mt-[1.5px]" />
            ) : (
              <MdRemove className="mt-[1.5px]" />
            )}
            <p>{suggestionItem.isAdding ? 'Add ' : 'Remove '}</p>
          </span>
          <p>{suggestionItem.name}</p>
        </div>
      ))}
    </div>
  );
}
