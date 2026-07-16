import { describe, it, expect } from 'vitest';
import { createRulesRegistry } from '../registry.js';
import { evaluateRules } from '../evaluator.js';
import type { RuleDefinition } from '@shopping-rescue/shared/types';

const sampleRule: RuleDefinition = {
  id: 'BI-001',
  version: 1,
  category: 'business_identity',
  title: 'Missing contact page',
  description: 'Site should expose contact information',
  severity: 'high',
  confidenceMethod: 'deterministic',
  evidenceRequirements: ['contact page URL'],
  remediationTemplate: 'Add a contact page',
  enabled: true,
};

describe('RulesRegistry', () => {
  it('registers and retrieves rules', () => {
    const registry = createRulesRegistry([sampleRule]);
    expect(registry.get('BI-001')).toEqual(sampleRule);
    expect(registry.getEnabled()).toHaveLength(1);
  });
});

describe('evaluateRules', () => {
  it('returns empty findings for placeholder evaluator', () => {
    const registry = createRulesRegistry([sampleRule]);
    const findings = evaluateRules(registry, {
      scanId: 'scan-1',
      url: 'https://example.com',
    });

    expect(findings).toEqual([]);
  });
});
