import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Examination' },
  { number: 2, label: 'Subjects' },
  { number: 3, label: 'Paper Details' },
  { number: 4, label: 'Add Questions' },
  { number: 5, label: 'Organize' },
  { number: 6, label: 'Preview & Export' },
];

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid var(--color-border)',
      padding: '16px 24px',
      overflowX: 'auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 'max-content',
        gap: 0,
      }}>
        {STEPS.map((step, idx) => {
          const status = step.number < current ? 'completed' : step.number === current ? 'active' : 'pending';
          return (
            <React.Fragment key={step.number}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className={`step-dot ${status}`}>
                  {status === 'completed' ? <Check size={14} /> : step.number}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: status === 'active' ? 'var(--color-terra)' : status === 'completed' ? 'var(--color-green)' : 'var(--color-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  height: 2,
                  width: 48,
                  background: step.number < current ? 'var(--color-green)' : 'var(--color-border)',
                  margin: '0 4px',
                  marginBottom: 20,
                  flexShrink: 0,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
