interface SubjectInputProps {
  value: string[];
  onChange: (subjects: string[]) => void;
}

export default function SubjectInput({ value, onChange }: SubjectInputProps) {
  const textValue = value.join('\n');

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const lines = e.target.value.split('\n');
    const subjects = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onChange(subjects);
  }

  const hasOddNumber = value.length > 0 && value.length % 2 !== 0;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">Subject IDs</span>
        <span className="label-text-alt">
          {value.length} subject{value.length !== 1 ? 's' : ''} entered
          {hasOddNumber && ' (need even number)'}
        </span>
      </label>
      <textarea
        className={`textarea textarea-bordered h-48 font-mono text-sm ${
          hasOddNumber ? 'textarea-warning' : ''
        }`}
        placeholder="Enter subject IDs, one per line:&#10;subject-001&#10;subject-002&#10;subject-003&#10;subject-004"
        value={textValue}
        onChange={handleChange}
      />
      <label className="label">
        <span className="label-text-alt text-base-content/60">
          Each subject ID should be on its own line. You need an even number of subjects for pairing.
        </span>
      </label>
      {hasOddNumber && (
        <div className="alert alert-warning mt-2">
          <span className="text-sm">
            You have {value.length} subject{value.length !== 1 ? 's' : ''}.
            Add one more to create {Math.ceil(value.length / 2)} pair{Math.ceil(value.length / 2) !== 1 ? 's' : ''}.
          </span>
        </div>
      )}
    </div>
  );
}