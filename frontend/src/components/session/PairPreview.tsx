interface PairPreviewProps {
  subjects: string[];
}

export default function PairPreview({ subjects }: PairPreviewProps) {
  if (subjects.length === 0) {
    return null;
  }

  if (subjects.length % 2 !== 0) {
    return (
      <div className="alert alert-warning">
        <span>Cannot create pairs with an odd number of subjects. Add one more subject.</span>
      </div>
    );
  }

  const numPairs = subjects.length / 2;
  const pairs: Array<{ s1: string; s2: string }> = [];

  for (let i = 0; i < numPairs; i++) {
    pairs.push({
      s1: subjects[i * 2],
      s2: subjects[i * 2 + 1],
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Pair Preview</h3>
        <span className="badge badge-primary">
          {numPairs} pair{numPairs !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Pair</th>
              <th>S1 (Investor)</th>
              <th>S2 (Trustee)</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, index) => (
              <tr key={index}>
                <td className="font-medium">#{index + 1}</td>
                <td className="font-mono text-sm">{pair.s1}</td>
                <td className="font-mono text-sm">{pair.s2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-base-content/60">
        Subjects are paired sequentially: first two become Pair #1, next two become Pair #2, etc.
      </div>
    </div>
  );
}