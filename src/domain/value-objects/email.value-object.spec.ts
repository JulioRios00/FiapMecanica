import { Email } from './email.value-object';

describe('Email', () => {
  describe('Valid emails', () => {
    it('should accept valid email addresses', () => {
      expect(() => new Email('user@example.com')).not.toThrow();
      expect(() => new Email('test.user@domain.com')).not.toThrow();
      expect(() => new Email('user+tag@example.co.uk')).not.toThrow();
      expect(() => new Email('user_name@sub.domain.com')).not.toThrow();
    });

    it('should convert email to lowercase', () => {
      const email = new Email('USER@EXAMPLE.COM');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  user@example.com  ');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should return the same value when getValue is called', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });
  });

  describe('Invalid emails', () => {
    it('should reject emails without @ symbol', () => {
      expect(() => new Email('userexample.com')).toThrow('Invalid email format');
    });

    it('should reject emails without domain', () => {
      expect(() => new Email('user@')).toThrow('Invalid email format');
      expect(() => new Email('user@.')).toThrow('Invalid email format');
    });

    it('should reject emails without local part', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
    });

    it('should reject empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
    });

    it('should reject emails with spaces', () => {
      expect(() => new Email('user name@example.com')).toThrow('Invalid email format');
      expect(() => new Email('user@exam ple.com')).toThrow('Invalid email format');
    });

    it('should reject malformed emails', () => {
      expect(() => new Email('user@@example.com')).toThrow('Invalid email format');
      expect(() => new Email('user@example..com')).toThrow('Invalid email format');
      expect(() => new Email('.user@example.com')).toThrow('Invalid email format');
    });
  });

  describe('Edge cases', () => {
    it('should accept emails with numbers', () => {
      expect(() => new Email('user123@example456.com')).not.toThrow();
    });

    it('should accept emails with hyphens in domain', () => {
      expect(() => new Email('user@my-domain.com')).not.toThrow();
    });

    it('should maintain immutability', () => {
      const email = new Email('test@example.com');
      const value1 = email.getValue();
      const value2 = email.getValue();
      expect(value1).toBe(value2);
      expect(value1).toBe('test@example.com');
    });
  });
});
