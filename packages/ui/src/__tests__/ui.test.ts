import { describe, it, expect } from 'vitest';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';

describe('UI components', () => {
  it('exports Button component', () => {
    expect(Button).toBeTypeOf('function');
  });

  it('exports Card component', () => {
    expect(Card).toBeTypeOf('function');
  });
});
