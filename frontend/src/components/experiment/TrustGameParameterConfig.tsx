interface TrustGameParameters {
  E1: number;
  E2: number;
  m: number;
  UNIT: number;
}

interface TrustGameParameterConfigProps {
  parameters: TrustGameParameters;
  onChange: (params: TrustGameParameters) => void;
}

export default function TrustGameParameterConfig({
  parameters,
  onChange,
}: TrustGameParameterConfigProps) {
  const maxPayout = parameters.E1 * parameters.m + parameters.E2;

  function handleChange(field: keyof TrustGameParameters, value: number) {
    onChange({
      ...parameters,
      [field]: value,
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Trust Game Parameters</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* E1 - S1 Endowment */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">S1 Endowment (E1)</span>
            <span className="label-text-alt">{parameters.E1.toLocaleString()} µALGO</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={parameters.E1}
            onChange={(e) => handleChange('E1', Number(e.target.value))}
            step={1000}
            min={0}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Initial endowment for investor
            </span>
          </label>
        </div>

        {/* E2 - S2 Endowment */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">S2 Endowment (E2)</span>
            <span className="label-text-alt">{parameters.E2.toLocaleString()} µALGO</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={parameters.E2}
            onChange={(e) => handleChange('E2', Number(e.target.value))}
            step={1000}
            min={0}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Initial endowment for trustee
            </span>
          </label>
        </div>

        {/* Multiplier */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Multiplier (m)</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={parameters.m}
            onChange={(e) => handleChange('m', Number(e.target.value))}
            min={1}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Investment is multiplied by this amount
            </span>
          </label>
        </div>

        {/* UNIT - Step Size */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Step Size (UNIT)</span>
            <span className="label-text-alt">{parameters.UNIT.toLocaleString()} µALGO</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={parameters.UNIT}
            onChange={(e) => handleChange('UNIT', Number(e.target.value))}
            step={100}
            min={1}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Minimum increment for decisions
            </span>
          </label>
        </div>
      </div>

      {/* Max Payout Preview */}
      <div className="alert alert-info">
        <div>
          <div className="font-semibold">Max Payout Per Pair:</div>
          <div className="text-sm">
            {maxPayout.toLocaleString()} µALGO ({(maxPayout / 1_000_000).toFixed(4)} ALGO)
          </div>
          <div className="text-xs text-base-content/70 mt-1">
            Calculated as: (E1 × m) + E2 = ({parameters.E1.toLocaleString()} × {parameters.m}) + {parameters.E2.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}