import { NewComicData } from '.';

type Step3Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

// Obviously, this whole component/step is very wip.

export default function Step3Pagemanager({ comicData, onUpdate }: Step3Props) {
  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) {
      console.log(files);
      const fileList = Array.from(files);
      onUpdate({ ...comicData, files: fileList });
    }
  }

  return (
    <>
      <h4 className="mt-8">Pages</h4>
      <input type="file" onChange={onFileChange} multiple />
    </>
  );
}
