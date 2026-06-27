import { describe, it, expect } from "vitest";
import { evaluatePassword } from "../components/auth/password-strength.jsx";

// Helper: build expectation object for criteria
const allFalse = { length: false, upper: false, lower: false, number: false, special: false };
const allTrue  = { length: true,  upper: true,  lower: true,  number: true,  special: true  };

describe("evaluatePassword – score", () => {
  it("returns score 0 for an empty string", () => {
    const { score, criteria } = evaluatePassword("");
    expect(score).toBe(0);
    expect(criteria).toEqual(allFalse);
  });

  it("returns score 0 for a short password with no other criteria", () => {
    // 'ab' – too short, lowercase only qualifies as lower but NOT length
    const { score, criteria } = evaluatePassword("ab");
    expect(score).toBe(1); // only 'lower' is true
    expect(criteria.length).toBe(false);
    expect(criteria.lower).toBe(true);
  });

  it("returns score 2 for 8 lowercase characters (length + lower)", () => {
    const { score, criteria } = evaluatePassword("abcdefgh");
    expect(score).toBe(2);
    expect(criteria.length).toBe(true);
    expect(criteria.lower).toBe(true);
    expect(criteria.upper).toBe(false);
    expect(criteria.number).toBe(false);
    expect(criteria.special).toBe(false);
  });

  it("returns score 3 for length + lower + upper", () => {
    const { score, criteria } = evaluatePassword("Abcdefgh");
    expect(score).toBe(3);
    expect(criteria.length).toBe(true);
    expect(criteria.lower).toBe(true);
    expect(criteria.upper).toBe(true);
    expect(criteria.number).toBe(false);
    expect(criteria.special).toBe(false);
  });

  it("returns score 4 for length + lower + upper + number", () => {
    const { score, criteria } = evaluatePassword("Abcdefg1");
    expect(score).toBe(4);
    expect(criteria.length).toBe(true);
    expect(criteria.lower).toBe(true);
    expect(criteria.upper).toBe(true);
    expect(criteria.number).toBe(true);
    expect(criteria.special).toBe(false);
  });

  it("returns score 5 for a fully strong password", () => {
    const { score, criteria } = evaluatePassword("Abcdefg1!");
    expect(score).toBe(5);
    expect(criteria).toEqual(allTrue);
  });
});

describe("evaluatePassword – label", () => {
  it('labels score 0 as "Too short"', () => {
    expect(evaluatePassword("").label).toBe("Too short");
  });

  it('labels score 1 as "Very weak"', () => {
    expect(evaluatePassword("a").label).toBe("Very weak");
  });

  it('labels score 2 as "Weak"', () => {
    expect(evaluatePassword("abcdefgh").label).toBe("Weak");
  });

  it('labels score 3 as "Fair"', () => {
    expect(evaluatePassword("Abcdefgh").label).toBe("Fair");
  });

  it('labels score 4 as "Strong"', () => {
    expect(evaluatePassword("Abcdefg1").label).toBe("Strong");
  });

  it('labels score 5 as "Very strong"', () => {
    expect(evaluatePassword("Abcdefg1!").label).toBe("Very strong");
  });
});

describe("evaluatePassword – special characters", () => {
  it("detects punctuation as special characters", () => {
    expect(evaluatePassword("aB3!").criteria.special).toBe(true);
    expect(evaluatePassword("aB3@").criteria.special).toBe(true);
    expect(evaluatePassword("aB3#").criteria.special).toBe(true);
    expect(evaluatePassword("aB3$").criteria.special).toBe(true);
  });

  it("does not flag alphanumeric-only passwords as having special chars", () => {
    expect(evaluatePassword("Abcdefg1").criteria.special).toBe(false);
  });
});

describe("evaluatePassword – edge cases", () => {
  it("handles passwords with only numbers", () => {
    const { criteria } = evaluatePassword("12345678");
    expect(criteria.number).toBe(true);
    expect(criteria.upper).toBe(false);
    expect(criteria.lower).toBe(false);
    expect(criteria.special).toBe(false);
  });

  it("handles passwords with only uppercase", () => {
    const { criteria } = evaluatePassword("ABCDEFGH");
    expect(criteria.upper).toBe(true);
    expect(criteria.lower).toBe(false);
  });

  it("handles unicode/emoji as special characters", () => {
    const { criteria } = evaluatePassword("Abcdefg1🔒");
    expect(criteria.special).toBe(true);
  });

  it("returns a color string for every score", () => {
    for (let i = 0; i <= 5; i++) {
      // build passwords that hit each score level
      const passwords = ["", "a", "abcdefgh", "Abcdefgh", "Abcdefg1", "Abcdefg1!"];
      const { color } = evaluatePassword(passwords[i]);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#")).toBe(true);
    }
  });
});
