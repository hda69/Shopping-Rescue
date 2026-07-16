import type { Finding, RuleDefinition } from '@shopping-rescue/shared/types';
import type { RulesRegistry } from './registry.js';

export interface EvaluationContext {
  scanId: string;
  url: string;
  pageHtml?: string;
  metadata?: Record<string, unknown>;
}

export interface RuleEvaluator {
  evaluate(context: EvaluationContext, rule: RuleDefinition): Finding | null;
}

export class PlaceholderRuleEvaluator implements RuleEvaluator {
  evaluate(_context: EvaluationContext, _rule: RuleDefinition): Finding | null {
    return null;
  }
}

export function evaluateRules(
  registry: RulesRegistry,
  context: EvaluationContext,
  evaluator: RuleEvaluator = new PlaceholderRuleEvaluator(),
): Finding[] {
  return registry
    .getEnabled()
    .map((rule) => evaluator.evaluate(context, rule))
    .filter((finding): finding is Finding => finding !== null);
}
