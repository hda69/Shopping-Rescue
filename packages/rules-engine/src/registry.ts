import type { RuleDefinition } from '@shopping-rescue/shared/types';

export class RulesRegistry {
  private readonly rules = new Map<string, RuleDefinition>();

  register(rule: RuleDefinition): void {
    this.rules.set(rule.id, rule);
  }

  get(ruleId: string): RuleDefinition | undefined {
    return this.rules.get(ruleId);
  }

  getEnabled(): RuleDefinition[] {
    return [...this.rules.values()].filter((rule) => rule.enabled);
  }

  list(): RuleDefinition[] {
    return [...this.rules.values()];
  }
}

export function createRulesRegistry(initialRules: RuleDefinition[] = []): RulesRegistry {
  const registry = new RulesRegistry();
  initialRules.forEach((rule) => registry.register(rule));
  return registry;
}
